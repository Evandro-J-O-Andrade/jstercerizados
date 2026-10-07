export const SENIORITY_LABELS: Record<string, string> = {
  internship: 'Estágio',
  junior: 'Júnior',
  mid: 'Pleno',
  senior: 'Sênior',
  master: 'Master',
  leadership: 'Liderança',
};

export function getSeniorityLabel(level: string): string {
  return SENIORITY_LABELS[level] ?? level;
}