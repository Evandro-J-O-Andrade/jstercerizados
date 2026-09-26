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
  tabIndex: tabIndexProp,
  role: roleProp,
  ...props
}: PremiumCardProps) {
  const roundedClass = ROUNDED_VARIANTS[rounded];
  const interactionClasses =
    hover && interactable
      ? [
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
        ]
      : [];

  if (!goldGlow) {
    return (
      <div
        className={cn(
          'card-base rounded-xl motion-reduce:transition-none',
          roundedClass,
          interactionClasses,
          hover && !interactable && 'group hover:-translate-y-[3px]',
          className,
        )}
        {...props}
        tabIndex={tabIndexProp ?? (interactable ? 0 : undefined)}
        role={roleProp ?? (interactable ? 'group' : undefined)}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'gold-glow-wrapper group group/card relative block w-full',
        roundedClass,
        interactionClasses,
        hover && !interactable && 'group hover:-translate-y-[3px]',
      )}
      {...props}
      tabIndex={tabIndexProp ?? (interactable ? 0 : undefined)}
      role={roleProp ?? (interactable ? 'group' : undefined)}
    >
      <div
        className={cn(
          'gold-glow-card card-base motion-reduce:transition-none',
          roundedClass,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
