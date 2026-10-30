/**
 * MidiaSidebar — sidebar da célula de Mídia.
 * Apenas itens de navegação da célula de mídia, sem expor outras células.
 */

import { NavLink } from 'react-router-dom';
import { Image, Upload } from 'lucide-react';
import { getMidiaRoutes } from './MidiaRoutes';

export function MidiaSidebar() {
  const routes = getMidiaRoutes();

  return (
    <nav className="space-y-1">
      {routes.map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          end={route.path === '/midia'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          {route.path === '/midia/upload' ? (
            <Upload className="h-4 w-4" />
          ) : (
            <Image className="h-4 w-4" />
          )}
          {route.label}
        </NavLink>
      ))}
    </nav>
  );
}
