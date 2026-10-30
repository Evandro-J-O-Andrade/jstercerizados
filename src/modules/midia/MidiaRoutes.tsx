/**
 * MidiaRoutes — rotas da célula de Mídia.
 * Cada célula define suas próprias rotas, não depende de um roteador genérico.
 */

import type { MidiaCellRoute } from './types';

export const midiaRoutes: MidiaCellRoute[] = [
  {
    path: '/midia',
    label: 'Biblioteca de Mídia',
    requiredPermissions: ['midia.read'],
  },
  {
    path: '/midia/upload',
    label: 'Upload',
    requiredPermissions: ['midia.upload'],
  },
];

export function getMidiaRoutes(): MidiaCellRoute[] {
  return midiaRoutes;
}
