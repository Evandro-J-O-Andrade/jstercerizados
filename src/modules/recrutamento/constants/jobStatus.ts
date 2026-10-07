export const JOB_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  paused: 'Pausado',
  closed: 'Fechado',
  filled: 'Preenchido',
  cancelled: 'Cancelado',
};

export function getJobStatusLabel(status: string): string {
  return JOB_STATUS_LABELS[status] ?? status;
}