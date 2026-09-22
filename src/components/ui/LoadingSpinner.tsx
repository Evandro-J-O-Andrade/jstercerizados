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

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          SIZE_MAP[size],
          'border-t-primary border-r-primary animate-spin rounded-full border-2 border-transparent shadow-[0_0_15px_hsl(var(--primary)/0.35)]',
          className,
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
