const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type UuidRouteParam =
  | { kind: 'missing' }
  | { kind: 'invalid'; value: string }
  | { kind: 'valid'; value: string };

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function classifyUuidRouteParam(
  value: string | undefined,
): UuidRouteParam {
  if (value === undefined || value.trim() === '') return { kind: 'missing' };
  return isUuid(value) ? { kind: 'valid', value } : { kind: 'invalid', value };
}
