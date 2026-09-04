import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { navigationRepository } from '@/repositories/navigation.repository';
import {
  filterNavigation,
  type FilteredNavigation,
  type CandidatePortalModule,
  type GlobalNavigationLink,
} from '@/types/navigation';

export function useNavigation() {
  const { permissions, roles, isAdminMaster } = useAuth();
  const [modules, setModules] = useState<CandidatePortalModule[]>([]);
  const [globals, setGlobals] = useState<GlobalNavigationLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    navigationRepository
      .listAll()
      .then((res) => {
        if (!alive) return;
        setModules(res.modules);
        setGlobals(res.globals);
      })
      .catch((err) => {
        console.error('[NAV:HOOK] load failed', err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const roleNames = useMemo(
    () =>
      isAdminMaster
        ? ['admin_master', ...roles.map((r) => r.name)]
        : roles.map((r) => r.name),
    [roles, isAdminMaster],
  );

  const filtered = useMemo<FilteredNavigation>(
    () => filterNavigation(modules, globals, permissions, roleNames),
    [modules, globals, permissions, roleNames],
  );

  return { ...filtered, loading };
}
