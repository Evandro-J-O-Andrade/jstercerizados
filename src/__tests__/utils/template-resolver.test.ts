import { describe, it, expect } from 'vitest';
import {
  extractTokens,
  getValue,
  applyTemplate,
} from '@/utils/template-resolver';

describe('extractTokens', () => {
  it('extrai tokens simples', () => {
    expect(extractTokens('Ola %username%!')).toEqual(['username']);
  });

  it('extrai tokens aninhados', () => {
    expect(extractTokens('%tenant.name% / %tenant.plan%')).toEqual([
      'tenant.name',
      'tenant.plan',
    ]);
  });

  it('deduplica tokens repetidos', () => {
    expect(extractTokens('%user% - %user% - %user%')).toEqual(['user']);
  });

  it('retorna lista vazia se nao ha tokens', () => {
    expect(extractTokens('sem tokens')).toEqual([]);
  });
});

describe('getValue', () => {
  it('acessa propriedade simples', () => {
    expect(getValue({ name: 'Joao' }, 'name')).toBe('Joao');
  });

  it('acessa propriedade aninhada', () => {
    expect(getValue({ tenant: { name: 'J&S' } }, 'tenant.name')).toBe('J&S');
  });

  it('retorna undefined se caminho nao existe', () => {
    expect(getValue({ a: 1 }, 'a.b.c')).toBeUndefined();
  });
});

describe('applyTemplate', () => {
  it('substitui token simples', () => {
    const out = applyTemplate('Ola %name%!', { name: 'Maria' });
    expect(out.resolved).toBe('Ola Maria!');
    expect(out.missing).toEqual([]);
  });

  it('substitui tokens aninhados', () => {
    const out = applyTemplate('%tenant.name% - %user.name%', {
      tenant: { name: 'J&S' },
      user: { name: 'Ana' },
    });
    expect(out.resolved).toBe('J&S - Ana');
  });

  it('substitui tokens ausentes por string vazia por padrao', () => {
    const out = applyTemplate('Ola %name%, %missing%!', { name: 'X' });
    expect(out.resolved).toBe('Ola X, !');
    expect(out.missing).toEqual(['missing']);
  });

  it('mantem token original quando options.missing=keep', () => {
    const out = applyTemplate(
      'Ola %name%, %missing%!',
      { name: 'X' },
      { missing: 'keep' },
    );
    expect(out.resolved).toBe('Ola X, %missing%!');
    expect(out.missing).toEqual(['missing']);
  });

  it('converte valores numericos e booleanos para string', () => {
    const out = applyTemplate('%count% - %active%', {
      count: 42,
      active: true,
    });
    expect(out.resolved).toBe('42 - true');
  });

  it('substitui token null como ausente', () => {
    const out = applyTemplate('Ola %name%', { name: null });
    expect(out.resolved).toBe('Ola ');
    expect(out.missing).toEqual(['name']);
  });

  it('funciona com multiplas instancias do mesmo token', () => {
    const out = applyTemplate('%x%-%x%', { x: 'A' });
    expect(out.resolved).toBe('A-A');
  });
});
