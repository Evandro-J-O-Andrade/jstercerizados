export function sanitizeText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  // eslint-disable-next-line no-control-regex
  const withoutControlChars = trimmed.replace(/[\x00-\x1F\x7F]/g, '');
  const normalizedSpaces = withoutControlChars
    .replace(/[^\S ]+/g, ' ')
    .replace(/\s+/g, ' ');

  return normalizedSpaces.trim();
}

export function sanitizeName(value: string): string {
  const cleaned = value
    .replace(/[^\p{L}\p{M}'\s.-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

export function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function sanitizeTextarea(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  // eslint-disable-next-line no-control-regex
  const withoutControlChars = trimmed.replace(/[\x00-\x1F\x7F]/g, '');
  const normalizedSpaces = withoutControlChars
    .replace(/[^\S ]+/g, ' ')
    .replace(/\s+/g, ' ');

  return normalizedSpaces.trim();
}

export function sanitizeFileName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\p{L}\p{M}\p{N}\s._-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    return url.toString();
  } catch {
    return trimmed;
  }
}
