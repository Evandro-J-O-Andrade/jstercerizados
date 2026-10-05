# P2 — Asset Contract Specification

**Status**: Draft for review  
**Scope**: Read-only specification — no code changes, no DB changes  
**Based on**: P0/P1 Audit findings (existing `media_assets`, `public-media`, public views)

---

## 1. Logical Asset Keys

The contract defines **logical keys** that frontend components use. These keys are stable regardless of physical file format, storage path, or CDN URL.

### Company / Client / Partner / Supplier

| Logical Key | `entity_type` | `entity_id` | Selection Rule | Fallback |
|-------------|---------------|-------------|----------------|----------|
| `company.logo` | `company` | `companies.id` | `is_primary=true` OR `alt_text ILIKE '%logo%'` (first by `sort_order`) | `companies.logo_url` (Vite path) |
| `company.hero` | `company` | `companies.id` | `alt_text ILIKE '%hero%'` OR `title ILIKE '%hero%'` (first by `sort_order`) | `company_relationships.metadata->>'hero_image_url'` |
| `company.gallery[]` | `company` | `companies.id` | All non-primary, non-hero assets ordered by `sort_order` | `[]` |

### Service

| Logical Key | `entity_type` | `entity_id` | Selection Rule | Fallback |
|-------------|---------------|-------------|----------------|----------|
| `service.card` | `service` | `services.id` | `is_primary=true` OR `alt_text ILIKE '%card%'` | `services.card_image_url` (Vite path) |
| `service.hero` | `service` | `services.id` | `alt_text ILIKE '%hero%'` OR `title ILIKE '%hero%'` | `services.hero_image_url` (Vite path) |
| `service.gallery[]` | `service` | `services.id` | All assets ordered by `is_primary DESC, sort_order ASC` | `[]` |

### Job

| Logical Key | Resolution |
|-------------|------------|
| `job.company.logo` | Delegates to `company.logo` via `jobs.company_id` → `companies.id` |

### Blog Post (future)

| Logical Key | `entity_type` | `entity_id` | Selection Rule | Fallback |
|-------------|---------------|-------------|----------------|----------|
| `blog.hero` | `blog_post` | `blog_posts.id` | `is_primary=true` OR `alt_text ILIKE '%hero%'` | `/images/blog/fallbacks/blog.svg` |
| `blog.gallery[]` | `blog_post` | `blog_posts.id` | All ordered by `sort_order` | `[]` |

### Candidate Avatar

| Logical Key | `entity_type` | `entity_id` | Selection Rule | Bucket |
|-------------|---------------|-------------|----------------|--------|
| `candidate.avatar` | `avatar` | `people.id` | `is_primary=true` | `avatars` |

### Document (private)

| Logical Key | `entity_type` | `entity_id` | Selection Rule | Bucket |
|-------------|---------------|-------------|----------------|--------|
| `document.file` | `document` | variable | All active assets | `private-documents` |

---

## 2. Physical Schema Mapping

### `media_assets` Columns Used

| Logical Concept | `media_assets` Column | Notes |
|-----------------|----------------------|-------|
| Entity binding | `entity_type`, `entity_id` | Required for all assets |
| Storage reference | `bucket_id`, `storage_path`, `file_url` | `file_url` is the public CDN URL |
| File identity | `file_name`, `mime_type`, `file_size_bytes` | `mime_type` = canonical format |
| Dimensions | `width`, `height` | For responsive `srcset` |
| Accessibility | `alt_text`, `title`, `description` | `alt_text` mandatory for public images |
| Ordering | `is_primary`, `sort_order` | `is_primary` = single source of truth per role |
| Metadata | `metadata` (jsonb) | Extensible: focal point, crop, variants, etc. |
| Audit | `tenant_id`, `uploaded_by`, `created_at`, `updated_at` | Tenant-scoped, owner-tracked |

### Bucket Assignment

| `entity_type` | Bucket | Public? |
|---------------|--------|---------|
| `company`, `service`, `blog_post` | `public-media` | **Yes** |
| `avatar` | `avatars` | **Yes** |
| `document` | `private-documents` | **No** |

---

## 3. MIME Type Policy

### Accepted for Public Assets (`public-media`, `avatars`)

| Category | MIME Types | Notes |
|----------|------------|-------|
| **Raster (preferred)** | `image/webp`, `image/jpeg`, `image/png` | WebP preferred for delivery |
| **Vector (system-only)** | `image/svg+xml` | **Only** for system-controlled logos/icons; **never** user uploads |
| **Legacy** | `image/gif` | Allowed but discouraged |

