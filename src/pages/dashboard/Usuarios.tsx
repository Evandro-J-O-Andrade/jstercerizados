import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { usersRepository } from '@/repositories/users.repository';
import { cn } from '@/utils';
import { Users, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Person } from '@/types/domain/person';

export default function Usuarios() {
  const { isAdminMaster } = useAuth();
  const [users, setUsers] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await usersRepository.findAll('');
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Erro ao carregar usuários',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  return (
    <ModuleWorkspace
      title="Usuários"
      description="Gerencie os usuários e permissões."
      icon={Users}
      breadcrumbItems={[{ label: 'Usuários' }]}
      actions={
        isAdminMaster ? (
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo usuário
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <Search className="text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar usuário..."
              className="bg-transparent text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border px-3 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="pending">Pendente</option>
          </select>
        </div>

        {isLoading && (
          <Card className="p-6">
            <p className="text-muted-foreground">Carregando usuários...</p>
          </Card>
        )}

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <Card className="p-6">
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          </Card>
        )}

        {!isLoading && !error && filtered.length > 0 && (
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
                  <th className="text-muted-foreground px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {user.full_name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          user.status === 'active' &&
                            'bg-success/10 text-success',
                          user.status === 'inactive' &&
                            'bg-warning/10 text-warning',
                          user.status === 'pending' &&
                            'bg-muted text-muted-foreground',
                        )}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModuleWorkspace>
  );
}
