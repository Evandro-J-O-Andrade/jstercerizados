import type { HTMLAttributes } from 'react';
import { cn } from '@/utils';

const ROUNDED_VARIANTS = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
} as const;

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  rounded?: keyof typeof ROUNDED_VARIANTS;
  interactable?: boolean;
  hover?: boolean;
  goldGlow?: boolean;
}

export function PremiumCard({
  children,
  className,
  rounded = 'xl',
  interactable = false,
  hover = true,
  goldGlow = false,
  ...props
}: PremiumCardProps) {
  if (!goldGlow) {
    return (
      <div
        className={cn(
          'bg-card shadow-premium border-border relative overflow-hidden border transition-all duration-300 motion-reduce:transition-none',
          ROUNDED_VARIANTS[rounded],
          hover &&
            interactable && [
              'hover:translate-y-1',
              'hover:scale-[1.01]',
              'hover:shadow-premium',
              'focus-within:translate-y-1',
              'focus-within:scale-[1.01]',
              'focus-within:shadow-premium',
              'motion-reduce:hover:translate-y-0',
              'motion-reduce:hover:scale-100',
            ],
          hover && !interactable && 'group hover:translate-y-0.5',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'gold-glow-wrapper group group/card relative inline-block',
        hover &&
          interactable && [
            'hover:translate-y-1',
            'hover:scale-[1.01]',
            'hover:shadow-premium',
            'focus-within:translate-y-1',
            'focus-within:scale-[1.01]',
            'focus-within:shadow-premium',
            'motion-reduce:hover:translate-y-0',
            'motion-reduce:hover:scale-100',
          ],
        hover && !interactable && 'hover:translate-y-0.5',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'bg-card shadow-premium border-border relative overflow-hidden border transition-all duration-300 motion-reduce:transition-none',
          ROUNDED_VARIANTS[rounded],
        )}
      >
        {children}
      </div>
    </div>
  );
}
