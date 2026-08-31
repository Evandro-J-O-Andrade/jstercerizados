# Migration Guide — Companies + Services Reconciliation

**Date:** 2026-08-31
**Author:** Kilo + Evandro
**Status:** Ready for Supabase execution

---

## Purpose

Reconcile the existing database schema with the canonical model defined for:

1. **Companies** — central business entity (customers, partners, suppliers)
2. **Services** — institutional catalog (what J&S offers)
3. **Operations** — company_services, service_orders, recruitment_demands

**Critical rule:** All migrations are fully idempotent. Existing data is preserved.

---

## Migration Files (Execution Order)

| Order | File                                                  | Purpose                                              |
| ----- | ----------------------------------------------------- | ---------------------------------------------------- |
| 1     | `20260824000002_fix_rls_infrastructure_grants.sql`    | Fix RLS infrastructure grants                        |
| 2     | `20260830000100_auth_people_sync.sql`                 | Auth → People sync triggers                          |
| 3     | `20260830000200_reconcile_applications.sql`           | Reconcile applications table                         |
| 4     | `20260830000300_reconcile_recruitment_demands.sql`    | Reconcile recruitment_demands                        |
| 5     | `20260830000400_candidate_bootstrap_role.sql`         | Candidate bootstrap role assignment                  |
| 6     | `20260830000500_reconcile_job_matches.sql`            | Reconcile job_matches                                |
| 7     | `20260830000600_reconcile_notifications.sql`          | Reconcile notifications                              |
| 8     | `20260830000700_services_catalog.sql`                 | Add CMS columns to services                          |
| 9     | `20260830000800_company_services_link.sql`            | Link company_services ↔ services                     |
| 10    | `20260830000900_service_orders_relationship.sql`      | Add company_relationship_id to service_orders        |
| 11    | `20260830001000_recruitment_demands_service_link.sql` | Link recruitment_demands ↔ services                  |
| 12    | `20260830001100_storage_services_images.sql`          | Storage bucket for service images                    |
| 13    | `20260831000001_company_social_links.sql`             | Company social media links (idempotent)              |
| 14    | `20260831000002_reconcile_companies_services.sql`     | Full reconciliation (companies + services + storage) |

---

## What Each Migration Does

### `20260831000002_reconcile_companies_services.sql` (Main Reconciliation)

#### Companies

- Adds `description`, `short_description`, `company_segment` columns
- Copies `document` → `cnpj` ONLY when:
  - `cnpj` IS NULL
  - `document` contains exactly 14 digits (valid CNPJ)
- Preserves `document` column (no deletion)
- Sets `cnpj_root` from `cnpj` when NULL
- Adds CNPJ format validation constraint
- Adds indexes on `cnpj` and `website`

#### Services (CMS Catalog)

- Creates `services` table with full CMS fields:
  - Content: name, slug, category, short_description, description
  - Media: card_image_url, hero_image_url, hero_title, hero_subtitle
  - Details: icon, benefits (jsonb), process_steps (jsonb)
  - CTA: cta_title, cta_description, cta_button_text, cta_button_url
  - SEO: seo_title, seo_description, seo_keywords
  - Publishing: status, published_at, display_order
- RLS: public read for published, members with permissions for write
- Indexes on tenant_id, status, display_order, category

#### Company Services

- Adds `service_id` FK to `company_services`
- Adds `metadata` jsonb column

#### Service Orders

- Adds `company_relationship_id` FK to `service_orders`
- Adds `metadata` jsonb column

#### Recruitment Demands

- Adds `service_id` FK to `recruitment_demands`
- Adds `urgency` column (low/normal/high/critical)

#### Storage

- Creates `company-logos` bucket (5MB, images only)
- Creates `service-images` bucket (10MB, images only)
- RLS policies: public read, authenticated write

---

## Data Preservation Guarantee

| Table                 | Action                     | Data Impact                    |
| --------------------- | -------------------------- | ------------------------------ |
| `companies`           | ADD COLUMN only            | ✅ All existing rows preserved |
| `companies.document`  | COPY to `cnpj`             | ✅ `document` preserved        |
| `services`            | CREATE TABLE IF NOT EXISTS | ✅ Existing data preserved     |
| `company_services`    | ADD COLUMN only            | ✅ All existing rows preserved |
| `service_orders`      | ADD COLUMN only            | ✅ All existing rows preserved |
| `recruitment_demands` | ADD COLUMN only            | ✅ All existing rows preserved |
| `jobs`                | No changes                 | ✅ 20 existing jobs untouched  |
| `applications`        | No changes                 | ✅ All data preserved          |

---

## Pre-Execution Checklist

- [ ] Supabase connection available
- [ ] `SUPABASE_DB_PASSWORD` environment variable set
- [ ] Current backup/snapshot of production database
- [ ] No concurrent schema changes in progress

---

## Execution Command

```bash
# Using Supabase CLI
supabase db push

# Or using psql directly
psh -h db.okxqfyoqbhcmflpurfrw.supabase.co \
    -U postgres \
    -f supabase/migrations/20260831000002_reconcile_companies_services.sql
```

---

## Post-Execution Verification

```sql
-- Verify companies columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name IN ('description', 'short_description', 'company_segment', 'cnpj', 'document')
ORDER BY column_name;

-- Verify services table exists
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'services';

-- Verify storage buckets
SELECT id, name, public FROM storage.buckets WHERE id IN ('company-logos', 'service-images');

-- Verify CNPJ migration (document → cnpj)
SELECT trading_name, document, cnpj FROM companies WHERE document IS NOT NULL;
```

---

## Architecture Reference

```
companies (master business entity)
├── document (preserved)
├── cnpj (canonical, populated from document)
├── website, logo_url, description
└── company_social_links (1:N)

services (institutional catalog)
├── slug, category, status
├── card_image_url, hero_image_url → Storage
├── benefits, process_steps (jsonb)
└── SEO fields

company_services (N:M link)
├── company_id → companies
└── service_id → services

service_orders (operational)
├── company_relationship_id → company_relationships
└── company_service_id → company_services

recruitment_demands (hiring needs)
├── company_id → companies
└── service_id → services
```

---

## Rollback Plan

If issues occur after execution:

```sql
-- Remove added columns (safe, preserves data)
ALTER TABLE companies DROP COLUMN IF EXISTS description;
ALTER TABLE companies DROP COLUMN IF EXISTS short_description;
ALTER TABLE companies DROP COLUMN IF EXISTS company_segment;

-- Note: cnpj data copied from document is harmless to keep
-- Document column is preserved for backward compatibility
```

---

## Notes

- All `CREATE` statements use `IF NOT EXISTS`
- All `ADD COLUMN` statements use `IF NOT EXISTS`
- All `CREATE POLICY` statements use `DROP POLICY IF EXISTS` first
- All `CREATE TRIGGER` statements use `DROP TRIGGER IF EXISTS` first
- All `ADD CONSTRAINT` statements use `DO $$` blocks with existence checks
- Storage buckets use `ON CONFLICT (id) DO NOTHING`
