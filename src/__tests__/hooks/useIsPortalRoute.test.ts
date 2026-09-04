import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsPortalRoute } from '@/hooks/useIsPortalRoute';

const mockUseLocation = vi.fn();
vi.mock('react-router-dom', () => ({
  useLocation: () => mockUseLocation(),
}));

describe('useIsPortalRoute', () => {
  it('retorna true em /candidato', () => {
    mockUseLocation.mockReturnValue({ pathname: '/candidato' });
    const { result } = renderHook(() => useIsPortalRoute());
    expect(result.current).toBe(true);
  });

  it('retorna true em /candidato/vagas', () => {
    mockUseLocation.mockReturnValue({ pathname: '/candidato/vagas' });
    const { result } = renderHook(() => useIsPortalRoute());
    expect(result.current).toBe(true);
  });

  it('retorna true em /dashboard', () => {
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });
    const { result } = renderHook(() => useIsPortalRoute());
    expect(result.current).toBe(true);
  });

  it('retorna true em /dashboard/financeiro', () => {
    mockUseLocation.mockReturnValue({ pathname: '/dashboard/financeiro' });
    const { result } = renderHook(() => useIsPortalRoute());
    expect(result.current).toBe(true);
  });

  it('retorna false em /', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    const { result } = renderHook(() => useIsPortalRoute());
    expect(result.current).toBe(false);
  });

  it('retorna false em /vagas (rota pública)', () => {
    mockUseLocation.mockReturnValue({ pathname: '/vagas' });
    const { result } = renderHook(() => useIsPortalRoute());
    expect(result.current).toBe(false);
  });

  it('retorna false em /login', () => {
    mockUseLocation.mockReturnValue({ pathname: '/login' });
    const { result } = renderHook(() => useIsPortalRoute());
    expect(result.current).toBe(false);
  });

  it('retorna false em /candidatos (público, não confunde com /candidato)', () => {
    mockUseLocation.mockReturnValue({ pathname: '/candidatos' });
    const { result } = renderHook(() => useIsPortalRoute());
    expect(result.current).toBe(false);
  });
});
