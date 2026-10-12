=== P0 REPORT (read-only evidence) ===

Date: 2026-10-12

## P0.1 - public_services_v1 (repo evidence)

- File: 20260902170003_bloco3_public_services_v1.sql
  - L65: ALTER VIEW public.public_services_v1 SET (security_invoker = false);
  - L66: GRANT SELECT ON public.public_services_v1 TO anon, authenticated;
- security_invoker: false (migration)
- Grant: anon, authenticated (SELECT)
- View filters: status='published' AND tenant_id from tenants.slug='js-empregos' (subquery)
- Risk (hypothesis, unverified): if anon cannot read tenants OR security_invoker differs in prod, view may return 0 rows despite services published

## P0.2 - TRUNCATE grants (repo)

- TRUNCATE tokens in migrations: 0
- GRANT TRUNCATE to anon/authenticated/PUBLIC in migrations: 0
- Note: repo migrations do NOT show GRANT TRUNCATE to anon/authenticated; catalog verification required in prod

## P0.3 - Migration inventory (repo)

- .sql files in supabase/migrations (root): 95
  - dir: p0_reconciliation
  - dir: _legacy
  - dir: _superseded
  - p0_reconciliation: 4
  - _legacy: 1
  - _superseded: 2
    - 20260902000000_platform_hardening_v1.sql
    - 20260902000001_reconcile_services_cms.sql
- Stated divergence (audit note): '101 repo vs 95 applied' with references to reconcile_services_cms/_superseded/blocked - classify vs nested dirs

## Status

- Read-only repo scan complete
- No DB changes, no RLS/grant changes executed
- No TRUNCATE grants to anon/authenticated found in repo migrations
- public_services_v1: security_invoker=false, grants anon/authenticated SELECT, filters by js-empregos tenant

## P0.2b — Privilégio TRUNCATE (produção — confirmado, somente leitura)
- Crítico: 221/221 tabelas public com TRUNCATE efetivo para anon e para authenticated (catálogo)
- Inclui: people, tenants, tenant_memberships, role_assignments, applications, candidates, employees, contracts, accounts_payable, audit_logs
- storage: 3 relações com TRUNCATE efetivo para ambos
- public: 0 tabelas com FORCE ROW LEVEL SECURITY
- Nota: RLS não protege TRUNCATE; concessão explícita (ACL arwdDxtm inclui D). Requer inventário e plano de revogação sem execução até autorização.

## P0.1b — public_services_v1 (produção — divergência confirmada)
- security_invoker: true (em produção; migration define false)
- Proprietário: postgres; SELECT concedido a anon e authenticated
- Retorna 20 serviços no contexto administrativo; precisa confirmação como anon
- Hipótese: filtro por tenants.slug + security_invoker=true + política tenants_member_read (autenticado) pode impedir anon de resolver tenant → view vazia
- Divergências vs migration: security_invoker e presença de campo gallery na view implantada

## Riscos/ações (não executadas)
- Prioridade 1: preparar plano de remediação TRUNCATE (revisável), sem executar GRANT/REVOKE
- Prioridade 2: confirmar acesso anon à public_services_v1 (PostgREST) e reconciliar view/migration (gallery + security_invoker) antes de alterar banco
- Não foram executadas alterações em Supabase, RLS, migrations, código ou deploy.
