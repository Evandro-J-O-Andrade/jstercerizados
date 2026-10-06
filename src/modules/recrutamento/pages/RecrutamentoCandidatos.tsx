import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Users, Search, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import { useState } from 'react';
import type { CandidateListItem } from '@/modules/recrutamento/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function CandidateCard({ candidate }: { candidate: CandidateListItem }) {
  const fullName = candidate.person?.full_name ?? 'Sem nome';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:bg-muted/50 flex items-center gap-4 p-4 transition-colors">
      <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full font-medium">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium">{fullName}</h4>
        <p className="text-muted-foreground truncate text-sm">
          {candidate.person?.email ?? '—'}
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {candidate.person?.city && (
            <span className="text-muted-foreground text-xs">
              {candidate.person.city}
              {candidate.person.state ? `/${candidate.person.state}` : ''}
            </span>
          )}
          {candidate.status === 'active' && (
            <span className="bg-green/10 text-green rounded-full px-2 py-0.5 text-xs">
              Ativo
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        {candidate.headline && (
          <p className="text-muted-foreground text-sm">{candidate.headline}</p>
        )}
        <p className="text-muted-foreground text-xs">
          Atualizado:{' '}
          {candidate.updated_at
            ? new Date(candidate.updated_at).toLocaleDateString('pt-BR')
            : '—'}
        </p>
      </div>
    </Card>
  );
}

export default function RecrutamentoCandidatos() {
  const { candidatesEnriched, isLoading, error, refetchCandidates } =
    useRecrutamento();
  const [search, setSearch] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const filteredCandidates = candidatesEnriched.filter((c) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      (c.person?.full_name ?? '').toLowerCase().includes(term) ||
      (c.person?.email ?? '').toLowerCase().includes(term) ||
      (c.headline ?? '').toLowerCase().includes(term);
    const matchesActive = !showOnlyActive || c.status === 'active';
    return matchesSearch && matchesActive;
  });

  if (isLoading) {
    return (
      <ModuleWorkspace
        title="Candidatos"
        description="Banco de talentos e currículos"
        icon={Users}
        breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }]}
      >
        <div
          className="flex h-64 items-center justify-center"
          role="status"
          aria-busy="true"
        >
          <LoadingSpinner size="sm" />
          <span className="sr-only">Carregando candidatos…</span>
        </div>
      </ModuleWorkspace>
    );
  }

  if (error) {
    return (
      <ModuleWorkspace
        title="Candidatos"
        description="Banco de talentos e currículos"
        icon={Users}
        breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }]}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => refetchCandidates()}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title="Candidatos"
      description="Banco de talentos e currículos"
      icon={Users}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Candidatos' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            Novo Candidato
          </Button>
          <Button variant="outline" size="sm" className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar candidatos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyActive}
              onChange={(e) => setShowOnlyActive(e.target.checked)}
              className="border-input rounded"
            />
            Apenas ativos
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {filteredCandidates.length === 0 ? (
          <Card className="py-12 text-center">
            <Users className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">
              Nenhum candidato encontrado
            </h3>
            <p className="text-muted-foreground mt-2">
              {search || showOnlyActive
                ? 'Tente ajustar os filtros de busca'
                : 'Nenhum candidato cadastrado neste tenant'}
            </p>
          </Card>
        ) : (
          filteredCandidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))
        )}
      </div>

      <div className="text-muted-foreground mt-4 text-center text-sm">
        {filteredCandidates.length} de {candidatesEnriched.length} candidatos
      </div>
    </ModuleWorkspace>
  );
}
