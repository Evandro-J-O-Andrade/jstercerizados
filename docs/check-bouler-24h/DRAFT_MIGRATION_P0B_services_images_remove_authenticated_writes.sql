-- DRAFT MIGRATION (OFICIAL CANDIDATA) — NÃO APLICAR / NÃO COMMITAR / NÃO PUSHAR SEM AUTORIZAÇÃO EXPLÍCITA
-- P0-B: services-images — remove authenticated I/U/D cross-tenant; preserva SELECT público.
-- Projeto: J&S Empregos LTDA (CHECK BOULER 24H) / Supabase okxqfyoqbhcmflpurfrw
-- Baseline: main@b9de729 | Data prep: 2026-11-06
--
-- EVIDÊNCIA (SQL 02.14 / migration 20260830001100_storage_services_images.sql):
--   services_images_authenticated_{write,update,delete} permitem I/U/D a qualquer
--   authenticated com QUALQUER tenant_membership ativa (sem tenant/path/owner/entidade).
-- RISCO ACEITO (após validação): bucket legado; sem consumidores app/Edge locais conhecidos
--   escrevendo em services-images; services usam card_image_url/hero_image_url (URLs estáticas).
-- PRÉ-APLICAÇÃO OBRIGATÓRIA: autorização explícita remota; confirmar ausência de writers
--   produtivos; executar/planejar ST-003/ST-004/ST-006/REG-JS-IMG (P0B_ST003_ST004_TEST_PLAN.md).
--
-- ROLLBACK (autorização emergencial documentada): recriar policies de
--   supabase/migrations/20260830001100_storage_services_images.sql.

BEGIN;

-- Mantém leitura pública para compatibilidade de URLs históricas (bucket public=true).
-- Revisar com negócio se SELECT público deve ser restringido em fase posterior.

DROP POLICY IF EXISTS "services_images_authenticated_write" ON storage.objects;
DROP POLICY IF EXISTS "services_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "services_images_authenticated_delete" ON storage.objects;

COMMIT;
