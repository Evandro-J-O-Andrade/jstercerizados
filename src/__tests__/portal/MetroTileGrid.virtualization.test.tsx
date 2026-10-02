import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: vi.fn(),
}));

vi.mock('@/contexts/CandidateContext', () => ({
  useCandidate: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => null),
}));

vi.mock('lucide-react', () => {
  const icons: Record<string, any> = {};
  const iconNames = [
    'Home',
    'Users',
    'Briefcase',
    'DollarSign',
    'BarChart3',
    'Package',
    'Headphones',
    'Cpu',
    'Settings',
    'Shield',
    'Globe',
    'Building2',
    'FileText',
    'Plug',
    'Activity',
    'SlidersHorizontal',
    'Lock',
    'LayoutDashboard',
    'CreditCard',
    'BookOpen',
    'FolderOpen',
    'FileSignature',
    'Wrench',
    'Rocket',
    'Plus',
    'Pencil',
    'Trash2',
    'Power',
    'PowerOff',
    'MapPin',
    'Bell',
    'Upload',
    'GraduationCap',
    'Award',
    'Languages',
  ];
  iconNames.forEach((name) => {
    icons[name] = ({ className }: any) => (
      <svg data-testid={`icon-${name}`} className={className} />
    );
  });
  return icons;
});

vi.mock('@/components/ui/SEO', () => ({
  SEO: () => null,
}));

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/feedback/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

vi.mock('@/components/feedback/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}));

vi.mock('@/features/candidato/components/candidate/ExperienceDialog', () => ({
  ExperienceDialog: () => null,
}));

vi.mock('@/features/candidato/components/candidate/EducationDialog', () => ({
  EducationDialog: () => null,
}));

vi.mock('@/features/candidato/components/candidate/CourseDialog', () => ({
  CourseDialog: () => null,
}));

vi.mock('@/features/candidato/components/candidate/LanguageDialog', () => ({
  LanguageDialog: () => null,
}));

vi.mock('@/features/candidato/components/candidate/SkillDialog', () => ({
  SkillDialog: () => null,
}));

vi.mock('@/features/candidato/components/candidate/DocumentDialog', () => ({
  DocumentDialog: () => null,
}));

vi.mock('@/features/candidato/components/candidate/PreferencesDialog', () => ({
  PreferencesDialog: () => null,
}));

vi.mock('@/repositories/candidates.repository', () => ({
  candidatesRepository: { update: vi.fn() },
}));

vi.mock('@/repositories/candidate-experiences.repository', () => ({
  candidateExperiencesRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-education.repository', () => ({
  candidateEducationRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-courses.repository', () => ({
  candidateCoursesRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-languages.repository', () => ({
  candidateLanguagesRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-skills.repository', () => ({
  candidateSkillsRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-documents.repository', () => ({
  candidateDocumentsRepository: {
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/repositories/candidate-preferences.repository', () => ({
  candidatePreferencesRepository: { create: vi.fn(), update: vi.fn() },
}));

vi.mock('@/config', () => ({
  COMPANY: { name: 'J&S Empregos LTDA' },
}));

import {
  MetroTileGrid,
  computePuzzleLayout,
} from '@/components/portal/MetroTiles';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';

function makeModules(count: number): ModuleDefinition[] {
  const categories = [
    'inicio',
    'plataforma',
    'negocio',
    'ia',
    'seguranca',
    'documentos',
    'conta',
  ] as const;
  return Array.from({ length: count }, (_, i) => ({
    id: `module-${i}`,
    title: `Module ${i}`,
    description: `Description for module ${i}`,
    icon: 'home',
    route: `/dashboard/module-${i}`,
    category: categories[i % categories.length],
    scope: 'tenant' as const,
  }));
}

function getVisibleTileCount(container: HTMLElement): number {
  return container.querySelectorAll('[style*="grid-column"]').length;
}

describe('MetroTileGrid — Virtualização', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tiles when viewport height is zero (initial render guard)', () => {
    const modules = makeModules(28);
    const tileLayout = computePuzzleLayout(modules);

    const { container } = render(
      <MemoryRouter>
        <MetroTileGrid
          modules={modules}
          onReorder={vi.fn()}
          tileLayout={tileLayout}
          userId="user-1"
          tenantId="tenant-1"
        />
      </MemoryRouter>,
    );

    expect(getVisibleTileCount(container)).toBe(28);
  });

  it('applies overflow-y-auto class to the grid container', () => {
    const modules = makeModules(5);
    const tileLayout = computePuzzleLayout(modules);

    const { container } = render(
      <MemoryRouter>
        <MetroTileGrid
          modules={modules}
          onReorder={vi.fn()}
          tileLayout={tileLayout}
          userId="user-1"
          tenantId="tenant-1"
        />
      </MemoryRouter>,
    );

    const grid = container.querySelector('[role="list"]');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('overflow-y-auto');
  });

  it('renders tiles with grid-column and grid-row styles', () => {
    const modules = makeModules(5);
    const tileLayout = computePuzzleLayout(modules);

    const { container } = render(
      <MemoryRouter>
        <MetroTileGrid
          modules={modules}
          onReorder={vi.fn()}
          tileLayout={tileLayout}
          userId="user-1"
          tenantId="tenant-1"
        />
      </MemoryRouter>,
    );

    const tiles = container.querySelectorAll('[style*="grid-column"]');
    expect(tiles.length).toBe(5);

    const firstTile = tiles[0] as HTMLElement;
    expect(firstTile.style.gridColumn).toMatch(/\d+ \/ span \d+/);
    expect(firstTile.style.gridRow).toMatch(/\d+ \/ span \d+/);
  });

  it('handles window resize gracefully', async () => {
    const modules = makeModules(10);
    const tileLayout = computePuzzleLayout(modules);

    const { container } = render(
      <MemoryRouter>
        <MetroTileGrid
          modules={modules}
          onReorder={vi.fn()}
          tileLayout={tileLayout}
          userId="user-1"
          tenantId="tenant-1"
        />
      </MemoryRouter>,
    );

    expect(getVisibleTileCount(container)).toBe(10);
  });

  it('does not crash when ResizeObserver is unavailable', () => {
    const modules = makeModules(3);
    const tileLayout = computePuzzleLayout(modules);

    const originalRO = global.ResizeObserver;
    // @ts-expect-error - intentionally removing ResizeObserver
    delete global.ResizeObserver;

    try {
      expect(() => {
        render(
          <MemoryRouter>
            <MetroTileGrid
              modules={modules}
              onReorder={vi.fn()}
              tileLayout={tileLayout}
              userId="user-1"
              tenantId="tenant-1"
            />
          </MemoryRouter>,
        );
      }).not.toThrow();
    } finally {
      global.ResizeObserver = originalRO;
    }
  });
});
