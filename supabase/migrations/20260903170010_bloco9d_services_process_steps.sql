-- =============================================================================
-- BLOCO 9D — popular process_steps dos 20 serviços
-- =============================================================================
-- Purpose:
--   Restaurar o contrato editorial aprovado (MOCK src/services/mock/services.ts
--   + ServicoDetalhe.tsx DEFAULT_PROCESS_STEPS) gravando o array padrão
--   "Solicitação -> Análise -> Proposta -> Execução" em services.process_steps
--   para os 20 serviços catalogados em public_services_v1.
--
--   O TSX (ServicoDetalhe.tsx) consome service.processSteps com fallback
--   para DEFAULT_PROCESS_STEPS. Esta migration elimina a dependência do
--   fallback hardcoded.
--
--   schema: services.process_steps é jsonb; a VIEW pública expõe como array.
--   Vamos gravar direto como jsonb array de objetos (sem wrapper .items).
--
--   Idempotente: UPDATE apenas onde process_steps é NULL ou '{}'::jsonb ou
--   array vazio.
-- =============================================================================

BEGIN;

UPDATE public.services AS s
SET process_steps = jsonb_build_array(
  jsonb_build_object(
    'step', '01',
    'title', 'Solicitação',
    'description', 'Entre em contato pelo site ou WhatsApp com suas necessidades.'
  ),
  jsonb_build_object(
    'step', '02',
    'title', 'Análise',
    'description', 'Nossa equipe avalia o perfil e prepara uma proposta personalizada.'
  ),
  jsonb_build_object(
    'step', '03',
    'title', 'Proposta',
    'description', 'Apresentamos a solução ideal com custos e prazos detalhados.'
  ),
  jsonb_build_object(
    'step', '04',
    'title', 'Execução',
    'description', 'Iniciamos a operação com profissionais treinados e equipados.'
  )
)
WHERE s.status = 'published'
  AND s.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'js-empregos' LIMIT 1)
  AND (
    s.process_steps IS NULL
    OR s.process_steps = '{}'::jsonb
    OR (jsonb_typeof(s.process_steps) = 'array' AND jsonb_array_length(s.process_steps) = 0)
  );

COMMIT;

-- Validation
SELECT
  slug,
  name,
  category,
  jsonb_typeof(process_steps) AS ps_type,
  CASE
    WHEN jsonb_typeof(process_steps) = 'array'
      THEN jsonb_array_length(process_steps)
    ELSE 0
  END AS steps_count
FROM public.services
WHERE status = 'published'
  AND tenant_id = (SELECT id FROM public.tenants WHERE slug = 'js-empregos' LIMIT 1)
ORDER BY display_order, name;
