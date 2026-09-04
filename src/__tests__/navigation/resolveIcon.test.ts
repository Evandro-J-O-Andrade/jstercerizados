import { describe, it, expect } from 'vitest';
import { resolveIcon } from '@/utils/navigation-icons';
import { Home, Briefcase, Bell } from 'lucide-react';

describe('resolveIcon', () => {
  it('resolve nome conhecido para componente lucide', () => {
    expect(resolveIcon('Home')).toBe(Home);
    expect(resolveIcon('Briefcase')).toBe(Briefcase);
    expect(resolveIcon('Bell')).toBe(Bell);
  });

  it('cai no fallback Home para nome desconhecido', () => {
    expect(resolveIcon('NaoExiste')).toBe(Home);
    expect(resolveIcon('')).toBe(Home);
  });
});
