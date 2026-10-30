import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://jsempregos.com.br',
  'https://www.jsempregos.com.br',
  'https://jstercerizados.pages.dev',
  'http://localhost:3000',
  'http://localhost',
];

// MIME types permitidos: imagens para public-media, PDF para private-documents
const ALLOWED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_DOC_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE_IMAGE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE_DOC = 20 * 1024 * 1024; // 20 MB
const MAX_GALLERY_ITEMS = 10;

const ENTITY_TO_RESOURCE: Record<string, string> = {
  company: 'companies.media',
  service: 'services.media',
  partner: 'partners.media',
  supplier: 'suppliers.media',
  person: 'people.media',
  job: 'jobs.media',
};

const PRIMARY_PURPOSES = ['logo', 'hero', 'card', 'avatar'];

const BUCKET_FOR_PURPOSE: Record<string, string> = {
  logo: 'public-media',
  hero: 'public-media',
  card: 'public-media',
  gallery: 'public-media',
  avatar: 'avatars',
  cover: 'public-media',
  cv: 'private-documents',
};

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  'image/png': [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  ],
  'image/jpeg': [
    new Uint8Array([0xff, 0xd8, 0xff, 0xdb]),
    new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
    new Uint8Array([0xff, 0xd8, 0xff, 0xe1]),
  ],
  'image/webp': [
    new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]),
  ],
  'application/pdf': [new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])],
};

const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL');

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status: number, req: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
  });
}

function errorResponse(
  code: string,
  message: string,
  status: number,
  req: Request,
): Response {
  return json({ success: false, error: message, code }, status, req);
}

async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function validateMagicBytes(
  file: File,
  declaredMime: string,
): Promise<boolean> {
  const expectedSignatures = MAGIC_BYTES[declaredMime];
  if (!expectedSignatures) return Promise.resolve(false);

  return file
    .slice(0, 12)
    .arrayBuffer()
    .then((buffer) => {
      const header = new Uint8Array(buffer);
      return expectedSignatures.some((sig) =>
        sig.every((byte, i) => header[i] === byte),
      );
    });
}

