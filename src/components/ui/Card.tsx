import { type HTMLAttributes } from 'react';
import { cn } from '@/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline';
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-card overflow-hidden rounded-xl transition-all duration-300',
        {
          'shadow-premium': variant === 'default',
          'shadow-elevated': variant === 'elevated',
          'border-border border': variant === 'outline',
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
