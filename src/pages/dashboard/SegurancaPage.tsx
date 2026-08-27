import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Card } from '@/components/ui/Card';
import { Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { securityEventRepository } from '@/repositories/security.repository';
import type { SecurityEvent } from '@/types/domain/security';

export default function SegurancaPage() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [roles, setRoles] = useState<
    { id: string; name: string; scope: string }[]
  >([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchData = async () => {
      try {
        const tenantId = currentTenantId;
        if (!tenantId && !isAdminMaster) {
          setLoading(false);
          return;
        }

        const [rolesResult, eventsResult] = await Promise.all([
          supabase.from('roles').select('id, name, scope').order('name'),
          isAdminMaster && tenantId
            ? securityEventRepository.findAll(tenantId)
            : Promise.resolve([] as SecurityEvent[]),
        ]);

        setRoles(rolesResult.data || []);
        if (Array.isArray(eventsResult)) {
          setEvents(eventsResult);
        }
      } catch (error) {
        console.error('[SEGURANCA] Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentTenantId, isAdminMaster]);

  return (
    <ModuleWorkspace
      title="Segurança"
      description="Eventos, sessões e proteção da plataforma."
      icon={Shield}
      breadcrumbItems={[{ label: 'Segurança', href: '/dashboard/seguranca' }]}
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando dados de segurança...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Roles cadastradas
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {roles.length}
                </span>
                <Shield className="text-primary h-5 w-5" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Roles globais
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {roles.filter((r) => r.scope === 'global').length}
                </span>
                <Shield className="text-primary h-5 w-5" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Roles de tenant
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground text-2xl font-semibold">
                  {roles.filter((r) => r.scope === 'tenant').length}
                </span>
                <Users className="text-primary h-5 w-5" />
              </div>
            </Card>
          </div>

          {isAdminMaster && events.length > 0 && (
            <Card className="overflow-hidden">
              <div className="border-border border-b px-4 py-3">
                <h3 className="text-foreground text-sm font-semibold">
                  Eventos de segurança recentes
                </h3>
              </div>
              <table className="divide-border min-w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Evento
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      IP
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {events.slice(0, 20).map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="text-foreground px-4 py-3 text-sm font-medium">
                        {event.event_type}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {event.ip || '—'}
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="border-border border-b px-4 py-3">
              <h3 className="text-foreground text-sm font-semibold">
                Roles cadastradas
              </h3>
            </div>
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Nome
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                    Escopo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {roles.map((role) => (
                  <tr
                    key={role.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {role.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                        {role.scope === 'global' ? 'Plataforma' : 'Tenant'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </ModuleWorkspace>
  );
}

