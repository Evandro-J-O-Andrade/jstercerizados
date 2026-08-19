-- =============================================================================
-- GATE-TALENT-03 — RLS para operações anônimas do Banco de Talentos
-- =============================================================================
-- Objetivo: permitir que candidatos não autenticados submetam currículo
-- diretamente do frontend usando anon key, sem expor service_role.
-- Restrição: todas as operações são limitadas ao tenant js-empregos.
-- =============================================================================

-- =============================================================================
-- 01 — TENANTS (leitura pública)
-- =============================================================================
create policy "Tenants visible publicly"
  on public.tenants for select
  using (true);

-- =============================================================================
-- 02 — CANDIDATES (insert público)
-- =============================================================================
create policy "Candidates insertable publicly"
  on public.candidates for insert
  with check (
    tenant_id in (select id from public.tenants where slug = 'js-empregos')
  );

-- =============================================================================
-- 03 — CURRICULA (insert público)
-- =============================================================================
create policy "Curricula insertable publicly"
  on public.curricula for insert
  with check (
    tenant_id in (select id from public.tenants where slug = 'js-empregos')
  );

-- =============================================================================
-- 04 — CANDIDATE_DOCUMENTS (insert público)
-- =============================================================================
create policy "Documents insertable publicly"
  on public.candidate_documents for insert
  with check (
    tenant_id in (select id from public.tenants where slug = 'js-empregos')
  );

-- =============================================================================
-- 05 — CONSENTS (insert público)
-- =============================================================================
create policy "Consents insertable publicly"
  on public.consents for insert
  with check (
    tenant_id in (select id from public.tenants where slug = 'js-empregos')
  );
