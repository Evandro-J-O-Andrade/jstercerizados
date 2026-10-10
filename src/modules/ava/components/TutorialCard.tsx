'use client';

import { Play, Clock, Tag } from 'lucide-react';
import { cn } from '@/utils';

interface TutorialCardProps {
  tutorial: {
    id: string;
    title: string;
    summary: string;
    videoDurationSeconds?: number | null;
    videoKind?: string;
    tags: string[];
    slug: string;
  };
  onClick: () => void;
}

export function TutorialCard({ tutorial, onClick }: TutorialCardProps) {
  const durationLabel = tutorial.videoDurationSeconds
    ? `${Math.round(tutorial.videoDurationSeconds / 60)} min`
    : null;

  const kindLabel =
    tutorial.videoKind === 'short'
      ? 'Curto'
      : tutorial.videoKind === 'quicktip'
        ? 'Dica r�pida'
        : 'Completo';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-card hover:border-primary/50 flex flex-col gap-3 rounded-lg border p-4 text-left transition hover:shadow-md',
        'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium',
            tutorial.videoKind === 'short' && 'bg-blue/10 text-blue',
            tutorial.videoKind === 'quicktip' && 'bg-amber/10 text-amber',
          )}
        >
          {kindLabel}
        </span>
        {durationLabel && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {durationLabel}
          </span>
        )}
      </div>

      <h3 className="text-foreground line-clamp-2 text-sm font-semibold">
        {tutorial.title}
      </h3>
      <p className="text-muted-foreground line-clamp-2 text-xs">
        {tutorial.summary}
      </p>

      <div className="flex flex-wrap gap-1">
        {tutorial.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className={cn(
              'bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs',
            )}
          >
            <Tag className="mr-1 h-3 w-3" />
            {tag}
          </span>
        ))}
        {tutorial.tags.length > 3 && (
          <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
            +{tutorial.tags.length - 3}
          </span>
        )}
      </div>

      <div className="mt-auto pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn(
            'bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
          )}
        >
          <Play className="h-4 w-4" />
          Assistir
        </button>
      </div>
    </button>
  );
}
