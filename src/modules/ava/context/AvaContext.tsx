'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type { AvaContextValue, AvaModule, Tutorial } from '../types';
import { tutorialsRepository } from '../repositories/tutorials.repository';
import { filterTutorials, AVA_MODULES } from '../services/ava-modules';
import { useAuth } from '@/contexts/AuthContext';

const AvaContext = createContext<AvaContextValue | null>(null);

export function AvaProvider({ children }: { children: React.ReactNode }) {
  const { currentTenantId } = useAuth();
  const [availableModules, setAvailableModules] = useState<AvaModule[]>([]);
  const [tutorialsByModule, setTutorialsByModule] = useState<
    Record<AvaModule, Tutorial[]>
  >({} as Record<AvaModule, Tutorial[]>);
  const [selectedModule, setSelectedModule] = useState<AvaModule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTutorials = useCallback(async () => {
    if (!currentTenantId) return;
    setIsLoading(true);
    setError(null);
    try {
      const videoAssets =
        await tutorialsRepository.listVideoAssets(currentTenantId);

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

      setAvailableModules(available);
      setTutorialsByModule(tutorialsMap);
      const currentSelected = selectedModule;
      if (currentSelected && !available.includes(currentSelected)) {
        setSelectedModule(available[0] ?? null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar tutoriais',
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentTenantId, selectedModule]);

  useEffect(() => {
    loadTutorials();
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

export function useAva(): AvaContextValue {
  const context = useContext(AvaContext);
  if (!context) {
    throw new Error('useAva must be used within an AvaProvider');
  }
  return context;
}
