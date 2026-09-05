import { useLocation } from 'react-router-dom';

const PORTAL_PREFIXES = ['/candidato', '/dashboard'];

export function useIsPortalRoute(): boolean {
  const { pathname } = useLocation();
  return PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
