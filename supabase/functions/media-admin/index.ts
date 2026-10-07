import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://jsempregos.com.br',
  'https://www.jsempregos.com.br',
  'https://jstercerizados.pages.dev',
  'http://localhost:3000',
  'http://localhost',
];

const ENTITY_TO_RESOURCE: Record<string, string> = {
  company: 'companies.media',
  service: 'services.media',
  partner: 'partners.media',
  supplier: 'suppliers.media',
};

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
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

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  try {
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

    const body = await req.json();
    const { action, media_id, entity_type, entity_id, sort_order } = body;

    if (!action || !media_id) {
      return errorResponse(
        'INVALID_REQUEST',
        'Missing required fields: action, media_id',
        400,
        req,
      );
    }

    const validActions = ['archive', 'set_primary', 'reorder'];
    if (!validActions.includes(action)) {
      return errorResponse(
        'INVALID_ACTION',
        `Invalid action: ${action}. Must be one of: ${validActions.join(', ')}`,
        400,
        req,
      );
    }

    if (!entity_type || !entity_id) {
      return errorResponse(
        'INVALID_REQUEST',
        'Missing required fields: entity_type, entity_id',
        400,
        req,
      );
    }

    const resource = ENTITY_TO_RESOURCE[entity_type];
    if (!resource) {
      return errorResponse(
        'INVALID_ENTITY_TYPE',
        `Invalid entity_type: ${entity_type}`,
        400,
        req,
      );
    }

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
        `Sem permissão para administrar mídia em ${resource}.`,
        403,
        req,
      );
    }

    const { data: asset, error: assetError } = await adminClient
      .from('media_assets')
      .select('id, tenant_id, storage_path, entity_type, entity_id, is_primary')
      .eq('id', media_id)
      .maybeSingle();

    if (assetError || !asset) {
      return errorResponse(
        'MEDIA_NOT_FOUND',
        'Mídia não encontrada.',
        404,
        req,
      );
    }

    if (asset.tenant_id !== tenantId) {
      return errorResponse(
        'PERMISSION_DENIED',
        'Mídia não pertence ao tenant do usuário.',
        403,
        req,
      );
    }

    if (asset.entity_type !== entity_type || asset.entity_id !== entity_id) {
      return errorResponse(
        'ENTITY_MISMATCH',
        'Mídia não pertence à entidade informada.',
        400,
        req,
      );
    }

    let result: unknown = null;

    switch (action) {
      case 'archive': {
        const { error: updateError } = await adminClient
          .from('media_assets')
          .update({
            metadata: {
              ...(asset as Record<string, unknown>).metadata,
              archived: true,
              archived_at: new Date().toISOString(),
            },
            is_primary: false,
          })
          .eq('id', media_id);

        if (updateError) {
          return errorResponse(
            'ARCHIVE_FAILED',
            'Falha ao arquivar mídia.',
            500,
            req,
          );
        }
        result = { archived: true };
        break;
      }

      case 'set_primary': {
        if (!PRIMARY_PURPOSES.some((p) => (asset as Record<string, unknown>).metadata?.purpose === p)) {
          const { data: mediaData, error: mediaError } = await adminClient
            .from('media_assets')
            .select('metadata')
            .eq('id', media_id)
            .single();

          if (mediaError || !mediaData) {
            return errorResponse(
              'MEDIA_NOT_FOUND',
              'Mídia não encontrada.',
              404,
              req,
            );
          }
        }

        const { error: primaryError } = await adminClient.rpc(
          'set_primary_media',
          {
            p_entity_type: entity_type,
            p_entity_id: entity_id,
            p_media_id: media_id,
          },
        );

        if (primaryError) {
          return errorResponse(
            'SET_PRIMARY_FAILED',
            'Falha ao definir mídia como principal.',
            500,
            req,
          );
        }
        result = { is_primary: true };
        break;
      }

      case 'reorder': {
        if (typeof sort_order !== 'number' || sort_order < 0) {
          return errorResponse(
            'INVALID_SORT_ORDER',
            'sort_order deve ser um número não-negativo.',
            400,
            req,
          );
        }

        const { error: reorderError } = await adminClient
          .from('media_assets')
          .update({ sort_order })
          .eq('id', media_id);

        if (reorderError) {
          return errorResponse(
            'REORDER_FAILED',
            'Falha ao reordenar mídia.',
            500,
            req,
          );
        }
        result = { sort_order };
        break;
      }
    }

    return json({ success: true, ...result }, 200, req);
  } catch (error) {
    console.error('[media-admin] Exception:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      'Erro interno do servidor.',
      500,
      req,
    );
  }
});

const PRIMARY_PURPOSES = ['logo', 'hero', 'card'];