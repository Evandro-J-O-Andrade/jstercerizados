import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const VisaoGeral = lazy(() => import('@/pages/dashboard/VisaoGeral'));
const Vagas = lazy(() => import('@/pages/dashboard/Vagas'));
const Candidatos = lazy(() => import('@/pages/dashboard/Candidatos'));
const Empresas = lazy(() => import('@/pages/dashboard/Empresas'));
const Clientes = lazy(() => import('@/pages/dashboard/Clientes'));
const Parceiros = lazy(() => import('@/pages/dashboard/Parceiros'));
const Fornecedores = lazy(() => import('@/pages/dashboard/Fornecedores'));
const Usuarios = lazy(() => import('@/pages/dashboard/Usuarios'));
const ProcessosSeletivos = lazy(
  () => import('@/pages/dashboard/ProcessosSeletivos'),
);
const Servicos = lazy(() => import('@/pages/dashboard/Servicos'));
const Financeiro = lazy(() => import('@/pages/dashboard/Financeiro'));
const Estoque = lazy(() => import('@/pages/dashboard/Estoque'));
const Suporte = lazy(() => import('@/pages/dashboard/Suporte'));
const Relatorios = lazy(() => import('@/pages/dashboard/Relatorios'));
const Configuracoes = lazy(() => import('@/pages/dashboard/Configuracoes'));

export const dashboardRoutes = [
  { path: '', element: <VisaoGeral />, exact: true },
  { path: 'vagas', element: <Vagas />, permission: 'jobs.read' },
  {
    path: 'candidatos',
    element: <Candidatos />,
    permission: 'candidates.read',
  },
  { path: 'empresas', element: <Empresas />, permission: 'companies.read' },
  { path: 'clientes', element: <Clientes />, permission: 'companies.read' },
  { path: 'parceiros', element: <Parceiros />, permission: 'companies.read' },
  {
    path: 'fornecedores',
    element: <Fornecedores />,
    permission: 'companies.read',
  },
  { path: 'usuarios', element: <Usuarios />, permission: 'people.read' },
  {
    path: 'processos-seletivos',
    element: <ProcessosSeletivos />,
    permission: 'recruitment.read',
  },
  {
    path: 'servicos',
    element: <Servicos />,
    permission: 'service_orders.read',
  },
  {
    path: 'financeiro',
    element: <Financeiro />,
    permission: 'purchase_orders.read',
  },
  {
    path: 'estoque',
    element: <Estoque />,
    permission: 'stock_movements.read',
  },
  {
    path: 'suporte',
    element: <Suporte />,
    permission: 'support_tickets.read',
  },
  { path: 'relatorios', element: <Relatorios />, permission: 'reports.read' },
  {
    path: 'configuracoes',
    element: <Configuracoes />,
    permission: 'tenants.read',
  },
];

export function DashboardRouteNotFound() {
  return <Navigate to="/dashboard" replace />;
}
