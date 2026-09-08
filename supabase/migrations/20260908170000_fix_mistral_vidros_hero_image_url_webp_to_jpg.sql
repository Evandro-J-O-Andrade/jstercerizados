-- =============================================================================
-- BLOCO 9B — Correção: hero_image_url do Mistral Vidros de .webp para .jpg
-- =============================================================================
-- Purpose:
--   A migration 20260903170009 (bloco9a) gravou:
--     company_relationships.metadata->>'hero_image_url'
--     = '/images/clientes/mistral-vidros-real.webp'
--
--   Mas o asset real no repositório é JPG (sha 42bb10a2710ee9ce).
--   O .webp foi removido do Git por corrupção (ver commit ddefdce).
--   O mock src/mock/clients.ts já aponta para .jpg.
--
--   Esta migration corrige o valor persistido no Supabase para bater com
--   o asset real e com o mock. É IDEMPOTENTE: só atualiza onde o hero
--   ainda é .webp.
--
--   NÃO edita migrations antigas. O histórico permanece intacto.
--   Estado final: hero_image_url = '/images/clientes/mistral-vidros-real.jpg'
--   logo_url permanece '/images/clientes/Mistral Vidros.jpg' (não alterado).
-- =============================================================================

BEGIN;

UPDATE public.company_relationships AS cr
SET metadata = cr.metadata || jsonb_build_object(
  'hero_image_url', '/images/clientes/mistral-vidros-real.jpg'
)
FROM public.companies c
WHERE c.id = cr.company_id
  AND c.tenant_id = cr.tenant_id
  AND c.name = 'Mistral Vidros'
  AND c.status = 'active'
  AND cr.status = 'active'
  AND cr.relationship_type = 'client'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true'
  AND coalesce(cr.metadata->>'hero_image_url', '') = '/images/clientes/mistral-vidros-real.webp';

-- Validation
SELECT
  c.name AS empresa,
  c.logo_url,
  cr.metadata->>'hero_image_url' AS hero_image_url,
  cr.metadata->>'description' AS descricao,
  cr.metadata->>'website' AS website
FROM public.company_relationships cr
JOIN public.companies c ON c.id = cr.company_id
WHERE cr.relationship_type = 'client'
  AND c.status = 'active'
  AND cr.status = 'active'
  AND coalesce(c.metadata->>'is_test', 'false') <> 'true'
  AND c.name = 'Mistral Vidros'
ORDER BY c.name;

COMMIT;