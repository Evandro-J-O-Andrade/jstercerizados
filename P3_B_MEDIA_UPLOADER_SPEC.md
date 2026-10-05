# P3-B — MediaUploader Component Specification

**Status**: Draft for review — no implementation yet  
**Scope**: Reusable React component for uploading assets to `media_assets` via server-side API

---

## 1. Component Interface

```tsx
interface MediaUploaderProps {
  entityType: 'company' | 'service' | 'partner' | 'supplier' | 'job' | 'blog_post' | 'page';
  entityId: string;
  purpose: 'logo' | 'hero' | 'card' | 'gallery' | 'avatar' | 'cover';
  onUploadComplete?: (asset: MediaAsset) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  maxFiles?: number;        // default: 1 (logo/hero/card), 10 (gallery)
  accept?: string;          // default: 'image/png,image/jpeg,image/webp'
  maxSizeMB?: number;       // default: 10
  showPreview?: boolean;    // default: true
  className?: string;
}

interface MediaAsset {
  id: string;
  bucket_id: string;
  storage_path: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  is_primary: boolean;
  sort_order: number;
  alt_text: string | null;
  created_at: string;
}
```

---

## 2. Variants by Purpose

| Purpose | Entity Types | Max Files | Primary Logic | UI Pattern |
|---------|--------------|-----------|---------------|------------|
| `logo` | company, partner, supplier | 1 | Single primary | Dropzone + preview (square) |
| `hero` | company, service, blog_post, page | 1 | Single primary | Dropzone + preview (wide 16:9) |
| `card` | service | 1 | Single primary | Dropzone + preview (4:3) |
| `gallery` | company, service | 10 | Multiple, sortable | Multi-file dropzone + reorderable grid |
| `avatar` | (people) | 1 | Single primary | Circle dropzone + preview |
| `cover` | blog_post, page | 1 | Single primary | Wide dropzone + preview |

---

## 3. Upload Flow (Server-Side Mediated)

```
User selects file(s)
       ↓
Client: Validate MIME + size (immediate feedback)
       ↓
Client: POST /api/media/upload (multipart/form-data)
       ↓
Server (Edge Function / API Route):
  1. Verify auth + permission (companies.media.write, etc.)
  2. Validate MIME (png/jpeg/webp only — reject SVG)
  3. Validate size (≤10MB)
  4. Generate storage_path: `{entityType}/{entityId}/{purpose}/{uuid}.webp`
  5. Convert to WebP (sharp, quality 85)
  6. Upload to Storage (service role)
  7. Insert media_assets (uploaded_by = current_person_id)
  8. If purpose=logo/hero/card: call set_primary_media RPC
  9. Return MediaAsset
       ↓
Client: Update UI, call onUploadComplete
```

---

## 4. API Endpoint: `POST /api/media/upload`

### Request (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Image file |
| `entity_type` | string | Yes | `company`, `service`, etc. |
| `entity_id` | UUID | Yes | Target entity ID |
| `purpose` | string | Yes | `logo`, `hero`, `card`, `gallery`, `avatar`, `cover` |
| `alt_text` | string | No | Accessibility text |
| `sort_order` | number | No | For gallery (auto-increment if omitted) |

### Response (200)

```json
{
  "success": true,
  "asset": {
    "id": "uuid",
    "bucket_id": "public-media",
    "storage_path: "company/abc-123/logo/xyz.webp",
    "file_url": "https://.../public-media/company/abc-123/logo/xyz.webp",
    "file_name": "xyz.webp",
    "mime_type": "image/webp",
    "width": 800,
    "height": 800,
    "is_primary": true,
    "sort_order": 0,
    "alt_text": "Logo da empresa",
    "created_at": "2026-10-04T..."
  }
}
```

### Response (400/403/413)

```json
{
  "success": false,
  "error": "Formato não suportado. Use PNG, JPG ou WebP.",
  "code": "INVALID_MIME_TYPE"
}
```

### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_MIME_TYPE` | 400 | Not png/jpeg/webp |
| `FILE_TOO_LARGE` | 413 | >10MB |
| `PERMISSION_DENIED` | 403 | User lacks `entityType.media.write` |
| `GALLERY_LIMIT_EXCEEDED` | 400 | >10 items in gallery |
| `ENTITY_NOT_FOUND` | 404 | entity_id doesn't exist |
| `UPLOAD_FAILED` | 500 | Storage/DB error |

---

## 5. Permission Check (Server-Side)

```typescript
// Required permissions per entity_type
const MEDIA_WRITE_PERMISSIONS: Record<string, string> = {
  company: 'companies.media.write',
  service: 'services.media.write',
  partner: 'partners.media.write',
  supplier: 'suppliers.media.write',
  job: 'jobs.media.write',
  blog_post: 'blog.media.write',
  page: 'pages.media.write',
};

async function checkMediaPermission(userId: string, entityType: string, entityId: string): Promise<boolean> {
  const permission = MEDIA_WRITE_PERMISSIONS[entityType];
  if (!permission) return false;
  
  // Check via AuthContext / RBAC
  const { data } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_permission: permission,
    p_resource_id: entityId  // for ownership checks
  });
  return data === true;
}
```

---

## 6. WebP Conversion (Server-Side)

```typescript
// Using sharp (available in Edge Runtime)
import sharp from 'sharp';

async function convertToWebP(buffer: Buffer, originalMime: string): Promise<Buffer> {
  const pipeline = sharp(buffer);
  
  // Preserve dimensions, convert to WebP quality 85
  const webpBuffer = await pipeline
    .webp({ quality: 85, effort: 4 })
    .toBuffer();
  
  // Get metadata for media_assets
  const metadata = await sharp(buffer).metadata();
  
  return {
    buffer: webpBuffer,
    width: metadata.width,
    height: metadata.height,
    originalMime
  };
}
```

---

## 7. Storage Path Convention

```
public-media/
├── company/
│   └── {company_id}/
│       ├── logo/
│       │   └── {uuid}.webp
│       ├── hero/
│       │   └── {uuid}.webp
│       └── gallery/
│           ├── {uuid}-1.webp
│           └── {uuid}-2.webp
├── service/
│   └── {service_id}/
│       ├── card/
│       │   └── {uuid}.webp
│       ├── hero/
│       │   └── {uuid}.webp
│       └── gallery/
│           └── ...
├── partner/
├── supplier/
├── job/
├── blog_post/
└── page/
```

---

## 8. MediaUploader Component Structure

```
MediaUploader/
├── MediaUploader.tsx           # Main component
├── DropZone.tsx                # Drag-drop + click area
├── Preview.tsx                 # Image preview with remove
├── GalleryGrid.tsx             # Reorderable grid (for gallery)
├── UploadProgress.tsx          # Progress bar + status
├── useMediaUpload.ts           # Hook: upload logic + validation
├── mediaApi.ts                 # API client (POST /api/media/upload)
└── index.ts                    # Exports
```

### Key Hook: `useMediaUpload`

