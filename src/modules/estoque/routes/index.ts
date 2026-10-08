import type { ComponentType } from 'react';
import { lazy } from 'react';
import type { ModuleRoute } from '@/platform/router/types';

const EstoquePage = lazy(() => import('@/pages/dashboard/Estoque'));
const AlmoxarifadoPage = lazy(() => import('@/pages/dashboard/Almoxarifado'));

export const estoqueRoutes: ModuleRoute[] = [
  {
    path: '',
    label: 'Dashboard Estoque',
    element: EstoquePage as unknown as ComponentType,
    requiredPermissions: ['stock.read'],
    icon: 'LayoutDashboard',
  },
  {
    path: 'produtos',
    label: 'Produtos',
    element: EstoquePage as unknown as ComponentType,
    requiredPermissions: ['stock.read'],
  },
  {
    path: 'produtos/criar',
    label: 'Novo Produto',
    element: EstoquePage as unknown as ComponentType,
    requiredPermissions: ['stock.create'],
  },
  {
    path: 'movimentos',
    label: 'Movimentações',
    element: EstoquePage as unknown as ComponentType,
    requiredPermissions: ['stock.read'],
  },
  {
    path: 'almoxarifados',
    label: 'Almoxarifados',
    element: AlmoxarifadoPage as unknown as ComponentType,
    requiredPermissions: ['stock.read'],
  },
  {
    path: 'compras',
    label: 'Pedidos de Compra',
    element: EstoquePage as unknown as ComponentType,
    requiredPermissions: ['purchase_orders.read'],
  },
  {
    path: 'inventario',
    label: 'Inventário',
    element: EstoquePage as unknown as ComponentType,
    requiredPermissions: ['stock.read'],
  },
];
