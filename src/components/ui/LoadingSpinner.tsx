import { motion } from 'framer-motion';
import { cn } from '@/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
} as const;

const BORDER_WIDTH_MAP = {
  sm: 'border-2',
  md: 'border-3',
  lg: 'border-4',
} as const;

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="relative" role="status" aria-live="polite" aria-busy="true">
      <div
        className={cn(
          SIZE_MAP[size],
          BORDER_WIDTH_MAP[size],
          'border-t-primary border-r-primary rounded-full border-transparent',
          prefersReducedMotion ? 'animate-spin-slow' : 'animate-spin',
          'shadow-[0_0_20px_hsl(var(--primary)/0.4)]',
          'dark:shadow-[0_0_24px_hsl(var(--primary)/0.5)]',
          className,
        )}
      />
      <div
        className={cn(
          SIZE_MAP[size],
          'border-b-primary/30 border-l-primary/30 rounded-full border-transparent',
          prefersReducedMotion
            ? 'animate-spin-slow-reverse'
            : 'animate-spin-reverse',
          'absolute inset-0 opacity-50',
        )}
      />
    </div>
  );
}

interface LoadingOverlayProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  size = 'md',
  className,
  fullScreen = false,
}: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        'flex items-center justify-center',
        fullScreen && 'bg-background/80 fixed inset-0 z-50 backdrop-blur-sm',
        className,
      )}
    >
      <LoadingSpinner size={size} />
    </motion.div>
  );
}
