import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils';
import { ICON_MAP } from '@/components/portal/MetroTiles';
import type { ModuleDefinition } from '@/components/portal/ModuleRegistry';
import type { ModuleStats } from '@/lib/module-stats';

export interface ModuleCardGridProps {
  modules: ModuleDefinition[];
  moduleStats?: Record<string, ModuleStats>;
  statsLoading?: boolean;
  userId?: string;
  tenantId?: string | null;
}

/**
 * Identidade visual por modulo.
 *
 * Apenas modulos de negocio recebem acento proprio. Plataforma e conta
 * permanecem neutros para nao transformar o launcher num carnaval visual.
 * As classes sao literais de proposito: o JIT do Tailwind so enxerga
 * strings completas.
 */
interface ModuleAccent {
  chip: string;
  icon: string;
  bar: string;
  hover: string;
}

const MODULE_ACCENT: Record<string, ModuleAccent> = {
  rh: {
    chip: 'bg-sky-500/10',
    icon: 'text-sky-600 dark:text-sky-400',
    bar: 'bg-sky-500',
    hover: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
  },
  recrutamento: {
    chip: 'bg-cyan-500/10',
    icon: 'text-cyan-600 dark:text-cyan-400',
    bar: 'bg-cyan-500',
    hover: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
  },
  crm: {
    chip: 'bg-indigo-500/10',
    icon: 'text-indigo-600 dark:text-indigo-400',
    bar: 'bg-indigo-500',
    hover: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
  },
  financeiro: {
    chip: 'bg-violet-500/10',
    icon: 'text-violet-600 dark:text-violet-400',
    bar: 'bg-violet-500',
    hover: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
  },
  faturamento: {
    chip: 'bg-purple-500/10',
    icon: 'text-purple-600 dark:text-purple-400',
    bar: 'bg-purple-500',
    hover: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
  },
  fiscal: {
    chip: 'bg-teal-500/10',
    icon: 'text-teal-600 dark:text-teal-400',
    bar: 'bg-teal-500',
    hover: 'hover:border-teal-500/50 hover:shadow-teal-500/10',
  },
  contabilidade: {
    chip: 'bg-slate-500/10',
    icon: 'text-slate-600 dark:text-slate-400',
    bar: 'bg-slate-500',
    hover: 'hover:border-slate-500/50 hover:shadow-slate-500/10',
  },
  estoque: {
    chip: 'bg-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400',
    bar: 'bg-amber-500',
    hover: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
  },
  almoxarifado: {
    chip: 'bg-orange-500/10',
    icon: 'text-orange-600 dark:text-orange-400',
    bar: 'bg-orange-500',
    hover: 'hover:border-orange-500/50 hover:shadow-orange-500/10',
  },
  servicos: {
    chip: 'bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    hover: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
  },
  contratos: {
    chip: 'bg-blue-500/10',
    icon: 'text-blue-600 dark:text-blue-400',
    bar: 'bg-blue-500',
    hover: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
  },
  suporte: {
    chip: 'bg-rose-500/10',
    icon: 'text-rose-600 dark:text-rose-400',
    bar: 'bg-rose-500',
    hover: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
  },
  relatorios: {
    chip: 'bg-sky-500/10',
    icon: 'text-sky-600 dark:text-sky-400',
    bar: 'bg-sky-500',
    hover: 'hover:border-sky-500/50 hover:shadow-sky-500/10',
  },
  ia: {
    chip: 'bg-fuchsia-500/10',
    icon: 'text-fuchsia-600 dark:text-fuchsia-400',
    bar: 'bg-fuchsia-500',
    hover: 'hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/10',
  },
  integracoes: {
    chip: 'bg-indigo-500/10',
    icon: 'text-indigo-600 dark:text-indigo-400',
    bar: 'bg-indigo-500',
    hover: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
  },
};

const DEFAULT_ACCENT: ModuleAccent = {
  chip: 'bg-primary/10',
  icon: 'text-primary',
  bar: 'bg-primary',
  hover: 'hover:border-primary/50 hover:shadow-primary/10',
};

function accentFor(moduleId: string): ModuleAccent {
  return MODULE_ACCENT[moduleId] ?? DEFAULT_ACCENT;
}

function ModuleCardIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? ICON_MAP.home;
  return <Icon className={cn('h-5 w-5 shrink-0', className)} />;
}

