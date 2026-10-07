import { SupabaseRepository } from './supabase.repository';
import type { Database } from '@/types/database';
import type { MediaAsset } from '@/components/media/MediaUploader.types';

type MediaAssetsRow = Database['public']['Tables']['media_assets']['Row'];

export type MediaEntityType = 'company' | 'service' | 'partner' | 'supplier' | 'job' | 'blog_post' | 'page' | 'avatar' | 'document';
export type MediaPurpose = 'logo' | 'hero' | 'card' | 'gallery';

export class MediaAssetsRepository extends SupabaseRepository {
  private mapRow(row: MediaAssetsRow): MediaAsset {
    return {
      id: row.id,
      bucket_id: row.bucket_id,
      storage_path: row.storage_path,
      file_url: row.file_url,
      file_name: row.file_name,
      mime_type: row.mime_type,
      width: row.width,
      height: row.height,
      is_primary: row.is_primary,
      sort_order: row.sort_order,
      alt_text: row.alt_text,
      created_at: row.created_at,
      metadata: row.metadata as Record<string, unknown> | undefined,
    };
  }

  async findByEntity(
    tenantId: string,
    entityType: MediaEntityType,
    entityId: string,
    purpose?: MediaPurpose,
  ): Promise<MediaAsset[]> {
    if (!this.supabase) return [];

    let query = this.supabase
      .from('media_assets')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('sort_order', { ascending: true });

    if (purpose === 'logo' || purpose === 'hero' || purpose === 'card') {
      query = query.eq('is_primary', purpose === 'logo' || purpose === 'hero' || purpose === 'card');
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.mapRow);
  }

  async findAllByEntity(
    tenantId: string,
    entityType: MediaEntityType,
    entityId: string,
  ): Promise<MediaAsset[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('media_assets')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapRow);
  }

  async findPrimary(
    tenantId: string,
    entityType: MediaEntityType,
    entityId: string,
  ): Promise<MediaAsset | null> {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('media_assets')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('is_primary', true)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapRow(data) : null;
  }

  async updateSortOrder(
    tenantId: string,
    assetId: string,
    sortOrder: number,
  ): Promise<MediaAsset> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('media_assets')
      .update({ sort_order: sortOrder })
      .eq('id', assetId)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return this.mapRow(data);
  }

  async setPrimary(
    tenantId: string,
    entityType: MediaEntityType,
    entityId: string,
    assetId: string,
  ): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    // First, unset current primary
    await this.supabase
      .from('media_assets')
      .update({ is_primary: false })
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('is_primary', true);

    // Then set new primary
    const { error } = await this.supabase
      .from('media_assets')
      .update({ is_primary: true })
      .eq('id', assetId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  async archive(tenantId: string, assetId: string): Promise<MediaAsset> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { data, error } = await this.supabase
      .from('media_assets')
      .update({ metadata: { archived: true } })
      .eq('id', assetId)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return this.mapRow(data);
  }

  async delete(tenantId: string, assetId: string): Promise<void> {
    if (!this.supabase) throw new Error('Supabase não configurado');

    const { error } = await this.supabase
      .from('media_assets')
      .delete()
      .eq('id', assetId)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }
}

export const mediaAssetsRepository = new MediaAssetsRepository();