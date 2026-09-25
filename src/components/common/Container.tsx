import { type ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:max-w-[1920px] lg:px-8 xl:max-w-[2200px] xl:px-10 ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
