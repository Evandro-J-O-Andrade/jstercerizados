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
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  });

  const [tts, setTTS] = useState<TTSState>(DEFAULT_TTS);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

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
    stopTTS();
  };

  const getVoices = (): SpeechSynthesisVoice[] => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  };

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const updateVoices = () => setVoices(getVoices());
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const stopTTS = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTTS(DEFAULT_TTS);
    utteranceRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopTTS();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen, stopTTS]);

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

  const speakPage = useCallback(() => {
    stopTTS();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const root = document.documentElement;
    const content = root.querySelector('main') || root;
    const elements = content.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, li, a, button',
    );
    const textParts: string[] = [];
    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (!text || text.length === 0) return;
      const style = window.getComputedStyle(el);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
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
    if (tts.voice) {
      utterance.voice = tts.voice;
    }

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
  }, [tts.rate, tts.voice, stopTTS]);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = voices.find((v) => v.name === e.target.value) || null;
    setTTS((prev) => ({ ...prev, voice: selected }));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = Number(e.target.value);
    setTTS((prev) => ({ ...prev, rate }));
  };

  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, [stopTTS]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(WHATSAPP_MESSAGES.whatsappButton);
    window.open(getWhatsAppUrl(COMPANY.whatsapp, message), '_blank');
  };

  const accessibilityPanelRef = useFocusTrap(isOpen);

  return (
    <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom)+10px)] left-4 z-50 sm:bottom-16 sm:left-6">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overlay-backdrop fixed inset-0 z-40"
              onClick={() => {
                stopTTS();
                setIsOpen(false);
              }}
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
                  onClick={() => {
                    stopTTS();
                    setIsOpen(false);
                  }}
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
                        onChange={handleVoiceChange}
                        className="border-input bg-surface text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-2 py-1.5 text-xs outline-none focus:ring-2"
                      >
                        <option value="">Selecionar voz</option>
                        {voices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
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
                        onChange={handleRateChange}
                        className="w-full"
                      />
                    </div>
                  </div>
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
                      className={`bg-background inline-block h-4 w-4 rounded-full transition-transform ${
                        settings.highContrast
                          ? 'translate-x-6'
                          : 'translate-x-1'
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
                      className={`bg-background inline-block h-4 w-4 rounded-full transition-transform ${
                        settings.highlightLinks
                          ? 'translate-x-6'
                          : 'translate-x-1'
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
                      className={`bg-background inline-block h-4 w-4 rounded-full transition-transform ${
                        settings.reducedMotion
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                    <Type className="h-4 w-4" />
                    Espaçamento de texto
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle('increasedSpacing')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.increasedSpacing ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-pressed={settings.increasedSpacing}
                    aria-label="Alternar espaçamento de texto"
                  >
                    <span
                      className={`bg-background inline-block h-4 w-4 rounded-full transition-transform ${
                        settings.increasedSpacing
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    Modo foco
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle('focusMode')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.focusMode ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-pressed={settings.focusMode}
                    aria-label="Alternar modo foco"
                  >
                    <span
                      className={`bg-background inline-block h-4 w-4 rounded-full transition-transform ${
                        settings.focusMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

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
                      className="justify-center"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenChat?.();
                      }}
                      className="justify-center"
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
        onClick={() => {
          stopTTS();
          setIsOpen(!isOpen);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="shadow-glow-lg bg-primary text-primary-foreground flex items-center gap-2 rounded-full px-4 py-3 transition-colors sm:h-12 sm:w-12 sm:justify-center sm:px-0"
        aria-label="Abrir painel de acessibilidade"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
