# AUDIT PROMPT — P0/P1: Asset Inventory + Supabase/Storage Mapping

**Objective**: Read-only audit of all public-facing assets and their Supabase/Storage backing. **NO WRITES, NO MIGRATIONS, NO BUCKET CREATION.**

---

## Context Summary (for the auditor)

### Current Architecture (Discovered)

| Layer | What Exists | Key Files |
|-------|-------------|-----------|
| **Media Catalog Table** | `public.media_assets` — centralized catalog with `entity_type`, `entity_id`, `bucket_id`, `storage_path`, `file_url`, `mime_type`, `width`, `height`, `alt_text`, `is_primary`, `sort_order` | `supabase/migrations/20260901000001_media_storage_v1.sql` |
| **Storage Buckets** | `public-media` (public, 10MB, images), `avatars` (public, 5MB), `private-documents` (private, 20MB) | Same migration |
| **Public Views (anon SELECT)** | `public_companies_by_type` (client/partner/supplier), `public_services_v1` (20 services with gallery from `media_assets`) | Bloco 1, 3, 5C migrations |
| **Services** | 20 seeded services (8 RH + 11 Facilities + 1 Terceirização) with `card_image_url`, `hero_image_url`, `gallery` (from `media_assets`) | `bloco3_public_services_v1.sql`, `bloco5c_public_service_gallery_v1.sql` |
| **Companies (Clients/Partners/Suppliers)** | `companies` table + `company_relationships` (type: client/partner/supplier) + `company_relationships.metadata` (hero_image_url, description, website) | `bloco1_public_companies_by_type.sql`, `bloco8_1_seed_clientes_content_contract.sql` |
| **Current Image Hosting** | **Vite static assets** at `/images/...` (public folder) — NOT yet in Supabase Storage | `src/content/assets.ts`, `src/mock/clients.ts`, seed migrations use COALESCE to Vite paths |
| **Fallback Strategy** | All public hooks use **DB-first → MOCK fallback** pattern | `usePublicServices`, `usePublicCompanies`, `usePublicPartnersAsPartnerVisuals` |

### Public Pages Consuming Assets

| Page | Entity | Image Fields Used | Current Source |
|------|--------|-------------------|----------------|
| `/` (Home) | Hero slides, Service cards | `HERO_ASSETS.homeSlides`, `SHOWCASE_SLIDES`, `SERVICE_IMAGES` | Vite static |
| `/servicos` | Services list | `card_image_url`, `hero_image_url`, `gallery[]` | DB view → MOCK (Vite) |
| `/servicos/:slug` | Service detail | `hero_image_url`, `gallery[]`, `card_image_url` | DB view → MOCK |
| `/clientes` | Clients (4 seeded) | `logo_url`, `relationship_metadata.hero_image_url` | DB view (seeded with Vite paths) → MOCK |
| `/parceiros` | Partners | Same as clients | DB view → MOCK |
| `/fornecedores` | Suppliers | Same as clients | DB view → MOCK |
| `/empresas` | Company solutions | Hero, cards | Vite static |
| `/blog` | Blog posts | Hero images | Vite static (no DB yet) |
| `/trabalhe-conosco` | Hero | Hero image | Vite static |
| `/suporte` | Cards | Icons only | Vite static |
| `/candidatos` | Cards | Icons only | Vite static |
| `/vagas` | Job cards | Company logos | Vite static / external |
| `/vagas/:slug` | Job detail | Company logo | Vite static / external |

---

## P0 — Asset Inventory (Read-Only)

### Deliverable: Markdown table per page/entity

For **each public page/entity** listed above, produce:

