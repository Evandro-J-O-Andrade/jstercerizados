import type { ModuleRoute } from '@/platform/router/types';
import { rhRoutes } from '@/modules/rh/routes';
import { CandidatoRoutes } from '@/modules/candidato/CandidatoRoutes';
import { RecrutamentoRoutes } from '@/modules/recrutamento/RecrutamentoRoutes';
import { servicosRoutes } from '@/modules/servicos/routes';
import { estoqueRoutes } from '@/modules/estoque/routes';
import { fiscalRoutes } from '@/modules/fiscal/routes';
import { suporteRoutes } from '@/modules/suporte/routes';
import { financeiroRoutes } from '@/modules/financeiro/routes';
import { contabilidadeRoutes } from '@/modules/contabilidade/routes';
import { posRoutes } from '@/modules/pos/routes';
import { operacoesRoutes } from '@/modules/operacoes/routes';
import { empresasRoutes } from '@/modules/empresas/routes';

export const moduleRouteRegistries: Record<string, ModuleRoute[]> = {
  rh: rhRoutes,
  candidato: CandidatoRoutes,
  recrutamento: RecrutamentoRoutes,
  servicos: servicosRoutes,
  estoque: estoqueRoutes,
  fiscal: fiscalRoutes,
  suporte: suporteRoutes,
  financeiro: financeiroRoutes,
  contabilidade: contabilidadeRoutes,
  operacoes: operacoesRoutes,
  empresas: empresasRoutes,
  pos: posRoutes,
};
