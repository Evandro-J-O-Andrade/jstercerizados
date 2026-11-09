/**
 * Utilitário puro para interpretar erros de callback de autenticação (Supabase/Auth).
 * Lê query e fragmento, aceita apenas códigos permitidos e produz mensagens seguras,
 * sem expor descrições arbitrárias ou tokens de sessão.
 */

export interface SafeAuthCallbackError {
  /** Mensagem segura para exibição ao usuário. */
  message: string;
  /** Indica se um erro seguro foi identificado. */
  hasError: boolean;
}

/** Códigos de erro permitidos mapeados para mensagens seguras. */
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  otp_expired:
    'O link de confirmação expirou ou já foi utilizado. Solicite um novo link para continuar.',
  access_denied:
    'O acesso foi negado. Verifique o link recebido ou solicite um novo.',
  email_not_confirmed:
    'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e spam.',
};

const GENERIC_SAFE_MESSAGE =
  'Não foi possível concluir a autenticação. Tente novamente ou solicite um novo link.';

/** Parâmetros que indicam tokens de sessão — nunca devem ser consumidos como erro. */
const SESSION_TOKEN_KEYS = new Set([
  'access_token',
  'refresh_token',
  'provider_token',
  'provider_refresh_token',
]);

function parseParams(raw: string): URLSearchParams {
  const trimmed = raw.replace(/^[?#]/, '');
  return new URLSearchParams(trimmed);
}

/** Extrai erro seguro de query e/ou hash, ignorando tokens de sessão e descrições arbitrárias. */
export function getSafeAuthCallbackError(
  search: string,
  hash: string,
): SafeAuthCallbackError {
  const hashParams = parseParams(hash);
  // Fragmento com tokens de sessão é fluxo de sucesso do SDK — não tratar como erro.
  const hasSessionToken = [...SESSION_TOKEN_KEYS].some((k) => hashParams.has(k));
  if (hasSessionToken) {
    return { hasError: false, message: '' };
  }

  const queryParams = parseParams(search);
  const errorCode =
    queryParams.get('error_code') || hashParams.get('error_code') || '';
  const errorType = queryParams.get('error') || hashParams.get('error') || '';
  const hasAnyErrorSignal =
    queryParams.has('error') ||
    queryParams.has('error_code') ||
    queryParams.has('error_description') ||
    hashParams.has('error') ||
    hashParams.has('error_code') ||
    hashParams.has('error_description');

  if (!hasAnyErrorSignal) {
    return { hasError: false, message: '' };
  }

  const mapped =
    (errorCode && SAFE_ERROR_MESSAGES[errorCode]) ||
    (errorType && SAFE_ERROR_MESSAGES[errorType]) ||
    null;
  if (mapped) return { hasError: true, message: mapped };

  // Aceita mensagem segura já produzida internamente (redirecionamento do callback),
  // sem refletir descrições arbitrárias vindas da URL.
  const safeValues = new Set(Object.values(SAFE_ERROR_MESSAGES));
  safeValues.add(GENERIC_SAFE_MESSAGE);
  if (errorType && safeValues.has(errorType)) return { hasError: true, message: errorType };

  return { hasError: true, message: GENERIC_SAFE_MESSAGE };
}

/** Remove parâmetros de erro de uma string de busca, preservando os demais. */
export function stripAuthErrorParams(search: string): string {
  const params = parseParams(search);
  params.delete('error');
  params.delete('error_code');
  params.delete('error_description');
  const next = params.toString();
  return next ? `?${next}` : '';
}

/** Remove parâmetros de erro do hash, preservando tokens de sessão e demais valores. */
export function stripAuthErrorParamsFromHash(hash: string): string {
  const params = parseParams(hash);
  if ([...SESSION_TOKEN_KEYS].some((k) => params.has(k))) {
    return hash; // nunca alterar fragmento com tokens de sessão
  }
  params.delete('error');
  params.delete('error_code');
  params.delete('error_description');
  const next = params.toString();
  return next ? `#${next}` : '';
}
