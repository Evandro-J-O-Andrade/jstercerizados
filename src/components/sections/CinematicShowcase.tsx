import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { HERO_ASSETS } from '@/content/assets';

const ENTER_MS = 2500;
const HOLD_MS = 5000;
const EXIT_MS = 2500;
const TOTAL_MS = ENTER_MS + HOLD_MS + EXIT_MS;

const easing = [0.25, 0.4, 0.25, 1] as const;

export function CinematicShowcase({ onFinish }: { onFinish: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<
    'black' | 'entering' | 'holding' | 'closing'
  >('black');
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

    const t1 = setTimeout(() => setPhase('entering'), 200);
    const t2 = setTimeout(() => setPhase('holding'), ENTER_MS + 200);
    const t3 = setTimeout(() => setPhase('closing'), ENTER_MS + 200 + HOLD_MS);
    const t4 = setTimeout(finish, TOTAL_MS + 400);
    timers.current = [t1, t2, t3, t4];

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [shouldReduceMotion, finish]);

  const handleSkip = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPhase('closing');
    setTimeout(finish, EXIT_MS);
  }, [finish]);

  const imageVariants: Variants = shouldReduceMotion
    ? {
        black: { opacity: 0 },
        entering: { opacity: 1, transition: { duration: 0.1 } },
        holding: { opacity: 1 },
        closing: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        black: { opacity: 0, scale: 1.2 },
        entering: {
          opacity: 1,
          scale: [1.1, 0.9, 1.02, 1],
          y: ['5%', '0%', '-1%', '0%'],
          rotate: [1, -0.5, 0.25, 0],
          transition: {
            duration: ENTER_MS / 1000,
            ease: easing,
            times: [0, 0.5, 0.8, 1],
          },
        },
        holding: {
          opacity: 1,
          scale: [1, 1.005, 1, 1.005, 1],
          y: [0, 0.5, 0, -0.5, 0],
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
          scale: 1.05,
          transition: {
            duration: EXIT_MS / 1000,
            ease: easing,
          },
        },
      };

  const currentVariant = shouldReduceMotion
    ? phase === 'black'
      ? 'entering'
      : phase
    : phase;

  const bgVariants: Variants = shouldReduceMotion
    ? {}
    : {
        black: { opacity: 1, transition: { duration: 0.5 } },
        entering: { opacity: 1 },
        holding: { opacity: 1 },
        closing: { opacity: 1 },
      };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black"
      initial="black"
      animate={currentVariant}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: easing } }}
    >
      <motion.div variants={bgVariants} className="absolute inset-0 bg-black" />

      <motion.div
        variants={imageVariants}
        className="cinematic-hero-image absolute inset-0 flex items-center justify-center"
      >
        <SafeImage
          src={HERO_ASSETS.cardheros}
          alt="J&amp;S Empregos LTDA"
          className="h-full w-full object-cover sm:max-h-[80vh] sm:max-w-[90vw]"
          loading="eager"
          decoding="async"
          skeleton={false}
        />
      </motion.div>

      {!shouldReduceMotion && phase === 'holding' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: easing }}
        />
      )}

      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-6 bottom-6 z-10 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition-colors hover:text-white"
      >
        Pular
      </button>

      <span className="sr-only">
        Abertura cinematográfica J&amp;S Empregos LTDA
      </span>
    </motion.div>
  );
}
