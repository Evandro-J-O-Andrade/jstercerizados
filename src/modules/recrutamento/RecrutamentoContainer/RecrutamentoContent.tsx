import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface RecrutamentoContentProps {
  children?: ReactNode;
}

export function RecrutamentoContent({ children }: RecrutamentoContentProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Outlet />
      {children}
    </div>
  );
}