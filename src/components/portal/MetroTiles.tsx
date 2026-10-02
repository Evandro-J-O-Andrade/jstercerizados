import {
  type ReactNode,
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  DollarSign,
  BarChart3,
  Package,
  Headphones,
  Cpu,
  Settings,
  Shield,
  Globe,
  Building2,
  FileText,
  Plug,
  Activity,
  SlidersHorizontal,
  Lock,
  LayoutDashboard,
  CreditCard,
  BookOpen,
  FolderOpen,
  FileSignature,
  Wrench,
  Rocket,
} from 'lucide-react';
import { cn } from '@/utils';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import type { ModuleStats } from '@/lib/module-stats';

export const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  home: Home,
  users: Users,
  briefcase: Briefcase,
  'dollar-sign': DollarSign,
  'bar-chart': BarChart3,
  'bar-chart-2': BarChart3,
  'bar-chart-3': BarChart3,
  package: Package,
  headphones: Headphones,
  cpu: Cpu,
  settings: Settings,
  shield: Shield,
  globe: Globe,
  building2: Building2,
  'file-text': FileText,
  plug: Plug,
  activity: Activity,
  sliders: SlidersHorizontal,
  'sliders-horizontal': SlidersHorizontal,
  lock: Lock,
  layoutdashboard: LayoutDashboard,
  rocket: Rocket,
  'credit-card': CreditCard,
  'file-check': FileText,
  'book-open': BookOpen,
  folder: FolderOpen,
  'file-signature': FileSignature,
  wrench: Wrench,
};

function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Home;
  return <Icon className={cn('h-5 w-5 shrink-0', className)} />;
}

export interface TileStats {
  primary?: { label: string; value: string | number };
  secondary?: Array<{ label: string; value: string | number }>;
  badge?: {
    label: string;
    variant?: 'primary' | 'success' | 'warning' | 'danger';
  };
  description?: string;
}

interface TilePosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ModuleAccent {
  bg: string;
  fg: string;
  border: string;
  hover: string;
  glow: string;
}

