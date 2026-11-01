/**
 * MediaCellContract — Contrato de identidade da Célula Media
 *
 * Define a identidade, capacidades, dependências e ciclo de vida da célula.
 * A célula não cria identidade, não escolhe permissões por conta própria
 * e não contorna a cadeia de autorização do CHECK BOULER 24H.
 */

export const MEDIA_CELL_ID = 'media' as const;
export const MEDIA_CELL_VERSION = '1.0.0' as const;
export const MEDIA_CELL_NAME = 'Mídia' as const;

export interface MediaCellDependency {
  name: string;
  required: boolean;
  description: string;
}

export interface MediaCellRoute {
  path: string;
  label: string;
  requiredPermissions: string[];
  icon: string;
}

export interface MediaCellLifecycle {
  status: 'active' | 'inactive' | 'degraded';
  health: 'healthy' | 'degraded' | 'unhealthy';
}

export interface MediaCellContract {
  id: typeof MEDIA_CELL_ID;
  name: typeof MEDIA_CELL_NAME;
  version: typeof MEDIA_CELL_VERSION;
  description: string;
  category: string;
  domain: string;
  scope: 'tenant' | 'global';
  lifecycle: MediaCellLifecycle;
  homeRoute: string;
  routes: MediaCellRoute[];
  layout: { skipLayout: boolean };
  navigation: { sidebar: boolean; label: string; icon: string };
  permissions: readonly string[];
  enabled: boolean;
  dependencies: MediaCellDependency[];
}

export const MEDIA_CELL_DEPENDENCIES: MediaCellDependency[] = [
  { name: 'Identity/Auth', required: true, description: 'Autenticação e identidade de pessoa' },
  { name: 'Tenant Context', required: true, description: 'Contexto de tenant selecionado' },
  { name: 'Authorization/RBAC', required: true, description: 'Sistema de autorização e permissões' },
  { name: 'DispatcherMaster', required: true, description: 'Autoridade de despacho global' },
  { name: 'Auditoria', required: true, description: 'Registro de operações e incidentes' },
  { name: 'Supabase Storage', required: true, description: 'Armazenamento de objetos' },
  { name: ' Repositório de ativos', required: true, description: 'Catálogo central media_assets' },
];

export const MEDIA_CELL_PERMISSIONS = [
  'media.read',
  'media.upload',
  'media.update',
  'media.archive',
  'media.delete',
  'media.manage',
  'media.gallery.manage',
  'media.private.read',
] as const;

export type MediaPermissionKey = (typeof MEDIA_CELL_PERMISSIONS)[number];