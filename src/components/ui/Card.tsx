import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'interactive' | 'gold-glow';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  className,
  variant = 'default',
  hover = false,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  const interactive = variant === 'interactive' || hover;
  const goldGlow = variant === 'gold-glow';

  if (goldGlow) {
    return (
      <div
        className={cn(
          'gold-glow-wrapper group group/card relative block w-full',
          'rounded-xl',
          interactive && [
            'hover:-translate-y-[3px]',
            'hover:scale-[1.01]',
            'hover:shadow-glow-lg',
            'focus:-translate-y-[3px]',
            'focus:scale-[1.01]',
            'focus:shadow-glow-lg',
            'focus-within:-translate-y-[3px]',
            'focus-within:scale-[1.01]',
            'focus-within:shadow-glow-lg',
            'motion-reduce:hover:translate-y-0',
            'motion-reduce:hover:scale-100',
            'motion-reduce:focus:translate-y-0',
            'motion-reduce:focus:scale-100',
            'motion-reduce:focus-within:translate-y-0',
            'motion-reduce:focus-within:scale-100',
          ],
          className,
        )}
        {...props}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'group' : undefined}
      >
        <div
          className={cn(
            'gold-glow-card',
            'rounded-xl',
            PADDING[padding],
            className,
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'card-base rounded-xl transition-all duration-300',
        PADDING[padding],
        {
          'shadow-elevated': variant === 'elevated',
          'card-border-refined': variant === 'outline',
          'card-hover': interactive,
        },
        className,
      )}
      {...props}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'group' : undefined}
    >
      {children}
    </div>
  );
}
