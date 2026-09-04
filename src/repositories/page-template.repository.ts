import { getSupabaseClient } from '@/lib/supabase';

export interface PageTemplateResolution {
  found: boolean;
  key: string;
  title?: string;
  raw: string | null;
  resolved: string | null;
  vars: Record<string, unknown>;
  missing: string[];
}

const EMPTY: PageTemplateResolution = {
  found: false,
  key: '',
  raw: null,
  resolved: null,
  vars: {},
  missing: [],
};

export const pageTemplateRepository = {
  async resolve(
    key: string,
    personId: string | null,
    tenantId: string | null,
  ): Promise<PageTemplateResolution> {
    const supabase = getSupabaseClient();
    if (!supabase) return { ...EMPTY, key };

    const { data, error } = await supabase.rpc('resolve_page_template', {
      p_key: key,
      p_person_id: personId,
      p_tenant_id: tenantId,
    });

    if (error) {
      console.error('[PAGE_TEMPLATE:REPO] error', error);
      return { ...EMPTY, key };
    }

    const obj = (data ?? {}) as Record<string, unknown>;
    return {
      found: Boolean(obj.found),
      key: (obj.key as string) ?? key,
      title: obj.title as string | undefined,
      raw: (obj.raw as string | null) ?? null,
      resolved: (obj.resolved as string | null) ?? null,
      vars: (obj.vars as Record<string, unknown>) ?? {},
      missing: (obj.missing as string[]) ?? [],
    };
  },
};
