/**
 * Tipos da célula de Mídia — CHECK BOULER 24H.
 * Reutiliza MediaAsset dos componentes de mídia existentes para evitar duplicação.
 */

import type { MediaAsset } from '@/components/media/MediaUploader.types';

export type MidiaEntityType =
  | 'company'
  | 'service'
  | 'partner'
  | 'supplier'
  | 'job'
  | 'blog_post'
  | 'page'
  | 'avatar'
  | 'document'
  | 'ava';

export type MidiaPurpose = 'logo' | 'hero' | 'card' | 'gallery';

export interface MidiaAsset extends MediaAsset {}

/**
 * Contexto de execução da célula de mídia.
 * Cada operação deve carregar: quem, qual tenant, qual recurso, qual operação.
 */
export interface MidiaOperationContext {
  personId: string;
  tenantId: string | null;
  entityType: MidiaEntityType;
  entityId: string;
  purpose: MidiaPurpose;
  operation: 'upload' | 'view' | 'delete' | 'reorder' | 'set_primary';
}

/**
 * Estatísticas do dashboard de mídia.
 */
export interface MidiaDashboardStats {
  totalAssets: number;
  byPurpose: Record<MidiaPurpose, number>;
  byEntityType: Record<MidiaEntityType, number>;
  recentUploads: MidiaAsset[];
}

/**
 * Rota de célula para o registro do Core.
 */
export interface MidiaCellRoute {
  path: string;
  label: string;
  requiredPermissions?: string[];
}
