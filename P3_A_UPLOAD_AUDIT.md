# P3-A — Upload Pipeline Audit (Read-Only) — **COMPLETE**

**Status**: Complete — no writes, no migrations, no seeds  
**Scope**: Actual Supabase schema, Storage policies, RPCs, permissions, Edge Functions runtime

---

## 1. `media_assets` Table — Actual Schema (Confirmed)

```sql
CREATE TABLE public.media_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  bucket_id       TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  file_size_bytes INTEGER,
  width           INTEGER,
  height          INTEGER,
  entity_type     TEXT NOT NULL,  -- 'service', 'company', 'job', 'blog_post', 'page', 'avatar', 'document'
  entity_id       UUID,            -- nullable for general uploads
  uploaded_by     UUID REFERENCES public.people(id),
  alt_text        TEXT,
  title           TEXT,
  description     TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_media_assets_storage UNIQUE (bucket_id, storage_path)
);
```

### ⚠️ **CONFIRMED: No `status` column exists**

| P2 Assumed | Actual Schema |
|------------|---------------|
| `status` column (`active`/`deleted`/etc.) | **Does NOT exist** |
| Soft delete via `status='deleted'` | **NOT POSSIBLE** — no status column |
| Primary asset via `is_primary` | ✅ Exists |

**Implication**: Asset replacement **must use `is_primary` swap**, not status change. Old asset archival via `metadata.archived=true`.

---

## 2. RPCs — Confirmed Existing

### `media_for_entity(entity_type, entity_id)` — ✅ Exists
```sql
CREATE OR REPLACE FUNCTION public.media_for_entity(
  p_entity_type text, p_entity_id uuid
) RETURNS TABLE (...) LANGUAGE sql STABLE SECURITY INVOKER
```
- Grants: `authenticated`, `service_role`
- Returns ordered assets (primary first, then sort_order, then created_at)

### `set_primary_media(entity_type, entity_id, media_id)` — ✅ Exists
```sql
CREATE OR REPLACE FUNCTION public.set_primary_media(
  p_entity_type text, p_entity_id uuid, p_media_id uuid
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
```
- Grants: **`service_role` only** (revoked from PUBLIC, authenticated, anon)
- Idempotent: unsets all, sets chosen as primary

---

## 3. Storage Buckets — Confirmed

| Bucket | Public? | Size Limit | Allowed MIME Types |
|--------|---------|------------|-------------------|
| `public-media` | **Yes** | 10 MB | `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `image/gif` |
| `avatars` | **Yes** | 5 MB | `image/jpeg`, `image/png`, `image/webp` |
| `private-documents` | **No** | 20 MB | images, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

### MIME Mismatch with P2 Decision
| P2 Decision | Bucket Config | Match? |
|-------------|---------------|--------|
| Accept PNG/JPEG/WebP | ✅ All three in `public-media` | ✅ Yes |
| **Reject SVG for user uploads** | ⚠️ `image/svg+xml` **allowed** in `public-media` | ❌ **Mismatch** |
| SVG system-only | Not enforced at bucket level | ⚠️ Needs app-level validation |

---

## 4. Storage Policies — `public-media` — **CRITICAL GAP**

```sql
-- Public read: ✅ Correct
CREATE POLICY public_media_read ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'public-media');

-- ⚠️ PROBLEM: ANY authenticated user can INSERT
CREATE POLICY public_media_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'public-media' AND auth.role() = 'authenticated');

-- ⚠️ PROBLEM: ANY authenticated user can UPDATE
CREATE POLICY public_media_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'public-media' AND auth.role() = 'authenticated');