### Rejected for User Uploads

- `image/svg+xml` (XSS risk in user content)
- `application/pdf` (use `private-documents`)
- Any non-image MIME

### Normalization Pipeline (P3)

```
Upload (PNG / JPEG / WebP)
    ↓
Validate MIME + size + dimensions
    ↓
Convert to WebP (quality 85) for delivery
    ↓
Store original + WebP variant in Storage
    ↓
media_assets.mime_type = 'image/webp'
media_assets.metadata.original_mime = 'image/png' | 'image/jpeg' | 'image/webp'
media_assets.metadata.variants = { 
  webp: { url, width, height }, 
  original: { url, width, height } 
}
```

**Result**: Frontend always receives `image/webp` URLs. Original preserved for re-processing.

---

## 4. Validation Rules

### Client-Side (Upload Component)

| Rule | Value | Error Message |
|------|-------|---------------|
| Max file size | 10 MB (`public-media`), 5 MB (`avatars`) | "Arquivo muito grande. Máximo 10 MB." |
| Min dimensions | 200×200 px (logo), 1200×630 px (hero) | "Imagem muito pequena. Mínimo 200×200." |
| Max dimensions | 4000×4000 px | "Imagem muito grande. Máximo 4000×4000." |
| Aspect ratio (logo) | 1:1 ± 20% | "Logo deve ser aproximadamente quadrada." |
| Aspect ratio (hero) | 16:9 ± 10% | "Hero deve ser 16:9 (1200×630 recomendado)." |
| Allowed MIME | `image/webp`, `image/jpeg`, `image/png` | "Formato não suportado. Use WebP, JPG ou PNG." |

### Server-Side (RLS + RPC)

- `media_assets` INSERT requires `uploaded_by = current_person_id()`
- `tenant_id` must match user's active tenant
- `entity_type` must be in allowed list
- `entity_id` must exist and belong to same tenant
- `bucket_id` must match `entity_type` bucket assignment
- `is_primary` uniqueness: at most 1 primary per `(entity_type, entity_id)`

---

## 5. Fallback Strategy (Migration Period)

During gradual migration (P5/P6), the resolver follows this chain:

```typescript
function resolveAssetUrl(logicalKey: AssetKey): string {
  // 1. Try media_assets (Storage)
  const asset = await fetchMediaAsset(logicalKey);
  if (asset?.file_url) return asset.file_url;

  // 2. Fallback to legacy DB column (Vite path)
  const legacy = await fetchLegacyColumn(logicalKey);
  if (legacy) return legacy; // e.g., '/images/servicos/...'

  // 3. Fallback to static placeholder
  return getPlaceholder(logicalKey.entityType);
}
```

**Implemented in**: `service-mapper.ts`, `client-visual.ts`, `job-mapper.ts`, `partner-visual.ts`, `supplier-visual.ts`

**No breaking changes**: Existing pages continue working via Vite paths until `media_assets` records exist.

---

## 6. Frontend Contract

### Asset Resolver Hook (to be created in P3)

```typescript
interface AssetResolver {
  // Returns public CDN URL or Vite fallback
  getUrl(logicalKey: AssetKey): string;

  // Returns full asset metadata for <picture>/srcset
  getAsset(logicalKey: AssetKey): MediaAsset | null;

  // Returns gallery array
  getGallery(entityType: string, entityId: string): MediaAsset[];
}

// Usage in components
<AssetImage
  key="service.hero"
  entityType="service"
  entityId={service.id}
  assetRole="hero"
  alt={service.title}
/>

<AssetGallery
  entityType="service"
  entityId={service.id}
/>
```

### TypeScript Types

```typescript
type AssetRole = 'logo' | 'hero' | 'card' | 'avatar' | 'document';

type AssetKey =
  | { entityType: 'company'; entityId: string; role: 'logo' | 'hero' }
  | { entityType: 'service'; entityId: string; role: 'card' | 'hero' }
  | { entityType: 'blog_post'; entityId: string; role: 'hero' }
  | { entityType: 'avatar'; entityId: string; role: 'avatar' };

interface MediaAsset {
  id: string;
  file_url: string;
  mime_type: string;
  width: number;
  height: number;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  metadata: {
    variants?: Record<string, { url: string; width: number; height: number }>;
    focal_point?: { x: number; y: number };
    [key: string]: unknown;
  };
}
```

