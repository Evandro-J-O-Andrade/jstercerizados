import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  pageTemplateRepository,
  type PageTemplateResolution,
} from '@/repositories/page-template.repository';

const EMPTY: PageTemplateResolution = {
  found: false,
  key: '',
  raw: null,
  resolved: null,
  vars: {},
  missing: [],
};

export function usePageTemplate(key: string): {
  data: PageTemplateResolution;
  loading: boolean;
} {
  const { person, currentTenantId, isAdminMaster } = useAuth();
  const personId = isAdminMaster ? null : (person?.id ?? null);
  const tenantId = currentTenantId ?? null;

  const [data, setData] = useState<PageTemplateResolution>({ ...EMPTY, key });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    pageTemplateRepository
      .resolve(key, personId, tenantId)
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((err) => {
        console.error('[PAGE_TEMPLATE:HOOK] error', err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [key, personId, tenantId]);

  return { data, loading };
}
