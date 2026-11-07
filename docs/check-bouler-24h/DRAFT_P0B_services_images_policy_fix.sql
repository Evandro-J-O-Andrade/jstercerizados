-- DRAFT — NÃO APLICAR / NÃO COMMITAR SEM AUTORIZAÇÃO EXPLÍCITA
-- P0-B: services-images — isolamento de escrita cross-tenant
-- Projeto: J&S Empregos LTDA (CHECK BOULER 24H) / Supabase okxqfyoqbhcmflpurfrw
-- Data: 2026-11-06 | Baseline: main@b9de729
-- Escopo: SOMENTE storage.objects policies do bucket `services-images`.
-- Bloqueado: aplicação remota, migration oficial, commit, push, deploy.
-- Pré-requisitos antes de aplicar: autorização explícita; confirmar writers reais;
--   decidir se bucket permanece público para SELECT; validar compatibilidade js-empregos;
--   executar matriz 02.13.1 ST-003/ST-004/ST-006 em ambiente autorizado.
--
-- Evidência (02.14, Comprovado por SQL): policies atuais permitem I/U/D para qualquer
-- authenticated com QUALQUER tenant_membership ativa, sem binding tenant/path/owner/entidade.
-- Evidência (inspeção local 2026-11-06): nenhum consumidor de app/Edge escreve no bucket
-- `services-images`; services.card_image_url/hero_image_url usam URLs estáticas/locais.
-- Portanto, remover escrita authenticated direta é a mitigação de menor regressão conhecida,
-- MAS requer confirmação antes de aplicar.
--
-- Estratégia proposta (fase 1, mínima): manter SELECT público; remover I/U/D authenticated.
-- Escrita futura deve ocorrer por caminho autorizado (Edge/service_role com validação
-- tenant+RBAC+MIME+path+auditoria) OU por policy tenant-scoped somente após definir
-- convenção de path e permissão canônica (ex.: services.update no tenant do recurso).
--
-- ROLLBACK (manter pronto; NÃO executar agora): recriar policies originais de
-- 20260830001100_storage_services_images.sql apenas com autorização emergencial documentada.

BEGIN;

-- Leitura pública preservada (bucket é public=true). Revisar se negócio exige restrição.
-- Policy services_images_public_read já existe; não alterar.

DROP POLICY IF EXISTS "services_images_authenticated_write" ON storage.objects;
DROP POLICY IF EXISTS "services_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "services_images_authenticated_delete" ON storage.objects;

-- NÃO criar substitutas authenticated nesta fase sem contrato de path/tenant/permissão.
-- service_role bypassa RLS quando aplicável; paths administrativos futuros devem ser
-- validados server-side antes de usar service_role.

COMMIT;

-- Verificação read-only sugerida APÓS aplicação autorizada (não executar agora):
-- select policyname, roles, cmd, qual, with_check
-- from pg_policies
-- where schemaname='storage' and tablename='objects' and policyname like 'services_images%';
-- Esperado: apenas services_images_public_read (SELECT, {public}).
--
-- Testes mínimos (02.13.1): ST-003a-c authenticated/membership ativa não escreve/altera/exclui;
-- ST-004 anon/authenticated lê se público mantido; validar fluxos js-empregos de exibição de serviços.