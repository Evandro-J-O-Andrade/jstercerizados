import { describe, it, expect } from 'vitest';
import { normalizeError } from '@/lib/error-normalizer';

describe('normalizeError', () => {
  it('normalizes Error instances', () => {
    const result = normalizeError(new Error('Something failed'));
    expect(result.userMessage).not.toBe('Something failed');
    expect(result.technicalDetail).toBe('Something failed');
    expect(result.category).toBe('unknown');
  });

  it('normalizes strings', () => {
    const result = normalizeError('Something failed');
    expect(result.userMessage).not.toBe('Something failed');
    expect(result.technicalDetail).toBe('Something failed');
  });

  it('handles null', () => {
    const result = normalizeError(null);
    expect(result.userMessage).toBeTruthy();
    expect(result.technicalDetail).toBe('null');
  });

  it('handles undefined', () => {
    const result = normalizeError(undefined);
    expect(result.userMessage).toBeTruthy();
    expect(result.technicalDetail).toBe('undefined');
  });

  it('handles boolean', () => {
    const result = normalizeError(true);
    expect(result.userMessage).toBeTruthy();
    expect(result.technicalDetail).toBe('true');
  });

  it('handles arrays', () => {
    const result = normalizeError(['err1', 'err2']);
    expect(result.userMessage).toBeTruthy();
  });

  it('handles objects', () => {
    const result = normalizeError({ message: 'nested error' });
    expect(result.userMessage).toBeTruthy();
    expect(result.technicalDetail).toBe('nested error');
  });

  it('categorizes validation errors including Expected string, received boolean', () => {
    const result = normalizeError(
      new Error('Expected string, received boolean'),
    );
    expect(result.category).toBe('validation');
    expect(result.userMessage).toBe(
      'Não foi possível processar os dados informados. Verifique os campos e tente novamente.',
    );
  });

  it('categorizes network errors', () => {
    const result = normalizeError(
      new Error('NetworkError when attempting to fetch resource.'),
    );
    expect(result.category).toBe('network');
  });

  it('categorizes timeout errors', () => {
    const result = normalizeError(new Error('Request timed out'));
    expect(result.category).toBe('timeout');
  });

  it('categorizes 404 errors', () => {
    const result = normalizeError({ status: 404 });
    expect(result.category).toBe('not_found');
  });

  it('categorizes 500 errors', () => {
    const result = normalizeError({ status: 500 });
    expect(result.category).toBe('server');
  });

  it('categorizes 504 errors as timeout', () => {
    const result = normalizeError({ status: 504 });
    expect(result.category).toBe('timeout');
  });

  it('maps auth errors to the auth category', () => {
    const result = normalizeError({ status: 401 });
    expect(result.category).toBe('auth');
  });

  it('maps permission errors to the permission category', () => {
    const result = normalizeError({ status: 403 });
    expect(result.category).toBe('permission');
  });

  it('maps rate limit errors to the rate_limit category', () => {
    const result = normalizeError({ status: 429 });
    expect(result.category).toBe('rate_limit');
  });

  it('maps 502/503 errors to upstream', () => {
    expect(normalizeError({ status: 502 }).category).toBe('upstream');
    expect(normalizeError({ status: 503 }).category).toBe('upstream');
  });

  it('never exposes technical details as userMessage', () => {
    const inputs: unknown[] = [
      new Error('Expected string, received boolean'),
      { status: 500, error: 'Internal server error' },
      new Error('Supabase não configurado'),
      'Network request failed',
    ];

    for (const input of inputs) {
      const result = normalizeError(input);
      expect(result.userMessage).not.toContain('Expected string');
      expect(result.userMessage).not.toContain('Supabase');
      expect(result.userMessage).not.toContain('NetworkError');
      expect(result.userMessage).not.toContain('Internal server error');
    }
  });
});
