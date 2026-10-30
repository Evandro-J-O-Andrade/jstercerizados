import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';
import { MEDIA_PERMISSIONS } from '../permissions';

const DashboardMedia = lazy(() =>
  import('../DashboardMedia').then((m) => ({ default: m.DashboardMedia })),
);

const UploadPage = lazy(() => import('@/modules/media/pages/Upload'));
const GalleryPage = lazy(() => import('@/modules/media/pages/Gallery'));
const AssetsPage = lazy(() => import('@/modules/media/pages/Assets'));

export const mediaRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Mídia',
    element: DashboardMedia as unknown as ComponentType,
    requiredPermissions: [MEDIA_PERMISSIONS.dashboardRead],
    icon: 'Image',
  },
  {
    path: 'upload',
    label: 'Upload',
    element: UploadPage as unknown as ComponentType,
    requiredPermissions: [MEDIA_PERMISSIONS.uploadManage],
    icon: 'Upload',
  },
  {
    path: 'gallery',
    label: 'Galeria',
    element: GalleryPage as unknown as ComponentType,
    requiredPermissions: [MEDIA_PERMISSIONS.galleryManage],
    icon: 'LayoutGrid',
  },
  {
    path: 'assets',
    label: 'Ativos',
    element: AssetsPage as unknown as ComponentType,
    requiredPermissions: [MEDIA_PERMISSIONS.assetsRead],
    icon: 'FileImage',
  },
];
