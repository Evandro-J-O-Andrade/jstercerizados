import { useEffect, useState, type ReactNode } from 'react';
import { motion, type Variants, type Transition } from 'framer-motion';
import { staggerReveal } from '@/animations/scroll';
import { cn } from '@/utils';

interface SectionRevealProps {
  children: ReactNode;
  staggerDelay?: number;
  viewportMargin?: string;
  once?: boolean;
  className?: string;
  as?: 'section' | 'div';
}

export function SectionReveal({
  children,
  staggerDelay = 0.15,
  viewportMargin = '-100px',
  once = true,
  className,
  as = 'div',
}: SectionRevealProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const variants: Variants = prefersReducedMotion
    ? { visible: { transition: { staggerChildren: 0 } } }
    : staggerReveal(staggerDelay);

  const transition: Transition | undefined = prefersReducedMotion
    ? { duration: 0 }
    : undefined;

  if (as === 'section') {
    return (
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: viewportMargin }}
        variants={variants}
        transition={transition}
        className={cn(className)}
      >
        {children}
      </motion.section>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
      variants={variants}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
