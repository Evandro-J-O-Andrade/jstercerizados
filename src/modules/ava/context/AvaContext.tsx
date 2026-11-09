'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { AvaContextValue, AvaModule, Tutorial } from '../types';
import { tutorialsRepository } from '../repositories/tutorials.repository';
import { filterTutorials, AVA_MODULES } from '../services/ava-modules';
import { useAuth } from '@/contexts/AuthContext';

const AvaContext = createContext<AvaContextValue | null>(null);

/** Limpa estado derivado de tenant para evitar vazamento entre contextos. */
function createEmptyTutorialsByModule(): Record<AvaModule, Tutorial[]> {
  return {} as Record<AvaModule, Tutorial[]>;
}

export function AvaProvider({ children }: { children: React.ReactNode }) {
  const { currentTenantId } = useAuth();
  const [availableModules, setAvailableModules] = useState<AvaModule[]>([]);
  const [tutorialsByModule, setTutorialsByModule] = useState<
    Record<AvaModule, Tutorial[]>
  >(createEmptyTutorialsByModule);
  const [selectedModule, setSelectedModule] = useState<AvaModule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Evita aplicar resposta assíncrona de um tenant anterior após troca. */
  const tenantRequestRef = useRef(0);

  const loadTutorials = useCallback(async () => {
    // Fail-closed: sem tenant válido não consulta Supabase e limpa dados antigos.
    if (!currentTenantId) {
      tenantRequestRef.current += 1;
      setAvailableModules([]);
      setTutorialsByModule(createEmptyTutorialsByModule());
      setFilteredTutorials([]);
      setSelectedModule(null);
      setSearchQuery('');
      setError(null);
      setIsLoading(false);
      return;
    }

    const requestId = ++tenantRequestRef.current;
    const tenantId = currentTenantId;
    setIsLoading(true);
    setError(null);
    // Limpa dados do tenant anterior antes da nova carga.
    setAvailableModules([]);
    setTutorialsByModule(createEmptyTutorialsByModule());
    setFilteredTutorials([]);

    try {
      const videoAssets =
        await tutorialsRepository.listVideoAssets(tenantId);
      if (tenantRequestRef.current !== requestId || currentTenantId !== tenantId) {
        return;
      }

      const tutorialsMap: Record<AvaModule, Tutorial[]> = {} as Record<
        AvaModule,
        Tutorial[]
      >;

      for (const asset of videoAssets) {
        const metadata = asset.metadata as Record<string, unknown> | undefined;
        if (!metadata?.tutorial) continue;

        const t = metadata.tutorial as Tutorial;
        const module = t.module || 'sistema';
        if (!tutorialsMap[module]) tutorialsMap[module] = [];
        tutorialsMap[module].push(t);
      }

      const allModules = Object.keys(AVA_MODULES) as AvaModule[];
      const available = allModules.filter(
        (m) => (tutorialsMap[m]?.length ?? 0) > 0,
      );

      if (tenantRequestRef.current !== requestId) return;
      setAvailableModules(available);
      setTutorialsByModule(tutorialsMap);
      setSelectedModule((currentSelected) =>
        currentSelected && !available.includes(currentSelected)
          ? available[0] ?? null
          : currentSelected,
      );
    } catch (err) {
      if (tenantRequestRef.current !== requestId) return;
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar tutoriais',
      );
    } finally {
      if (tenantRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [currentTenantId]);

  useEffect(() => {
    void loadTutorials();
  }, [loadTutorials]);

  useEffect(() => {
    const allTutorials = Object.values(tutorialsByModule).flat();
    const filtered = filterTutorials(allTutorials, selectedModule, searchQuery);
    setFilteredTutorials(filtered);
  }, [tutorialsByModule, selectedModule, searchQuery]);

  const getTutorial = useCallback(
    (slug: string): Tutorial | null => {
      for (const tutorials of Object.values(tutorialsByModule)) {
        const found = tutorials.find((t) => t.slug === slug);
        if (found) return found;
      }
      return null;
    },
    [tutorialsByModule],
  );

  const getVideoAsset = useCallback(
    async (tutorialId: string) => {
      if (!currentTenantId) return null;
      return tutorialsRepository.findVideoAssetForTutorial(
        currentTenantId,
        tutorialId,
      );
    },
    [currentTenantId],
  );

  const refresh = useCallback(async () => {
    await loadTutorials();
  }, [loadTutorials]);

  return (
    <AvaContext.Provider
      value={{
        availableModules,
        tutorialsByModule,
        selectedModule,
        searchQuery,
        filteredTutorials,
        isLoading,
        error,
        selectModule: setSelectedModule,
        setSearchQuery,
        getTutorial,
        getVideoAsset,
        refresh,
      }}
    >
      {children}
    </AvaContext.Provider>
  );
}

/** Contexto React exposto apenas para testes/mocks controlados. */
export { AvaContext as AvaReactContext };

export function useAva(): AvaContextValue {
  const context = useContext(AvaContext);
  if (!context) {
    throw new Error('useAva must be used within an AvaProvider');
  }
  return context;
}

/** Estado neutro para testes/uso sem provider (fail-closed, sem consulta). */
export const AVA_CONTEXT_EMPTY_VALUE: AvaContextValue = {
  availableModules: [],
  tutorialsByModule: {} as Record<AvaModule, Tutorial[]>,
  selectedModule: null,
  searchQuery: '',
  filteredTutorials: [],
  isLoading: false,
  error: null,
  selectModule: () => {},
  setSearchQuery: () => {},
  getTutorial: () => null,
  getVideoAsset: async () => null,
  refresh: async () => {},
};
