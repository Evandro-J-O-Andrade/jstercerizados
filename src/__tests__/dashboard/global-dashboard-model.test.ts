import { describe, expect, it } from 'vitest';
import { buildGlobalDashboardKpis } from '@/pages/dashboard/global-dashboard-model';

describe('buildGlobalDashboardKpis', () => {
  it('builds the global admin master KPI set from real aggregate counts', () => {
    const result = buildGlobalDashboardKpis({
      people: 128,
      companies: 34,
      jobs: 19,
      candidates: 412,
      applications: 87,
      tenants: 6,
      serviceOrders: 21,
      supportTickets: 13,
    });

    expect(result.map((item) => item.id)).toEqual([
      'tenants',
      'companies',
      'people',
      'candidates',
      'jobs',
      'applications',
      'service-orders',
      'support-tickets',
    ]);
    expect(result.find((item) => item.id === 'tenants')?.value).toBe(6);
    expect(result.find((item) => item.id === 'service-orders')?.value).toBe(21);
    expect(result.find((item) => item.id === 'support-tickets')?.value).toBe(13);
  });
});