const MODULE_ACCENTS: Record<string, ModuleAccent> = {
  inicio: {
    bg: 'var(--primary)/12',
    fg: 'var(--primary)',
    border: 'var(--primary)/20',
    hover: 'var(--primary)/20',
    glow: 'hsla(43, 80%, 48%, 0.35)',
  },
  'admin-master': {
    bg: '215 80% 12% / 0.14',
    fg: '215 80% 62%',
    border: '215 80% 62% / 0.22',
    hover: '215 80% 12% / 0.22',
    glow: 'hsla(215, 80%, 62%, 0.35)',
  },
  tenants: {
    bg: '215 80% 12% / 0.14',
    fg: '215 80% 62%',
    border: '215 80% 62% / 0.22',
    hover: '215 80% 12% / 0.22',
    glow: 'hsla(215, 80%, 62%, 0.35)',
  },
  onboarding: {
    bg: '340 70% 38% / 0.14',
    fg: '340 70% 58%',
    border: '340 70% 58% / 0.22',
    hover: '340 70% 38% / 0.22',
    glow: 'hsla(340, 70%, 58%, 0.35)',
  },
  assinaturas: {
    bg: '160 60% 33% / 0.14',
    fg: '160 60% 52%',
    border: '160 60% 52% / 0.22',
    hover: '160 60% 33% / 0.22',
    glow: 'hsla(160, 60%, 52%, 0.35)',
  },
  'gestao-saas': {
    bg: '260 60% 43% / 0.14',
    fg: '260 60% 62%',
    border: '260 60% 62% / 0.22',
    hover: '260 60% 43% / 0.22',
    glow: 'hsla(260, 60%, 62%, 0.35)',
  },
  usuarios: {
    bg: '200 70% 38% / 0.14',
    fg: '200 70% 58%',
    border: '200 70% 58% / 0.22',
    hover: '200 70% 38% / 0.22',
    glow: 'hsla(200, 70%, 58%, 0.35)',
  },
  'roles-permissoes': {
    bg: '25 80% 43% / 0.14',
    fg: '25 80% 62%',
    border: '25 80% 62% / 0.22',
    hover: '25 80% 43% / 0.22',
    glow: 'hsla(25, 80%, 62%, 0.35)',
  },
  auditoria: {
    bg: '350 60% 38% / 0.14',
    fg: '350 60% 58%',
    border: '350 60% 58% / 0.22',
    hover: '350 60% 38% / 0.22',
    glow: 'hsla(350, 60%, 58%, 0.35)',
  },
  contratos: {
    bg: '40 65% 38% / 0.14',
    fg: '40 65% 58%',
    border: '40 65% 58% / 0.22',
    hover: '40 65% 38% / 0.22',
    glow: 'hsla(40, 65%, 58%, 0.35)',
  },
  rh: {
    bg: '180 55% 33% / 0.14',
    fg: '180 55% 52%',
    border: '180 55% 52% / 0.22',
    hover: '180 55% 33% / 0.22',
    glow: 'hsla(180, 55%, 52%, 0.35)',
  },
  recrutamento: {
    bg: '280 60% 43% / 0.14',
    fg: '280 60% 62%',
    border: '280 60% 62% / 0.22',
    hover: '280 60% 43% / 0.22',
    glow: 'hsla(280, 60%, 62%, 0.35)',
  },
  crm: {
    bg: '140 55% 33% / 0.14',
    fg: '140 55% 52%',
    border: '140 55% 52% / 0.22',
    hover: '140 55% 33% / 0.22',
    glow: 'hsla(140, 55%, 52%, 0.35)',
  },
  financeiro: {
    bg: '160 65% 33% / 0.14',
    fg: '160 65% 52%',
    border: '160 65% 52% / 0.22',
    hover: '160 65% 33% / 0.22',
    glow: 'hsla(160, 65%, 52%, 0.35)',
  },
  faturamento: {
    bg: '25 70% 38% / 0.14',
    fg: '25 70% 58%',
    border: '25 70% 58% / 0.22',
    hover: '25 70% 38% / 0.22',
    glow: 'hsla(25, 70%, 58%, 0.35)',
  },
  fiscal: {
    bg: '20 60% 38% / 0.14',
    fg: '20 60% 58%',
    border: '20 60% 58% / 0.22',
    hover: '20 60% 38% / 0.22',
    glow: 'hsla(20, 60%, 58%, 0.35)',
  },
  contabilidade: {
    bg: '220 60% 38% / 0.14',
    fg: '220 60% 58%',
    border: '220 60% 58% / 0.22',
    hover: '220 60% 38% / 0.22',
    glow: 'hsla(220, 60%, 58%, 0.35)',
  },
  estoque: {
    bg: '30 65% 38% / 0.14',
    fg: '30 65% 58%',
    border: '30 65% 58% / 0.22',
    hover: '30 65% 38% / 0.22',
    glow: 'hsla(30, 65%, 58%, 0.35)',
  },
  servicos: {
    bg: '190 60% 38% / 0.14',
    fg: '190 60% 58%',
    border: '190 60% 58% / 0.22',
    hover: '190 60% 38% / 0.22',
    glow: 'hsla(190, 60%, 58%, 0.35)',
  },
  almoxarifado: {
    bg: '50 60% 38% / 0.14',
    fg: '50 60% 58%',
    border: '50 60% 58% / 0.22',
    hover: '50 60% 38% / 0.22',
    glow: 'hsla(50, 60%, 58%, 0.35)',
  },
  ia: {
    bg: '300 65% 48% / 0.14',
    fg: '300 65% 67%',
    border: '300 65% 67% / 0.22',
    hover: '300 65% 48% / 0.22',
    glow: 'hsla(300, 65%, 67%, 0.35)',
  },
  documentos: {
    bg: '210 55% 38% / 0.14',
    fg: '210 55% 58%',
    border: '210 55% 58% / 0.22',
    hover: '210 55% 38% / 0.22',
    glow: 'hsla(210, 55%, 58%, 0.35)',
  },
  conta: {
    bg: '215 40% 38% / 0.14',
    fg: '215 40% 62%',
    border: '215 40% 62% / 0.22',
    hover: '215 40% 38% / 0.22',
    glow: 'hsla(215, 40%, 62%, 0.35)',
  },
};

function getModuleAccent(moduleId: string): ModuleAccent {
  return MODULE_ACCENTS[moduleId] || MODULE_ACCENTS['inicio'];
}

