import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { usersRepository } from '@/repositories/users.repository';
import { cn } from '@/utils';
import { Users } from 'lucide-react';
import type { Person } from '@/types/domain/person';

export default function Usuarios() {
  const { currentTenantId } = useAuth();
  const [users, setUsers] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await usersRepository.findAll(currentTenantId);
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
  }, [currentTenantId]);

  return (
    <ModuleWorkspace
      title="Usuários"
      description="Gerencie os usuários e permissões."
      icon={Users}
      breadcrumbItems={[{ label: 'Usuários' }]}
    >
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

      {!isLoading && !error && users.length === 0 && (
        <Card className="p-6">
          <p className="text-muted-foreground">
            Nenhum usuário cadastrado no momento.
          </p>
        </Card>
      )}

      {!isLoading && !error && users.length > 0 && (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {user.full_name}
                  </h3>
                  <p className="text-muted-foreground mt-1">{user.email}</p>
                  {user.phone && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {user.phone}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    user.status === 'active' && 'bg-success/10 text-success',
                    user.status === 'inactive' && 'bg-warning/10 text-warning',
                    user.status === 'pending' &&
                      'bg-muted text-muted-foreground',
                  )}
                >
                  {user.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ModuleWorkspace>
  );
}
