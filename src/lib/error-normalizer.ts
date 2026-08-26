import { error as logError } from '@/lib/logger';

export type ErrorCategory =
  | 'validation'
  | 'network'
  | 'timeout'
  | 'auth'
  | 'permission'
  | 'not_found'
  | 'server'
  | 'upstream'
  | 'rate_limit'
  | 'unknown';

export interface NormalizedError {
  category: ErrorCategory;
  userMessage: string;
  technicalDetail: string;
  statusCode?: number;
  canRetry: boolean;
}

const USER_MESSAGES: Record<ErrorCategory, string> = {
  validation:
    'Não foi possível processar os dados informados. Verifique os campos e tente novamente.',
  network: 'Verifique sua conexão com a internet e tente novamente.',
  timeout:
    'A operação está demorando mais que o esperado. Tente novamente em alguns instantes.',
  auth: 'Sua sessão expirou. Faça login novamente para continuar.',
  permission: 'Você não tem permissão para acessar este recurso.',
  not_found: 'O conteúdo que você procura não foi encontrado.',
  server:
    'Tivemos um problema inesperado. Nossa equipe já pode verificar o ocorrido.',
  upstream:
    'Serviço temporariamente indisponível. Tente novamente em alguns instantes.',
  rate_limit:
    'Muitas solicitações em um curto período. Aguarde um momento e tente novamente.',
  unknown: 'Não foi possível concluir esta ação. Tente novamente.',
};

export function normalizeError(input: unknown): NormalizedError {
  const technicalDetail = normalizeErrorDetail(input);
  const category = categorizeError(input);
  const userMessage = USER_MESSAGES[category];
  const canRetry =
    category !== 'auth' &&
    category !== 'permission' &&
    category !== 'not_found';

  if (category !== 'unknown') {
    logError('Error normalized', {
      category,
      technicalDetail,
      userMessage,
      canRetry,
      raw: input,
    });
  }

  return {
    category,
    userMessage,
    technicalDetail,
    canRetry,
  };
}

function normalizeErrorDetail(input: unknown): string {
  if (input instanceof Error) {
    return input.message;
  }
  if (typeof input === 'string') {
    return input;
  }
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const message = record.message || record.error || record.error_description;
    if (typeof message === 'string') {
      return message;
    }
    return JSON.stringify(record);
  }
  return String(input);
}

function categorizeError(input: unknown): ErrorCategory {
  if (isAuthError(input)) {
    return 'auth';
  }
  if (isPermissionError(input)) {
    return 'permission';
  }
  if (isNotFoundError(input)) {
    return 'not_found';
  }
  if (isRateLimitError(input)) {
    return 'rate_limit';
  }
  if (isValidationError(input)) {
    return 'validation';
  }
  if (isNetworkError(input)) {
    return 'network';
  }
  if (isTimeoutError(input)) {
    return 'timeout';
  }
  if (isUpstreamError(input)) {
    return 'upstream';
  }
  if (isServerError(input)) {
    return 'server';
  }
  return 'unknown';
}

function isValidationError(input: unknown): boolean {
  if (input instanceof Error) {
    const message = input.message.toLowerCase();
    return (
      message.includes('expected string, received') ||
      message.includes('expected number, received') ||
      message.includes('invalid') ||
      message.includes('validation') ||
      message.includes('required') ||
      message.includes('zod')
    );
  }
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return true;
    }
  }
  return false;
}

function isNetworkError(input: unknown): boolean {
  if (input instanceof Error) {
    const message = input.message.toLowerCase();
    return (
      message.includes('networkerror') ||
      message.includes('failed to fetch') ||
      message.includes('network request failed') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('econnrefused')
    );
  }
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    if (typeof status === 'number' && status === 0) {
      return true;
    }
  }
  return false;
}

function isTimeoutError(input: unknown): boolean {
  if (input instanceof Error) {
    const message = input.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('504')
    );
  }
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    if (typeof status === 'number' && status === 504) {
      return true;
    }
  }
  return false;
}

function isAuthError(input: unknown): boolean {
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    const code = record.code;
    if (typeof status === 'number' && status === 401) {
      return true;
    }
    if (
      typeof code === 'string' &&
      /^(invalid_credentials|email_not_confirmed|user_not_found|session_expired|token_expired|token_revoked|missing_session_token|invalid_grant|unsupported_grant_type)/.test(
        code,
      )
    ) {
      return true;
    }
  }
  return false;
}

function isPermissionError(input: unknown): boolean {
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    if (typeof status === 'number' && status === 403) {
      return true;
    }
  }
  return false;
}

function isNotFoundError(input: unknown): boolean {
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    if (typeof status === 'number' && status === 404) {
      return true;
    }
  }
  return false;
}

function isRateLimitError(input: unknown): boolean {
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    if (typeof status === 'number' && status === 429) {
      return true;
    }
  }
  return false;
}

function isUpstreamError(input: unknown): boolean {
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    if (typeof status === 'number' && (status === 502 || status === 503)) {
      return true;
    }
  }
  return false;
}

function isServerError(input: unknown): boolean {
  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const status = record.status || record.statusCode;
    if (typeof status === 'number' && status >= 500 && status < 600) {
      return true;
    }
  }
  return false;
}