```markdown
## P0 — [Entity/Page Name]

### Images Currently Used
| Purpose | Variable/Prop | Current Path/URL | Storage Location | Referenced By |
|---------|--------------|------------------|------------------|---------------|
| Hero slide 1 | HERO_ASSETS.homeSlides[0] | /images/home/banners/banner-principal.webp | public/ (Vite) | Home.tsx, assets.ts |
| Service card (recrutamento) | SERVICE_IMAGES.recrutamento | /images/servicos/recrutamento-selecao/recrutamento-alt.jfif | public/ (Vite) | Servicos.tsx, mock/services.ts |
| Client logo (Abarca) | CLIENTS_LIST[0].logo | /images/clientes/Abarca Moveis.jpg | public/ (Vite) | Clientes.tsx, mock/clients.ts |
| Client hero (Mistral) | CLIENTS_LIST[2].image | /images/clientes/mistral-vidros-real.jpg | public/ (Vite) | Clientes.tsx, mock/clients.ts |
| ... | ... | ... | ... | ... |

### Classification
| Image | Static/Dynamic? | Should Be Dynamic? | Reason |
|-------|-----------------|-------------------|--------|
| Home hero slides | Static (config) | **Yes** — marketing controls | Content team needs to rotate |
| Service card images | Static (mock) | **Yes** — seeded in DB | Already have DB columns |
| Client logos/heros | Static (mock) | **Yes** — seeded in DB | Already have DB columns |
| Blog post heroes | Static | **Yes** — future CMS | No DB table yet |
| Job company logos | Mixed | **Yes** — from companies table | Companies already have logo_url |

### Asset References in Code
- **Static imports**: `import x from '@/assets/...'` — list files
- **Vite public paths**: `/images/...` — list all unique paths found via grep
- **External URLs**: `https://...` — list domains
- **Supabase Storage URLs**: `https://<project>.supabase.co/storage/v1/object/public/...` — list if any exist
- **media_asset.file_url**: Check if any code reads this field directly
```

### Search Commands to Run (Read-Only)

```bash
# 1. All Vite public image paths in src/
grep -r "/images/" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | sort -u

# 2. All static asset imports
grep -r "from '@/assets" src/ --include="*.ts" --include="*.tsx" | sort -u

# 3. All external image URLs
grep -r "https://.*\.(jpg|jpeg|png|webp|svg)" src/ --include="*.ts" --include="*.tsx" | sort -u

# 4. Supabase Storage URL patterns
grep -r "supabase.co/storage" src/ --include="*.ts" --include="*.tsx" | sort -u

# 5. media_assets references in frontend code
grep -r "media_assets\|mediaAssets" src/ --include="*.ts" --include="*.tsx" | sort -u

# 6. Public folder inventory
find public/images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.svg" \) | head -100
```

---

## P1 — Supabase Schema + Storage Mapping (Read-Only)

### Deliverable: Structured inventory

```markdown
## P1 — Supabase Database & Storage Inventory

### 1. Tables Supporting Public Content
| Table | Purpose | Key Columns for Assets | RLS Status | Public View? |
|-------|---------|------------------------|------------|--------------|
| media_assets | Central media catalog | id, tenant_id, entity_type, entity_id, bucket_id, storage_path, file_url, mime_type, width, height, alt_text, is_primary, sort_order | Enabled (tenant-scoped) | No (tenant-only) |
| companies | Company master | id, name, logo_url, description, website, industry, size, status | Enabled (tenant-scoped) | Yes: public_companies_by_type |
| company_relationships | Commercial role | id, company_id, relationship_type (client/partner/supplier), status, metadata (hero_image_url, description, website) | Enabled (tenant-scoped) | Yes: via view |
| services | Service catalog | id, tenant_id, name, slug, category, card_image_url, hero_image_url, icon, benefits, status, display_order | Enabled (tenant-scoped) | Yes: public_services_v1 |
| tenants | Tenant registry | id, slug, name | Enabled | No |
| blog_posts | Blog posts | **CHECK IF EXISTS** | | |
| jobs | Job postings | **CHECK logo_url, company_id** | | |

### 2. Public Views (Anon Access)
| View | Source Tables | Exposed Columns | Filter | Grants |
|------|---------------|-----------------|--------|--------|
| public_companies_by_type | companies JOIN company_relationships JOIN company_relationship_types | company_id, company_name, logo_url, description, website, industry, company_size, relationship_type, relationship_metadata (hero_image_url, etc.) | status=active + relationship status=active | GRANT SELECT TO anon, authenticated |
| public_services_v1 | services (+ media_assets for gallery) | id, name, slug, category, short_description, description, card_image_url, hero_image_url, icon, benefits, gallery (jsonb), status, display_order, SEO fields | tenant_id = js-empregos + status=published | GRANT SELECT TO anon, authenticated |

