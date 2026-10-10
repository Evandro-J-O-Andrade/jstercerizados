'use client';

import { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { cn } from '@/utils';

interface AvaLauncherProps {
  tutorials: ReadonlyArray<{ id: string; title: string; slug: string }>;
  onTutorialClick: (slug: string) => void;
}

export function AvaLauncher({ tutorials, onTutorialClick }: AvaLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (tutorials.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-40">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg transition',
          isOpen && 'rounded-b-none',
        )}
        aria-label={isOpen ? 'Fechar central' : 'Abrir tutoriais'}
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden font-medium sm:inline">AVA</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="bg-popover fixed right-4 bottom-4 z-40 w-72 rounded-lg border p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-foreground font-semibold">Tutoriais r�pidos</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {tutorials.slice(0, 5).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onTutorialClick(t.slug);
                  setIsOpen(false);
                }}
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-start gap-2 rounded px-2 py-1.5 text-sm transition"
              >
                <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
