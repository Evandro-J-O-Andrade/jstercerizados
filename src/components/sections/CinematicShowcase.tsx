import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { HERO_ASSETS } from '@/content/assets';

const ENTER_MS = 2500;
const HOLD_MS = 10000;
const EXIT_MS = 2500;

const easing = [0.25, 0.4, 0.25, 1] as const;

export function CinematicShowcase({ onFinish }: { onFinish: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'entering' | 'holding' | 'closing'>(
    'entering',
  );
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
      const t = setTimeout(finish, 500);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase('holding'), ENTER_MS);
    const t2 = setTimeout(() => setPhase('closing'), ENTER_MS + HOLD_MS);
    const t3 = setTimeout(finish, ENTER_MS + HOLD_MS + EXIT_MS);
    timers.current = [t1, t2, t3];

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [shouldReduceMotion, finish]);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_ASSETS.cardheros;
    img.onload = () => setImageLoaded(true);
  }, []);

  const handleSkip = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPhase('closing');
    setTimeout(finish, EXIT_MS);
  }, [finish]);

  const imageVariants: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 1, transition: { duration: 0.1 } },
        holding: { opacity: 1 },
        closing: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: {
          opacity: 1,
          scale: [1.01, 0.99, 1.005, 1],
          y: ['1%', '0%', '-0.3%', '0%'],
          rotate: [0.3, -0.15, 0.05, 0],
          transition: {
            duration: ENTER_MS / 1000,
            ease: easing,
            times: [0, 0.5, 0.8, 1],
          },
        },
        holding: {
          opacity: 1,
          scale: [1, 1.001, 1, 1.001, 1],
          y: [0, 0.2, 0, -0.2, 0],
          transition: {
            duration: HOLD_MS / 1000,
            ease: 'easeInOut',
            times: [0, 0.2, 0.4, 0.6, 1],
            repeat: Infinity,
            repeatType: 'mirror',
          },
        },
        closing: {
          opacity: 0,
          scale: 1.01,
          transition: {
            duration: EXIT_MS / 1000,
            ease: easing,
          },
        },
      };

  const currentVariant = shouldReduceMotion ? phase : phase;

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-center justify-center overflow-hidden bg-black"
      initial="entering"
      animate={currentVariant}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: easing } }}
    >
      <motion.div
        variants={imageVariants}
        className="cinematic-hero-image absolute inset-0 flex items-center justify-center"
      >
        <img
          src={HERO_ASSETS.cardheros}
          alt="J&amp;S Empregos LTDA"
          loading="eager"
          decoding="sync"
          onLoad={() => setImageLoaded(true)}
          className="h-full w-full object-contain"
          style={{ objectPosition: 'center 30%' }}
        />
      </motion.div>

      {!imageLoaded && (
        <div className="bg-surface-alt absolute inset-0 flex items-center justify-center">
          <div className="bg-muted h-16 w-16 animate-pulse rounded-full" />
        </div>
      )}

      {!shouldReduceMotion && phase === 'holding' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easing }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={
          phase === 'holding' ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
        }
        transition={{ duration: 0.8, ease: easing }}
        className="absolute top-8 right-0 left-0 z-10 text-center"
      >
        <h1 className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">
          J&amp;S Empregos
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={
          phase === 'holding' ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
        }
        transition={{ duration: 0.8, ease: easing }}
        className="absolute right-0 bottom-20 left-0 z-10 text-center"
      >
        <p className="text-xl text-white/90 drop-shadow-md sm:text-2xl">
          Gestão em Recursos Humanos
        </p>
      </motion.div>

      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-6 bottom-6 z-20 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition-colors hover:text-white"
      >
        Pular
      </button>

      <span className="sr-only">
        Abertura cinematográfica J&amp;S Empregos LTDA
      </span>
    </motion.div>
  );
}
