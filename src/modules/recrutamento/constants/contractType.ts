export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  clt: 'CLT',
  internship: 'Estágio',
  temporary: 'Temporário',
  freelance: 'Freelance',
  contracted: 'PJ',
  cd: 'CD',
};

export function getContractTypeLabel(type: string): string {
  return CONTRACT_TYPE_LABELS[type] ?? type;
}