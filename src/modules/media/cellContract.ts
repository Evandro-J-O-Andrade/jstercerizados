import type { CellContract, CellRoute } from '@/core/types';
import { mediaRoutes } from './routes';
import { MEDIA_PERMISSIONS } from './permissions';

const mediaCellRoutes: CellRoute[] = mediaRoutes.map((route) => ({
  path: route.path,
  label: route.label,
  requiredPermissions: route.requiredPermissions,
  icon: route.icon,
  children: route.children,
  implementationStatus: route.implementationStatus,
}));

export const mediaCellContract: CellContract = {
  id: 'media',
  name: 'Mídia',
  version: '1.0.0',
  description: 'Gerenciamento de mídia: avatares, imagens públicas e documentos privados.',
  category: 'mídia',
  domain: 'tenant',
  scope: 'tenant',
  lifecycle: { status: 'active', health: 'healthy' },
  homeRoute: '/dashboard/media',
  routes: mediaCellRoutes,
  layout: { skipLayout: false },
  navigation: { sidebar: true, label: 'Mídia', icon: 'Image' },
  permissions: Object.values(MEDIA_PERMISSIONS),
  enabled: true,
};
