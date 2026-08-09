import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Type,
  Contrast,
  Accessibility,
  Eye,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

type AccessibilityState = {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  highlightLinks: boolean;
};

const STORAGE_KEY = 'js-accessibility-settings';

const DEFAULT_STATE: AccessibilityState = {
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  highlightLinks: false,
};

export function AccessibilityWidget({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const [settings, setSettings] = useState<AccessibilityState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  });

  const applySettings = useCallback((state: AccessibilityState) => {
    const root = document.documentElement;
    root.style.fontSize = `${state.fontSize}%`;
    root.classList.toggle('high-contrast', state.highContrast);
    root.classList.toggle('reduce-motion', state.reducedMotion);
    root.classList.toggle('highlight-links', state.highlightLinks);
  }, []);

  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings, applySettings]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && settings.reducedMotion === false) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  const toggle = (key: keyof AccessibilityState) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  };

  const reset = () => {
    setSettings(DEFAULT_STATE);
  };

  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-24 md:bottom-24">
      {isOpen && (
        <div className="bg-card border-border shadow-premium w-80 rounded-2xl border p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="text-primary h-5 w-5" />
              <h3 className="text-foreground text-lg font-semibold">
                Acessibilidade
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar painel de acessibilidade"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                <Type className="h-4 w-4" />
                Tamanho do texto
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      fontSize: Math.max(80, prev.fontSize - 10),
                    }))
                  }
                  aria-label="Diminuir fonte"
                >
                  A-
                </Button>
                <span className="text-foreground min-w-[3rem] text-center text-sm font-semibold">
                  {settings.fontSize}%
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      fontSize: Math.min(150, prev.fontSize + 10),
                    }))
                  }
                  aria-label="Aumentar fonte"
                >
                  A+
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                <Contrast className="h-4 w-4" />
                Alto contraste
              </span>
              <button
                type="button"
                onClick={() => toggle('highContrast')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.highContrast ? 'bg-primary' : 'bg-muted'
                }`}
                aria-pressed={settings.highContrast}
                aria-label="Alternar alto contraste"
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                <Eye className="h-4 w-4" />
                Destacar links
              </span>
              <button
                type="button"
                onClick={() => toggle('highlightLinks')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.highlightLinks ? 'bg-primary' : 'bg-muted'
                }`}
                aria-pressed={settings.highlightLinks}
                aria-label="Alternar destaque de links"
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.highlightLinks ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                {settings.reducedMotion ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Reduzir animações
              </span>
              <button
                type="button"
                onClick={() => toggle('reducedMotion')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-primary' : 'bg-muted'
                }`}
                aria-pressed={settings.reducedMotion}
                aria-label="Alternar redução de animações"
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
              className="mt-2 w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar padrão
            </Button>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="shadow-glow-lg h-12 w-12 rounded-full sm:h-14 sm:w-14"
        aria-label="Abrir painel de acessibilidade"
        aria-expanded={isOpen}
      >
        <Accessibility className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  );
}
