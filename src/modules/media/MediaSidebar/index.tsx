import type { ReactNode } from 'react';
import { Image, Upload, LayoutGrid, FileImage } from 'lucide-react';

interface MediaSidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export function MediaSidebar({ className }: { className?: string }) {
  const items: MediaSidebarItem[] = [
    { label: 'Dashboard', path: '/dashboard/media', icon: <Image className="h-4 w-4" /> },
    { label: 'Upload', path: '/dashboard/media/upload', icon: <Upload className="h-4 w-4" /> },
    { label: 'Galeria', path: '/dashboard/media/gallery', icon: <LayoutGrid className="h-4 w-4" /> },
    { label: 'Ativos', path: '/dashboard/media/assets', icon: <FileImage className="h-4 w-4" /> },
  ];

  return (
    <aside className={className}>
      <nav>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {item.icon}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