function orderStorageKey(userId?: string, tenantId?: string | null): string {
  return `metro-tile-order:${userId ?? 'anon'}:${tenantId || 'global'}`;
}

function readStoredOrder(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
}

/**
 * Launcher de modulos do Portal.
 *
 * Decisoes estruturais:
 * - Nao cria container de scroll proprio. O scroll pertence ao ContentShell.
 * - Nao usa posicionamento absoluto, fixo ou sticky. Tudo em fluxo normal.
 * - Nao virtualiza. O volume de modulos nao justifica e a virtualizacao
 *   exigia um scroller interno, que era a origem do duplo scroll.
 * - Todos os cards tem o mesmo tamanho. Nada de tile ocupando meia tela.
 */
export function ModuleCardGrid({
  modules,
  moduleStats = {},
  statsLoading = false,
  userId,
  tenantId,
}: ModuleCardGridProps) {
  const storageKey = orderStorageKey(userId, tenantId);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const orderedModules = useMemo(() => {
    const stored = readStoredOrder(storageKey);
    if (stored.length === 0) return modules;

    const rank = new Map(stored.map((id, index) => [id, index]));
    return [...modules].sort((a, b) => {
      const ra = rank.get(a.id);
      const rb = rank.get(b.id);
      if (ra !== undefined && rb !== undefined) return ra - rb;
      if (ra !== undefined) return -1;
      if (rb !== undefined) return 1;
      return 0;
    });
  }, [modules, storageKey]);

  useEffect(() => {
    if (orderedModules.length > 0 && readStoredOrder(storageKey).length === 0) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify(orderedModules.map((m) => m.id)),
        );
      } catch {
        // Ordem e preferencia local. Falha de persistencia nao bloqueia o launcher.
      }
    }
  }, [orderedModules, storageKey]);

  const persistOrder = useCallback(
    (next: ModuleDefinition[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next.map((m) => m.id)));
      } catch {
        // Idem: preferencia local.
      }
    },
    [storageKey],
  );

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!draggingId || draggingId === targetId) return;
      const next = [...orderedModules];
      const from = next.findIndex((m) => m.id === draggingId);
      const to = next.findIndex((m) => m.id === targetId);
      if (from === -1 || to === -1) return;
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      persistOrder(next);
    },
    [draggingId, orderedModules, persistOrder],
  );

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
      role="list"
      aria-label="Módulos do sistema"
    >
      {orderedModules.map((module) => {
        const accent = accentFor(module.id);
        const stat = moduleStats[module.id];
        const primary = statsLoading ? null : stat?.primaryMetric;
        const isDragging = draggingId === module.id;
        const isDragOver = overId === module.id && draggingId !== module.id;

        return (
          <NavLink
            key={module.id}
            to={module.route}
            role="listitem"
            draggable
            onDragStart={(event) => {
              setDraggingId(module.id);
              event.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setOverId(module.id);
            }}
            onDragLeave={() =>
              setOverId((current) => (current === module.id ? null : current))
            }
            onDrop={(event) => {
              event.preventDefault();
              handleDrop(module.id);
              setDraggingId(null);
              setOverId(null);
            }}
            onDragEnd={() => {
              setDraggingId(null);
              setOverId(null);
            }}
            aria-label={`Acessar módulo ${module.title}`}
            className={cn(
              'group border-border bg-card relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200',
              'focus-visible:ring-ring hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none',
              accent.hover,
              isDragging && 'opacity-50',
              isDragOver &&
                'border-primary ring-primary/40 scale-[1.01] ring-2',
            )}
          >
            <span
              className={cn('absolute inset-x-0 top-0 h-0.5', accent.bar)}
              aria-hidden="true"
            />

            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  accent.chip,
                )}
              >
                <ModuleCardIcon name={module.icon} className={accent.icon} />
              </span>
              {primary ? (
                <span className="text-foreground shrink-0 text-right">
                  <span className="block text-lg leading-tight font-semibold tabular-nums">
                    {primary.value}
                  </span>
                  <span className="text-muted-foreground block text-[11px] leading-tight">
                    {primary.label}
                  </span>
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-foreground truncate text-base font-semibold">
                {module.title}
              </h3>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-5">
                {module.description}
              </p>
            </div>

            <span
              className={cn(
                'text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
              )}
            >
              Acessar módulo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </NavLink>
        );
      })}
    </div>
  );
}
