import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleCard } from '@/components/portal/ModuleCard';
import {
  BarChart,
  DollarSign,
  BarChart3,
  TrendingUp,
  Activity,
  LayoutDashboard,
} from 'lucide-react';

export default function GestaoSaaSPage() {
  return (
    <ModuleWorkspace
      title="Gestão SaaS"
      description="Métricas, crescimento e saúde da plataforma."
      icon={BarChart}
      breadcrumbItems={[
        { label: 'Gestão SaaS', href: '/dashboard/gestao-saas' },
      ]}
      actions={<button className="text-sm">+ Nova métrica</button>}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ModuleCard
          title="Dashboard"
          description="Visão executiva do SaaS."
          icon={LayoutDashboard}
          route="/dashboard/gestao-saas"
        />
        <ModuleCard
          title="MRR / Receita"
          description="Receita recorrente e financeiro."
          icon={DollarSign}
          route="/dashboard/gestao-saas/mrr"
        />
        <ModuleCard
          title="Uso da plataforma"
          description="Adoção e utilização por tenant."
          icon={BarChart3}
          route="/dashboard/gestao-saas/uso"
        />
        <ModuleCard
          title="Crescimento"
          description="Aquisição e expansão de clientes."
          icon={TrendingUp}
          route="/dashboard/gestao-saas/crescimento"
        />
        <ModuleCard
          title="Indicadores"
          description="KPIs do SaaS e operação."
          icon={Activity}
          route="/dashboard/gestao-saas/indicadores"
        />
      </div>
    </ModuleWorkspace>
  );
}
