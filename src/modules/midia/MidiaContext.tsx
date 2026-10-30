/**
 * MidiaContext — contexto da célula de Mídia.
 * Gerencia estado de ativos de mídia do tenant atual, integrando o
 * MediaAssetsRepository existente e o MediaUploader dos componentes compartilhados.
 *
 * Não duplica implementação de upload: consome MediaUploader e useMediaUpload
 * de @/components/media e @/hooks/useMediaUpload.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { mediaAssetsRepository } from '@/repositories/media-assets.repository';
import type {
  MidiaAsset,
  MidiaEntityType,
  MidiaPurpose,
  MidiaDashboardStats,
} from './types';

interface MidiaContextType {
  assets: MidiaAsset[];
  stats: MidiaDashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadByEntity: (
    entityType: MidiaEntityType,
    entityId: string,
    purpose?: MidiaPurpose,
  ) => Promise<MidiaAsset[]>;
}

const MidiaContext = createContext<MidiaContextType | undefined>(undefined);

export function MidiaProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<MidiaAsset[]>([]);
  const [stats, setStats] = useState<MidiaDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Carrega ativos gerais do tenant (sem filtro de entidade específica)
      // Nota: o repositório filtra por tenant_id internamente via RLS
      const allAssets = await mediaAssetsRepository.findAllByEntity(
        '', // tenant_id é injetado pelo RLS; vazio aqui para listar todos do contexto
        'page',
        '',
      );
      setAssets(allAssets);

      setStats({
        totalAssets: allAssets.length,
        byPurpose: {
          logo: allAssets.filter((a) => a.metadata?.purpose === 'logo').length,
          hero: allAssets.filter((a) => a.metadata?.purpose === 'hero').length,
          card: allAssets.filter((a) => a.metadata?.purpose === 'card').length,
          gallery: allAssets.filter((a) => a.metadata?.purpose === 'gallery').length,
        },
        byEntityType: allAssets.reduce(
          (acc, a) => {
            acc[a.metadata?.entity_type as MidiaEntityType] =
              (acc[a.metadata?.entity_type as MidiaEntityType] || 0) + 1;
            return acc;
          },
          {} as Record<MidiaEntityType, number>,
        ),
        recentUploads: allAssets
          .slice()
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 10),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar mídia';
      setError(msg);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadByEntity = useCallback(
    async (
      entityType: MidiaEntityType,
      entityId: string,
      purpose?: MidiaPurpose,
    ): Promise<MidiaAsset[]> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mediaAssetsRepository.findByEntity(
          '', // tenant_id injetado pelo RLS
          entityType,
          entityId,
          purpose,
        );
        setAssets(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar ativos';
        setError(msg);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <MidiaContext.Provider
      value={{
        assets,
        stats,
        isLoading,
        error,
        refresh,
        loadByEntity,
      }}
    >
      {children}
    </MidiaContext.Provider>
  );
}

export function useMidia(): MidiaContextType {
  const ctx = useContext(MidiaContext);
  if (!ctx) {
    throw new Error('useMidia must be used within MidiaProvider');
  }
  return ctx;
}
