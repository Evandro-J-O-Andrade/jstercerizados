import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { HERO_ASSETS } from '@/content/assets';

const SHOWCASE_KEY = 'js-showcase-dismissed';

const IMAGE_ENTER_MS = 600;
const TEXT_DELAY_MS = 400;
const AUTO_CLOSE_MS = 1600;
const TRANSITION_OUT_MS = 600;

const easing = [0.25, 0.4, 0.25, 1] as const;

export function CinematicShowcase({ onFinish }: { onFinish: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'entering' | 'revealing' | 'closing'>(
    'entering',
  );

  const finish = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SHOWCASE_KEY, '1');
    }
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (shouldReduceMotion) {
      const show = setTimeout(() => setPhase('revealing'), 200);
      const close = setTimeout(() => setPhase('closing'), 600);
      const end = setTimeout(finish, 800);
      return () => {
        clearTimeout(show);
        clearTimeout(close);
        clearTimeout(end);
      };
    }

    const reveal = setTimeout(() => setPhase('revealing'), IMAGE_ENTER_MS);
    const autoClose = setTimeout(
      () => setPhase('closing'),
      IMAGE_ENTER_MS + TEXT_DELAY_MS + AUTO_CLOSE_MS,
    );
    const end = setTimeout(
      finish,
      IMAGE_ENTER_MS + TEXT_DELAY_MS + AUTO_CLOSE_MS + TRANSITION_OUT_MS,
    );

    return () => {
      clearTimeout(reveal);
      clearTimeout(autoClose);
      clearTimeout(end);
    };
  }, [shouldReduceMotion, finish]);

  const triggerClose = useCallback(() => {
    sessionStorage.setItem(SHOWCASE_KEY, '1');
    setPhase('closing');
    setTimeout(finish, shouldReduceMotion ? 150 : TRANSITION_OUT_MS);
  }, [shouldReduceMotion, finish]);

  const imageVariants = shouldReduceMotion
    ? {
        entering: { opacity: 0 },
        revealing: { opacity: 1, transition: { duration: 0.15 } },
        closing: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        entering: { opacity: 1, scale: 1.08, filter: 'blur(2px)' },
        revealing: {
          opacity: 1,
          scale: [1.08, 1.04, 1],
          filter: 'blur(0px)',
          transition: {
            duration: IMAGE_ENTER_MS / 1000,
            ease: easing,
          },
        },
        closing: {
          opacity: 0,
          scale: 1.02,
          transition: { duration: TRANSITION_OUT_MS / 1000, ease: easing },
        },
      };

  const overlayVariants = shouldReduceMotion
    ? {
        entering: { opacity: 0 },
        revealing: { opacity: 1, transition: { duration: 0.15 } },
        closing: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        entering: { opacity: 0 },
        revealing: {
          opacity: 1,
          transition: {
            duration: 0.4,
            ease: easing,
            delay: IMAGE_ENTER_MS / 1000,
          },
        },
        closing: { opacity: 0, transition: { duration: 0.4, ease: easing } },
      };

  const titleVariants = shouldReduceMotion
    ? {
        entering: { opacity: 0 },
        revealing: { opacity: 1, transition: { duration: 0.15 } },
        closing: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        entering: { opacity: 0, x: -32 },
        revealing: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.5,
            ease: easing,
            delay: (IMAGE_ENTER_MS + TEXT_DELAY_MS) / 1000,
          },
        },
        closing: {
          opacity: 0,
          x: 20,
          transition: { duration: 0.4, ease: easing },
        },
      };

  const descVariants = shouldReduceMotion
    ? {
        entering: { opacity: 0 },
        revealing: { opacity: 1, transition: { duration: 0.15 } },
        closing: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        entering: { opacity: 0, x: 60 },
        revealing: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.5,
            ease: easing,
            delay: (IMAGE_ENTER_MS + TEXT_DELAY_MS + 250) / 1000,
          },
        },
        closing: {
          opacity: 0,
          x: 40,
          transition: { duration: 0.4, ease: easing },
        },
      };

  const visible = phase !== 'closing';

  return (
    <motion.div
      key="cinematic"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial ellipse at center,top 40% rgb(10,10,20) 0%, rgb(5,5,10) 100%',
        }}
      />

      <AnimatePresence>
        {(phase === 'entering' || phase === 'revealing') && (
          <motion.div
            key="image"
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
              style={{ objectPosition: 'center 35%' }}
              decoding="async"
              loading="eager"
            />
            <motion.div
              className="absolute inset-0 bg-black/40"
              variants={overlayVariants}
              initial="entering"
              animate={phase === 'revealing' ? 'revealing' : 'entering'}
              exit="closing"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && phase !== 'entering' && (
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
              className="text-foreground mb-4 text-3xl font-bold drop-shadow-lg sm:text-4xl md:text-5xl"
              variants={titleVariants}
              initial="entering"
              animate="revealing"
              exit="closing"
            >
              Mais eficiência em Recursos Humanos,
              <br />
              mais agilidade para sua empresa.
            </motion.h1>

            <motion.p
              key="desc"
              className="text-foreground/90 mb-8 max-w-2xl text-base drop-shadow-md sm:text-lg"
              variants={descVariants}
              initial="entering"
              animate="revealing"
              exit="closing"
            >
              Simplifique processos operacionais, reduza encargos e dedique seu
              tempo ao que realmente importa: o crescimento do seu negócio.
            </motion.p>

            <motion.div
              key="cta"
              className="flex flex-col gap-3 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: easing, delay: 1.4 },
              }}
              exit={{
                opacity: 0,
                y: 8,
                transition: { duration: 0.3, ease: easing },
              }}
            >
              <button
                type="button"
                onClick={triggerClose}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-lg rounded-[18px] px-8 py-4 text-base font-semibold transition-colors"
              >
                Contrinar Funcionários
              </button>
              <button
                type="button"
                onClick={triggerClose}
                className="border-border/30 text-foreground hover:bg-muted rounded-[18px] border px-8 py-4 text-base font-semibold backdrop-blur"
              >
                Quero uma Vaga
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={triggerClose}
        className="absolute right-6 bottom-6 z-20 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur transition-colors hover:text-white"
      >
        Pular
      </button>

      <span className="sr-only">
        Abertura cinematográfica J&amp;S Terceirizados
      </span>
    </motion.div>
  );
}
