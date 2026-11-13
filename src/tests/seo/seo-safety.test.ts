import { describe, it, expect } from 'vitest';

function escHtml(v: unknown) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeText(v: unknown) {
  // O intervalo de caracteres de controle é intencional: a função existe para
  // removê-los de conteúdo vindo do banco/CMS.
  // eslint-disable-next-line no-control-regex
  return String(v ?? '').replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}
function validSlug(s: unknown) { return typeof s === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s); }

describe('seo safety invariants', () => {
  it('escapes HTML/attribute injection vectors', () => {
    const e = escHtml('<img onerror=alert(1) src=x>"\'&');
    expect(e).not.toContain('<img');
    expect(e).toContain('&lt;img');
    expect(e).toContain('&quot;');
    expect(e).toContain('&#39;');
    expect(e).toContain('&amp;');
  });
  it('strips tags/control chars and normalizes text', () => {
    expect(safeText('<script>alert(1)</script>  Olá\u0007 mundo')).toBe('alert(1) Olá mundo');
  });
  it('rejects malformed slugs', () => {
    expect(validSlug('processo-de-rh')).toBe(true);
    expect(validSlug('../etc/passwd')).toBe(false);
    expect(validSlug('DROP TABLE jobs;')).toBe(false);
    expect(validSlug('')).toBe(false);
  });
});
