/**
 * Ponto de compatibilidade: reexporta as rotas canônicas da célula Recrutamento
 * (fonte usada por platform/router/module-routes + Provider). Mantém importadores
 * legados (`./RecrutamentoRoutes`, index, cellContract) alinhados à mesma definição
 * sem remover arquivos.
 */
export { RecrutamentoRoutes } from './RecrutamentoRoutes/RecrutamentoRoutes';
