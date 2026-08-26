import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleCard } from '@/components/portal/ModuleCard';
import {
  Users,
  Target,
  Building2,
  GitBranch,
  FileSignature,
  UserPlus,
} from 'lucide-react';

export default function ClientesPage() {
  return (
    <ModuleWorkspace
      title="Clientes"
      description="Leads, prospects e carteira de clientes."
      icon={Users}
      breadcrumbItems={[{ label: 'Clientes', href: '/dashboard/clientes' }]}
      actions={<button className="text-sm">+ Novo cliente</button>}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ModuleCard
          title="Leads"
          description="Contatos iniciais e interessados."
          icon={UserPlus}
          route="/dashboard/clientes/leads"
        />
        <ModuleCard
          title="Prospects"
          description="Oportunidades comerciais em andamento."
          icon={Target}
          route="/dashboard/clientes/prospects"
        />
        <ModuleCard
          title="Empresas"
          description="Cadastro e relacionamento de empresas."
          icon={Building2}
          route="/dashboard/empresas"
        />
        <ModuleCard
          title="Pipeline"
          description="Funil comercial e etapas de vendas."
          icon={GitBranch}
          route="/dashboard/clientes/pipeline"
        />
        <ModuleCard
          title="Contratos"
          description="Contratos e propostas comerciais."
          icon={FileSignature}
          route="/dashboard/contratos"
        />
        <ModuleCard
          title="Clientes ativos"
          description="Clientes com tenant ativo na plataforma."
          icon={Users}
          route="/dashboard/clientes/ativos"
        />
      </div>
    </ModuleWorkspace>
  );
}
