import { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { HERO_ASSETS } from '@/content/assets';

const SHOWCASE_KEY = 'js-showcase-dismissed';

const ENTER_MS = 500;
const HOLD_MS = 500;
const EXIT_MS = 500;

const easing = [0.25, 0.4, 0.25, 1] as const;

export function CinematicIntro({ onFinish }: { onFinish: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'entering' | 'holding' | 'exiting'>(
    'entering',
  );

  const finish = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SHOWCASE_KEY, '1');
    }
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const enterDelay = shouldReduceMotion ? 150 : ENTER_MS;
    const exitDelay = shouldReduceMotion ? 150 : EXIT_MS;
    const holdDelay = shouldReduceMotion ? 80 : HOLD_MS;

    const holdTimer = setTimeout(() => setPhase('holding'), enterDelay);
    const exitTimer = setTimeout(
      () => setPhase('exiting'),
      enterDelay + holdDelay,
    );
    const finishTimer = setTimeout(
      finish,
      enterDelay + holdDelay + exitDelay + 100,
    );

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [shouldReduceMotion, finish]);

  const handleSkip = useCallback(() => {
    sessionStorage.setItem(SHOWCASE_KEY, '1');
    setPhase('exiting');
    setTimeout(finish, shouldReduceMotion ? 150 : EXIT_MS);
  }, [shouldReduceMotion, finish]);

  const currentVariant =
    phase === 'holding'
      ? 'holding'
      : phase === 'exiting'
        ? 'exiting'
        : 'entering';

  const imageVariants: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 0 },
        holding: { opacity: 1, transition: { duration: 0.1 } },
        exiting: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: { opacity: 1, scale: 1.06, filter: 'blur(2px)' },
        holding: {
          opacity: 1,
          scale: [1.06, 1.04, 1, 1.02, 1],
          filter: 'blur(0px)',
          transition: {
            duration: HOLD_MS / 1000,
            ease: 'easeInOut',
            times: [0, 0.5, 0.75, 0.875, 1],
          },
        },
        exiting: {
          opacity: 0,
          scale: 1.02,
          transition: { duration: EXIT_MS / 1000, ease: easing },
        },
      };

  return (
    <motion.div
      key="cinematic"
      className="fixed inset-0 z-[70] overflow-hidden"
    >
      <motion.div
        key="image"
        className="absolute inset-0 h-full w-full"
        variants={imageVariants}
        initial="entering"
        animate={currentVariant}
      >
        <SafeImage
          src={HERO_ASSETS.cardheros}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: 'center 30%' }}
          decoding="async"
          loading="eager"
        />
      </motion.div>

      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-6 bottom-6 z-10 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur hover:text-white"
      >
        Pular
      </button>

      <span className="sr-only">
        Abertura cinematográfica J&amp;S Terceirizados
      </span>
    </motion.div>
  );
}
