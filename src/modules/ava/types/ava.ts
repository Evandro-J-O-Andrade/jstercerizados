import type { MediaAsset } from '@/components/media/MediaUploader.types';
import type { AvaModule, Tutorial } from './tutorial';

export interface AvaContextValue {
  availableModules: AvaModule[];
  tutorialsByModule: Record<AvaModule, Tutorial[]>;
  selectedModule: AvaModule | null;
  searchQuery: string;
  filteredTutorials: Tutorial[];
  isLoading: boolean;
  error: string | null;
  selectModule: (module: AvaModule | null) => void;
  setSearchQuery: (query: string) => void;
  getTutorial: (slug: string) => Tutorial | null;
  getVideoAsset: (tutorialId: string) => Promise<MediaAsset | null>;
  refresh: () => Promise<void>;
}

export interface AvaModuleInfo {
  id: AvaModule;
  label: string;
  description: string;
  icon: string;
  route: string;
  tutorialCount: number;
}

export type AvaPermission = 'ava.read' | 'ava.manage';
