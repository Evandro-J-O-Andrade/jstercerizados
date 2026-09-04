import { getSupabaseClient } from '@/lib/supabase';
import type { FooterConfig, FooterScope } from '@/types/footer';

const EMPTY: FooterConfig = {
  scope: 'global_public',
  links: [],
  is_active: false,
  metadata: {},
};

export const footerRepository = {
  async getByScope(scope: FooterScope): Promise<FooterConfig | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('footer_configs')
      .select('*')
      .eq('scope', scope)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('[FOOTER:REPO] error', error);
      return null;
    }

    if (!data) return null;
    return {
      scope: data.scope as FooterScope,
      links: (data.links ?? []) as FooterConfig['links'],
      is_active: data.is_active as boolean,
      metadata: (data.metadata ?? {}) as Record<string, unknown>,
    };
  },

  async getFallback(): Promise<FooterConfig> {
    const supabase = getSupabaseClient();
    if (!supabase) return EMPTY;

    const { data, error } = await supabase
      .from('footer_configs')
      .select('*')
      .eq('scope', 'global_public')
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return EMPTY;
    return {
      scope: 'global_public',
      links: (data.links ?? []) as FooterConfig['links'],
      is_active: true,
      metadata: (data.metadata ?? {}) as Record<string, unknown>,
    };
  },
};
