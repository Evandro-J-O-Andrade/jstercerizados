import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { Lock, Monitor, ShieldAlert } from 'lucide-react';

export default function SegurancaPage() {
  return (
    <ModuleWorkspace
      title="Segurança"
      description="Eventos, sessões e proteção da plataforma."
      icon={Lock}
      breadcrumbItems={[{ label: 'Segurança', href: '/dashboard/seguranca' }]}
      actions={<button className="text-sm">+ Nova política</button>}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ModuleCard
          title="Sessões"
          description="Sessões ativas e dispositivos conectados."
          icon={Monitor}
          route="/dashboard/seguranca/sessoes"
        />
        <ModuleCard
          title="Eventos de Segurança"
          description="Logs e incidentes registrados."
          icon={ShieldAlert}
          route="/dashboard/seguranca/eventos"
        />
      </div>
    </ModuleWorkspace>
  );
}
