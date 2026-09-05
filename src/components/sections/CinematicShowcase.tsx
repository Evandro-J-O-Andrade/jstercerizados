import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { HERO_ASSETS } from '@/content/assets';
import {
  CINEMATIC_TIMING,
  CINEMATIC_EASING,
  CINEMATIC_TEXT_TIMING,
} from '@/components/sections/cinematic-timing';

const easing = CINEMATIC_EASING;

export function CinematicShowcase({ onFinish }: { onFinish: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'entering' | 'holding' | 'closing'>(
    'entering',
  );
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 767px)').matches;
    }
    return false;
  });

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_ASSETS.cardheros;
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const checkMobile = () => setIsMobile(mq.matches);
    checkMobile();
    mq.addEventListener('change', checkMobile);
    return () => mq.removeEventListener('change', checkMobile);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      const t = setTimeout(finish, 500);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase('entering'), 100);
    const t2 = setTimeout(
      () => setPhase('holding'),
      CINEMATIC_TIMING.ENTER_MS + 100,
    );
    const t3 = setTimeout(
      () => setPhase('closing'),
      CINEMATIC_TIMING.ENTER_MS + CINEMATIC_TIMING.HOLD_MS + 100,
    );
    const t4 = setTimeout(
      finish,
      CINEMATIC_TIMING.ENTER_MS +
        CINEMATIC_TIMING.HOLD_MS +
        CINEMATIC_TIMING.EXIT_MS +
        100,
    );
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
    setTimeout(finish, CINEMATIC_TIMING.EXIT_MS);
  }, [finish]);

  const imageVariants: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 1, transition: { duration: 0.1 } },
        holding: { opacity: 1 },
        closing: { opacity: 0, transition: { duration: 0.1 } },
      }
    : isMobile
      ? {
          entering: {
            opacity: 1,
            scale: [1.02, 0.985, 1.01, 1],
            y: ['3%', '0%', '-1%', '0%'],
            transition: {
              duration: CINEMATIC_TIMING.ENTER_MS / 1000,
              ease: easing,
              times: [0, 0.4, 0.75, 1],
            },
          },
          holding: {
            opacity: 1,
            scale: [1, 1.004, 1],
            y: [0, 0.3, 0],
            x: [0, 0.5, 0],
            transition: {
              duration: CINEMATIC_TIMING.HOLD_MS / 1000,
              ease: 'easeInOut',
              times: [0, 0.5, 1],
              repeat: Infinity,
              repeatType: 'mirror',
            },
          },
          closing: {
            opacity: 0,
            scale: 1.015,
            transition: {
              duration: CINEMATIC_TIMING.EXIT_MS / 1000,
              ease: easing,
            },
          },
        }
      : {
          entering: {
            opacity: 1,
            scale: [1.03, 0.98, 1.012, 1],
            y: ['3%', '0%', '-1%', '0%'],
            rotate: [0.6, -0.35, 0.18, 0],
            transition: {
              duration: CINEMATIC_TIMING.ENTER_MS / 1000,
              ease: easing,
              times: [0, 0.4, 0.75, 1],
            },
          },
          holding: {
            opacity: 1,
            scale: [1, 1.004, 1, 1.004, 1],
            y: [0, 0.5, 0, -0.5, 0],
            x: [0, 0.8, 0, -0.8, 0],
            transition: {
              duration: CINEMATIC_TIMING.HOLD_MS / 1000,
              ease: 'easeInOut',
              times: [0, 0.2, 0.5, 0.8, 1],
              repeat: Infinity,
              repeatType: 'mirror',
            },
          },
          closing: {
            opacity: 0,
            scale: 1.025,
            y: '-1%',
            transition: {
              duration: CINEMATIC_TIMING.EXIT_MS / 1000,
              ease: easing,
            },
          },
        };

  const textVariantsMobile: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 1, y: 0, transition: { duration: 0.1 } },
        holding: { opacity: 1, y: 0 },
        closing: { opacity: 0, y: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: {
          opacity: 0,
          y: -20,
          transition: {
            duration: CINEMATIC_TEXT_TIMING.TITLE_ENTER_DURATION_S,
            ease: easing,
            delay: CINEMATIC_TEXT_TIMING.TITLE_DELAY_ENTER_S,
          },
        },
        holding: {
          opacity: 1,
          y: 0,
          transition: {
            duration: CINEMATIC_TEXT_TIMING.TITLE_ENTER_DURATION_S,
            ease: easing,
          },
        },
        closing: {
          opacity: 0,
          y: -10,
          transition: {
            duration: CINEMATIC_TEXT_TIMING.TEXT_EXIT_DURATION_S,
            ease: easing,
          },
        },
      };

  const textVariantsDesktop: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 1, x: 0, transition: { duration: 0.1 } },
        holding: { opacity: 1, x: 0 },
        closing: { opacity: 0, x: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: {
          opacity: 0,
          x: '-100vw',
          transition: {
            duration: CINEMATIC_TEXT_TIMING.TITLE_ENTER_DURATION_S,
            ease: easing,
            delay: CINEMATIC_TEXT_TIMING.TITLE_DELAY_ENTER_S,
          },
        },
        holding: {
          opacity: 1,
          x: 0,
          transition: {
            duration: CINEMATIC_TEXT_TIMING.TITLE_ENTER_DURATION_S,
            ease: easing,
          },
        },
        closing: {
          opacity: 0,
          x: '-20px',
          transition: {
            duration: CINEMATIC_TEXT_TIMING.TEXT_EXIT_DURATION_S,
            ease: easing,
          },
        },
      };

  const subtitleVariantsMobile: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 1, y: 0, transition: { duration: 0.1 } },
        holding: { opacity: 1, y: 0 },
        closing: { opacity: 0, y: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: {
          opacity: 0,
          y: 20,
          transition: {
            duration: CINEMATIC_TEXT_TIMING.SUBTITLE_ENTER_DURATION_S,
            ease: easing,
            delay: CINEMATIC_TEXT_TIMING.SUBTITLE_DELAY_ENTER_S,
          },
        },
        holding: {
          opacity: 1,
          y: 0,
          transition: {
            duration: CINEMATIC_TEXT_TIMING.SUBTITLE_ENTER_DURATION_S,
            ease: easing,
          },
        },
        closing: {
          opacity: 0,
          y: 10,
          transition: {
            duration: CINEMATIC_TEXT_TIMING.TEXT_EXIT_DURATION_S,
            ease: easing,
          },
        },
      };

  const subtitleVariantsDesktop: Variants = shouldReduceMotion
    ? {
        entering: { opacity: 1, x: 0, transition: { duration: 0.1 } },
        holding: { opacity: 1, x: 0 },
        closing: { opacity: 0, x: 0, transition: { duration: 0.1 } },
      }
    : {
        entering: {
          opacity: 0,
          x: '100vw',
          transition: {
            duration: CINEMATIC_TEXT_TIMING.SUBTITLE_ENTER_DURATION_S,
            ease: easing,
            delay: CINEMATIC_TEXT_TIMING.SUBTITLE_DELAY_ENTER_S,
          },
        },
        holding: {
          opacity: 1,
          x: 0,
          transition: {
            duration: CINEMATIC_TEXT_TIMING.SUBTITLE_ENTER_DURATION_S,
            ease: easing,
          },
        },
        closing: {
          opacity: 0,
          x: '20px',
          transition: {
            duration: CINEMATIC_TEXT_TIMING.TEXT_EXIT_DURATION_S,
            ease: easing,
          },
        },
      };

  const currentVariant = phase;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      initial="entering"
      animate={currentVariant}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: easing } }}
    >
      <motion.div
        variants={isMobile ? textVariantsMobile : textVariantsDesktop}
        className="absolute top-[12px] right-0 left-0 z-10 text-center md:top-8"
      >
        <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
          J&amp;S Empregos
        </h1>
      </motion.div>

      <motion.div
        variants={imageVariants}
        className="absolute inset-0 flex items-center justify-center"
      >
        {!imageLoaded && (
          <div className="bg-surface-alt absolute inset-0 flex items-center justify-center">
            <div className="bg-muted h-16 w-16 animate-pulse rounded-full" />
          </div>
        )}
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

      <motion.div
        variants={isMobile ? subtitleVariantsMobile : subtitleVariantsDesktop}
        className="absolute right-20 bottom-16 left-4 z-10 text-center md:right-0 md:bottom-24 md:left-0"
      >
        <p className="text-lg text-white/90 drop-shadow-md sm:text-xl md:text-2xl">
          Gestão em Recursos Humanos
        </p>
      </motion.div>

      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-6 bottom-6 z-20 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur transition-colors hover:text-white md:right-8 md:bottom-8"
        style={{
          bottom: 'max(env(safe-area-inset-bottom, 0px) + 1.5rem, 1.5rem)',
        }}
      >
        Pular
      </button>

      <span className="sr-only">
        Abertura cinematográfica J&amp;S Empregos LTDA
      </span>
    </motion.div>
  );
}
