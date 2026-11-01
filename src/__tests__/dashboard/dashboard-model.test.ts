import { Briefcase, Users } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import {
  filterDashboardMetrics,
  formatDashboardMetricValue,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';
import { getAvailableModules } from '@/platform/modules';
import { normalizePermission } from '@/utils/rbac-normalize';

const jobsMetric: DashboardMetric = {
  id: 'jobs',
  label: 'Vagas',
  value: 12,
  description: 'Vagas publicadas',
  icon: Briefcase,
  tone: 'success',
  href: '/dashboard/vagas',
  permission: 'jobs.read',
  format: 'number',
};

const candidatesMetric: DashboardMetric = {
  id: 'candidates',
  label: 'Candidatos',
  value: 34,
  description: 'Candidatos ativos',
  icon: Users,
  tone: 'primary',
  href: '/dashboard/candidatos',
  permission: 'candidates.read',
  format: 'number',
};

describe('dashboard metric model', () => {
  it('formats number and currency values in pt-BR', () => {
    expect(formatDashboardMetricValue({ ...jobsMetric, value: 1234 })).toBe(
      '1.234',
    );
    expect(
      formatDashboardMetricValue({
        ...jobsMetric,
        value: 1234.5,
        format: 'currency',
      }),
    ).toBe('R$\u00a01.234,50');
  });

  it('keeps metrics without a permission requirement', () => {
    expect(filterDashboardMetrics([jobsMetric, candidatesMetric], [])).toEqual(
      [],
    );

    const unrestrictedMetric = { ...jobsMetric, permission: undefined };
    expect(filterDashboardMetrics([unrestrictedMetric], [])).toEqual([
      unrestrictedMetric,
    ]);
  });

  it('filters tenant metrics by active permissions', () => {
    expect(
      filterDashboardMetrics(
        [jobsMetric, candidatesMetric],
        [
          normalizePermission({
            id: 'permission-jobs-read',
            resource: 'jobs',
            action: 'read',
          })!,
        ],
      ),
    ).toEqual([jobsMetric]);
  });

  it('does not bypass database permissions for admin_master metrics', () => {
    expect(filterDashboardMetrics([jobsMetric, candidatesMetric], [])).toEqual(
      [],
    );
  });

  it('exposes the global module only with a real permission granted by the database', () => {
    const globalReadPermission = normalizePermission({
      id: 'permission-tenants-read',
      resource: 'tenants',
      action: 'read',
    })!;

    expect(
      getAvailableModules([globalReadPermission], 'global'),
    ).toContainEqual(expect.objectContaining({ id: 'admin-master' }));
    expect(getAvailableModules([], 'global')).not.toContainEqual(
      expect.objectContaining({ id: 'admin-master' }),
    );
  });
});
