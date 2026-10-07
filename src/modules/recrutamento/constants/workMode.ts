export const WORK_MODE_LABELS: Record<string, string> = {
  onsite: 'Presencial',
  hybrid: 'Híbrido',
  remote: 'Remoto',
};

export function getWorkModeLabel(mode: string): string {
  return WORK_MODE_LABELS[mode] ?? mode;
}