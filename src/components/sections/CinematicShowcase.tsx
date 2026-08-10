import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { Pause, Play } from 'lucide-react';

export interface ShowcaseSlide {
  src: string;
  alt: string;
  objectPosition?: string;
}

interface CinematicShowcaseProps {
  slides: readonly ShowcaseSlide[];
  onFinish: () => void;
}

const SLIDE_DURATION = 2000;
const TRANSITION_MS = 600;
const EXIT_MS = 500;

const fadeInVariants = {
  initial: { opacity: 0, scale: 1.05 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1 },
  transition: { duration: TRANSITION_MS / 1000, ease: [0.25, 0.4, 0.25, 1] },
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export function CinematicShowcase({
  slides,
  onFinish,
}: CinematicShowcaseProps) {
  const shouldReduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      const t = setTimeout(finish, 300);
      return () => clearTimeout(t);
    }

    if (paused) return;

    if (current >= slides.length - 1) {
      const t = setTimeout(() => finish(), SLIDE_DURATION);
      timers.current = [t];
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setCurrent((c) => c + 1);
    }, SLIDE_DURATION);
    timers.current = [t];
    return () => clearTimeout(t);
  }, [current, paused, shouldReduceMotion, finish, slides.length]);

  const handleSkip = useCallback(() => {
    timers.current.forEach(clearTimeout);
    finish();
  }, [finish]);

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  const imageVariants = shouldReduceMotion
    ? reducedMotionVariants
    : fadeInVariants;

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: EXIT_MS / 1000 } }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`slide-${current}`}
          layout={shouldReduceMotion ? false : 'position'}
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 h-full w-full"
        >
          <SafeImage
            src={slides[current].src}
            alt={slides[current].alt}
            className="h-full w-full object-cover"
            style={{
              objectPosition: slides[current].objectPosition ?? 'center',
            }}
            loading={current === 0 ? 'eager' : 'lazy'}
            decoding="async"
            skeleton={false}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-6 bottom-6 z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePause}
          className="rounded-full border border-white/30 bg-black/20 p-2 text-white/70 backdrop-blur transition-colors hover:text-white"
          aria-label={paused ? 'Retomar' : 'Pausar'}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur transition-colors hover:text-white"
        >
          Pular
        </button>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      <span className="sr-only">
        Abertura cinematográfica J&amp;S Empregos LTDA
      </span>
    </motion.div>
  );
}