```typescript
function useMediaUpload(props: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateFile = (file: File): string | null => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      return 'Formato não suportado. Use PNG, JPG ou WebP.';
    }
    if (file.size > (props.maxSizeMB ?? 10) * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${props.maxSizeMB ?? 10} MB.`;
    }
    return null;
  };
  
  const upload = async (file: File) => {
    const error = validateFile(file);
    if (error) { setErrors(f => ({ ...f, [file.name]: error })); return; }
    
    setUploading(true);
    setProgress(p => ({ ...p, [file.name]: 0 }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', props.entityType);
      formData.append('entity_id', props.entityId);
      formData.append('purpose', props.purpose);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        // Progress via XMLHttpRequest or stream
      });
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      props.onUploadComplete?.(result.asset);
      setFiles(f => f.filter(f => f !== file));
    } catch (err) {
      setErrors(e => ({ ...e, [file.name]: err.message }));
      props.onError?.(err);
    } finally {
      setUploading(false);
      setProgress(p => { const n = { ...p }; delete n[file.name]; return n; });
    }
  };
  
  return { files, setFiles, upload, uploading, progress, errors };
}
```

---

## 9. Gallery Reordering (Phase 1: Numeric Input)

```tsx
// GalleryGrid.tsx - Phase 1: simple number inputs
function GalleryGrid({ assets, onReorder }) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {assets.map((asset, index) => (
        <div key={asset.id} className="relative group">
          <img src={asset.file_url} alt={asset.alt_text} className="aspect-square object-cover rounded" />
          <input
            type="number"
            value={asset.sort_order}
            onChange={e => onReorder(asset.id, Number(e.target.value))}
            className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs px-1 rounded"
            min={0}
          />
          <button
            onClick={() => removeAsset(asset.id)}
            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 10. Usage Examples

### Company Logo (CRUD Empresa)

```tsx
<MediaUploader
  entityType="company"
  entityId={company.id}
  purpose="logo"
  maxFiles={1}
  onUploadComplete={asset => setCompanyLogo(asset.file_url)}
/>
```

### Service Card Image (CRUD Serviço)

```tsx
<MediaUploader
  entityType="service"
  entityId={service.id}
  purpose="card"
  maxFiles={1}
  onUploadComplete={asset => setCardImage(asset.file_url)}
/>
```

### Service Hero (CRUD Serviço)

```tsx
<MediaUploader
  entityType="service"
  entityId={service.id}
  purpose="hero"
  maxFiles={1}
  onUploadComplete={asset => setHeroImage(asset.file_url)}
/>
```

### Service Gallery (CRUD Serviço)

```tsx
<MediaUploader
  entityType="service"
  entityId={service.id}
  purpose="gallery"
  maxFiles={10}
  onUploadComplete={asset => addToGallery(asset)}
/>
```

---

## 11. Fallback Chain (Unchanged)

Public site continues to resolve images as:

```typescript
// In mappers (e.g., mapCompanyFromSupabase)
logo_url: mediaAsset?.file_url 
  ?? company.logo_url           // legacy Vite path
  ?? '/images/placeholder-logo.svg';
```

---

## 12. Implementation Order

1. **API Route** `/api/media/upload` (Edge Function preferred)
2. **Hook** `useMediaUpload` with validation
3. **Components** `DropZone`, `Preview`, `GalleryGrid`, `UploadProgress`
4. **Main** `MediaUploader` composition
5. **Integration** into Company/Service CRUD forms
6. **Testing** with one real company + one real service

---

## 13. Open Questions for Review

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Edge Function vs API Route? | Edge Function (lower latency) / Next.js API Route | Edge Function — runs at edge, service role available |
| 2 | Progress indication? | XMLHttpRequest / Fetch + ReadableStream | Fetch + stream (modern, simpler) |
| 3 | Client-side image compression? | Yes (browser canvas) / No (server only) | **No** — server does WebP conversion; keeps client simple |
| 4 | Delete asset button in gallery? | Yes / No | **Yes** — calls DELETE /api/media/{id} (server checks permission) |

---

## 14. Acceptance Criteria for P3-B Approval

- [ ] Component accepts all 6 purposes with correct constraints
- [ ] MIME validation rejects SVG on client + server
- [ ] Size validation at 10MB on client + server
- [ ] Permission check via `entityType.media.write` on server
- [ ] WebP conversion server-side (sharp)
- [ ] `is_primary` managed automatically for logo/hero/card
- [ ] Gallery limited to 10, sortable via `sort_order`
- [ ] Fallback chain unchanged (media_assets → legacy → placeholder)
- [ ] No direct client-to-Storage uploads
- [ ] TypeScript types exported for consumers

---

**Ready for review. Approve to proceed to implementation.**