### 3. Storage Buckets
| Bucket | Public? | Size Limit | Allowed MIME Types | Current Usage | Policies |
|--------|---------|------------|-------------------|---------------|----------|
| public-media | Yes | 10MB | image/jpeg, png, webp, svg, gif | **CHECK: any objects?** | Public read, authenticated insert/update/delete |
| avatars | Yes | 5MB | image/jpeg, png, webp | **CHECK: any objects?** | Public read, authenticated insert/update/delete |
| private-documents | No | 20MB | images, pdf, docx | **CHECK: any objects?** | Authenticated only |

### 4. Entity → Asset Mapping (Current vs Desired)
| Entity | Current Image Fields | media_assets.entity_type | Storage Bucket | Gap |
|--------|---------------------|--------------------------|----------------|-----|
| Service | card_image_url, hero_image_url, gallery (view) | 'service' | public-media | Gallery works via view; card/hero still Vite paths in seed |
| Company (client) | logo_url, relationship_metadata.hero_image_url | 'company' (logo), 'company' (hero?) | public-media | Logo in companies table; hero in relationship metadata |
| Company (partner) | Same as client | 'company' | public-media | Same |
| Company (supplier) | Same as client | 'company' | public-media | Same |
| Blog Post | **CHECK IF EXISTS** | 'blog_post' | public-media | No table/view yet |
| Job | company_id → companies.logo_url | 'company' | public-media | Indirect via company |
| Candidate Avatar | **CHECK** | 'avatar' | avatars | Separate bucket |
| Document | **CHECK** | 'document' | private-documents | Separate bucket |

### 5. Migration History (Asset-Related)
List all migrations touching media_assets, storage buckets, public views, or image columns:

```bash
ls supabase/migrations/* | grep -iE "media|storage|image|asset|gallery|public.*service|public.*compan"
```

### 6. RLS & Access Patterns
- `media_assets`: Tenant-scoped RLS (INSERT/UPDATE/DELETE require `uploaded_by = current_person_id()`)
- `public_companies_by_type`: `security_invoker=false` → bypasses underlying table RLS for public SELECT
- `public_services_v1`: Same pattern
- Storage policies: `public-media` allows public SELECT, authenticated INSERT/UPDATE/DELETE

---

## P2 — Contract Definition (Out of Scope for This Audit)

*After P0/P1 complete, we will define:*
- `Asset` interface (id, tenant_id, entity_type, entity_id, asset_type, storage_path, mime_type, width, height, metadata)
- Logical keys: `company.logo`, `company.cover`, `service.hero`, `service.card`, `service.gallery[]`, `client.logo`, `client.hero`, `partner.logo`, `blog.hero`
- `<AssetImage asset={company.logo} alt={company.name} />` component
- Upload normalization (PNG/JPG/WebP → WebP, resize variants)

---

## Execution Rules for Auditor

1. **READ ONLY** — No `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `supabase migration new`, `supabase db push`
2. **Run search commands** — Use bash/grep/glob to collect evidence
3. **Read migrations** — Open and analyze each asset-related migration
4. **Check Supabase Dashboard (if MCP available)** — List buckets, objects, table row counts
5. **Document everything** — Tables, columns, views, buckets, policies, code references
6. **Flag gaps** — Where static Vite paths should become dynamic DB/Storage references
7. **No assumptions** — If unsure, mark as `UNKNOWN` and note what to verify

---

## Expected Output Format

```
AUDIT_REPORT_P0_P1.md

# P0 — Asset Inventory
## Home
### Images Currently Used
| Purpose | Variable | Path | Location | Referenced By |
|---|---|---|---|---|
...

## Servicos
...

## Clientes
...

# P1 — Supabase/Storage Mapping
## Tables
| Table | ... |
|---|---|

## Views
...

## Buckets
...

## Entity→Asset Mapping
...

## Migration History
...

## Gaps & Recommendations
- [ ] Service card/hero images still seeded as Vite paths → should be media_assets
- [ ] Client logos/heros seeded as Vite paths → should be media_assets
- [ ] No blog_posts table → needed for dynamic blog
- [ ] No media_assets records for existing seeded entities → need backfill
- [ ] Upload UI not connected to media_assets → CRUD gap
```

---

## Priority Order

1. **P0** — Complete asset inventory across all 13 public pages
2. **P1** — Complete Supabase schema/storage mapping for 6 entity types (services, clients, partners, suppliers, jobs, blog)
3. **Gap Analysis** — Explicit list of what must move from static → dynamic

**Do not proceed to P2/P3 until P0/P1 are delivered and reviewed.**