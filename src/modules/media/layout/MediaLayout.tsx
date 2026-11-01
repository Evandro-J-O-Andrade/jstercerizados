/**
 * MediaLayout — layout próprio da célula media.
 * Envolve o conteúdo do ModuleRouter com sidebar, header e footer próprios,
 * sem herdar AdminModuleLayout.
 */

import { Image } from 'lucide-react';
import { ModuleLayout } from '@/shell/ModuleLayout';

interface MediaLayoutProps {
  children?: React.ReactNode;
}

export function MediaLayout({ children }: MediaLayoutProps) {
  return (
    <ModuleLayout
      title="Mídia"
      description="Gestão de assets de mídia, upload e galeria."
      icon={<Image className="h-5 w-5" />}
      homeRoute="/dashboard/media"
      moduleId="media"
    >
      {children}
    </ModuleLayout>
  );
}