---

## 7. Security & Permissions

### Current State (from P1)
- `public-media`: Any authenticated user can INSERT/UPDATE/DELETE
- `media_assets`: Tenant-scoped, owner-checked on write

### Required for SaaS (P3/P4)

| Permission | Resource | Description |
|------------|----------|-------------|
| `companies.media.write` | Company assets | Create/update/delete logo, hero, gallery |
| `services.media.write` | Service assets | Create/update/delete card, hero, gallery |
| `partners.media.write` | Partner assets | Same as companies |
| `suppliers.media.write` | Supplier assets | Same as companies |
| `candidates.media.write` | Avatar | Own avatar only |
| `documents.media.write` | Private docs | Own documents only |

### Implementation Pattern

```sql
-- In media_assets INSERT policy (replace current)
WITH CHECK (
  is_tenant_member(tenant_id)
  AND uploaded_by = current_person_id()
  AND has_media_permission(entity_type, entity_id, 'write')
)

-- Function to check permission
CREATE FUNCTION has_media_permission(
  p_entity_type text,
  p_entity_id uuid,
  p_action text
) RETURNS boolean ...
```

**Do not change policies yet** — document here, implement in P3 after contract approval.

---

## 8. CRUD Integration Points (P4)

### Company CRUD (Dashboard)
- Fields: Logo upload, Hero upload, Gallery multi-upload
- On save: upsert `media_assets` with correct `entity_type='company'`, `entity_id=company.id`
- `is_primary` management: only one logo, one hero

### Service CRUD (Dashboard)
- Fields: Card image, Hero image, Gallery
- Same `media_assets` pattern with `entity_type='service'`

### Client/Partner/Supplier
- Use existing `company_relationships` flow
- Logo/Hero stored on `companies` + `company_relationships.metadata`
- `media_assets` linked to `companies.id`

---

## 9. Backfill Strategy (Not in P2/P3)

**Explicitly deferred** — do not auto-migrate Vite paths.

### Manual Process (Post P5)
1. Content team reviews each service/client image
2. Approves or replaces via CRUD upload
3. System creates `media_assets` record
4. Public view immediately serves Storage URL
5. Vite file can be deleted after verification

### Seed Data
- Keep current seeds with Vite paths as fallback
- New CRUD entries use Storage from day one

---

## 10. Decisions (Approved)

| # | Decision | Resolution | Rationale |
|---|----------|------------|-----------|
| 1 | SVG for logos in user uploads | **No** — only PNG/JPEG/WebP | Prevents XSS/malformed SVG; system-controlled logos only |
| 2 | Auto-convert to WebP for delivery | **Yes** | Normalizes any input (PNG/JPG/WebP) to WebP; original preserved |
| 3 | Focal point / smart crop | **Deferred** — schema ready (`metadata.focal_point`), not implemented in P3 | Useful for hero, but not blocking |
| 4 | CDN/Cache strategy | **Stable URL + Supabase Storage CDN** | No custom infra; `storage_path` includes content hash for immutability |
| 5 | Asset replacement | **Soft delete** — old asset `status='deleted'`, new becomes `is_primary=true` | Preserves history, avoids broken refs, enables audit |
| 6 | Gallery limit per entity | **10 images** initially | Prevents abuse, keeps pages light; configurable via `metadata.max_gallery` |

---

## 11. Architectural Rule: Logical Key Over Physical Filename

> **The uploaded file's extension/name never determines the asset contract. The contract is defined by `entity_type`, `entity_id`, logical role, and priority (`is_primary`).**

### Examples

```
User uploads:                    Logical contract:
─────────────────────────        ────────────────────
empresa.png          ──►         company.logo (is_primary=true)
logo-nova.webp       ──►         company.logo (is_primary=true)
recrutamento-selecao.png ──►    service.card (is_primary=true)
hero-final.jpg       ──►         service.hero (is_primary=true)
gallery-01.webp      ──►         service.gallery[0] (sort_order=1)
gallery-02.jpg       ──►         service.gallery[1] (sort_order=2)
```

**Result**: Swapping `recrutamento-selecao.png` → `recrutamento-selecao.webp` requires **zero** changes to TSX, routes, slugs, or content DB. The resolver always returns the current `is_primary` asset for that logical key.

---

## 12. Updated Flow Diagrams

### Company CRUD → Public Site

