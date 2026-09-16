import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FN_DIR = resolve(import.meta.dirname);
const FN_PATH = resolve(FN_DIR, 'index.ts');

describe('turnstile-siteverify CORS contract', () => {
  const source = readFileSync(FN_PATH, 'utf8');

  it('source handles OPTIONS preflight', () => {
    expect(source).toMatch(/req\.method\s*===\s*['"]OPTIONS['"]/);
  });

  it('source returns 204 for OPTIONS', () => {
    expect(source).toMatch(/new Response\(null,\s*\{\s*status:\s*204/);
  });

  it('source sets Access-Control-Allow-Origin', () => {
    expect(source).toMatch(/Access-Control-Allow-Origin/);
  });

  it('source sets Access-Control-Allow-Methods including POST', () => {
    expect(source).toMatch(/Access-Control-Allow-Methods/);
    expect(source).toMatch(/POST/);
  });

  it('source sets Access-Control-Allow-Headers', () => {
    expect(source).toMatch(/Access-Control-Allow-Headers/);
  });

  it('source does NOT use wildcard origin', () => {
    expect(source).not.toMatch(
      /Access-Control-Allow-Origin['"]?\s*:\s*['"]?\*/,
    );
  });

  it('source keeps TURNSTILE_SECRET server-side only', () => {
    expect(source).not.toMatch(/VITE_TURNSTILE_SECRET/);
  });

  it('source reads TURNSTILE_SECRET from Deno.env', () => {
    expect(source).toMatch(/Deno\.env\.get\(['"]TURNSTILE_SECRET['"]/);
  });

  it('source validates action against allowlist', () => {
    expect(source).toMatch(/EXPECTED_ACTIONS/);
  });

  it('source validates hostname when allowlist configured', () => {
    expect(source).toMatch(/TURNSTILE_HOSTNAMES/);
    expect(source).toMatch(/parseAllowedHostnames/);
  });

  it('source rejects verification_failed when success is false', () => {
    expect(source).toMatch(/verification_failed/);
  });

  it('source sends secret and response to Cloudflare siteverify', () => {
    expect(source).toMatch(/form\.append\('secret'/);
    expect(source).toMatch(/form\.append\('response'/);
  });

  it('source reads token from request body', () => {
    expect(source).toMatch(/body\.token/);
  });
});
