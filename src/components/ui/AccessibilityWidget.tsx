import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import {
  Accessibility,
  Plus,
  Minus,
  RotateCcw,
  X,
  Play,
  Pause,
  Square,
  Phone,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { COMPANY, getWhatsAppUrl, WHATSAPP_MESSAGES } from '@/config';

const FONT_SIZES = [100, 110, 120, 130, 140];

type AccessibilityState = {
  fontSizeIndex: number;
  highContrast: boolean;
  highlightLinks: boolean;
  increasedSpacing: boolean;
  reduceAnimations: boolean;
  focusMode: boolean;
  grayscale: boolean;
};

const INITIAL_STATE: AccessibilityState = {
  fontSizeIndex: 1,
  highContrast: false,
  highlightLinks: false,
  increasedSpacing: false,
  reduceAnimations: false,
  focusMode: false,
  grayscale: false,
};

export function AccessibilityWidget({
  open: externalOpen,
  onOpenChange,
  onOpenChat,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChat?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [state, setState] = useState<AccessibilityState>(INITIAL_STATE);
  const [tts, setTts] = useState({ speaking: false, paused: false });
  const panelRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${FONT_SIZES[state.fontSizeIndex]}%`;

    root.classList.toggle('high-contrast', state.highContrast);
    root.classList.toggle('highlight-links', state.highlightLinks);
    root.classList.toggle('increased-spacing', state.increasedSpacing);
    root.classList.toggle('reduce-animations', state.reduceAnimations);
    root.classList.toggle('focus-mode', state.focusMode);
    root.classList.toggle('grayscale', state.grayscale);

    return () => {
      root.style.fontSize = '';
      root.classList.remove(
        'high-contrast',
        'highlight-links',
        'increased-spacing',
        'reduce-animations',
        'focus-mode',
        'grayscale',
      );
    };
  }, [state]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) return;

    const focusableElements = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement | undefined;
    const lastElement = focusableElements[focusableElements.length - 1] as
      HTMLElement | undefined;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!focusableElements.length) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  const resetAll = useCallback(() => {
    setState(INITIAL_STATE);
    stopTts();
  }, []);

  const stopTts = useCallback(() => {
    window.speechSynthesis.cancel();
    setTts({ speaking: false, paused: false });
    utteranceRef.current = null;
  }, []);

  const toggleTts = useCallback(() => {
    if (tts.speaking && !tts.paused) {
      window.speechSynthesis.pause();
      setTts((prev) => ({ ...prev, paused: true }));
      return;
    }
    if (tts.paused) {
      window.speechSynthesis.resume();
      setTts((prev) => ({ ...prev, paused: false }));
      return;
    }
    stopTts();
    const root = document.documentElement;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.hasAttribute('aria-hidden')) return NodeFilter.FILTER_REJECT;
        const style = parent.getAttribute('style') || '';
        if (style.includes('display:none') || style.includes('display: none'))
          return NodeFilter.FILTER_REJECT;
        if (getComputedStyle(parent).display === 'none')
          return NodeFilter.FILTER_REJECT;
        if (getComputedStyle(parent).visibility === 'hidden')
          return NodeFilter.FILTER_REJECT;
        const rawText = node.nodeValue?.trim();
        if (!rawText) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const parts: string[] = [];
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      parts.push(node.nodeValue?.trim() || '');
    }
    const text = parts.join('. ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utteranceRef.current = utterance;
    utterance.onend = () => setTts({ speaking: false, paused: false });
    utterance.onerror = () => setTts({ speaking: false, paused: false });
    window.speechSynthesis.speak(utterance);
    setTts({ speaking: true, paused: false });
  }, [tts.speaking, tts.paused, stopTts]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  }, []);

  return (
    <div className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] left-4 z-50 sm:bottom-[calc(9rem+env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={handleBackdropClick}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 mb-3 w-80 max-w-[calc(100vw-2rem)] sm:left-0"
            >
              <div
                ref={panelRef}
                className="bg-background border-border flex max-h-[70vh] w-80 flex-col overflow-hidden rounded-2xl border shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label="Painel de acessibilidade"
              >
                <div className="border-border/50 flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Accessibility className="text-primary h-5 w-5" />
                    <h3 className="text-foreground text-sm font-semibold">
                      Acessibilidade
                    </h3>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
                    aria-label="Fechar acessibilidade"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  <div className="space-y-3">
                    <h4 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                      Visual
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        Tamanho da fonte
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              fontSizeIndex: Math.max(
                                prev.fontSizeIndex - 1,
                                0,
                              ),
                            }))
                          }
                          disabled={state.fontSizeIndex === 0}
                          aria-label="Diminuir fonte"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-foreground w-10 text-center text-xs font-medium">
                          {FONT_SIZES[state.fontSizeIndex]}%
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              fontSizeIndex: Math.min(
                                prev.fontSizeIndex + 1,
                                FONT_SIZES.length - 1,
                              ),
                            }))
                          }
                          disabled={
                            state.fontSizeIndex === FONT_SIZES.length - 1
                          }
                          aria-label="Aumentar fonte"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <ToggleRow
                      label="Alto contraste"
                      checked={state.highContrast}
                      onChange={(checked) =>
                        setState((prev) => ({ ...prev, highContrast: checked }))
                      }
                    />
                    <ToggleRow
                      label="Destacar links"
                      checked={state.highlightLinks}
                      onChange={(checked) =>
                        setState((prev) => ({
                          ...prev,
                          highlightLinks: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      label="Espaçamento aumentado"
                      checked={state.increasedSpacing}
                      onChange={(checked) =>
                        setState((prev) => ({
                          ...prev,
                          increasedSpacing: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      label="Reduzir animações"
                      checked={state.reduceAnimations}
                      onChange={(checked) =>
                        setState((prev) => ({
                          ...prev,
                          reduceAnimations: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      label="Modo foco"
                      checked={state.focusMode}
                      onChange={(checked) =>
                        setState((prev) => ({ ...prev, focusMode: checked }))
                      }
                    />
                    <ToggleRow
                      label="Escala de cinza"
                      checked={state.grayscale}
                      onChange={(checked) =>
                        setState((prev) => ({ ...prev, grayscale: checked }))
                      }
                    />
                  </div>

                  <div className="border-border/50 border-t pt-3">
                    <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                      Leitura em voz alta
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={toggleTts}
                        disabled={tts.paused}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Ler página
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.speechSynthesis.pause();
                          setTts((prev) => ({ ...prev, paused: true }));
                        }}
                        disabled={!tts.speaking || tts.paused}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stopTts}
                        disabled={!tts.speaking}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-border/50 border-t pt-3">
                    <h4 className="text-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                      Atendimento
                    </h4>
                    <div className="space-y-2">
                      <a
                        href={getWhatsAppUrl(
                          COMPANY.whatsapp,
                          WHATSAPP_MESSAGES.whatsappButton,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary/10 hover:bg-primary/20 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                      >
                        <Phone className="text-primary h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-foreground text-xs font-medium">
                            WhatsApp
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Fale com a J&S
                          </p>
                        </div>
                        <ChevronRight className="text-muted-foreground h-4 w-4" />
                      </a>
                      <button
                        onClick={() => {
                          setOpen(false);
                          onOpenChat?.();
                        }}
                        className="bg-primary/10 hover:bg-primary/20 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                      >
                        <MessageCircle className="text-primary h-4 w-4" />
                        <div className="flex-1 text-left">
                          <p className="text-foreground text-xs font-medium">
                            Chat Online
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Atendimento humano
                          </p>
                        </div>
                        <ChevronRight className="text-muted-foreground h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={resetAll}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restaurar padrão
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Button
        variant="primary"
        size="icon"
        className="shadow-glow-lg h-12 w-12 rounded-full"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fechar acessibilidade' : 'Abrir acessibilidade'}
        aria-expanded={open}
        aria-controls="accessibility-panel"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <Accessibility className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted',
        )}
        aria-label={`Alternar ${label}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            'bg-background absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
    </div>
  );
}
