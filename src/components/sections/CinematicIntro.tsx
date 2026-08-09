import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';

const SHOWCASE_KEY = 'js-showcase-dismissed';
const IDLE_TIMEOUT = 10 * 60 * 1000;
const SLIDE_DURATION = 1400;
const SLIDE_TRANSITION = 500;

import { HERO_ASSETS } from '@/content/assets';

const slides = [
  HERO_ASSETS.cardheros,
  '/images/hero/hero-main.webp',
  '/images/hero/hero-security.webp',
];

const slideVariants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: SLIDE_TRANSITION / 1000,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: {
      duration: SLIDE_TRANSITION / 1000,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  },
} as const;

const reducedMotionSlideVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
} as const;

function getBreakpointObjectPosition(width: number): string {
  if (width >= 1024) return 'center 35%';
  if (width >= 640) return 'center 40%';
  return '60% center';
}

export function CinematicShowcase({ onFinish }: { onFinish: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'closing'>('idle');
  const [objectPosition, setObjectPosition] = useState(() =>
    getBreakpointObjectPosition(
      typeof window !== 'undefined' ? window.innerWidth : 1024,
    ),
  );

  const finish = useCallback(() => {
    setPhase('closing');
    setTimeout(
      () => {
        onFinish();
      },
      shouldReduceMotion ? 150 : SLIDE_TRANSITION,
    );
  }, [onFinish, shouldReduceMotion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SHOWCASE_KEY)) return;

    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const resetIdle = () => {
      clearTimeout(idleTimer);
      if (phase === 'playing') return;
      idleTimer = setTimeout(() => {
        setPhase('playing');
      }, IDLE_TIMEOUT);
    };

    const events: (keyof WindowEventMap)[] = [
      'pointermove',
      'pointerdown',
      'keydown',
      'scroll',
      'touchstart',
    ];
    events.forEach((event) => window.addEventListener(event, resetIdle));
    resetIdle();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => window.removeEventListener(event, resetIdle));
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (slides.length <= 1) {
      finish();
      return;
    }

    const slideTimer = setInterval(
      () => {
        setCurrent((prev) => {
          if (prev + 1 >= slides.length) {
            finish();
            return prev;
          }
          return prev + 1;
        });
      },
      shouldReduceMotion ? 400 : SLIDE_DURATION,
    );

    return () => clearInterval(slideTimer);
  }, [phase, finish, shouldReduceMotion]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (phase === 'playing' || phase === 'closing') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setObjectPosition(getBreakpointObjectPosition(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <AnimatePresence>
        {(phase === 'playing' || phase === 'closing') && (
          <motion.div
            key="showcase"
            variants={
              shouldReduceMotion ? reducedMotionSlideVariants : slideVariants
            }
            initial="hidden"
            animate={phase === 'closing' ? 'exit' : 'visible'}
            className="absolute inset-0"
          >
            <SafeImage
              src={slides[current]}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition }}
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(SHOWCASE_KEY, '1');
          finish();
        }}
        className="absolute right-6 bottom-6 z-20 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur transition-colors hover:text-white"
      >
        Pular
      </button>
      <span className="sr-only">Apresentação cinematográfica</span>
    </div>
  );
}