-- ⚠️ PROBLEM: ANY authenticated user can DELETE
CREATE POLICY public_media_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'public-media' AND auth.role() = 'authenticated');
```

### Security Gap vs P2 Requirement

| P2 Required Permission | Actual Policy |
|------------------------|---------------|
| `companies.media.write` | ❌ Not enforced — any authenticated user |
| `services.media.write` | ❌ Not enforced — any authenticated user |
| `partners.media.write` | ❌ Not enforced — any authenticated user |
| `suppliers.media.write` | ❌ Not enforced — any authenticated user |

**Current state**: Any logged-in user can upload/overwrite/delete any file in `public-media`.

**Required for P3**: App-level validation **mandatory**; policy tightening can come later.

---

## 5. `media_assets` RLS Policies — Correctly Scoped

```sql
-- SELECT: tenant members can read
CREATE POLICY media_assets_tenant_read ON public.media_assets FOR SELECT
  USING (is_tenant_member(tenant_id));

-- INSERT: tenant member + must be uploader
CREATE POLICY media_assets_tenant_insert ON public.media_assets FOR INSERT
  WITH CHECK (is_tenant_member(tenant_id) AND uploaded_by = current_person_id());

-- UPDATE: tenant member + must be uploader
CREATE POLICY media_assets_tenant_update ON public.media_assets FOR UPDATE
  USING (is_tenant_member(tenant_id) AND uploaded_by = current_person_id());

-- DELETE: tenant member + must be uploader
CREATE POLICY media_assets_tenant_delete ON public.media_assets FOR DELETE
  USING (is_tenant_member(tenant_id) AND uploaded_by = current_person_id());
```

✅ **Correct** — tenant isolation + ownership enforced via `current_person_id()` and `is_tenant_member()`.

---

## 6. Permission System — Actual State

### `user_has_permission()` Function — ✅ Exists
```sql
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_auth_user_id uuid, p_resource text, p_action text, p_tenant_id uuid default null
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE
```
- Resolves `auth.uid()` → `people.id` → `role_assignments` → `role_permissions` → `permissions`
- Checks global roles (`admin_master`) + tenant-scoped roles
- Granted to `authenticated`

### **Media Permissions Do NOT Exist Yet**

Current canonical permissions (from `20260816000700_rbac.sql`):
```
people.read/create/update/disable
candidates.read/create/update
jobs.read/create/update/publish/delete
applications.read/update/reject/approve
companies.read/create/update
finance.read/create/update
audit.read
roles.manage, tenant.manage, integrations.manage
```

**Missing (P2 required):**
- `companies.media.write` / `companies.media.read`
- `services.media.write` / `services.media.read`
- `partners.media.write` / `partners.media.read`
- `suppliers.media.write` / `suppliers.media.read`
- `jobs.media.write`, `blog_post.media.write`, `page.media.write`

---

## 7. Auth Context Resolution — Confirmed

### `current_person_id()` — ✅ Exists
```sql
-- Used in media_assets RLS and multiple migrations
current_setting('app.current_person_id', true)::uuid
```
- Set via session/auth context
- Used in RLS policies for ownership checks

### `is_tenant_member(tenant_id)` — ✅ Exists
- Checks `tenant_memberships` for current person
- Used in all tenant-scoped RLS

### `AuthContext.tsx` — Frontend Pattern
- Loads session via `supabase.auth.getSession()`
- Fetches `person`, `roles`, `permissions[]` (15 real permissions)
- Provides `hasPermission(resource, action)` hook

---

## 8. Supabase Edge Functions — Existing Pattern

**Runtime**: Deno (imports from `https://deno.land/std@0.168.0/http/server.ts`)

**Existing Functions** (4 total):
| Function | Purpose | Auth Pattern |
|----------|---------|--------------|
| `turnstile-siteverify` | Cloudflare Turnstile verification | No auth required (public) |
| `handoff` | n8n webhook relay | No auth required (public) |
| `chat` | OpenRouter AI chat | No auth required (public) |
| `audit-probe` | Schema inspection | Service role (internal) |

**Pattern**: All use `serve()` from Deno std, manual CORS, JSON responses. **None use Supabase auth context** — they're either public or service-role only.

### ⚠️ **Sharp Compatibility: NOT AVAILABLE in Deno Edge Functions**

