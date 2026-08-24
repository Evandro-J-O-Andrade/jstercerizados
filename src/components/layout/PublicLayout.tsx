import { type ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pt-16 pb-24 lg:pt-20 lg:pb-0">{children}</main>
      <div className="pb-24 lg:pb-0">
        <Footer />
      </div>
      <BottomNavigation />
    </div>
  );
}
