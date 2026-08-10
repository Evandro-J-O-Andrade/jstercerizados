import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { HERO_ASSETS } from '@/content/assets';

const DURATION_MS = 8000;
const EXIT_MS = 600;

const easing = [0.25, 0.4, 0.25, 1] as const;

export function CinematicIntro({ onFinish }: { onFinish: () => void }) {
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
    if (shouldReduceMotion) {
      const t1 = setTimeout(() => setPhase('closing'), 300);
      const t2 = setTimeout(finish, 500);
      timers.current = [t1, t2];
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    const t1 = setTimeout(() => setPhase('holding'), 2000);
    const t2 = setTimeout(() => setPhase('closing'), 6000);
    const t3 = setTimeout(finish, DURATION_MS);
    timers.current = [t1, t2, t3];

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [shouldReduceMotion, finish]);

  const handleSkip = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPhase('closing');
    setTimeout(finish, EXIT_MS);
  }, [finish]);

  const imageVariants: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 0 },
        holding: { opacity: 1, transition: { duration: 0.1 } },
        closing: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: {
          opacity: 0,
          scale: 0.35,
          filter: 'blur(4px)',
        },
        holding: {
          opacity: 1,
          scale: [1, 1.0, 1.08, 1, 1.02, 1, 1.0],
          x: [0, 0, -2, 2, -1, 1, 0],
          y: [0, 0, 1, -1, 0.5, -0.5, 0],
          filter: 'blur(0px)',
          transition: {
            duration: 4,
            ease: 'easeInOut',
            times: [0, 0.4, 0.5, 0.58, 0.65, 0.9, 1],
            x: { duration: 0 },
            y: { duration: 0 },
            scale: { duration: 0 },
            filter: { duration: 0 },
          },
        },
        closing: {
          opacity: 0,
          scale: 1.05,
          filter: 'blur(0px)',
          transition: { duration: EXIT_MS / 1000, ease: easing },
        },
      };

  return (
    <motion.div
      key="mgm-intro"
      className="fixed inset-0 z-[90] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: easing } }}
    >
      <motion.div
        key="image"
        className="absolute inset-0 h-full w-full"
        variants={imageVariants}
        initial="entering"
        animate={
          phase === 'holding'
            ? 'holding'
            : phase === 'closing'
              ? 'closing'
              : 'entering'
        }
        exit="closing"
      >
        <SafeImage
          src={HERO_ASSETS.cardheros}
          alt="J&amp;S Terceirizados"
          className="h-full w-full object-cover"
          style={{ objectPosition: 'center 30%' }}
          decoding="async"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      {!shouldReduceMotion && (
        <motion.div
          key="roar-overlay"
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{
            opacity: [0.3, 0, 0, 0.15, 0, 0],
            scale: [1, 1, 1.05, 1.05, 1.1, 1.1],
            transition: {
              duration: 1,
              ease: 'easeInOut',
              delay: 0.5,
              times: [0, 0.5, 0.6, 0.65, 0.7, 1],
            },
          }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        />
      )}

      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-6 bottom-6 z-10 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur transition-colors hover:text-white"
      >
        Pular
      </button>

      <span className="sr-only">
        Abertura cinematográfica J&amp;S Terceirizados
      </span>
    </motion.div>
  );
}
