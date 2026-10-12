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