| Library | Node.js | Deno Edge Function |
|---------|---------|-------------------|
| `sharp` (libvips) | ✅ Native | ❌ **No** — native bindings not supported |
| `@img/sharp` (wasm) | ✅ | ⚠️ **Experimental**, large bundle |
| `deno-image` / `imagescript` | N/A | ✅ Pure JS/WASM alternatives |

**Finding**: `sharp` **cannot be used directly** in Supabase Edge Functions (Deno runtime). Alternatives:
1. **`imagescript`** — Pure WASM, supports WebP encoding
2. **`@img/sharp`** — WASM build of sharp (large, ~15MB)
3. **Client-side conversion** — Canvas API in browser before upload
4. **Separate Node.js service** — Not in current architecture

---

## 9. API Infrastructure — No `/api` Routes Exist

```bash
$ find src/app/api -name "*.ts" 2>/dev/null
# No results
```

**Current pattern**: All server-side logic via **Supabase Edge Functions** (`supabase/functions/*`) invoked via `supabase.functions.invoke()`.

---

## 10. Current Data State (Verified)

| Table/Bucket | Row Count | Notes |
|--------------|-----------|-------|
| `media_assets` | **0 rows** | Empty — no assets registered yet |
| `public-media` bucket | **0 objects** | Empty |
| `services` | 20 rows | Seeded with Vite paths in `card_image_url`/`hero_image_url` |
| `companies` (clients) | 4 rows | Seeded with Vite paths in `logo_url` + `metadata.hero_image_url` |

---

## 11. P3-B Implementation Feasibility Matrix

| Requirement | Feasible? | Blocker | Resolution |
|-------------|-----------|---------|------------|
| **No migration/schema change** | ✅ Yes | None | Schema ready |
| **No new bucket creation** | ✅ Yes | None | `public-media` exists |
| **Use existing Edge Function pattern** | ✅ Yes | None | Pattern established |
| **Server-side WebP conversion** | ⚠️ **No** | `sharp` not in Deno | Use `imagescript` (WASM) or client-side |
| **Permission check before service_role** | ✅ Yes | None | `user_has_permission()` exists |
| **Media permissions exist** | ❌ **No** | Not seeded | Must add permissions first (seed/migration) |
| **Storage policy tightening** | ⚠️ Deferred | Policy gap | App-level guard + future migration |
| **SVG rejection** | ✅ Yes | None | App-level MIME validation |
| **Gallery limit (10)** | ✅ Yes | None | App-level count check |
| **Soft delete via `status`** | ❌ **No** | Column missing | Use `is_primary` + `metadata.archived` |
| **No second `/api` infrastructure** | ✅ Yes | None | Use Edge Function pattern |

---

## 12. **VERDICT: P3-B CANNOT BE IMPLEMENTED AS SPECIFIED**

### Blockers (Must Resolve First)

| # | Blocker | Type | Resolution Required |
|---|---------|------|---------------------|
| 1 | **`sharp` incompatible with Deno Edge Functions** | Runtime | Choose: `imagescript` (WASM), client-side canvas, or defer conversion |
| 2 | **Media permissions don't exist** (`companies.media.write`, etc.) | Data/Schema | **Requires migration/seed** to insert permissions + role_permissions |
| 3 | **Storage policies too permissive** | Security | App-level guard mandatory; policy fix can be separate migration |
| 4 | **No `status` column** | Schema | P2 assumption invalid; use `is_primary` + `metadata.archived` |

### Can Proceed WITHOUT Migration? **NO**

- **Permission seed is a migration** (inserts into `permissions` + `role_permissions`)
- **WebP conversion strategy must be decided** (affects implementation)
- **Storage policy fix is a migration** (optional, can defer with app guard)

### Can Proceed WITHOUT Second API Infrastructure? **YES**

- Use existing **Edge Function pattern** (`supabase/functions/media-upload/`)
- Invoke via `supabase.functions.invoke('media-upload', { ... })`
- No `/api` routes needed

