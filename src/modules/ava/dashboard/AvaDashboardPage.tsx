'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, BookOpen } from 'lucide-react';
import { useAva } from '../context/AvaContext';
import {
  buildAvaModuleInfo,
  AVA_ICON_COMPONENTS,
} from '../services/ava-modules';
import type { AvaModuleInfo, Tutorial, AvaModule } from '../types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/fallback';
import { useToast } from '@/components/feedback/ToastContext';

export function AvaDashboardPage() {
  const {
    availableModules,
    tutorialsByModule,
    selectedModule,
    selectModule,
    searchQuery,
    setSearchQuery,
    filteredTutorials,
    isLoading,
    error,
    refresh,
  } = useAva();
  const { addToast } = useToast();
  const [moduleInfos, setModuleInfos] = useState<AvaModuleInfo[]>([]);
  const [activeModule, setActiveModule] = useState<AvaModule | null>(null);

  useEffect(() => {
    const infos = buildAvaModuleInfo(Object.values(tutorialsByModule).flat());
    setModuleInfos(infos);
    if (availableModules.length > 0 && !activeModule) {
      setActiveModule(selectedModule ?? availableModules[0]);
    }
  }, [availableModules, tutorialsByModule, selectedModule, activeModule]);

  const handleModuleClick = (module: AvaModule) => {
    setActiveModule(module);
    selectModule(module);
  };

  const getModuleIcon = (iconName: string) => {
    const Icon = AVA_ICON_COMPONENTS[iconName];
    return Icon ? (
      <Icon className="h-5 w-5" />
    ) : (
      <BookOpen className="h-5 w-5" />
    );
  };

  const handlePlayTutorial = (tutorial: Tutorial) => {
    addToast({ type: 'info', message: `Abrindo tutorial: ${tutorial.title}` });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse p-4">
              <div className="bg-muted mb-2 h-4 w-3/4 rounded" />
              <div className="bg-muted h-3 w-1/2 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const activeTutorials = selectedModule
    ? (tutorialsByModule[selectedModule]?.filter(
        (t) => t.status === 'published',
      ) ?? [])
    : [];
  const displayTutorials = searchQuery ? filteredTutorials : activeTutorials;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">
            AVA - Assistente Virtual de Aprendizado
          </h1>
          <p className="text-muted-foreground text-sm">
            Tutoriais em vídeo por módulo do sistema.
          </p>
        </div>
      </div>

      <div className="border-border bg-background flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar tutoriais..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {moduleInfos.map((mod) => (
          <Button
            key={mod.id}
            variant={activeModule === mod.id ? 'primary' : 'outline'}
            onClick={() => handleModuleClick(mod.id)}
            className="whitespace-nowrap"
          >
            {getModuleIcon(mod.icon)}
            <span className="ml-2">{mod.label}</span>
            {mod.tutorialCount > 0 && (
              <span className="bg-muted text-muted-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
                {mod.tutorialCount}
              </span>
            )}
          </Button>
        ))}
      </div>

      {displayTutorials.length === 0 ? (
        <EmptyState
          title={
            searchQuery
              ? 'Nenhum tutorial encontrado'
              : 'Nenhum tutorial neste módulo'
          }
          description={
            searchQuery
              ? 'Tente ajustar sua busca.'
              : 'Quando houver tutoriais publicados neste módulo, eles aparecerão aqui.'
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayTutorials.map((tutorial) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                    {tutorial.videoKind === 'short'
                      ? 'Curto'
                      : tutorial.videoKind === 'quicktip'
                        ? 'Dica rápida'
                        : 'Completo'}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {tutorial.videoDurationSeconds
                      ? `${Math.floor(tutorial.videoDurationSeconds / 60)}min`
                      : '—'}
                  </span>
                </div>
                <h3 className="text-foreground mb-2 line-clamp-2 text-sm font-semibold">
                  {tutorial.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2 text-xs">
                  {tutorial.summary}
                </p>
                <div className="mb-4 flex flex-wrap gap-1">
                  {tutorial.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {tutorial.tags.length > 3 && (
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                      +{tutorial.tags.length - 3}
                    </span>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => handlePlayTutorial(tutorial)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Assistir
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
