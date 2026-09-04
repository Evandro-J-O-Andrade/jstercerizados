import { getSupabaseClient } from '@/lib/supabase';
import type {
  CandidatePortalModule,
  GlobalNavigationLink,
} from '@/types/navigation';

interface FetchResult {
  modules: CandidatePortalModule[];
  globals: GlobalNavigationLink[];
}

const EMPTY: FetchResult = { modules: [], globals: [] };

export const navigationRepository = {
  async listAll(): Promise<FetchResult> {
    const supabase = getSupabaseClient();
    if (!supabase) return EMPTY;

    const [modulesRes, globalsRes] = await Promise.all([
      supabase
        .from('candidate_portal_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('global_navigation_links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (modulesRes.error) {
      console.error('[NAV:REPO] modules error', modulesRes.error);
    }
    if (globalsRes.error) {
      console.error('[NAV:REPO] globals error', globalsRes.error);
    }

    return {
      modules: (modulesRes.data ?? []) as CandidatePortalModule[],
      globals: (globalsRes.data ?? []) as GlobalNavigationLink[],
    };
  },
};