```
CRUD Empresa
    │
    ├── Dados da empresa
    │
    └── Logo
          │
          ├── PNG
          ├── JPG/JPEG
          └── WebP
                  ↓
             Valida MIME (image/png|jpeg|webp)
                  ↓
          Valida tamanho (≤10MB) + dimensões (≥200×200)
                  ↓
       Upload public-media (Supabase Storage)
                  ↓
          registra media_assets
          {
            entity_type: 'company',
            entity_id: <company-uuid>,
            asset_role: 'logo',
            is_primary: true,
            mime_type: 'image/webp',
            metadata: { original_mime: 'image/png', ... }
          }
                  ↓
        company.logo → primary
                  ↓
       public_companies_by_type (view)
                  ↓
             SITE PÚBLICO
```

### Service CRUD → Public Site

```
CRUD Serviço
    │
    ├── Imagem do card  ──► service.card (is_primary)
    ├── Imagem do hero  ──► service.hero (is_primary)
    └── Galeria[]       ──► service.gallery[] (sort_order)
             ↓
       media_assets (entity_type='service')
             ↓
      public_services_v1 (view + gallery JSONB)
             ↓
      /servicos  +  /servicos/:slug
```

### Job → Company Logo (Delegation)

```
Vaga (jobs.company_id)
      │
      ▼
Company (companies.id)
      │
      ▼
company.logo  (via media_assets)
      │
      ▼
public_jobs_v1.company_logo_url
      │
      ▼
/vagas  +  /vagas/:slug
```

---

## 13. Open Questions for Review (Remaining)

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Max file size for hero images | 10 MB / 20 MB | 10 MB (same as public-media limit) |
| 2 | Aspect ratio enforcement | Strict (reject) / Warn only | Warn only — allow but show preview |
| 3 | Gallery reorder UX | Drag-drop / Number input | Drag-drop in P4 CRUD |

---

## 14. Acceptance Criteria for P2 Approval (Updated)

- [x] Logical keys cover all current public pages
- [x] Fallback chain documented and implemented in mappers
- [x] MIME policy matches Storage bucket config (WebP/JPEG/PNG only)
- [x] Permission model aligns with existing RBAC (per-resource)
- [x] No new tables/buckets required
- [x] Contract is testable (resolver tests can be written)
- [x] **Decisions 1-6 resolved**
- [x] **Architectural rule: logical key over physical filename**
- [x] **Flow diagrams match CRUD → Storage → View → Public Site**

---

## 15. Next Steps After Approval

```
P2 Approved (with decisions above)
    ↓
P3 — Upload Pipeline Implementation
    ├── AssetUpload component (React)
    │   ├── MIME validation (png/jpeg/webp)
    │   ├── Size/dimensions validation
    │   ├── Drag-drop + preview
    │   └── Progress + error handling
    ├── Server-side
    │   ├── Storage upload (public-media)
    │   ├── WebP conversion (sharp/libvips)
    │   ├── media_assets upsert RPC
    │   ├── is_primary management (atomic swap)
    │   └── Permission checks (per-resource)
    └── Integration tests
    ↓
P4 — CRUD Integration
    ├── Company form: logo/hero/gallery
    ├── Service form: card/hero/gallery
    └── Client/Partner/Supplier: reuse company flow
    ↓
P5 — Public Site Migration
    ├── Update mappers to use resolver
    ├── Verify each page
    └── Gradual mock removal
```

---

**End of P2 Specification — Decisions Resolved**  
Ready for explicit approval before P3 implementation.

---

## 11. Acceptance Criteria for P2 Approval

- [ ] Logical keys cover all current public pages
- [ ] Fallback chain documented and implemented in mappers
- [ ] MIME policy matches Storage bucket config
- [ ] Permission model aligns with existing RBAC
- [ ] No new tables/buckets required
- [ ] Contract is testable (can write resolver tests against it)

---

## 12. Next Steps After Approval

```
P2 Approved
    ↓
P3 — Upload Pipeline Implementation
    ├── AssetUpload component (React)
    ├── media_assets upsert RPC
    ├── Storage upload + WebP conversion
    ├── Permission checks
    └── Integration tests
    ↓
P4 — CRUD Integration
    ├── Company form: logo/hero/gallery
    ├── Service form: card/hero/gallery
    └── Client/Partner/Supplier: reuse company flow
    ↓
P5 — Public Site Migration
    ├── Update mappers to use resolver
    ├── Verify each page
    └── Gradual mock removal
```

---

**End of P2 Specification**  
Ready for review. No implementation until explicit approval.