async function notifyN8nWebhook(payload: unknown): Promise<void> {
  if (!N8N_WEBHOOK_URL) {
    console.error('[media-upload] N8N_WEBHOOK_URL not configured');
    return;
  }
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'media-upload',
        'X-Request-Id': crypto.randomUUID(),
      },
      body: JSON.stringify({
        ...payload,
        source: 'media-upload',
        sentAt: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error('[media-upload] n8n webhook failed:', err);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', 'Method not allowed', 405, req);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(
      'UNAUTHORIZED',
      'Missing Authorization header',
      401,
      req,
    );
  }

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Client with user JWT for auth validation
  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  // Service role client for Storage + media_assets write
  const adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    // 1. Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return errorResponse(
        'UNAUTHORIZED',
        'Invalid or expired token',
        401,
        req,
      );
    }

    const authUserId = user.id;

    // 2. Parse multipart form data
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const entityType = formData.get('entity_type') as string;
    const entityId = formData.get('entity_id') as string;
    const purpose = formData.get('purpose') as string;
    const altText = formData.get('alt_text') as string | null;
    const sortOrderStr = formData.get('sort_order') as string | null;

    if (!file || !entityType || !entityId || !purpose) {
      return errorResponse(
        'INVALID_REQUEST',
        'Missing required fields: file, entity_type, entity_id, purpose',
        400,
        req,
      );
    }

    // 3. Validate entity_type
    const resource = ENTITY_TO_RESOURCE[entityType];
    if (!resource) {
      return errorResponse(
        'INVALID_ENTITY_TYPE',
        `Invalid entity_type: ${entityType}`,
        400,
        req,
      );
    }

    // 4. Validate purpose
    const validPurposes = [
      'logo',
      'hero',
      'card',
      'gallery',
      'avatar',
      'cover',
      'cv',
    ];
    if (!validPurposes.includes(purpose)) {
      return errorResponse(
        'INVALID_PURPOSE',
        `Invalid purpose: ${purpose}`,
        400,
        req,
      );
    }

    // 5. Validate MIME type based on purpose
    const isDoc = purpose === 'cv';
    const allowedMimes = isDoc
      ? ALLOWED_DOC_MIME_TYPES
      : ALLOWED_IMAGE_MIME_TYPES;
    const maxSize = isDoc ? MAX_FILE_SIZE_DOC : MAX_FILE_SIZE_IMAGE;

    if (!allowedMimes.includes(file.type)) {
      const expected = isDoc ? 'PDF' : 'PNG, JPG ou WebP';
      return errorResponse(
        'INVALID_MIME_TYPE',
        `Formato não suportado. Use ${expected}.`,
        400,
        req,
      );
    }

    // 6. Validate magic bytes (file content matches declared MIME)
    const magicValid = await validateMagicBytes(file, file.type);
    if (!magicValid) {
      return errorResponse(
        'INVALID_FILE_CONTENT',
        'Conteúdo do arquivo não corresponde ao formato declarado.',
        400,
        req,
      );
    }

    // 7. Validate file size
    if (file.size > maxSize) {
      return errorResponse(
        'FILE_TOO_LARGE',
        `Arquivo muito grande. Máximo ${maxSize / 1024 / 1024} MB.`,
        413,
        req,
      );
    }

    // 8. Resolve person_id from auth_user_id
    const { data: person, error: personError } = await userClient
      .from('people')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (personError || !person) {
      return errorResponse(
        'PERSON_NOT_FOUND',
        'Identidade não encontrada. Complete seu cadastro ou contate o administrador.',
        403,
        req,
      );
    }
    const personId = person.id;

    // 9. Resolve tenant_id from active membership
    const { data: membership, error: membershipError } = await userClient
      .from('tenant_memberships')
      .select('tenant_id')
      .eq('person_id', personId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      return errorResponse(
        'TENANT_NOT_FOUND',
        'Nenhum tenant ativo encontrado para o usuário.',
        403,
        req,
      );
    }
    const tenantId = membership.tenant_id;

    // 10. Check permission via RPC (uses user_has_permission internally)
    const { data: hasPermission, error: permError } = await userClient.rpc(
      'user_has_permission',
      {
        p_auth_user_id: authUserId,
        p_resource: resource,
        p_action: 'write',
        p_tenant_id: tenantId,
      },
    );

    if (permError || !hasPermission) {
      return errorResponse(
        'PERMISSION_DENIED',
        `Sem permissão para upload de mídia em ${resource}.`,
        403,
        req,
      );
    }

    // 11. Verify entity exists and belongs to tenant
    const entityTable =
      entityType === 'company'
        ? 'companies'
        : entityType === 'service'
          ? 'services'
          : entityType === 'partner'
            ? 'company_relationships'
            : entityType === 'supplier'
              ? 'company_relationships'
              : entityType === 'person'
                ? 'people'
                : entityType === 'job'
                  ? 'jobs'
                  : null;

    if (!entityTable) {
      return errorResponse(
        'INVALID_ENTITY_TYPE',
        `Entity type not supported for verification`,
        400,
        req,
      );
    }

    let entityQuery = userClient
      .from(entityTable)
      .select('id')
      .eq('id', entityId);

    // person: verify via tenant_memberships (already done above)
    if (entityType === 'company' || entityType === 'service' || entityType === 'job') {
      entityQuery = entityQuery.eq('tenant_id', tenantId);
    } else if (entityType !== 'person') {
      // partner/supplier: verify via company_relationships tenant_id
      entityQuery = entityQuery.eq('tenant_id', tenantId);
    }

    const { data: entity, error: entityError } =
      await entityQuery.maybeSingle();
    if (entityError || !entity) {
      return errorResponse(
        'ENTITY_NOT_FOUND',
        'Entidade não encontrada ou sem acesso.',
        404,
        req,
      );
    }

    // 12. Check gallery limit (for gallery purpose)
    if (purpose === 'gallery') {
      const { count, error: countError } = await userClient
        .from('media_assets')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .is('metadata->>archived', null);

      if (countError) {
        console.error('[media-upload] Gallery count error:', countError);
      } else if (count && count >= MAX_GALLERY_ITEMS) {
        return errorResponse(
          'GALLERY_LIMIT_EXCEEDED',
          `Limite de ${MAX_GALLERY_ITEMS} imagens por galeria atingido.`,
          400,
          req,
        );
      }
    }

    // 13. Generate storage path
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const uuid = crypto.randomUUID();
    const bucketName = BUCKET_FOR_PURPOSE[purpose];
    const storagePath = `${entityType}/${entityId}/${purpose}/${uuid}.${fileExt}`;

    // 14. Read file buffer and compute integrity hash
    const fileBuffer = await file.arrayBuffer();
    const fileHash = await computeSha256(fileBuffer);

    // 14.5. Deduplication: check if an asset with the same hash already exists for this tenant
    const { data: existingAsset } = await adminClient
      .from('media_assets')
      .select('id, bucket_id, storage_path, file_url, file_name, mime_type, file_size_bytes, file_hash, entity_type, entity_id, purpose, is_primary, sort_order, alt_text, created_at, metadata')
      .eq('tenant_id', tenantId)
      .eq('file_hash', fileHash)
      .maybeSingle();

    if (existingAsset) {
      // Return existing asset without re-uploading
      return json(
        {
          success: true,
          asset: {
            id: existingAsset.id,
            bucket_id: existingAsset.bucket_id,
            storage_path: existingAsset.storage_path,
            file_url: existingAsset.file_url,
            file_name: existingAsset.file_name,
            mime_type: existingAsset.mime_type,
            file_size_bytes: existingAsset.file_size_bytes,
            file_hash: existingAsset.file_hash,
            is_primary: existingAsset.is_primary,
            sort_order: existingAsset.sort_order,
            alt_text: existingAsset.alt_text,
            created_at: existingAsset.created_at,
            metadata: existingAsset.metadata,
          },
          duplicate: true,
          bucket: existingAsset.bucket_id,
        },
        200,
        req,
      );
    }

    // 15. Upload to Storage using service_role
    const { error: uploadError } = await adminClient.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[media-upload] Storage upload error:', uploadError);
      return errorResponse(
        'UPLOAD_FAILED',
        'Falha ao enviar arquivo para o storage.',
        500,
        req,
      );
    }

    // 16. Get public URL (or signed URL for private buckets)
    const { data: urlData } = adminClient.storage
      .from(bucketName)
      .getPublicUrl(storagePath);
    const fileUrl = urlData.publicUrl;

    // 17. Determine sort_order
    let sortOrder = 0;
    if (sortOrderStr) {
      sortOrder = parseInt(sortOrderStr, 10);
    } else if (purpose === 'gallery') {
      const { data: maxOrder } = await userClient
        .from('media_assets')
        .select('sort_order')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('sort_order', { ascending: false })
        .limit(1);
      sortOrder = (maxOrder?.[0]?.sort_order ?? -1) + 1;
    }

    // 18. Insert media_assets record
    const { data: asset, error: assetError } = await adminClient
      .from('media_assets')
      .insert({
        tenant_id: tenantId,
        bucket_id: bucketName,
        storage_path: storagePath,
        file_url: fileUrl,
        file_name: `${uuid}.${fileExt}`,
        mime_type: file.type,
        file_size_bytes: file.size,
        file_hash: fileHash,
        width: null,
        height: null,
        entity_type: entityType,
        entity_id: entityId,
        uploaded_by: personId,
        alt_text: altText,
        title: null,
        description: null,
        metadata: { purpose, original_name: file.name },
        is_primary: PRIMARY_PURPOSES.includes(purpose),
        sort_order: sortOrder,
      })
      .select('*')
      .single();

    if (assetError || !asset) {
      // Cleanup storage on DB failure
      await adminClient.storage.from(bucketName).remove([storagePath]);
      console.error('[media-upload] media_assets insert error:', assetError);
      return errorResponse(
        'DB_INSERT_FAILED',
        'Falha ao registrar mídia no banco.',
        500,
        req,
      );
    }

    // 19. If primary purpose, call set_primary_media RPC
    if (PRIMARY_PURPOSES.includes(purpose)) {
      const { error: primaryError } = await adminClient.rpc(
        'set_primary_media',
        {
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_media_id: asset.id,
        },
      );

      if (primaryError) {
        console.error('[media-upload] set_primary_media error:', primaryError);
        await adminClient.storage.from(bucketName).remove([storagePath]);
        await adminClient.from('media_assets').delete().eq('id', asset.id);
        return errorResponse(
          'SET_PRIMARY_FAILED',
          'Falha ao definir mídia como principal. Upload revertido.',
          500,
          req,
        );
      }
    }

    // 20. Sync companies.logo_url for logo purpose
    let logoSyncSuccess = true;
    if (purpose === 'logo' && entityType === 'company') {
      const { error: logoSyncError } = await adminClient
        .from('companies')
        .update({ logo_url: fileUrl })
        .eq('id', entityId)
        .eq('tenant_id', tenantId);

      if (logoSyncError) {
        console.error(
          '[media-upload] companies.logo_url sync error:',
          logoSyncError,
        );
        logoSyncSuccess = false;
      }
    }

    // 21. Notify n8n webhook
    await notifyN8nWebhook({
      action: 'media_uploaded',
      entity_type: entityType,
      entity_id: entityId,
      purpose,
      tenant_id: tenantId,
      person_id: personId,
      asset_id: asset.id,
      file_url: fileUrl,
      file_name: `${uuid}.${fileExt}`,
      mime_type: file.type,
      file_size_bytes: file.size,
      file_hash: fileHash,
    });

    // 22. Return success
    return json(
      {
        success: true,
        asset: {
          id: asset.id,
          bucket_id: asset.bucket_id,
          storage_path: asset.storage_path,
          file_url: asset.file_url,
          file_name: asset.file_name,
          mime_type: asset.mime_type,
          file_size_bytes: asset.file_size_bytes,
          file_hash: asset.file_hash,
          is_primary: asset.is_primary,
          sort_order: asset.sort_order,
          alt_text: asset.alt_text,
          created_at: asset.created_at,
        },
        logo_sync: logoSyncSuccess,
        bucket: bucketName,
      },
      200,
      req,
    );
  } catch (error) {
    console.error('[media-upload] Exception:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      'Erro interno do servidor.',
      500,
      req,
    );
  }
});
