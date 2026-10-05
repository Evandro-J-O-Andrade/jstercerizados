import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RECRUTAMENTO_PERMISSIONS, type RecrutamentoPermissionKey } from '../permissions';

export interface RecrutamentoFeatureAccess {
  vagas: { read: boolean; create: boolean; update: boolean; delete: boolean; publish: boolean; close: boolean };
  candidatos: { read: boolean; create: boolean; update: boolean; delete: boolean; documentsRead: boolean; documentsManage: boolean; profileRead: boolean };
  processos: { read: boolean; create: boolean; update: boolean; delete: boolean; advance: boolean; reject: boolean; stageManage: boolean };
  candidaturas: { read: boolean; create: boolean; advance: boolean; reject: boolean; historyRead: boolean };
  talentPool: { read: boolean; manage: boolean; match: boolean };
  demandas: { read: boolean; create: boolean; update: boolean; delete: boolean };
}

export function useRecrutamentoAuthorization(): RecrutamentoFeatureAccess {
  const { hasPermission } = useAuth();

  return useMemo(() => ({
    vagas: {
      read: hasPermission(RECRUTAMENTO_PERMISSIONS.vagas),
      create: hasPermission(RECRUTAMENTO_PERMISSIONS.vagasCriar),
      update: hasPermission(RECRUTAMENTO_PERMISSIONS.vagasEditar),
      delete: hasPermission(RECRUTAMENTO_PERMISSIONS.vagasExcluir),
      publish: hasPermission(RECRUTAMENTO_PERMISSIONS.vagasPublicar),
      close: hasPermission(RECRUTAMENTO_PERMISSIONS.vagasFechar),
    },
    candidatos: {
      read: hasPermission(RECRUTAMENTO_PERMISSIONS.candidatos),
      create: hasPermission(RECRUTAMENTO_PERMISSIONS.candidatosCriar),
      update: hasPermission(RECRUTAMENTO_PERMISSIONS.candidatosEditar),
      delete: hasPermission(RECRUTAMENTO_PERMISSIONS.candidatosExcluir),
      documentsRead: hasPermission(RECRUTAMENTO_PERMISSIONS.candidatosDocumentosLer),
      documentsManage: hasPermission(RECRUTAMENTO_PERMISSIONS.candidatosDocumentosGerenciar),
      profileRead: hasPermission(RECRUTAMENTO_PERMISSIONS.candidatosPerfilLer),
    },
    processos: {
      read: hasPermission(RECRUTAMENTO_PERMISSIONS.processos),
      create: hasPermission(RECRUTAMENTO_PERMISSIONS.processosCriar),
      update: hasPermission(RECRUTAMENTO_PERMISSIONS.processosEditar),
      delete: hasPermission(RECRUTAMENTO_PERMISSIONS.processosExcluir),
      advance: hasPermission(RECRUTAMENTO_PERMISSIONS.processosAvancar),
      reject: hasPermission(RECRUTAMENTO_PERMISSIONS.processosRejeitar),
      stageManage: hasPermission(RECRUTAMENTO_PERMISSIONS.etapasGerenciar),
    },
    candidaturas: {
      read: hasPermission(RECRUTAMENTO_PERMISSIONS.candidaturas),
      create: hasPermission(RECRUTAMENTO_PERMISSIONS.candidaturasCriar),
      advance: hasPermission(RECRUTAMENTO_PERMISSIONS.candidaturasAvancar),
      reject: hasPermission(RECRUTAMENTO_PERMISSIONS.candidaturasRejeitar),
      historyRead: hasPermission(RECRUTAMENTO_PERMISSIONS.candidaturasHistorico),
    },
    talentPool: {
      read: hasPermission(RECRUTAMENTO_PERMISSIONS.talentPool),
      manage: hasPermission(RECRUTAMENTO_PERMISSIONS.talentPoolGerenciar),
      match: hasPermission(RECRUTAMENTO_PERMISSIONS.talentPoolMatch),
    },
    demandas: {
      read: hasPermission(RECRUTAMENTO_PERMISSIONS.demandas),
      create: hasPermission(RECRUTAMENTO_PERMISSIONS.demandasCriar),
      update: hasPermission(RECRUTAMENTO_PERMISSIONS.demandasEditar),
      delete: hasPermission(RECRUTAMENTO_PERMISSIONS.demandasExcluir),
    },
  }), [hasPermission]);
}

export function useRecrutamentoCan(permissionKey: RecrutamentoPermissionKey): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(RECRUTAMENTO_PERMISSIONS[permissionKey]);
}

export function useRecrutamentoCanAll(...permissionKeys: RecrutamentoPermissionKey[]): boolean {
  const { hasAllPermissions } = useAuth();
  return hasAllPermissions(permissionKeys.map(key => RECRUTAMENTO_PERMISSIONS[key]));
}

export function useRecrutamentoCanAny(...permissionKeys: RecrutamentoPermissionKey[]): boolean {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(permissionKeys.map(key => RECRUTAMENTO_PERMISSIONS[key]));
}