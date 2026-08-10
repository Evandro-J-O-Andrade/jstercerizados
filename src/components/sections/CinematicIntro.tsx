import { useState, useEffect, useCallback, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { HERO_ASSETS } from '@/content/assets';
import { HERO_SLIDES } from '@/content/homeHero';

const INTRO_KEY = 'js-home-intro-dismissed';
const IMAGE_ENTER_MS = 600;
const TEXT_SLIDE_MS = 800;
const EXIT_MS = 500;

const easing = [0.25, 0.4, 0.25, 1] as const;

const rhSlide = HERO_SLIDES[0];

export function CinematicIntro({ onFinish }: { onFinish: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'entering' | 'revealing' | 'closing'>(
    'entering',
  );
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, '1');
    clearTimers();
    onFinish();
  }, [onFinish, clearTimers]);

  useEffect(() => {
    if (shouldReduceMotion) {
      const t1 = setTimeout(() => setPhase('revealing'), 100);
      const t2 = setTimeout(finish, 500);
      timers.current = [t1, t2];
      return;
    }

    const t1 = setTimeout(() => setPhase('revealing'), IMAGE_ENTER_MS);
    const t2 = setTimeout(
      () => setPhase('closing'),
      IMAGE_ENTER_MS + TEXT_SLIDE_MS,
    );
    const t3 = setTimeout(finish, IMAGE_ENTER_MS + TEXT_SLIDE_MS + EXIT_MS);
    timers.current = [t1, t2, t3];

    return clearTimers;
  }, [shouldReduceMotion, finish, clearTimers]);

  const handleSkip = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, '1');
    setPhase('closing');
    setTimeout(finish, EXIT_MS);
  }, [finish]);

  const imageVariants: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 0 },
        revealing: { opacity: 1, transition: { duration: 0.1 } },
        closing: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: { opacity: 1, scale: 1.06, filter: 'blur(2px)' },
        revealing: {
          opacity: 1,
          scale: [1.06, 1.03, 1, 1.02, 1],
          filter: 'blur(0px)',
          transition: {
            scale: {
              duration: TEXT_SLIDE_MS / 1000,
              ease: 'easeInOut',
              times: [0, 0.4, 0.6, 0.8, 1],
            },
            opacity: { duration: 0 },
          },
        },
        closing: {
          opacity: 0,
          scale: 1.02,
          filter: 'blur(0px)',
          transition: { duration: EXIT_MS / 1000, ease: easing },
        },
      };

  const overlayVariants: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 0 },
        revealing: { opacity: 1, transition: { duration: 0.1 } },
        closing: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: { opacity: 0 },
        revealing: { opacity: 1, transition: { duration: 0.5, ease: easing } },
        closing: { opacity: 0, transition: { duration: 0.4, ease: easing } },
      };

  const contentVariants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        hidden: { opacity: 0, x: -32 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: easing },
        },
        exit: {
          opacity: 0,
          x: 20,
          transition: { duration: 0.4, ease: easing },
        },
      };

  const descVariants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        hidden: { opacity: 0, x: 50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: easing, delay: 0.3 },
        },
        exit: {
          opacity: 0,
          x: 30,
          transition: { duration: 0.4, ease: easing },
        },
      };

  const ctaVariants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: easing, delay: 0.6 },
        },
        exit: {
          opacity: 0,
          y: 10,
          transition: { duration: 0.3, ease: easing },
        },
      };

  const contentVisible = phase !== 'entering';
  const contentState = phase === 'closing' ? 'exit' : 'visible';

  return (
    <motion.div
      key="intro"
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence>
        {phase !== 'closing' && (
          <motion.div
            key="image-wrapper"
            className="absolute inset-0"
            variants={imageVariants}
            initial="entering"
            animate={phase === 'revealing' ? 'revealing' : 'entering'}
            exit="closing"
          >
            <SafeImage
              src={HERO_ASSETS.cardheros}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: 'center 30%' }}
              decoding="async"
              loading="eager"
            />
            <motion.div
              className="absolute inset-0 bg-black/30"
              variants={overlayVariants}
              initial="entering"
              animate={phase === 'revealing' ? 'revealing' : 'entering'}
              exit="closing"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contentVisible && (
          <motion.div
            key="content"
            className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: easing },
            }}
            exit={{
              opacity: 0,
              y: -12,
              transition: { duration: 0.3, ease: easing },
            }}
          >
            <motion.h1
              key="title"
              className="mb-4 text-3xl font-bold drop-shadow-lg sm:text-4xl md:text-5xl"
              variants={contentVariants}
              initial="hidden"
              animate={contentState}
              exit="exit"
            >
              {rhSlide.title}
            </motion.h1>

            <motion.p
              key="desc"
              className="mb-8 max-w-2xl text-base opacity-90 drop-shadow-md sm:text-lg"
              variants={descVariants}
              initial="hidden"
              animate={contentState}
              exit="exit"
            >
              {rhSlide.description}
            </motion.p>

            <motion.div
              key="cta"
              className="flex flex-col gap-3 sm:flex-row sm:justify-center"
              variants={ctaVariants}
              initial="hidden"
              animate={contentState}
              exit="exit"
            >
              <button
                type="button"
                onClick={handleSkip}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[18px] border border-white/20 px-8 py-4 text-base font-semibold shadow-lg transition-colors"
              >
                {rhSlide.primaryCta.label}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="border-border/30 text-foreground hover:bg-muted rounded-[18px] border px-8 py-4 text-base font-semibold backdrop-blur"
              >
                {rhSlide.secondaryCta.label}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
