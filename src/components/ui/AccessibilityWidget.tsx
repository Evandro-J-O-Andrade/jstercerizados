import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  X,
  Type,
  Contrast,
  Accessibility,
  Eye,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  PauseCircle,
  StopCircle,
  MessageCircle,
  Phone,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { COMPANY, getWhatsAppUrl, WHATSAPP_MESSAGES } from '@/config';

type AccessibilityState = {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  highlightLinks: boolean;
  increasedSpacing: boolean;
  focusMode: boolean;
};

type TTSState = {
  speaking: boolean;
  paused: boolean;
  voice: SpeechSynthesisVoice | null;
  rate: number;
};

const STORAGE_KEY = 'js-accessibility-settings';

const DEFAULT_STATE: AccessibilityState = {
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  highlightLinks: false,
  increasedSpacing: false,
  focusMode: false,
};

const DEFAULT_TTS: TTSState = {
  speaking: false,
  paused: false,
  voice: null,
  rate: 1,
};

export function AccessibilityWidget({
  open,
  onOpenChange,
  onOpenChat,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChat?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const [settings, setSettings] = useState<AccessibilityState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE;
    } catch {
      return DEFAULT_STATE;
    }
  });

  const [tts, setTTS] = useState<TTSState>(DEFAULT_TTS);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const applySettings = useCallback((state: AccessibilityState) => {
    const root = document.documentElement;
    root.style.fontSize = `${state.fontSize}%`;
    root.classList.toggle('high-contrast', state.highContrast);
    root.classList.toggle('reduce-motion', state.reducedMotion);
    root.classList.toggle('highlight-links', state.highlightLinks);
    root.classList.toggle('increased-spacing', state.increasedSpacing);
    root.classList.toggle('focus-mode', state.focusMode);
  }, []);

  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings, applySettings]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  const stopTTS = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTTS(DEFAULT_TTS);
    utteranceRef.current = null;
  }, []);

  const closePanel = useCallback(() => {
    // Fechar o painel não interrompe uma leitura já iniciada.
    setIsOpen(false);
  }, [setIsOpen]);

  const reset = () => {
    setSettings(DEFAULT_STATE);
    stopTTS();
  };

  const toggle = (key: keyof AccessibilityState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const speakPage = useCallback(() => {
    stopTTS();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const content = document.querySelector('main') ?? document.body;
    const elements = content.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, li, a, button',
    );
    const textParts: string[] = [];

    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (!text) return;

      const style = window.getComputedStyle(el);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0' ||
        el.closest('[aria-hidden="true"]')
      ) {
        return;
      }

      textParts.push(text);
    });

    const text = textParts.join('. ');
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = tts.rate;
    if (tts.voice) utterance.voice = tts.voice;

    utterance.onend = () => {
      setTTS(DEFAULT_TTS);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setTTS(DEFAULT_TTS);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setTTS((prev) => ({ ...prev, speaking: true, paused: false }));
  }, [stopTTS, tts.rate, tts.voice]);

  const togglePauseTTS = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (tts.paused) {
      window.speechSynthesis.resume();
      setTTS((prev) => ({ ...prev, paused: false, speaking: true }));
    } else if (tts.speaking) {
      window.speechSynthesis.pause();
      setTTS((prev) => ({ ...prev, paused: true }));
    }
  }, [tts.paused, tts.speaking]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closePanel, isOpen]);

  useEffect(() => {
    return () => stopTTS();
  }, [stopTTS]);

  const accessibilityPanelRef = useFocusTrap(isOpen);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(WHATSAPP_MESSAGES.whatsappButton);
    window.open(getWhatsAppUrl(COMPANY.whatsapp, message), '_blank');
  };

  return (
    <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom)-10px)] left-4 z-50 sm:bottom-16 sm:left-6">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overlay-backdrop fixed inset-0 z-40"
              onClick={closePanel}
              aria-hidden="true"
            />
            <div
              id="accessibility-panel"
              ref={accessibilityPanelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
              className="overlay-panel relative z-50 max-h-[calc(100vh-6rem)] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl p-5 shadow-xl sm:max-h-[calc(100vh-4rem)] sm:w-96"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Accessibility className="text-primary h-5 w-5" />
                  <h3
                    id="accessibility-title"
                    className="text-foreground text-lg font-semibold"
                  >
                    Acessibilidade
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Fechar painel de acessibilidade"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <Volume2 className="h-4 w-4" />
                    Ler página
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={speakPage}
                      disabled={tts.speaking}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Ler
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={togglePauseTTS}
                      disabled={!tts.speaking}
                      className="flex-1"
                    >
                      {tts.paused ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <PauseCircle className="mr-2 h-4 w-4" />
                          Pausar
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={stopTTS}
                      disabled={!tts.speaking}
                      aria-label="Parar leitura"
                    >
                      <StopCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-muted-foreground mb-1 block text-xs">
                        Voz
                      </label>
                      <select
                        value={tts.voice?.name || ''}
                        onChange={(event) => {
                          const selected =
                            voices.find(
                              (voice) => voice.name === event.target.value,
                            ) ?? null;
                          setTTS((prev) => ({ ...prev, voice: selected }));
                        }}
                        className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-2 py-1.5 text-xs outline-none focus:ring-2"
                      >
                        <option value="">Selecionar voz</option>
                        {voices.map((voice) => (
                          <option
                            key={`${voice.name}-${voice.lang}`}
                            value={voice.name}
                          >
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                        <span>Velocidade</span>
                        <span className="font-medium">
                          {tts.rate.toFixed(1)}x
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={tts.rate}
                        onChange={(event) =>
                          setTTS((prev) => ({
                            ...prev,
                            rate: Number(event.target.value),
                          }))
                        }
                        className="w-full"
                        aria-label="Velocidade da leitura"
                      />
                    </div>
                  </div>

                  {tts.speaking && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      A leitura continua mesmo se você fechar este painel. Use
                      “Parar” para interrompê-la.
                    </p>
                  )}
                </div>

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

                {[
                  {
                    key: 'highContrast' as const,
                    icon: <Contrast className="h-4 w-4" />,
                    label: 'Alto contraste',
                  },
                  {
                    key: 'highlightLinks' as const,
                    icon: <Eye className="h-4 w-4" />,
                    label: 'Destacar links',
                  },
                  {
                    key: 'reducedMotion' as const,
                    icon: settings.reducedMotion ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    ),
                    label: 'Reduzir animações',
                  },
                  {
                    key: 'increasedSpacing' as const,
                    icon: <Type className="h-4 w-4" />,
                    label: 'Espaçamento de texto',
                  },
                  {
                    key: 'focusMode' as const,
                    icon: <Eye className="h-4 w-4" />,
                    label: 'Modo foco',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                      {item.icon}
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[item.key] ? 'bg-primary' : 'bg-muted'
                      }`}
                      aria-pressed={settings[item.key]}
                      aria-label={`Alternar ${item.label.toLowerCase()}`}
                    >
                      <span
                        className={`bg-background inline-block h-4 w-4 rounded-full transition-transform ${
                          settings[item.key]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <div className="border-border border-t pt-4">
                  <p className="text-foreground mb-3 flex items-center gap-2 text-sm font-medium">
                    <MessageCircle className="h-4 w-4" />
                    Atendimento
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleWhatsApp}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        closePanel();
                        onOpenChat?.();
                      }}
                    >
                      <Bot className="mr-2 h-4 w-4" />
                      Chat Online
                    </Button>
                  </div>
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
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="shadow-glow-lg bg-primary text-primary-foreground relative z-50 flex items-center gap-2 rounded-full px-4 py-3 transition-colors sm:h-12 sm:w-12 sm:justify-center sm:px-0"
        aria-label={
          isOpen
            ? 'Fechar painel de acessibilidade'
            : 'Abrir painel de acessibilidade'
        }
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
