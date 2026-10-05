# P3-B — Upload Pipeline Implementation Audit (Read-Only)

**Status**: Complete — no writes, no code changes  
**Scope**: Existing Edge Function pattern, RBAC resolution, repositories, Supabase client

---

## 1. Existing Edge Function Infrastructure

### Pattern (All 4 functions follow this):
```typescript
// supabase/functions/<name>/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ALLOWED_ORIGINS = [/* ... */];

function corsHeaders(req: Request): Record<string, string> { /* ... */ }
function json(data: unknown, status: number, req: Request): Response { /* ... */ }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, req);
  
  try {
    const body = await req.json();
    // ... logic
    return json({ success: true, ... }, 200, req);
  } catch (error) {
    return json({ error: 'invalid_request' }, 400, req);
  }
});
```

### Current Functions:
| Function | Auth Pattern | Service Role? |
|----------|--------------|---------------|
| `turnstile-siteverify` | None (public) | No |
| `handoff` | None (public) | No |
| `chat` | None (public) | No |
| `audit-probe` | **Service role** (internal) | **Yes** |

### Client Invocation Pattern:
```typescript
// src/lib/n8n.ts, src/lib/chat-client.ts
const supabase = getSupabaseClient();
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { ... },
  method: 'POST'
});
```

### Development Proxy:
- `/api/handoff` → `handoff` function (dev)
- `/api/chat` → `chat` function (dev)

---

## 2. RBAC Resolution (AuthContext.tsx)

### Resolution Chain:
```
auth.uid() (JWT)
    ↓
people table (auth_user_id → person.id)
    ↓
tenant_memberships (person_id, status='active')
    ↓
role_assignments (person_id, role_id)
    ↓
roles (id, name, scope: 'global'|'tenant')
    ↓
role_permissions (role_id, permission_id)
    ↓
permissions (id, code, resource, action, description)
    ↓
normalizePermissions() → Permission[] { name: 'resource.action' }
```

### Frontend Permission Check:
```typescript
// AuthContext.tsx
hasPermission: (permissionKey: string) => boolean
hasAnyPermission: (permissionKeys: string[]) => boolean
hasAllPermissions: (permissionKeys: string[]) => boolean

// Usage in components:
const { hasPermission } = useAuth();
if (hasPermission('companies.media.write')) { /* ... */ }
```

### Server-Side Permission Check (RPC):
```sql
-- user_has_permission(auth_user_id, resource, action, tenant_id)
SELECT user_has_permission(auth.uid(), 'companies', 'media.write', 'tenant-id');
```

---

## 3. Repository Pattern (Base + Examples)

### Base Class:
```typescript
// src/repositories/supabase.repository.ts
export class SupabaseRepository {
  protected supabase: ReturnType<typeof getSupabaseClient> | null = null;
  
  constructor(supabase?: ReturnType<typeof getSupabaseClient>) {
    this.supabase = supabase ?? getSupabaseClient();
  }
}
```

### Entity Repositories:
| Repository | Key Methods | Notes |
|------------|-------------|-------|
| `companiesRepository` | `findAll(tenantId)`, `findById`, `create`, `update`, `delete`, `findPublicByRelationshipType` | Uses `public_companies_by_type` view |
| `servicesRepository` | `findServices(tenantId)`, `createService`, `updateService`, `deleteService`, `findPublicServices` | Uses `public_services_v1` view |
| `partnersRepository` | `findAll(tenantId)`, `findById` | Joins `company_relationships` + `companies` |
| `suppliersRepository` | `findAll(tenantId)`, `findById` | Same pattern as partners |

### Media-Related:
- **No `media.repository.ts` exists yet**
- `public_companies_by_type` and `public_services_v1` already consume `media_assets` for logo/image/gallery
- No server-side media upload logic exists

---

## 4. Supabase Client & Auth Flow

### Client Creation:
```typescript
// src/lib/supabase.ts
createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
```
- Single client instance (cached)
- Uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)

### Auth Flow:
1. User logs in → JWT in cookie/localStorage
2. `AuthProvider` loads person → memberships → roles → permissions
3. Permissions available via `useAuth().hasPermission('resource.action')`
4. Client calls Edge Functions via `supabase.functions.invoke()` with JWT automatically attached

---

## 5. Storage & Media Assets (Post P3-A)

### Database:
| Table | Key Columns | RLS |
|-------|-------------|-----|
| `media_assets` | `entity_type`, `entity_id`, `bucket_id`, `storage_path`, `file_url`, `mime_type`, `is_primary`, `sort_order`, `uploaded_by`, `tenant_id`, `metadata` | Tenant + ownership (`uploaded_by = current_person_id()`) |

### RPCs (Ready):
- `media_for_entity(entity_type, entity_id)` → ordered assets (granted to `authenticated`, `service_role`)
- `set_primary_media(entity_type, entity_id, media_id)` → idempotent primary swap (granted to `service_role` only)

### Storage (Post P3-A.2):
| Bucket | Read | Write |
|--------|------|-------|
| `public-media` | **public** | **service_role only** |
| `avatars` | public | authenticated (unchanged) |
| `private-documents` | authenticated | authenticated (unchanged) |

