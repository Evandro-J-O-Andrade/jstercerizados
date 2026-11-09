import { describe, expect, it } from 'vitest';
import { classifyUuidRouteParam, isUuid } from './uuid';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('UUID route parameter validation', () => {
  it('accepts a canonical UUID', () => {
    expect(isUuid(validUuid)).toBe(true);
    expect(classifyUuidRouteParam(validUuid)).toEqual({
      kind: 'valid',
      value: validUuid,
    });
  });

  it.each([undefined, '', '   '])(
    'classifies an absent identifier without querying (%s)',
    (value) => {
      expect(classifyUuidRouteParam(value)).toEqual({ kind: 'missing' });
    },
  );

  it.each([':id', 'not-a-uuid', '123', '550e8400-e29b-41d4-a716'])(
    'rejects an invalid UUID without normalizing it (%s)',
    (value) => {
      expect(isUuid(value)).toBe(false);
      expect(classifyUuidRouteParam(value)).toEqual({ kind: 'invalid', value });
    },
  );
});
