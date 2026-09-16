import { Briefcase, Users } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import {
  filterDashboardMetrics,
  formatDashboardMetricValue,
  type DashboardMetric,
} from '@/components/dashboard/dashboard-model';

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
    expect(
      filterDashboardMetrics([jobsMetric, candidatesMetric], [], false),
    ).toEqual([]);

    const unrestrictedMetric = { ...jobsMetric, permission: undefined };
    expect(filterDashboardMetrics([unrestrictedMetric], [], false)).toEqual([
      unrestrictedMetric,
    ]);
  });

  it('filters tenant metrics by active permissions', () => {
    expect(
      filterDashboardMetrics(
        [jobsMetric, candidatesMetric],
        [{ resource: 'jobs', action: 'read' }],
        false,
      ),
    ).toEqual([jobsMetric]);
  });

  it('lets admin_master see every metric', () => {
    expect(
      filterDashboardMetrics([jobsMetric, candidatesMetric], [], true),
    ).toEqual([jobsMetric, candidatesMetric]);
  });
});
