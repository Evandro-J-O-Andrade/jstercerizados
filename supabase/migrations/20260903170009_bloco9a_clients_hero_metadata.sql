-- =============================================================================
-- BLOCO 9A — popular hero_image_url dos clientes REAIS conforme MOCK aprovado
-- =============================================================================
-- Purpose:
--   Apenas para os clientes REAIS (metadata.is_test != true) com relationship
--   ativa, popular company_relationships.metadata->>'hero_image_url' SOMENTE
--   quando o MOCK aprovado (src/mock/clients.ts) define um hero distinto
--   do logo.
--
--   Decisões aprovadas (auditoria Fase 1.3 + 1.6):
--     - Abarca Móveis     : MOCK só tem logo -> NÃO popular (deixar UI usar
--                            ClientCaseFallback). cliente decide depois.
--     - Vector Engenharia : MOCK.image = MOCK.logo -> NÃO popular
--                            (View.existing image_url já aponta para logo
--                            via fallback metadata->>'hero_image_url' = NULL
--                            e o mapper consome logo).
--     - Mistral Vidros    : MOCK.image = '/images/clientes/mistral-vidros-real.webp'
--                            (hero distinto do logo) -> POPULAR.
--     - Vectro Engenharia : MOCK só tem logo -> NÃO popular.
--
--   Decisão importante: Abarca, Vector e Vectro não recebem hero_image_url
--   copiado de logo. O MOCK não define hero para esses clientes. Manter
--   sem hero faz a UI renderizar o ClientCaseFallback (Building2), que é
--   o comportamento aprovado para "sem mídia" — não usar logo como
--   substituto editorial.
--
--   Idempotente: UPDATE apenas onde o hero ainda não está definido OU
--   é igual ao valor que estamos prestes a gravar.
-- =============================================================================

BEGIN;

UPDATE public.company_relationships AS cr
SET metadata = cr.metadata || jsonb_build_object(
  'hero_image_url', '/images/clientes/mistral-vidros-real.webp'
)
FROM public.companies c
WHERE c.id = cr.company_id
  AND c.tenant_id = cr.tenant_id
  AND c.name = 'Mistral Vidros'
  AND c.status = 'active'
  AND cr.status = 'active'
  AND cr.relationship_type = 'client'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true'
  AND coalesce(cr.metadata->>'hero_image_url', '') <> '/images/clientes/mistral-vidros-real.webp';

COMMIT;

-- Validation
SELECT
  c.name AS empresa,
  cr.relationship_type,
  cr.metadata->>'hero_image_url' AS hero_image_url,
  cr.metadata->>'description' AS descricao,
  cr.metadata->>'website' AS website
FROM public.company_relationships cr
JOIN public.companies c ON c.id = cr.company_id
WHERE cr.relationship_type = 'client'
  AND c.status = 'active'
  AND cr.status = 'active'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true'
ORDER BY c.name;
