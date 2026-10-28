import { Routes, Route } from 'react-router-dom';
import type { ComponentType } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPermissionKey } from '@/utils/rbac-normalize';
import type { ModuleRoute } from '@/platform/router/types';

interface CellRouterProps {
  routes: ModuleRoute[];
}

function CellAccessDenied() {
  return (
    <section
      role="alert"
      data-testid="cell-access-denied"
      className="flex min-h-[40dvh] items-center justify-center p-6"
    >
      <div className="max-w-md text-center">
        <h2 className="text-foreground text-xl font-semibold">Acesso não autorizado</h2>
        <p className="text-muted-foreground mt-2">
          Seu perfil não possui as permissões necessárias para esta funcionalidade.
        </p>
      </div>
    </section>
  );
}

function renderCellRoute(route: ModuleRoute, permissions: ReturnType<typeof useAuth>['permissions']) {
  const required = route.requiredPermissions ?? [];
  const allowed =
    required.length === 0 ||
    required.some((permission) =>
      permissions.some((granted) => getPermissionKey(granted) === permission),
    );
  const Element = route.element as ComponentType;

  return (
    <Route
      key={route.path || 'index'}
      path={route.path}
      element={allowed ? <Element /> : <CellAccessDenied />}
    >
      {route.children?.map((child) => renderCellRoute(child, permissions))}
    </Route>
  );
}

/**
 * Roteador canônico de uma célula.
 *
 * A definição das rotas vem do próprio módulo. O Portal não registra,
 * habilita ou decide se uma célula pode renderizar. A autorização é derivada
 * das permissões carregadas pela identidade autenticada a partir do Supabase.
 */
export function CellRouter({ routes }: CellRouterProps) {
  const { permissions } = useAuth();

  return <Routes>{routes.map((route) => renderCellRoute(route, permissions))}</Routes>;
}
