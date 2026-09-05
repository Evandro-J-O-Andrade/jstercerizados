import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { footerRepository } from '@/repositories/footer.repository';
import {
  pickFooterScope,
  type FooterConfig,
  type FooterScope,
} from '@/types/footer';

const EMPTY: FooterConfig = {
  scope: 'global_public',
  links: [],
  is_active: false,
  metadata: {},
};

export function useFooterConfig(): {
  scope: FooterScope;
  config: FooterConfig | null;
  loading: boolean;
} {
  const { isAuthenticated, roles, isAdminMaster } = useAuth();
  const primaryRole = roles[0]?.name ?? null;
  const scope: FooterScope = pickFooterScope(
    isAuthenticated || isAdminMaster,
    isAdminMaster ? 'admin_master' : primaryRole,
  );
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const primary = await footerRepository.getByScope(scope);
      let resolved = primary;
      if (!resolved) {
        resolved = await footerRepository.getFallback();
      }
      if (!alive) return;
      setConfig(resolved && resolved.is_active ? resolved : EMPTY);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [scope]);

  return { scope, config, loading };
}
