import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Componentes com animação (framer-motion) consultam matchMedia ao montar.
// jsdom não implementa isso, então o setup global evita duplicar o mock em
// cada arquivo de teste.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}