import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { COMPANY } from '@/config';
import { useNavigationContext } from '@/hooks/useNavigationContext';

interface PortalFooterLink {
  label: string;
  href: string;
  permission?: string;
  permissions?: string[];
  mode?: 'any' | 'all';
}

const PORTAL_FOOTER_LINKS: PortalFooterLink[] = [
  { label: 'Início', href: '/dashboard' },
  { label: 'Meu perfil', href: '/dashboard/configuracoes' },
  { label: 'Site público', href: '/' },
];

export function PortalFooter() {
  const { isAuthenticated, hasPermission, hasAnyPermission, hasAllPermissions, isAdminMaster } = useNavigationContext();

  const visibleLinks = useMemo(() => {
    if (!isAuthenticated) return [];
    if (isAdminMaster) return PORTAL_FOOTER_LINKS;

    return PORTAL_FOOTER_LINKS.filter((link) => {
      if (!link.permission && !link.permissions) return true;
      if (link.permission) return hasPermission(link.permission);
      if (link.permissions) {
        return link.mode === 'all'
          ? hasAllPermissions(link.permissions)
          : hasAnyPermission(link.permissions);
      }
      return true;
    });
  }, [isAuthenticated, isAdminMaster, hasPermission, hasAnyPermission, hasAllPermissions]);

  if (!visibleLinks.length) return null;

  return (
    <footer className="border-border/50 bg-surface relative z-10 border-t">
      <div className="via-primary/40 absolute -top-px right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />
      <div className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              {visibleLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Globe className="text-primary h-3.5 w-3.5" />
              <span>
                © {new Date().getFullYear()} {COMPANY.tradingName}. Todos os direitos reservados.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
