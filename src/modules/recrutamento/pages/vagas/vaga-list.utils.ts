import type { Job } from '@/modules/recrutamento/types';

export type JobStats = {
  total: number;
  draft: number;
  published: number;
  paused: number;
  closed: number;
  filled: number;
};

export function totalPages(count: number, pageSize: number): number {
  if (count <= 0 || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(count / pageSize));
}

export function jobStatsCards(stats: JobStats) {
  return [
    { id: 'total', label: 'Total de vagas', value: stats.total },
    { id: 'published', label: 'Publicadas', value: stats.published },
    { id: 'draft', label: 'Rascunhos', value: stats.draft },
    {
      id: 'closed',
      label: 'Encerradas/preenchidas',
      value: stats.closed + stats.filled,
    },
  ] satisfies Array<{ id: string; label: string; value: number }>;
}

export function isJobStatus(value: string): value is Job['status'] {
  return [
    'draft',
    'published',
    'paused',
    'closed',
    'filled',
    'cancelled',
  ].includes(value);
}
