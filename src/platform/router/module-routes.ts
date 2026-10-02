import type { ModuleRoute } from '@/platform/router/types';
import { rhRoutes } from '@/modules/rh/routes';

export const moduleRouteRegistries: Record<string, ModuleRoute[]> = {
  rh: rhRoutes,
};
