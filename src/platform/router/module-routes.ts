import type { ModuleRoute } from '@/platform/router/types';
import { rhRoutes } from '@/modules/rh/routes';
import { servicosRoutes } from '@/modules/servicos/routes';

export const moduleRouteRegistries: Record<string, ModuleRoute[]> = {
  rh: rhRoutes,
  servicos: servicosRoutes,
};
