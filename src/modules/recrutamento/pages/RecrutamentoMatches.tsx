import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import {
  Link,
  Search,
  Loader2,
  Star,
  AlertCircle,
  ExternalLink,
  User,
  Briefcase,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';
import { useState } from 'react';
import type { JobMatch } from '@/modules/recrutamento/types';

function scoreColor(score: number) {
  if (score >= 80) return 'text-green';
  if (score >= 60) return 'text-yellow';
  if (score >= 40) return 'text-orange';
  return 'text-red';
}

function MatchCard({ match }: { match: JobMatch }) {
  const isNotified = match.sent_notification;
  const isInvalidated = match.invalidated_at !== null;

  return (
    <Card className="hover:bg-muted/50 p-4 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="truncate font-medium">{match.candidate_id}</span>
            </div>
            <span className="text-muted-foreground">↔</span>
            <div className="flex items-center gap-1">
              <Briefcase className="text-muted-foreground h-4 w-4" />
              <span className="truncate font-medium">{match.job_id}</span>
            </div>
            <span className={`text-lg font-bold ${scoreColor(match.score)}`}>
              {match.score}%
            </span>
            <Star className={`h-4 w-4 ${scoreColor(match.score)}`} />
          </div>
          <p className="text-muted-foreground mt-1 truncate text-sm">
            Criado em {new Date(match.created_at).toLocaleDateString('pt-BR')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {isNotified && (
              <Badge variant="secondary" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Notificado
              </Badge>
            )}
            {isInvalidated && (
              <Badge variant="danger" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Invalidado: {match.invalidated_reason}
              </Badge>
            )}
            {!isNotified && !isInvalidated && (
              <Badge variant="outline" className="gap-1">
                Pendente
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Match criado:{' '}
            {new Date(match.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {isNotified ? (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" />
              Notificado
            </Badge>
          ) : (
            <Button variant="outline" size="sm">
              Notificar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function RecrutamentoMatches() {
  const { matches, isLoading, error, refetchMatches } = useRecrutamento();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      m.candidate_id.toLowerCase().includes(search.toLowerCase()) ||
      m.job_id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'notified' && m.sent_notification) ||
      (statusFilter === 'invalidated' && m.invalidated_at !== null) ||
      (statusFilter === 'pending' &&
        !m.sent_notification &&
        m.invalidated_at === null);
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <ModuleWorkspace
        title="Matches"
        description="Gerencie os matches entre candidatos e vagas"
        icon={Link}
        breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Matches' }]}
      >
        <div
          className="flex h-64 items-center justify-center"
          role="status"
          aria-busy="true"
        >
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="sr-only">Carregando matches…</span>
        </div>
      </ModuleWorkspace>
    );
  }

  if (error) {
    return (
      <ModuleWorkspace
        title="Matches"
        description="Gerencie os matches entre candidatos e vagas"
        icon={Link}
        breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Matches' }]}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => refetchMatches()}
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
      title="Matches"
      description="Gerencie os matches entre candidatos e vagas"
      icon={Link}
      breadcrumbItems={[{ label: 'Recrutamento' }, { label: 'Matches' }]}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar matches por ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-input bg-background focus-visible:ring-ring flex h-9 w-full max-w-xs items-center rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="notified">Notificados</option>
          <option value="invalidated">Invalidados</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <Card className="py-12 text-center">
            <Link className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">
              Nenhum match encontrado
            </h3>
            <p className="text-muted-foreground mt-2">
              {search || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Nenhum match gerado neste tenant'}
            </p>
          </Card>
        ) : (
          filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        )}
      </div>

      <div className="text-muted-foreground mt-4 text-center text-sm">
        {filteredMatches.length} de {matches.length} matches
      </div>
    </ModuleWorkspace>
  );
}
