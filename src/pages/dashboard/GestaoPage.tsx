import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Building2, Users, BarChart3 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}

export default function GestaoPage() {
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchStats = async () => {
      try {
        const isPlatform = isAdminMaster;
        let companies = 0;
        let people = 0;
        let jobs = 0;

        if (isPlatform) {
          const [{ count: cCount }, { count: pCount }, { count: jCount }] =
            await Promise.all([
              supabase
                .from('companies')
                .select('*', { count: 'exact', head: true }),
              supabase
                .from('people')
                .select('*', { count: 'exact', head: true }),
              supabase.from('jobs').select('*', { count: 'exact', head: true }),
            ]);
          companies = cCount || 0;
          people = pCount || 0;
          jobs = jCount || 0;
        } else {
          const activeTenantId =
            currentTenantId || tenantMemberships[0]?.tenant_id;
          if (activeTenantId) {
            const [{ count: cCount }, { count: pCount }, { count: jCount }] =
              await Promise.all([
                supabase
                  .from('companies')
                  .select('*', { count: 'exact', head: true })
                  .eq('tenant_id', activeTenantId),
                supabase
                  .from('people')
                  .select('*', { count: 'exact', head: true })
                  .eq('tenant_id', activeTenantId),
                supabase
                  .from('jobs')
                  .select('*', { count: 'exact', head: true })
                  .eq('tenant_id', activeTenantId),
              ]);
            companies = cCount || 0;
            people = pCount || 0;
            jobs = jCount || 0;
          }
        }

        setStats([
          { label: 'Empresas', value: companies, icon: Building2 },
          { label: 'Colaboradores', value: people, icon: Users },
          { label: 'Vagas', value: jobs, icon: BarChart3 },
        ]);
      } catch (error) {
        console.error('[GESTAO] Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdminMaster, currentTenantId, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="Gestão"
      description="Indicadores e operação da empresa."
      icon={BarChart3}
      breadcrumbItems={[{ label: 'Gestão' }]}
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando indicadores...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="p-6">
                <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  {item.label}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-2xl font-semibold">
                    {item.value.toLocaleString('pt-BR')}
                  </span>
                  <Icon className="text-primary h-5 w-5" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ModuleWorkspace>
  );
}

