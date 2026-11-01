import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Database, Search } from 'lucide-react';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import { useState } from 'react';

export default function RecrutamentoTalentPool() {
  const { talentPool, isLoading, error, refetchTalentPool } =
    useRecrutamento();
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const filteredPeople = talentPool.filter(
    (person) =>
      !term ||
      person.full_name.toLowerCase().includes(term) ||
      person.email.toLowerCase().includes(term) ||
      (person.phone ?? '').toLowerCase().includes(term),
  );

  return (
    <ModuleWorkspace
      title="Banco de Talentos"
      description="Consulte e gerencie o banco de talentos"
      icon={Database}
      breadcrumbItems={[
        { label: 'Recrutamento' },
        { label: 'Banco de Talentos' },
      ]}
    >
      {isLoading ? (
        <div
          className="flex h-64 items-center justify-center"
          role="status"
          aria-busy="true"
        >
          <LoadingSpinner size="sm" />
          <span className="sr-only">Carregando banco de talentos…</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => void refetchTalentPool()}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 max-w-md">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {filteredPeople.length === 0 ? (
            <Card className="py-12 text-center">
              <Database className="text-muted-foreground/50 mx-auto h-12 w-12" />
              <h2 className="mt-4 text-lg font-medium">
                Nenhum talento encontrado
              </h2>
              <p className="text-muted-foreground mt-2">
                {search
                  ? 'Tente ajustar os filtros.'
                  : 'Não há pessoas ativas no banco de talentos deste tenant.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPeople.map((person) => (
                <Card
                  key={person.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h2 className="truncate font-medium">{person.full_name}</h2>
                    <p className="text-muted-foreground truncate text-sm">
                      {person.email}
                    </p>
                    {person.phone && (
                      <p className="text-muted-foreground text-sm">
                        {person.phone}
                      </p>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Atualizado em{' '}
                    {new Date(person.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </ModuleWorkspace>
  );
}
