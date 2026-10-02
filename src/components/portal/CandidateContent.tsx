import { type ReactNode, useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { COMPANY, NEW_WAVE_URL } from '@/config';
import { CandidateBottomNavigation } from '@/components/layout/CandidateBottomNavigation';
import { useNavigation } from '@/hooks/useNavigation';
import type { NavigationItem } from '@/types/navigation';

interface CandidateContentProps {
  children?: ReactNode;
}

export function CandidateContent({ children }: CandidateContentProps) {
  const { bottomNavItems } = useNavigation();

  useLayoutEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const content = children ?? <Outlet />;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
          {content}
        </div>
      </main>

      <footer className="border-border/50 bg-background/50 shrink-0 border-t">
        <div className="mx-auto max-w-[1920px] px-4 py-4 sm:px-6 lg:px-8 xl:max-w-[2200px] xl:px-10">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} {COMPANY.name}. Todos os direitos
              reservados.
            </p>
            <a
              href={NEW_WAVE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-primary text-xs font-medium transition-colors hover:underline"
            >
              Desenvolvido por New Wave Sistemas Digital Solutions
            </a>
          </div>
        </div>
      </footer>

      <CandidateBottomNavigation items={bottomNavItems as NavigationItem[]} />
    </div>
  );
}
