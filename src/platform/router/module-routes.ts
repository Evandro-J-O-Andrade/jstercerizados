import type { ModuleRoute } from '@/platform/router/types';
import { rhRoutes } from '@/modules/rh/routes';
import { servicosRoutes } from '@/modules/servicos/routes';
import { estoqueRoutes } from '@/modules/estoque/routes';
import { fiscalRoutes } from '@/modules/fiscal/routes';
import { suporteRoutes } from '@/modules/suporte/routes';
import { financeiroRoutes } from '@/modules/financeiro/routes';
import { operacoesRoutes } from '@/modules/operacoes/routes';
import { empresasRoutes } from '@/modules/empresas/routes';
import { posRoutes } from '@/modules/pos/routes';

export const moduleRouteRegistries: Record<string, ModuleRoute[]> = {
  rh: rhRoutes,
  servicos: servicosRoutes,
  estoque: estoqueRoutes,
  fiscal: fiscalRoutes,
  suporte: suporteRoutes,
  financeiro: financeiroRoutes,
  operacoes: operacoesRoutes,
  empresas: empresasRoutes,
  pos: posRoutes,
};
