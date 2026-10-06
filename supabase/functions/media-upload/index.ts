import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://jsempregos.com.br',
  'https://www.jsempregos.com.br',
  'https://jstercerizados.pages.dev',
  'http://localhost:3000',
  'http://localhost',
];

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_GALLERY_ITEMS = 10;

const ENTITY_TO_RESOURCE: Record<string, string> = {
  company: 'companies.media',
  service: 'services.media',
  partner: 'partners.media',
  supplier: 'suppliers.media',
};

const PRIMARY_PURPOSES = ['logo', 'hero', 'card'];

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
    ];
    if (!validPurposes.includes(purpose)) {
      return errorResponse(
        'INVALID_PURPOSE',
        `Invalid purpose: ${purpose}`,
        400,
        req,
      );
    }

    // 5. Validate MIME type (reject SVG for user uploads)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return errorResponse(
        'INVALID_MIME_TYPE',
        'Formato não suportado. Use PNG, JPG ou WebP.',
        400,
        req,
      );
    }

    // 6. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        'FILE_TOO_LARGE',
        `Arquivo muito grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
        413,
        req,
      );
    }

    // 7. Resolve person_id from auth_user_id
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

    // 8. Resolve tenant_id from active membership
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

    // 9. Check permission via RPC (uses user_has_permission internally)
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

    // 10. Verify entity exists and belongs to tenant
    const entityTable =
      entityType === 'company'
        ? 'companies'
        : entityType === 'service'
          ? 'services'
          : entityType === 'partner'
            ? 'company_relationships'
            : entityType === 'supplier'
              ? 'company_relationships'
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

    if (entityType === 'company' || entityType === 'service') {
      entityQuery = entityQuery.eq('tenant_id', tenantId);
    } else {
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

    // 11. Check gallery limit (for gallery purpose)
    if (purpose === 'gallery') {
      const { count, error: countError } = await userClient
        .from('media_assets')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .is('metadata->>archived', null); // exclude archived

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

    // 12. Generate storage path
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const uuid = crypto.randomUUID();
    const storagePath = `${entityType}/${entityId}/${purpose}/${uuid}.${fileExt}`;

    // 13. Upload to Storage using service_role
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await adminClient.storage
      .from('public-media')
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

    // 14. Get public URL
    const { data: urlData } = adminClient.storage
      .from('public-media')
      .getPublicUrl(storagePath);
    const fileUrl = urlData.publicUrl;

    // 15. Determine sort_order
    let sortOrder = 0;
    if (sortOrderStr) {
      sortOrder = parseInt(sortOrderStr, 10);
    } else if (purpose === 'gallery') {
      // Auto-increment: get max sort_order for this entity
      const { data: maxOrder } = await userClient
        .from('media_assets')
        .select('sort_order')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('sort_order', { ascending: false })
        .limit(1);
      sortOrder = (maxOrder?.[0]?.sort_order ?? -1) + 1;
    }

    // 16. Insert media_assets record
    const { data: asset, error: assetError } = await adminClient
      .from('media_assets')
      .insert({
        tenant_id: tenantId,
        bucket_id: 'public-media',
        storage_path: storagePath,
        file_url: fileUrl,
        file_name: `${uuid}.${fileExt}`,
        mime_type: file.type,
        file_size_bytes: file.size,
        width: null, // not extracting dimensions (no sharp)
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
      await adminClient.storage.from('public-media').remove([storagePath]);
      console.error('[media-upload] media_assets insert error:', assetError);
      return errorResponse(
        'DB_INSERT_FAILED',
        'Falha ao registrar mídia no banco.',
        500,
        req,
      );
    }

    // 17. If primary purpose, call set_primary_media RPC
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
        // Non-fatal: asset created, primary not set
      }
    }

    // 18. Return success
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
          width: asset.width,
          height: asset.height,
          is_primary: asset.is_primary,
          sort_order: asset.sort_order,
          alt_text: asset.alt_text,
          created_at: asset.created_at,
        },
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
