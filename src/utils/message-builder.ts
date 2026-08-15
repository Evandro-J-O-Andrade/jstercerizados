type MaybeString = string | undefined | null;

function safeString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value;
}

function optional(value: MaybeString, fallback = '-'): string {
  const cleaned = safeString(value).trim();
  return cleaned || fallback;
}

function line(label: string, value: MaybeString): string {
  return `*${label}:* ${optional(value)}`;
}

export function buildServiceRequestMessage(params: {
  serviceName?: string;
  serviceSlug?: string;
  name: MaybeString;
  company: MaybeString;
  email: MaybeString;
  phone: MaybeString;
  city: MaybeString;
  environment: MaybeString;
  bestTime: MaybeString;
  message: MaybeString;
}): string {
  const serviceLabel =
    params.serviceName || params.serviceSlug || 'Não informado';

  return [
    '*Nova solicitação de serviço*',
    '',
    line('Serviço', serviceLabel),
    line('Nome', params.name),
    line('Empresa', params.company),
    line('E-mail', params.email),
    line('Telefone', params.phone),
    line('Cidade', params.city),
    line('Ambiente', params.environment),
    line('Melhor horário', params.bestTime),
    line('Mensagem', params.message),
  ].join('\n');
}

export function buildJobApplicationMessage(params: {
  jobTitle?: string;
  vagaId?: string;
  jobSlug?: string;
  name: MaybeString;
  email: MaybeString;
  phone: MaybeString;
  city: MaybeString;
  contract: MaybeString;
  experience: MaybeString;
  message: MaybeString;
}): string {
  return [
    '*Nova candidatura*',
    '',
    line('Vaga', params.jobTitle),
    line('ID da vaga', params.vagaId),
    line('Slug', params.jobSlug),
    line('Nome', params.name),
    line('E-mail', params.email),
    line('Telefone', params.phone),
    line('Cidade', params.city),
    line('Tipo de contrato', params.contract),
    line('Experiência', params.experience),
    line('Mensagem', params.message),
  ].join('\n');
}

export function buildContactMessage(params: {
  name: MaybeString;
  company: MaybeString;
  email: MaybeString;
  phone: MaybeString;
  subject: MaybeString;
  message: MaybeString;
}): string {
  return [
    '*Novo contato pelo site*',
    '',
    line('Nome', params.name),
    line('Empresa', params.company),
    line('E-mail', params.email),
    line('Telefone', params.phone),
    line('Assunto', params.subject),
    line('Mensagem', params.message),
  ].join('\n');
}

export function buildPartnerMessage(params: {
  company: MaybeString;
  cnpj: MaybeString;
  responsible: MaybeString;
  phone: MaybeString;
  email: MaybeString;
  area: MaybeString;
  city: MaybeString;
  state: MaybeString;
  documentation: MaybeString;
}): string {
  return [
    '*Novo cadastro de parceiro*',
    '',
    line('Empresa', params.company),
    line('CNPJ', params.cnpj),
    line('Responsável', params.responsible),
    line('Telefone', params.phone),
    line('E-mail', params.email),
    line('Área de atuação', params.area),
    line('Cidade', params.city),
    line('Estado', params.state),
    line('Documentação', params.documentation),
  ].join('\n');
}

export function buildSupplierMessage(params: {
  company: MaybeString;
  cnpj: MaybeString;
  products: MaybeString;
  representative: MaybeString;
  phone: MaybeString;
  email: MaybeString;
}): string {
  return [
    '*Novo cadastro de fornecedor*',
    '',
    line('Empresa', params.company),
    line('CNPJ', params.cnpj),
    line('Produtos/Serviços', params.products),
    line('Representante', params.representative),
    line('Telefone', params.phone),
    line('E-mail', params.email),
  ].join('\n');
}

export function buildCandidateMessage(params: {
  name: MaybeString;
  cpf: MaybeString;
  rg: MaybeString;
  phone: MaybeString;
  email: MaybeString;
  city: MaybeString;
  positions: string[];
  experience: MaybeString;
  courses: MaybeString;
  availability: MaybeString;
  schedule: MaybeString;
  resume: MaybeString;
}): string {
  const positionsText =
    params.positions.length > 0 ? params.positions.join(', ') : '-';

  return [
    '*Nova candidatura - Banco de Talentos*',
    '',
    line('Nome', params.name),
    line('CPF', params.cpf),
    line('RG', params.rg),
    line('Telefone', params.phone),
    line('E-mail', params.email),
    line('Cidade', params.city),
    line('Áreas de interesse', positionsText),
    line('Experiência', params.experience),
    line('Cursos', params.courses),
    line('Disponibilidade', params.availability),
    line('Escala preferida', params.schedule),
    line('Currículo', params.resume),
  ].join('\n');
}
