/**
 * ModuleContext.tsx — Contexto de módulo atual baseado na URL.
 *
 * Agora usa o CellRegistry (canônico) como fonte primária para resolução de
 * módulos, com fallback para PORTAL_MODULES (legado). A nulificação
 * propositada em /candidato e /candidato/ foi removida para que o módulo
 * candidato seja resolvido corretamente em sua raiz.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import type {
  ModuleDefinition,
  ModuleFeature,
} from '@/components/legacy/portal/ModuleRegistry';
import { resolveModuleFromPathname } from '@/core/cells/cell-to-module-definition';

interface ModuleContextType {
  currentModule: ModuleDefinition | null;
  currentFeature: ModuleFeature | null;
  isModuleLauncher: boolean;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [currentModule, setCurrentModule] = useState<ModuleDefinition | null>(
    null,
  );
  const [currentFeature, setCurrentFeature] = useState<ModuleFeature | null>(
    null,
  );

  useEffect(() => {
    const pathname = location.pathname;

    // Resolve módulo baseado no pathname, usando CellRegistry como fonte canônica
    const { module, feature } = resolveModuleFromPathname(pathname);

    setCurrentModule(module);
    setCurrentFeature(feature);
  }, [location.pathname]);

  const isModuleLauncher = currentModule === null;

  return (
    <ModuleContext.Provider
      value={{ currentModule, currentFeature, isModuleLauncher }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModuleContext(): ModuleContextType {
  const ctx = useContext(ModuleContext);
  if (!ctx) {
    throw new Error('useModuleContext must be used within ModuleProvider');
  }
  return ctx;
}