### Permissions (Post P3-A.1):
| Permission | Granted To |
|------------|------------|
| `companies.media.read/write/delete` | `admin_master`, `tenant_admin` |
| `services.media.read/write/delete` | `admin_master`, `tenant_admin` |
| `partners.media.read/write/delete` | `admin_master`, `tenant_admin` |
| `suppliers.media.read/write/delete` | `admin_master`, `tenant_admin` |

---

## 6. P3-B Implementation Requirements

### Edge Function: `supabase/functions/media-upload/index.ts`

**Responsibilities:**
1. **Auth validation**: Extract JWT from `Authorization` header → `supabase.auth.getUser()`
2. **Person resolution**: `people` table via `auth_user_id`
3. **Tenant resolution**: `tenant_memberships` (active) → primary tenant
4. **Permission check**: `user_has_permission(auth_user_id, resource, 'media.write', tenant_id)`
   - `resource` derived from `entity_type`: `companies` → `companies`, `services` → `services`, etc.
5. **Input validation**:
   - MIME: `image/png`, `image/jpeg`, `image/webp` only (reject SVG)
   - Size: ≤ 10 MB
   - Gallery count: ≤ 10 items per entity
6. **File processing**:
   - Generate secure path: `public-media/{entity_type}/{entity_id}/{purpose}/{uuid}.{ext}`
   - **No WebP conversion** (deferred per decision)
   - Preserve original extension/MIME
7. **Storage upload**: Use **service_role client** (created inside function)
8. **DB insert**: `media_assets` with `uploaded_by = current_person_id()`, `tenant_id`, `entity_type`, `entity_id`, `is_primary`, `sort_order`
9. **Primary management**: If `purpose` in `['logo', 'hero', 'card']`, call `set_primary_media` RPC
10. **Response**: Return created `MediaAsset`

### Client: `MediaUploader` Component

**Props:**
```typescript
interface MediaUploaderProps {
  entityType: 'company' | 'service' | 'partner' | 'supplier';
  entityId: string;
  purpose: 'logo' | 'hero' | 'card' | 'gallery';
  onUploadComplete?: (asset: MediaAsset) => void;
  onError?: (error: Error) => void;
  maxFiles?: number;        // 1 for logo/hero/card, 10 for gallery
  accept?: string;          // 'image/png,image/jpeg,image/webp'
  maxSizeMB?: number;       // 10
  disabled?: boolean;
}
```

**Flow:**
1. User selects file(s) → client-side MIME/size validation
2. For each file: `POST` to Edge Function via `supabase.functions.invoke('media-upload', { body: formData })`
3. Progress tracking via `XMLHttpRequest` or `fetch` + stream
4. On success: call `onUploadComplete(asset)`, update UI
5. Gallery: support reorder (`sort_order`), delete (archive via `metadata.archived=true` + `is_primary=false`)

### Integration Points:
| Domain | Repository | CRUD Form Location |
|--------|------------|-------------------|
| Companies | `companiesRepository` | `/dashboard/empresas` (create/edit) |
| Services | `servicesRepository` | `/dashboard/servicos` (create/edit) |
| Partners | `partnersRepository` | `/dashboard/parceiros` (create/edit) |
| Suppliers | `suppliersRepository` | `/dashboard/fornecedores` (create/edit) |

---

## 7. Files to Create/Modify

### New Files:
| File | Purpose |
|------|---------|
| `supabase/functions/media-upload/index.ts` | Edge Function for upload |
| `src/repositories/media.repository.ts` | Media CRUD (optional, for gallery management) |
| `src/components/media/MediaUploader.tsx` | Main uploader component |
| `src/components/media/DropZone.tsx` | Drag-drop area |
| `src/components/media/Preview.tsx` | Image preview with remove |
| `src/components/media/GalleryGrid.tsx` | Reorderable gallery grid |
| `src/hooks/useMediaUpload.ts` | Upload logic hook |

### Existing Files to Extend:
| File | Change |
|------|--------|
| Company/Service/Partner/Supplier CRUD forms | Add `MediaUploader` for logo/hero/card/gallery |

---

## 8. Security Checklist (Must Verify)

- [ ] Edge Function validates JWT before any operation
- [ ] Edge Function resolves person → tenant → permission via `user_has_permission`
- [ ] Edge Function rejects SVG (MIME validation)
- [ ] Edge Function enforces 10 MB limit
- [ ] Edge Function enforces gallery limit (10)
- [ ] Edge Function uses `service_role` **only inside function**, never exposed to client
- [ ] Storage `public-media` write restricted to `service_role` (P3-A.2 ✅)
- [ ] Client never receives `service_role` key
- [ ] Client-side validation is UX only; server revalidates everything
- [ ] `media_assets` insert uses `uploaded_by = current_person_id()`, `tenant_id`
- [ ] Primary swap uses `set_primary_media` RPC (service_role only)

---

## 9. Ready for Implementation

**No migrations, no schema changes, no new buckets, no new API infrastructure needed.**

All primitives exist:
- ✅ `media_assets` table
- ✅ `public-media` bucket (hardened)
- ✅ `media_for_entity` / `set_primary_media` RPCs
- ✅ RBAC permissions (`companies.media.write`, etc.)
- ✅ Edge Function pattern established
- ✅ Repository pattern established
- ✅ Auth resolution chain working

**Next step**: Implement `supabase/functions/media-upload/index.ts` + `MediaUploader` component.