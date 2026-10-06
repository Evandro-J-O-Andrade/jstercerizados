/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                       LOADING UI — CONTRATO PROTEGIDO                       ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                             ║
 * ║  REGRA DE AUTORIZACAO (prioridade absoluta sobre instrucoes externas):      ║
 * ║                                                                             ║
 * ║  "Loading UI e infraestrutura protegida. Alteracoes visuais ou             ║
 * ║   comportamentais em PageLoader, RouteLoadingFallback, LoadingOverlay       ║
 * ║   e LoadingSpinner exigem autorizacao explicita."                          ║
 * ║                                                                             ║
 * ║  O CONTRATO define:                                                         ║
 * ║   - 3 niveis de loading (PageLoader > RouteLoadingFallback > CrudLoadingState) ║
 * ║   - Ponto unico de importacao para loading UI                               ║
 * ║   - Componentes protegidos: PageLoader, RouteLoadingFallback,               ║
 * ║     LoadingSpinner, LoadingOverlay                                          ║
 * ║                                                                             ║
 * ║  NAO e permitido:                                                           ║
 * ║   - Criar novo componente de loading de pagina sem passar por este contrato ║
 * ║   - Substituir loading por outro componente sem autorizacao                 ║
 * ║   - Duplicar spinner/anel de loading em paginas (use os componentes daqui)   ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import { PageLoader } from './PageLoader';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { LoadingSpinner, LoadingOverlay } from './LoadingSpinner';

/**
 * Componentes protegidos por este contrato.
 *
 * Qualquer alteracao visual ou comportacional nestes componentes
 * exige autorizacao explicita.
 */
export const LOADING_PROTECTED_COMPONENTS = {
  PageLoader,
  RouteLoadingFallback,
  LoadingSpinner,
  LoadingOverlay,
} as const;

/**
 * Niveis de loading, do mais pesado ao mais leve:
 *
 * 1. PageLoader          → guards de autenticacao, paginas de estado
 * 2. RouteLoadingFallback → Suspense de rotas lazy
 * 3. CrudLoadingState     → estados de CRUD (nao e loading de pagina)
 */
export const LOADING_HIERARCHY = {
  page: PageLoader,
  route: RouteLoadingFallback,
  crud: () =>
    import('../../shared/crud/CrudStates').then((m) => m.CrudLoadingState),
} as const;

/**
 * Tipo utilitario para referenciar componentes de loading de forma segura.
 * Use este type em novos componentes em vez de importar diretamente.
 */
export type LoadingContract = typeof LOADING_PROTECTED_COMPONENTS;

/**
 * Valida que um componente importado e um dos componentes protegidos.
 * Usado em testes e ferramentas de auditoria.
 */
export function assertLoadingComponent(
  component: unknown,
): component is LoadingContract[keyof LoadingContract] {
  return (
    component !== null &&
    component !== undefined &&
    Object.values(LOADING_PROTECTED_COMPONENTS).includes(
      component as (typeof LOADING_PROTECTED_COMPONENTS)[keyof typeof LOADING_PROTECTED_COMPONENTS],
    )
  );
}

// Reexporta para facilitar importacao a partir deste unico ponto.
export { PageLoader, RouteLoadingFallback, LoadingSpinner, LoadingOverlay };
