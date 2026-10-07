Seeds directory for J&S Empregos LTDA (tenant slug: js-empregos).
These files are idempotent (ON CONFLICT DO NOTHING) and reference the tenant by slug, not hardcoded UUID.

Execution order:
  1. services.seed.sql  -> public.services via public_services_v1 contract
  2. jobs.seed.sql      -> public.jobs via public_jobs_v1 contract

Neither file creates tables, migrations, or alters schema. They only insert/update existing rows.