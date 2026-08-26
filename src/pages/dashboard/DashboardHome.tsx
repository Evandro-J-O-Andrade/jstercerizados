import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { ModuleCard } from '@/components/portal/ModuleCard';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount } from '@/contexts/AccountContext';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';

export default function DashboardHome() {
  const { person } = useAuth();
  const { activeRole, availableModules, activePermissions } = useAccount();
  const displayName = person?.full_name?.trim() || 'Usuário';
  const firstName = displayName.split(/\s+/)[0];

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const greeting = (() => {
    const hour = now.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  })();

  const scope = activeRole
    ? activeRole.scope === 'global'
      ? 'platform'
      : 'tenant'
    : 'tenant';

  const roleName = activeRole?.name || 'Usuário';

  return (
    <ModuleWorkspace
      title="Gestão Analítica"
      description="Visão geral do seu contexto"
      icon={BarChart3}
      breadcrumbItems={[]}
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-foreground mb-1 text-xl font-semibold">
            {greeting}, {firstName} 👋
          </h2>
          <p className="text-muted-foreground">
            {scope === 'platform'
              ? 'Aqui está o resumo da sua plataforma.'
              : 'Aqui está o resumo da sua operação.'}
          </p>
          <p className="text-muted-foreground text-sm">{dateStr}</p>
          {scope !== 'platform' && (
            <p className="text-muted-foreground text-xs">
              Contexto: {roleName}
            </p>
          )}
        </section>

        {availableModules.length === 0 ? (
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
              Acessar meus módulos
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableModules
                .filter((m) => m.id !== 'inicio')
                .map((mod, index) => (
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
