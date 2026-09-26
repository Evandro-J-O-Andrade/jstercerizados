import { type LabelHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={twMerge('label-base block text-sm font-medium', className)}
      {...props}
    >
      {children}
    </label>
  );
}
