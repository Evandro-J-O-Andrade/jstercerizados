import { type ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { HeroImage } from './HeroImage';
import { SafeImage } from '@/components/ui/SafeImage';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

export interface HeroSplitSlide {
  id: string;
  image: string;
  alt: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  cta?: ReactNode;
}

export interface HeroSplitProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  cta?: ReactNode;
  slides: HeroSplitSlide[];
  autoPlay?: boolean;
  interval?: number;
}

const slideTextVariants = (isMobile: boolean) => ({
  hidden: { opacity: 0, x: isMobile ? '-50vw' : '-80vw' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.25, 0.4, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    x: isMobile ? '50vw' : '80vw',
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
});

const reducedMotionTextVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function HeroSplit({
  eyebrow,
  title,
  subtitle,
  description,
  cta,
  slides,
  autoPlay = true,
  interval = 5000,
}: HeroSplitProps) {
  const [current, setCurrent] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const textVariants = shouldReduceMotion
    ? reducedMotionTextVariants
    : slideTextVariants(isMobile);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev: number) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const slide = slides[current];
  const slideEyebrow = slide.eyebrow ?? eyebrow;
  const slideTitle = slide.title ?? title;
  const slideSubtitle = slide.subtitle ?? subtitle;
  const slideDescription = slide.description ?? description;
  const slideCta = slide.cta ?? cta;

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden pt-16 lg:pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsla(215,35%,25%,0.3),transparent_70%)]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="absolute inset-0"
        >
          <SafeImage
            src={slide.image}
            alt={slide.alt}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <img
            src="/images/hero/hero-overlay.svg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-65"
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>

      <div className="from-background/95 via-background/70 absolute inset-0 bg-gradient-to-r to-transparent" />
      <div className="from-background via-background/30 to-background/10 absolute inset-0 bg-gradient-to-t" />

      <img
        src="/images/backgrounds/hero-grid.svg"
        alt=""
        className="absolute inset-0 h-full w-full opacity-80"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col justify-center">
          {slideEyebrow && (
            <motion.div
              key={`eyebrow-${slide.id}`}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-primary/10 border-primary/20 text-primary mb-6 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur"
            >
              {slideEyebrow}
            </motion.div>
          )}
          {slideTitle && (
            <motion.h1
              key={`title-${slide.id}`}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-foreground text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              {slideTitle}
            </motion.h1>
          )}
          {(slideSubtitle || slideDescription) && (
            <motion.p
              key={`subtitle-${slide.id}`}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed"
            >
              {slideSubtitle || slideDescription}
            </motion.p>
          )}
          {slideCta && (
            <motion.div
              key={`cta-${slide.id}`}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-8 flex flex-wrap gap-4"
            >
              {slideCta}
            </motion.div>
          )}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{
                opacity: 0,
                x: isMobile ? '40vw' : '60vw',
                scale: 0.98,
              }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: isMobile ? '-40vw' : '-60vw',
                scale: 0.98,
              }}
              transition={{ duration: 0.9, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <HeroImage
                src={slide.image}
                alt={slide.alt}
                className="aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[4/3]"
              />
            </motion.div>
          </AnimatePresence>
          {slides.length > 1 && (
            <nav
              className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-2"
              aria-label="Slides do hero"
            >
              {slides.map((s, index) => {
                const isActive = current === index;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrent(index)}
                    className="relative h-2 w-10 cursor-pointer rounded-full bg-white/10 transition-all duration-300 hover:bg-white/20"
                    aria-label={`Ir para ${s.alt || `slide ${index + 1}`}`}
                    aria-pressed={isActive}
                  >
                    <motion.div
                      className="bg-primary absolute inset-0.5 rounded-full"
                      initial={{ scaleX: 0, transformOrigin: 'left' }}
                      animate={{
                        scaleX: isActive ? 1 : 0.1,
                        opacity: isActive ? 1 : 0.3,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
