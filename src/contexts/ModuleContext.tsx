import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  PORTAL_MODULES,
  type ModuleDefinition,
  type ModuleFeature,
} from '@/components/portal/ModuleRegistry';

interface ModuleContextType {
  currentModule: ModuleDefinition | null;
  currentFeature: ModuleFeature | null;
  isModuleLauncher: boolean;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

// Sort modules by route length (descending) so more specific routes match first
const MODULES_BY_SPECIFICITY = [...PORTAL_MODULES].sort(
  (a, b) => b.route.length - a.route.length,
);

// Flatten all features with their parent module for direct route matching
const ALL_FEATURES: Array<{
  module: ModuleDefinition;
  feature: ModuleFeature;
}> = [];
for (const module of PORTAL_MODULES) {
  if (module.features) {
    for (const feature of module.features) {
      ALL_FEATURES.push({ module, feature });
      if (feature.features) {
        for (const subFeature of feature.features) {
          ALL_FEATURES.push({ module, feature: subFeature });
        }
      }
    }
  }
}

// Sort features by route length (descending)
ALL_FEATURES.sort((a, b) => b.feature.route.length - a.feature.route.length);

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

    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      setCurrentModule(null);
      setCurrentFeature(null);
      return;
    }

    // First, try to match a feature route directly (most specific)
    let foundModule: ModuleDefinition | null = null;
    let foundFeature: ModuleFeature | null = null;

    for (const { module, feature } of ALL_FEATURES) {
      if (
        pathname === feature.route ||
        pathname.startsWith(`${feature.route}/`)
      ) {
        foundModule = module;
        foundFeature = feature;
        break;
      }
    }

    // If no feature matched, fall back to module route matching
    if (!foundModule) {
      for (const module of MODULES_BY_SPECIFICITY) {
        if (
          pathname === module.route ||
          pathname.startsWith(`${module.route}/`)
        ) {
          foundModule = module;
          break;
        }
      }
    }

    setCurrentModule(foundModule);
    setCurrentFeature(foundFeature);
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