---

## 13. Recommended Path Forward

### Option A: Minimal P3 (Deferred Permissions)
1. **Add media permissions** via seed migration (required for any auth check)
2. **Implement Edge Function** with `imagescript` for WebP conversion
3. **App-level permission check** using `user_has_permission()` RPC
4. **Client-side MIME/size validation** (immediate feedback)
5. **Server validates again** before service-role Storage write

### Option B: Client-Side Conversion (No Server WASM)
1. Browser converts to WebP via Canvas API before upload
2. Server only validates + stores (no conversion)
3. Simpler Edge Function, but less control over quality

### Option C: Defer WebP Conversion
1. Accept PNG/JPEG/WebP as-is (bucket allows all three)
2. Store original MIME in `metadata.original_mime`
3. Add conversion later via background job or different infrastructure

---

## 14. Files to Reuse / Extend (If Proceeding)

| File | Purpose | Reuse? |
|------|---------|--------|
| `supabase/functions/turnstile-siteverify/index.ts` | Edge Function template (CORS, JSON, env) | ✅ Pattern |
| `supabase/functions/audit-probe/index.ts` | Service-role Supabase client pattern | ✅ Pattern |
| `supabase/migrations/20260902000003_03_cms_media.sql` | RPCs already deployed | ✅ Use as-is |
| `src/lib/supabase.ts` | Client creation | ✅ Use as-is |
| `src/contexts/AuthContext.tsx` | Permission loading (`permissions[]`) | ✅ Extend with media permissions |
| `src/components/auth/PermissionGuard.tsx` | Permission checking pattern | ✅ Extend |

---

## 15. Exact Answers to Mandatory Questions

### Q: Can P3-B be implemented without migration/schema change and without creating a second API infrastructure?

**NO — not without migration.**

| Aspect | Answer | Detail |
|--------|--------|--------|
| **Schema change** | ❌ Required | Media permissions must be inserted into `permissions` + `role_permissions` |
| **Second API infra** | ✅ Not needed | Use Edge Function pattern (`supabase/functions/media-upload/`) |
| **WebP conversion** | ❌ Blocked | `sharp` doesn't work in Deno; must choose alternative |
| **Auth before service_role** | ✅ Possible | `user_has_permission()` RPC exists, call from Edge Function |
| **Storage policy gap** | ⚠️ Acceptable with guard | App-level check compensates; policy fix can be separate |

### How Authorization Would Work (If Permissions Existed)

```typescript
// Edge Function: media-upload/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // 1. Get user from JWT (Authorization header)
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return json({ error: 'Unauthorized' }, 401);
  
  // 2. Check permission via RPC (uses user_has_permission internally)
  const { data: hasPerm } = await supabase.rpc('user_has_permission', {
    p_auth_user_id: user.id,
    p_resource: 'companies',  // or services, partners, etc.
    p_action: 'media.write',
    p_tenant_id: body.tenant_id  // from entity lookup
  });
  
  if (!hasPerm) return json({ error: 'Forbidden' }, 403);
  
  // 3. Validate MIME/size (reject SVG)
  // 4. Convert to WebP (imagescript WASM)
  // 5. Upload to Storage with service_role client
  // 6. Insert media_assets with uploaded_by = current_person_id()
  // 7. Call set_primary_media if logo/hero/card
  // 8. Return asset
});
```

---

## 16. Next Steps (Awaiting Decision)

**Do not implement P3-B yet.**

**Required decisions:**
1. **WebP conversion strategy**: `imagescript` (WASM in Edge) / client-side Canvas / defer
2. **Permission seed**: Approve migration to add media permissions
3. **Storage policy fix**: Separate migration or accept app-level guard only
4. **Soft delete approach**: Confirm `is_primary` + `metadata.archived` is acceptable

**Once decisions made**, I can draft the corrected P3-B spec with:
- Exact Edge Function code using chosen conversion
- Permission seed migration
- Updated component spec matching runtime reality