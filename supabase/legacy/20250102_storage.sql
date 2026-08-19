-- =============================================================================
-- GATE-TALENT-03 — Storage bucket + RLS para currículos
-- =============================================================================
-- Bucket: curriculos (privado, apenas upload anônimo e leitura autenticada)
-- =============================================================================

-- =============================================================================
-- 01 — BUCKET
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('curriculos', 'curriculos', false)
on conflict (id) do nothing;

-- =============================================================================
-- 02 — RLS
-- =============================================================================

-- Upload permitido para qualquer pessoa (formulário público)
create policy "Public can upload to curriculos"
  on storage.objects for insert
  with check (bucket_id = 'curriculos');

-- Leitura permitida apenas para usuários autenticados (RH interno)
create policy "Authenticated can read curriculos"
  on storage.objects for select
  using (bucket_id = 'curriculos' and auth.role() = 'authenticated');

-- Remoção permitida apenas para usuários autenticados (RH interno)
create policy "Authenticated can delete from curriculos"
  on storage.objects for delete
  using (bucket_id = 'curriculos' and auth.role() = 'authenticated');