function getElevationClass(w: number, h: number): string {
  const area = w * h;
  if (area >= 12) return 'tile-elevation-3';
  if (area >= 8) return 'tile-elevation-2';
  if (area >= 4) return 'tile-elevation-1';
  return 'tile-elevation-0';
}

interface MetroTileProps {
  module: ModuleDefinition;
  position: TilePosition;
  index: number;
  isDragging?: boolean;
  onDragStart?: (index: number) => void;
  onDragEnd?: (fromIndex: number, toIndex: number) => void;
  onDragOver?: (index: number) => void;
  children?: ReactNode;
  stats?: TileStats;
}

export function MetroTile({
  module,
  position,
  index,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  children,
  stats,
}: MetroTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accent = useMemo(() => getModuleAccent(module.id), [module.id]);
  const elevationClass = getElevationClass(position.w, position.h);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!dragRef.current) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
      onDragStart?.(index);
      dragRef.current.classList.add('dragging');
      dragRef.current.classList.add('ring-2', 'ring-primary/50');
    },
    [index, onDragStart],
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragRef.current) return;
      dragRef.current.classList.remove('dragging');
      dragRef.current.classList.remove('ring-2', 'ring-primary/50');
      onDragEnd?.(index, parseInt(e.dataTransfer.getData('text/plain'), 10));
    },
    [index, onDragEnd],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      onDragOver?.(index);
    },
    [index, onDragOver],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (fromIndex !== index) {
        onDragEnd?.(fromIndex, index);
      }
    },
    [index, onDragEnd],
  );

  const handleMouseDown = useCallback(() => {
    pressTimerRef.current = setTimeout(() => {
      setIsPressed(true);
    }, 150);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setIsPressed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setIsPressed(false);
    setIsHovered(false);
  }, []);

  const interactive = children ? false : true;

  return (
    <div
      ref={dragRef}
      draggable={interactive}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        'group relative',
        isDragging &&
          'ring-primary/50 z-50 scale-105 rotate-[2deg] opacity-50 ring-2',
        !interactive && 'pointer-events-none',
        isPressed && 'scale-[0.98]',
      )}
      style={
        {
          '--tile-accent-bg': accent.bg,
          '--tile-accent-fg': accent.fg,
          '--tile-accent-border': accent.border,
          '--tile-accent-hover': accent.hover,
          '--tile-accent-glow': accent.glow,
          gridColumn: `${position.x + 1} / span ${position.w}`,
          gridRow: `${position.y + 1} / span ${position.h}`,
        } as React.CSSProperties
      }
    >
      {interactive ? (
        <NavLink
          to={module.route}
          className={cn(
            'block h-full w-full rounded-lg',
            elevationClass,
            'transition-all duration-200 ease-out',
            'hover:-translate-y-[2px]',
            'focus-visible:ring-primary/50 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
            'active:translate-y-0 active:scale-[0.98]',
            'overflow-hidden',
            isHovered && '-translate-y-[2px]',
            isFocused &&
              'ring-primary/50 ring-offset-background ring-2 ring-offset-2',
            '@media (prefers-reduced-motion: reduce) { transform: none; scale: 1; }',
          )}
        >
          <TileContent module={module} position={position} stats={stats} />
        </NavLink>
      ) : (
        <div
          className={cn(
            'h-full w-full rounded-lg',
            elevationClass,
            'overflow-hidden',
          )}
        >
          <TileContent module={module} position={position} stats={stats} />
          {children}
        </div>
      )}
      {interactive && (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-200',
            'opacity-0 group-hover:opacity-100',
          )}
          style={
            {
              background: `linear-gradient(180deg, transparent, var(--tile-accent-hover))`,
            } as React.CSSProperties
          }
        />
      )}
      {isDragging && (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={
            {
              background: 'var(--tile-accent-bg)',
              boxShadow: `0 20px 48px var(--tile-accent-glow), 0 8px 16px hsla(215, 35%, 10%, 0.18)`,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function TileContent({
  module,
  position,
  children,
  stats,
}: {
  module: ModuleDefinition;
  position: TilePosition;
  children?: ReactNode;
  stats?: TileStats;
}) {
  const area = position.w * position.h;
  const isHero = area >= 12;
  const isLarge = area >= 8 && area < 12;
  const isMedium = area >= 4 && area < 8;
  const isWide = position.w >= 4 && position.h === 1;
  const isTall = position.w === 1 && position.h >= 3;
  const hasStats = Boolean(
    stats &&
    (stats.primary || stats.secondary || stats.badge || stats.description),
  );

  const iconSize = isHero
    ? 48
    : isLarge
      ? 36
      : isWide
        ? 30
        : isMedium
          ? 26
          : isTall
            ? 22
            : 20;
  const titleSize = isHero
    ? 'text-3xl'
    : isLarge
      ? 'text-2xl'
      : isWide
        ? 'text-xl'
        : isMedium
          ? 'text-lg'
          : 'text-base';
  const descSize = isHero
    ? 'text-base'
    : isLarge
      ? 'text-sm'
      : isWide
        ? 'text-sm'
        : isMedium
          ? 'text-xs'
          : 'text-xs';
  const padding = isHero
    ? 'p-8'
    : isLarge
      ? 'p-7'
      : isWide
        ? 'p-6'
        : isMedium
          ? 'p-5'
          : 'p-4';
  const iconPadding = isHero
    ? 'p-6'
    : isLarge
      ? 'p-5'
      : isWide
        ? 'p-4'
        : isMedium
          ? 'p-3.5'
          : 'p-3';

  const showDescription = area >= 6;

  return (
    <div
      className={`flex h-full w-full flex-col ${padding} relative overflow-hidden`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg transition-all duration-200',
            'group-hover:scale-[1.03]',
            iconPadding,
          )}
          style={
            {
              background: 'var(--tile-accent-bg)',
              color: 'var(--tile-accent-fg)',
              border: '1px solid var(--tile-accent-border)',
            } as React.CSSProperties
          }
        >
          <ModuleIcon
            name={module.icon}
            className={`h-[${iconSize}px] w-[${iconSize}px]`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn('text-foreground truncate font-semibold', titleSize)}
          >
            {module.title}
          </h3>
          {showDescription && (
            <p
              className={cn(
                'text-muted-foreground mt-1.5 truncate leading-relaxed',
                descSize,
              )}
            >
              {stats?.description || module.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between">
        {(isHero || isLarge || isWide || hasStats) && (
          <div className="space-y-2.5 text-sm">
            {stats?.primary && (
              <div className="flex items-baseline gap-1">
                <span className="text-foreground text-xl font-semibold tabular-nums">
                  {stats.primary.value}
                </span>
                <span className="text-muted-foreground text-sm">
                  {stats.primary.label}
                </span>
              </div>
            )}
            {stats?.secondary && stats.secondary.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stats.secondary.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-muted/50 flex items-center gap-1 rounded-md px-2 py-1"
                  >
                    <span className="text-muted-foreground text-xs font-medium">
                      {stat.label}
                    </span>
                    <span className="text-foreground font-semibold tabular-nums">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {stats?.badge && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  stats.badge.variant === 'success' &&
                    'bg-green-500/10 text-green-600 dark:text-green-400',
                  stats.badge.variant === 'warning' &&
                    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
                  stats.badge.variant === 'danger' &&
                    'bg-red-500/10 text-red-600 dark:text-red-400',
                  stats.badge.variant === 'primary' &&
                    'bg-primary/10 text-primary',
                )}
              >
                {stats.badge.label}
              </span>
            )}
            {children && !stats && (
              <div className="space-y-1.5">{children}</div>
            )}
          </div>
        )}

        <div className="border-border/40 flex items-center justify-between border-t pt-3">
          <span
            className={cn(
              'text-muted-foreground/50 group-hover:text-primary/70 font-medium tracking-wider uppercase transition-colors duration-200',
              isHero ? 'text-sm' : isLarge ? 'text-xs' : 'text-[10px]',
            )}
          >
            Acessar
          </span>
          <span
            className={cn(
              'text-primary transition-transform duration-200 group-hover:translate-x-0.5',
              isHero
                ? 'text-2xl'
                : isLarge
                  ? 'text-xl'
                  : isWide
                    ? 'text-lg'
                    : isMedium
                      ? 'text-base'
                      : 'text-sm',
            )}
          >
            →
          </span>
        </div>
      </div>
    </div>
  );
}

interface MetroTileGridProps {
  modules: ModuleDefinition[];
  onReorder: (modules: ModuleDefinition[]) => void;
  tileLayout: Record<string, TilePosition>;
  moduleStats?: Record<string, ModuleStats>;
  statsLoading?: boolean;
  userId: string;
  tenantId: string | null;
}

function getStorageKey(userId: string, tenantId: string | null): string {
  return `metro-tile-order:${userId}:${tenantId || 'global'}`;
}

export function MetroTileGrid({
  modules,
  onReorder,
  tileLayout,
  moduleStats = {},
  statsLoading = false,
  userId,
  tenantId,
}: MetroTileGridProps) {
  const storageKey = getStorageKey(userId, tenantId);

  const [tileOrder, setTileOrder] = useState<ModuleDefinition[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const moduleMap = new Map(modules.map((m) => [m.id, m]));
        const validOrder = parsed
          .map((id: string) => moduleMap.get(id))
          .filter(Boolean) as ModuleDefinition[];
        const existingIds = new Set(validOrder.map((m) => m.id));
        const newModules = modules.filter((m) => !existingIds.has(m.id));
        return [...validOrder, ...newModules];
      }
    } catch {
      // Ignore parse errors, fall back to default
    }
    return modules;
  });

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(tileOrder.map((m) => m.id)),
    );
  }, [tileOrder, storageKey]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (index: number) => {
      if (draggingIndex !== null && draggingIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggingIndex],
  );

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) {
        setDraggingIndex(null);
        setDragOverIndex(null);
        return;
      }

      const newOrder = [...tileOrder];
      const [removed] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, removed);
      setTileOrder(newOrder);
      onReorder(newOrder);

      setDraggingIndex(null);
      setDragOverIndex(null);
    },
    [tileOrder, onReorder],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setViewportHeight(container.clientHeight);
    };

    updateHeight();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }

    return undefined;
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    setScrollTop(containerRef.current.scrollTop);
  }, []);

  const { visibleStart, visibleEnd, totalHeight } = useMemo(() => {
    if (viewportHeight === 0 || tileOrder.length === 0) {
      return {
        visibleStart: 0,
        visibleEnd: tileOrder.length,
        totalHeight: 0,
      };
    }

    const pixelsPerRow = TILE_ROW_HEIGHT;
    const topPixel = scrollTop;
    const bottomPixel = scrollTop + viewportHeight;

    const startRow = Math.max(
      0,
      Math.floor(topPixel / pixelsPerRow) - VIRTUAL_BUFFER,
    );
    const endRow = Math.min(
      MAX_ROWS,
      Math.ceil(bottomPixel / pixelsPerRow) + VIRTUAL_BUFFER,
    );

    const startTile = tileOrder.findIndex(
      (_m, i) => (tileLayout[tileOrder[i].id]?.y ?? 0) >= startRow,
    );
    let endTile = tileOrder.length;
    for (let i = tileOrder.length - 1; i >= 0; i--) {
      const pos = tileLayout[tileOrder[i].id] || { y: 0, h: 1 };
      if ((pos.y ?? 0) + (pos.h ?? 1) <= endRow) {
        endTile = i + 1;
        break;
      }
    }

    const totalRows = Math.max(
      0,
      ...tileOrder.map((m) => {
        const pos = tileLayout[m.id] || { y: 0, h: 1 };
        return (pos.y ?? 0) + (pos.h ?? 1);
      }),
    );
    const totalHeight = totalRows * pixelsPerRow;

    return {
      visibleStart: Math.max(0, startTile === -1 ? 0 : startTile),
      visibleEnd:
        endTile === 0 ? tileOrder.length : Math.min(tileOrder.length, endTile),
      totalHeight,
    };
  }, [viewportHeight, scrollTop, tileOrder, tileLayout]);

  const topSpacerHeight = useMemo(() => {
    if (visibleStart === 0) return 0;
    const firstVisible = tileOrder[visibleStart];
    const pos = tileLayout[firstVisible?.id] || { y: 0 };
    return (pos.y ?? 0) * TILE_ROW_HEIGHT;
  }, [visibleStart, tileOrder, tileLayout]);

  const bottomSpacerHeight = useMemo(() => {
    const lastVisible = tileOrder[visibleEnd - 1];
    if (!lastVisible) return 0;
    const pos = tileLayout[lastVisible.id] || { y: 0, h: 1 };
    const lastRow = (pos.y ?? 0) + (pos.h ?? 1);
    return Math.max(0, totalHeight - lastRow * TILE_ROW_HEIGHT);
  }, [visibleEnd, tileOrder, tileLayout, totalHeight]);

  const safeStart = Math.max(0, visibleStart);
  const safeEnd = Math.min(tileOrder.length, visibleEnd);
  const visibleTiles = tileOrder.slice(safeStart, safeEnd);

  return (
    <div
      ref={containerRef}
      className="metro-grid-responsive grid auto-rows-[240px] grid-cols-12 gap-4 overflow-y-auto"
      role="list"
      aria-label="Módulos do sistema"
      onScroll={handleScroll}
    >
      {topSpacerHeight > 0 && (
        <div
          className="col-span-12"
          style={{ height: `${topSpacerHeight}px` }}
          aria-hidden="true"
        />
      )}

      {visibleTiles.map((module, visualIndex) => {
        const index = safeStart + visualIndex;
        const position = tileLayout[module.id] || { x: 0, y: 0, w: 2, h: 1 };
        const isDragging = draggingIndex === index;
        const isDragOver = dragOverIndex === index;
        const moduleStat = moduleStats[module.id];
        const stats: TileStats | undefined =
          statsLoading || !moduleStat
            ? undefined
            : {
                primary: moduleStat.primaryMetric
                  ? {
                      label: moduleStat.primaryMetric.label,
                      value: moduleStat.primaryMetric.value,
                    }
                  : undefined,
                secondary: moduleStat.secondaryMetrics?.map((m) => ({
                  label: m.label,
                  value: m.value,
                })),
                description: moduleStat.description,
              };

        return (
          <MetroTile
            key={module.id}
            module={module}
            position={position}
            index={index}
            isDragging={isDragging || isDragOver}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            stats={stats}
          />
        );
      })}

      {bottomSpacerHeight > 0 && (
        <div
          className="col-span-12"
          style={{ height: `${bottomSpacerHeight}px` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

interface AllowedSize {
  w: number;
  h: number;
}

const ALLOWED_SIZES: AllowedSize[] = [
  { w: 3, h: 2 }, // 6 cells - preferred medium
  { w: 2, h: 3 }, // 6 cells - preferred tall medium
  { w: 2, h: 2 }, // 4 cells - preferred square
  { w: 3, h: 1 }, // 3 cells - wide
  { w: 4, h: 1 }, // 4 cells - wider banner
  { w: 4, h: 2 }, // 8 cells - large wide
  { w: 3, h: 3 }, // 9 cells - large square
  { w: 2, h: 1 }, // 2 cells - small wide
  { w: 1, h: 2 }, // 2 cells - small tall
  { w: 1, h: 1 }, // 1 cell - tiny (last resort)
];

const COLS = 12;
const MAX_ROWS = 50;
const TILE_ROW_HEIGHT = 240;
const VIRTUAL_BUFFER = 2;

interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectFits(freeRect: FreeRect, w: number, h: number): boolean {
  return freeRect.w >= w && freeRect.h >= h;
}

function splitFreeRect(freeRect: FreeRect, placedRect: FreeRect): FreeRect[] {
  const result: FreeRect[] = [];

  // No overlap - return original
  if (
    placedRect.x >= freeRect.x + freeRect.w ||
    placedRect.x + placedRect.w <= freeRect.x ||
    placedRect.y >= freeRect.y + freeRect.h ||
    placedRect.y + placedRect.h <= freeRect.y
  ) {
    return [freeRect];
  }

  // Split left
  if (placedRect.x > freeRect.x) {
    result.push({
      x: freeRect.x,
      y: freeRect.y,
      w: placedRect.x - freeRect.x,
      h: freeRect.h,
    });
  }

  // Split right
  if (placedRect.x + placedRect.w < freeRect.x + freeRect.w) {
    result.push({
      x: placedRect.x + placedRect.w,
      y: freeRect.y,
      w: freeRect.x + freeRect.w - (placedRect.x + placedRect.w),
      h: freeRect.h,
    });
  }

  // Split top
  if (placedRect.y > freeRect.y) {
    const leftX = Math.max(freeRect.x, placedRect.x);
    const rightX = Math.min(
      freeRect.x + freeRect.w,
      placedRect.x + placedRect.w,
    );
    if (rightX > leftX) {
      result.push({
        x: leftX,
        y: freeRect.y,
        w: rightX - leftX,
        h: placedRect.y - freeRect.y,
      });
    }
  }

  // Split bottom
  if (placedRect.y + placedRect.h < freeRect.y + freeRect.h) {
    const leftX = Math.max(freeRect.x, placedRect.x);
    const rightX = Math.min(
      freeRect.x + freeRect.w,
      placedRect.x + placedRect.w,
    );
    if (rightX > leftX) {
      result.push({
        x: leftX,
        y: placedRect.y + placedRect.h,
        w: rightX - leftX,
        h: freeRect.y + freeRect.h - (placedRect.y + placedRect.h),
      });
    }
  }

  return result;
}

function pruneFreeRects(freeRects: FreeRect[]): FreeRect[] {
  const result: FreeRect[] = [];
  for (const rect of freeRects) {
    if (rect.w <= 0 || rect.h <= 0) continue;
    let contained = false;
    for (const other of freeRects) {
      if (rect === other) continue;
      if (
        rect.x >= other.x &&
        rect.y >= other.y &&
        rect.x + rect.w <= other.x + other.w &&
        rect.y + rect.h <= other.y + other.h
      ) {
        contained = true;
        break;
      }
    }
    if (!contained) result.push(rect);
  }
  return result;
}

function mergeAdjacentFreeRects(freeRects: FreeRect[]): FreeRect[] {
  const merged: FreeRect[] = [];
  const used = new Set<number>();

  for (let i = 0; i < freeRects.length; i++) {
    if (used.has(i)) continue;
    let current = { ...freeRects[i] };
    let changed = true;

    while (changed) {
      changed = false;
      for (let j = i + 1; j < freeRects.length; j++) {
        if (used.has(j)) continue;
        const other = freeRects[j];

        // Horizontal merge (same y, same h, adjacent x)
        if (
          current.y === other.y &&
          current.h === other.h &&
          (current.x + current.w === other.x || other.x + other.w === current.x)
        ) {
          const minX = Math.min(current.x, other.x);
          const maxX = Math.max(current.x + current.w, other.x + other.w);
          current = { x: minX, y: current.y, w: maxX - minX, h: current.h };
          used.add(j);
          changed = true;
        }
        // Vertical merge (same x, same w, adjacent y)
        else if (
          current.x === other.x &&
          current.w === other.w &&
          (current.y + current.h === other.y || other.y + other.h === current.y)
        ) {
          const minY = Math.min(current.y, other.y);
          const maxY = Math.max(current.y + current.h, other.y + other.h);
          current = { x: current.x, y: minY, w: current.w, h: maxY - minY };
          used.add(j);
          changed = true;
        }
      }
    }
    merged.push(current);
  }

  return merged;
}

function findBestPlacement(
  freeRects: FreeRect[],
  sizes: AllowedSize[],
  _moduleIndex: number,
  usedSizes: Map<string, number>,
  columnUsage: Map<string, number>,
): { rect: FreeRect; size: AllowedSize } | null {
  let bestScore = -Infinity;
  let bestRect: FreeRect | null = null;
  let bestSize: AllowedSize | null = null;

  for (const size of sizes) {
    for (const freeRect of freeRects) {
      if (rectFits(freeRect, size.w, size.h)) {
        // Score: prefer top-left, medium tiles that fit well, minimal waste
        const posScore =
          (MAX_ROWS - freeRect.y) * 100 + (COLS - freeRect.x) * 10;

        // Size score: sweet spot at 4-6 cells, penalize huge tiles
        const area = size.w * size.h;
        let sizeScore = 0;
        if (area >= 4 && area <= 6) sizeScore = 30;
        else if (area === 3) sizeScore = 25;
        else if (area === 8) sizeScore = 15;
        else if (area === 9) sizeScore = 10;
        else if (area === 2) sizeScore = 5;
        else if (area === 1) sizeScore = 0;
        else sizeScore = -20;

        const waste = freeRect.w * freeRect.h - area;
        const wastePenalty = waste * 4;

        // Slight preference for squares/near-squares (better visual balance)
        const aspectRatio = Math.max(size.w, size.h) / Math.min(size.w, size.h);
        const aspectBonus = aspectRatio <= 2 ? 8 : 0;

        // NO HERO BONUS - all modules treated equally

        // Variety bonus: prefer sizes not used yet
        const usedCount = usedSizes.get(`${size.w}x${size.h}`) || 0;
        let varietyBonus = 0;
        if (usedCount === 0) varietyBonus = 20;
        else if (usedCount === 1) varietyBonus = 12;
        else if (usedCount === 2) varietyBonus = 6;

        // Column width penalty: discourage repeating same width at same x-position
        const colKey = `${freeRect.x}:${size.w}`;
        const colCount = columnUsage.get(colKey) || 0;
        const columnPenalty = colCount * 18;

        const score =
          posScore +
          sizeScore -
          wastePenalty +
          aspectBonus +
          varietyBonus -
          columnPenalty;

        if (score > bestScore) {
          bestScore = score;
          bestRect = freeRect;
          bestSize = size;
        }
      }
    }
  }

  if (bestRect && bestSize) {
    return { rect: bestRect, size: bestSize };
  }
  return null;
}

export function computePuzzleLayout(
  modules: ModuleDefinition[],
): Record<string, TilePosition> {
  // Modules are treated equally - no priority by name/category
  // Order from DashboardHome (user's drag/drop order) is preserved
  const moduleList = [...modules];

  // Start with one large free rectangle covering the entire grid
  let freeRects: FreeRect[] = [{ x: 0, y: 0, w: COLS, h: MAX_ROWS }];
  const result: Record<string, TilePosition> = {};

  // Track size usage for variety bonus and column usage for diversity
  const usedSizes = new Map<string, number>();
  const columnUsage = new Map<string, number>();

  for (let moduleIndex = 0; moduleIndex < moduleList.length; moduleIndex++) {
    const module = moduleList[moduleIndex];
    const placement = findBestPlacement(
      freeRects,
      ALLOWED_SIZES,
      moduleIndex,
      usedSizes,
      columnUsage,
    );

    if (placement) {
      const { rect: freeRect, size } = placement;
      const position: TilePosition = {
        x: freeRect.x,
        y: freeRect.y,
        w: size.w,
        h: size.h,
      };

      // Mark the placed area as occupied by splitting free rectangles
      const placedRect: FreeRect = {
        x: freeRect.x,
        y: freeRect.y,
        w: size.w,
        h: size.h,
      };
      const newFreeRects: FreeRect[] = [];

      for (const fr of freeRects) {
        newFreeRects.push(...splitFreeRect(fr, placedRect));
      }

      // Prune contained rectangles and merge adjacent ones
      freeRects = pruneFreeRects(newFreeRects);
      freeRects = mergeAdjacentFreeRects(freeRects);

      result[module.id] = position;

      // Update tracking maps
      const sizeKey = `${size.w}x${size.h}`;
      usedSizes.set(sizeKey, (usedSizes.get(sizeKey) || 0) + 1);
      const colKey = `${freeRect.x}:${size.w}`;
      columnUsage.set(colKey, (columnUsage.get(colKey) || 0) + 1);
    } else {
      // Fallback: should rarely happen with proper splitting
      // Find any position for a 2x1 tile
      let found = false;
      for (let y = 0; y < MAX_ROWS && !found; y++) {
        for (let x = 0; x <= COLS - 2 && !found; x++) {
          let canPlace = true;
          for (const fr of freeRects) {
            if (
              x >= fr.x &&
              x + 2 <= fr.x + fr.w &&
              y >= fr.y &&
              y + 1 <= fr.y + fr.h
            ) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            const fallbackRect: FreeRect = { x, y, w: 2, h: 1 };
            const newFreeRects: FreeRect[] = [];
            for (const fr of freeRects) {
              newFreeRects.push(...splitFreeRect(fr, fallbackRect));
            }
            freeRects = pruneFreeRects(newFreeRects);
            freeRects = mergeAdjacentFreeRects(freeRects);
            result[module.id] = { x, y, w: 2, h: 1 };

            // Update tracking for fallback too
            usedSizes.set('2x1', (usedSizes.get('2x1') || 0) + 1);
            columnUsage.set(`${x}:2`, (columnUsage.get(`${x}:2`) || 0) + 1);
            found = true;
          }
        }
      }
      if (!found) {
        result[module.id] = { x: 0, y: 0, w: 2, h: 1 };
      }
    }
  }

  return result;
}
