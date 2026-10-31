/**
 * register-cells.ts — Registro de todas as células operacionais do CHECK BOULER 24H.
 *
 * Cada célula exporta um CellContract (id, name, routes, permissions, enabled).
 * Este módulo registra todas as células no CellRegistry (descoberta) e no
 * DispatcherMaster (despacho). O registro não concede permissões — apenas
 * disponibiliza as células para resolução de rotas e validação de contexto.
 *
 * Ordem de registro segue a dependência definida na Passagem E:
 * 1. Identidade e contratos de acesso (core)
 * 2. Candidato e Recrutamento (consolidar)
 * 3. Empresas, Mídia, Administração
 * 4. RH, Financeiro, Contabilidade, Suporte, Estoque
 * 5. AVA, Serviços, Fiscal, Operações, PDV
 */

import { cellRegistry } from '../registry/CellRegistryContract';
import { dispatcherMaster } from '../dispatcher';
import type { CellContract } from '../types';
import { candidatoCellContract } from '@/modules/candidato';
import { recrutamentoCellContract } from '@/modules/recrutamento';
import { empresasCellContract } from '@/modules/empresas';
import { adminCellContract } from '@/modules/admin';
import { mediaCellContract } from '@/modules/media';
import { rhCellContract } from '@/modules/rh';
import { financeiroCellContract } from '@/modules/financeiro';
import { contabilidadeCellContract } from '@/modules/contabilidade';
import { suporteCellContract } from '@/modules/suporte';
import { estoqueCellContract } from '@/modules/estoque';
import { avaCellContract } from '@/modules/ava';
import { servicosCellContract } from '@/modules/servicos';
import { fiscalCellContract } from '@/modules/fiscal';
import { operacoesCellContract } from '@/modules/operacoes';
import { posCellContract } from '@/modules/pos';
import { adminMasterCellContract } from '@/modules/admin-master';
import { adminTenantCellContract } from '@/modules/admin-tenant';
import { coreCellContract } from '@/cells/core';
import { integracoesCellContract } from '@/cells/integracoes';
import { contratosCellContract } from '@/modules/contratos';
import { crmCellContract } from '@/modules/crm';
import { faturamentoCellContract } from '@/modules/faturamento';
import { relatoriosCellContract } from '@/modules/relatorios';
import { iaCellContract } from '@/modules/ia';
import { configuracoesSaasCellContract } from '@/modules/configuracoes-saas';
import { preferenciasCellContract } from '@/modules/preferencias';

/**
 * Todas as células implementadas com CellContract.
 */
const cellContracts: CellContract[] = [
  candidatoCellContract,
  recrutamentoCellContract,
  empresasCellContract,
  adminCellContract,
  mediaCellContract,
  rhCellContract,
  financeiroCellContract,
  contabilidadeCellContract,
  suporteCellContract,
  estoqueCellContract,
  avaCellContract,
  servicosCellContract,
  fiscalCellContract,
  operacoesCellContract,
  posCellContract,
  adminMasterCellContract,
  adminTenantCellContract,
  coreCellContract,
  integracoesCellContract,
  contratosCellContract,
  crmCellContract,
  faturamentoCellContract,
  relatoriosCellContract,
  iaCellContract,
  configuracoesSaasCellContract,
  preferenciasCellContract,
];

let cellsRegistered = false;

/**
 * Registra todas as células no CellRegistry e no DispatcherMaster.
 * Chame este arquivo uma vez na inicialização da aplicação (ex: App.tsx ou main.tsx).
 * O registro é idempotente: chamadas subsequentes não duplicam células.
 */
export function registerAllCells(): void {
  if (cellsRegistered) {
    return;
  }
  for (const contract of cellContracts) {
    dispatcherMaster.registerCell(contract);
  }
  cellsRegistered = true;
}

/**
 * Retorna estatísticas do registry após o registro.
 */
export function getCellRegistryStats() {
  return cellRegistry.stats();
}
