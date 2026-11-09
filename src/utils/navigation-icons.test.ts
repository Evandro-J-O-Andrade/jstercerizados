import { describe, expect, it } from 'vitest';
import { resolveIcon } from './navigation-icons';

describe('resolveIcon', () => {
  it.each([
    ['Radar', 'radar'],
    ['ShieldCheck', 'shield-check'],
    ['BriefcaseBusiness', 'briefcase-business'],
    ['UserRoundSearch', 'user-round-search'],
    ['Headphones', 'headphones'],
    ['Wallet', 'wallet'],
    ['Images', 'images'],
  ])('resolve %s para um ícone semântico', (name, expectedClass) => {
    const Icon = resolveIcon(name);
    expect(Icon.displayName?.toLowerCase() ?? Icon.name.toLowerCase()).toContain(
      expectedClass.replaceAll('-', ''),
    );
  });

  it('aceita nomes em minúsculas usados por contratos antigos', () => {
    expect(resolveIcon('briefcase')).toBe(resolveIcon('Briefcase'));
  });

  it('não representa um ícone desconhecido como página inicial', () => {
    expect(resolveIcon('IconeInexistente')).toBe(resolveIcon('LayoutGrid'));
    expect(resolveIcon('IconeInexistente')).not.toBe(resolveIcon('Home'));
  });
});
