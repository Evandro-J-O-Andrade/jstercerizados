import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SafeImage } from '@/components/ui/SafeImage';
import { HERO_ASSETS } from '@/content/assets';

const SHOWCASE_KEY = 'js-showcase-dismissed';
const IDLE_THRESHOLD = 10 * 60 * 1000;
const SLIDE_DURATION = 1800;
const SLIDE_TRANSITION = 600;

const SHOWCASE_SLIDES: readonly string[] = [
  HERO_ASSETS.cardheros,
  '/images/services/facilities-real.webp',
  '/images/services/mao-de-obra-real.webp',
  '/images/services/limpeza-real.webp',
  '/images/services/jardinagem-real.webp',
];

const IDLE_EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'scroll',
  'touchstart',
] as const;

const easing = [0.25, 0.4, 0.25, 1] as const;

export function CinematicShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShown = useRef(false);

  const finish = useCallback(() => {
    sessionStorage.setItem(SHOWCASE_KEY, '1');
    setActive(false);
    setCurrent(0);
    if (slideTimer.current) clearTimeout(slideTimer.current);
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (active || hasShown.current) return;
      idleTimer.current = setTimeout(() => {
        if (sessionStorage.getItem(SHOWCASE_KEY)) return;
        hasShown.current = true;
        setActive(true);
      }, IDLE_THRESHOLD);
    };

    const handleActivity = () => {
      if (active) return;
      resetTimer();
    };

    IDLE_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity),
    );
    resetTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      IDLE_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    if (shouldReduceMotion) {
      slideTimer.current = setTimeout(finish, 400);
      return;
    }

    let isRunning = true;
    function cycle() {
      if (!isRunning) return;
      setCurrent((prev) => {
        if (prev + 1 >= SHOWCASE_SLIDES.length) {
          finish();
          return prev;
        }
        return prev + 1;
      });
      slideTimer.current = setTimeout(cycle, SLIDE_DURATION);
    }

    slideTimer.current = setTimeout(cycle, SLIDE_DURATION);

    return () => {
      isRunning = false;
    };
  }, [active, shouldReduceMotion, finish]);

  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [active]);

  const handleSkip = useCallback(() => {
    sessionStorage.setItem(SHOWCASE_KEY, '1');
    setActive(false);
    setCurrent(0);
    if (slideTimer.current) clearTimeout(slideTimer.current);
  }, []);

  if (!active) return null;

  const imageVariants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        initial: { opacity: 0, scale: 1.05 },
        animate: {
          opacity: 1,
          scale: [1.05, 1.04, 1, 1.02, 1],
          transition: {
            scale: {
              duration: SLIDE_DURATION / 1000,
              ease: 'easeInOut',
              times: [0, 0.5, 0.75, 0.875, 1],
            },
            opacity: { duration: 0 },
          },
        },
        exit: {
          opacity: 0,
          scale: 1.02,
          transition: { duration: SLIDE_TRANSITION / 1000, ease: easing },
        },
      };

  return (
    <motion.div
      key="showcase"
      className="fixed inset-0 z-[80] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: easing } }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`slide-${current}`}
          className="absolute inset-0 h-full w-full"
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <SafeImage
            src={SHOWCASE_SLIDES[current]}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center 32%' }}
            decoding="async"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/15" />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={handleSkip}
        className="absolute right-6 bottom-6 z-10 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur transition-colors hover:text-white"
      >
        Pular
      </button>

      <span className="sr-only">
        Apresentação cinematográfica J&amp;S Terceirizados
      </span>
    </motion.div>
  );
}
