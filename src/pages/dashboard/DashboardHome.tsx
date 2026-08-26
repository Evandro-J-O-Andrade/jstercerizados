import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Briefcase, BarChart3 } from 'lucide-react';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { cn } from '@/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  briefcase: Briefcase,
  'bar-chart-3': BarChart3,
};

function ModuleIconWrapper({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] || LayoutDashboard;
  return <Icon className={cn('h-5 w-5 shrink-0', className)} />;
}

export default function DashboardHome() {
  const { person, roles } = useAuth();
  const { availableModules, activePermissions } = useAccount();
  const displayName = person?.full_name?.trim() || 'Usuário';
  const firstName = displayName.split(/\s+/)[0];
  const roleName = roles[0]?.name || 'Usuário';

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const quickAccessModules = useMemo(() => {
    const priorityIds = [
      'clientes',
      'vagas',
      'candidatos',
      'servicos',
      'financeiro',
      'estoque',
      'suporte',
      'relatorios',
    ];
    return availableModules
      .filter((m) => priorityIds.includes(m.id))
      .slice(0, 8);
  }, [availableModules]);

  const isEmpty = availableModules.length === 0;

  return (
    <ModuleWorkspace
      title="Visão Geral"
      description="Painel de gestão"
      icon={LayoutDashboard}
      breadcrumbItems={[]}
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-foreground mb-1 text-xl font-semibold">
            {greeting}, {firstName}
          </h2>
          <p className="text-muted-foreground text-sm">
            {roleName} · {dateStr}
          </p>
        </section>

        <section>
          <h3 className="text-foreground mb-4 text-lg font-semibold">
            Indicadores
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Módulos disponíveis',
                value: availableModules.length.toString(),
                icon: 'layout-dashboard',
              },
              {
                label: 'Permissões ativas',
                value: activePermissions.length.toString(),
                icon: 'users',
              },
              {
                label: 'Acesso rápido',
                value: `${quickAccessModules.length}`,
                icon: 'briefcase',
              },
              { label: 'Data atual', value: dateStr, icon: 'bar-chart-3' },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border-border rounded-xl border p-4 shadow-sm"
              >
                <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  {item.label}
                </div>
                <div className="flex items-center gap-2">
                  <ModuleIconWrapper
                    name={item.icon}
                    className="text-primary"
                  />
                  <span className="text-foreground text-2xl font-semibold">
                    {item.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {isEmpty ? (
          <section>
            <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                Nenhum módulo disponível
              </h3>
              <p className="text-muted-foreground text-sm">
                Você ainda não tem permissões atribuídas para acessar módulos.
                Se precisar, solicite acesso ao administrador da plataforma.
              </p>
            </div>
          </section>
        ) : (
          <section>
            <h3 className="text-foreground mb-4 text-lg font-semibold">
              Acessos rápidos
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickAccessModules.map((mod, index) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ModuleCard module={mod} permissions={activePermissions} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </ModuleWorkspace>
  );
}
