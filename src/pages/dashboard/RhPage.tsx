import { useEffect, useState } from 'react';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Users, Plus } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { employeesRepository } from '@/repositories/employees.repository';
import type { Employee } from '@/types/domain/employee';

interface Person {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
}

type RhTab = 'people' | 'employees';

export default function RhPage() {
  const { isAdminMaster, tenantMemberships, currentTenantId } = useAuth();
  const [activeTab, setActiveTab] = useState<RhTab>('people');
  const [people, setPeople] = useState<Person[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const fetchPeople = async () => {
      try {
        let query = supabase
          .from('people')
          .select('id, full_name, email, status, created_at')
          .order('created_at', { ascending: false });

        if (!isAdminMaster) {
          const activeTenantId =
            currentTenantId || tenantMemberships[0]?.tenant_id;
          if (activeTenantId) {
            query = query.eq('tenant_id', activeTenantId);
          }
        }

        const { data } = await query;
        setPeople(data || []);
      } catch (error) {
        console.error('[RH] Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
    if (currentTenantId) {
      employeesRepository
        .findAll(currentTenantId)
        .then(setEmployees)
        .catch((error) =>
          console.error('[RH] Failed to load employees:', error),
        );
    }
  }, [isAdminMaster, currentTenantId, tenantMemberships]);

  return (
    <ModuleWorkspace
      title="RH"
      description="Gestão de pessoas e colaboradores."
      icon={Users}
      breadcrumbItems={[{ label: 'RH' }]}
      actions={
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          Novo colaborador
        </Button>
      }
    >
      {loading ? (
        <div className="text-muted-foreground text-sm">
          Carregando dados do RH...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border-border flex gap-2 overflow-x-auto border-b">
            {[
              { key: 'people', label: 'Pessoas' },
              { key: 'employees', label: 'Funcionários' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as RhTab)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary border-b-2'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'people' && (
            <div>
              {people.length === 0 ? (
                <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
                  <p className="text-muted-foreground text-sm">
                    Nenhuma pessoa encontrada.
                  </p>
                </div>
              ) : (
                <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
                  <table className="divide-border min-w-full divide-y">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          Nome
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          E-mail
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          Status
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          Criado em
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {people.map((person) => (
                        <tr
                          key={person.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="text-foreground px-4 py-3 text-sm font-medium">
                            {person.full_name}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {person.email}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                              {person.status}
                            </span>
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {new Date(person.created_at).toLocaleDateString(
                              'pt-BR',
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              {employees.length === 0 ? (
                <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
                  <p className="text-muted-foreground text-sm">
                    Nenhum funcionário cadastrado.
                  </p>
                </div>
              ) : (
                <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
                  <table className="divide-border min-w-full divide-y">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          Nome
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          Cargo
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          Departamento
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {employees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="text-foreground px-4 py-3 text-sm font-medium">
                            {employee.person?.full_name ?? 'Sem nome'}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {employee.job_title ?? '—'}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {employee.department ?? '—'}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                              {employee.status ?? 'active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </ModuleWorkspace>
  );
}
