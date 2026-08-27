import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ModuleWorkspace } from '@/components/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Plus, Search, User, MapPin, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { talentPoolRepository } from '@/repositories/talent-pool.repository';
import { candidatesRepository } from '@/repositories/candidates.repository';
import { cn } from '@/utils';
import type {
  Candidate,
  TalentPoolMembership,
  CandidatePreference,
  JobMatch,
} from '@/types/domain/candidate';

type Tab = 'dashboard' | 'candidates' | 'profile';

export default function BancoDeTalentos() {
  const { currentTenantId, isAdminMaster } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<
    | (Candidate & {
        talentPool?: TalentPoolMembership | null;
        preferences?: CandidatePreference | null;
        jobMatches?: JobMatch[];
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    withExperience: number;
    recentUpdates: number;
    withDocuments: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!currentTenantId) return;

      setIsLoading(true);
      setError(null);

      try {
        const [candidatesData, poolData] = await Promise.all([
          candidatesRepository.findAll(currentTenantId),
          talentPoolRepository.findByTenant(currentTenantId),
        ]);

        if (!cancelled) {
          setCandidates(candidatesData);

          const activeCount = poolData.filter(
            (p) => p.status === 'active',
          ).length;

          setStats({
            total: poolData.length,
            active: activeCount,
            withExperience: candidatesData.filter(
              (c) => (c.experiences || []).length > 0,
            ).length,
            recentUpdates: candidatesData.filter((c) => {
              if (!c.updated_at) return false;
              const updated = new Date(c.updated_at);
              const now = new Date();
              const diff = now.getTime() - updated.getTime();
              return diff < 7 * 24 * 60 * 60 * 1000;
            }).length,
            withDocuments: candidatesData.filter(
              (c) => (c.documents || []).length > 0,
            ).length,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar banco de talentos',
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

  const openProfile = async (candidate: Candidate) => {
    try {
      const membership = await talentPoolRepository.findByCandidate(
        candidate.id,
        currentTenantId || '',
      );

      const fullProfile = {
        ...candidate,
        talentPool: membership,
      };

      setSelectedCandidate(fullProfile);
      setTab('profile');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar perfil do candidato',
      );
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const person = candidate.person;
    const fullName = person?.full_name || '';
    const matchesSearch =
      !search ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      candidate.headline?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || candidate.status === statusFilter;
    const matchesSkill =
      !skillFilter ||
      candidate.skills?.some((skill) =>
        skill.name?.toLowerCase().includes(skillFilter.toLowerCase()),
      );
    const matchesCity =
      !cityFilter ||
      person?.city?.toLowerCase().includes(cityFilter.toLowerCase()) ||
      person?.state?.toLowerCase().includes(cityFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesSkill && matchesCity;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'inactive':
        return 'bg-warning/10 text-warning';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      case 'blacklisted':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'archived':
        return 'Arquivado';
      case 'blacklisted':
        return 'Bloqueado';
      default:
        return status;
    }
  };

  return (
    <ModuleWorkspace
      title="Banco de Talentos"
      description="Gerencie candidatos e oportunidades de matching."
      icon={User}
      breadcrumbItems={[{ label: 'Banco de Talentos' }]}
      actions={
        isAdminMaster ? (
          <Button variant="primary" size="sm" onClick={() => {}}>
            <Plus className="h-4 w-4" />
            Novo candidato
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b">
          <button
            type="button"
            onClick={() => setTab('dashboard')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === 'dashboard'
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setTab('candidates')}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === 'candidates'
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            Candidatos
          </button>
        </div>

        {error && (
          <Card className="p-6">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-6">
            <p className="text-muted-foreground">
              Carregando banco de talentos...
            </p>
          </Card>
        ) : tab === 'dashboard' && stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="p-6">
              <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Total de candidatos
              </div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Disponíveis
              </div>
              <div className="text-success text-3xl font-bold">
                {stats.active}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Com experiência
              </div>
              <div className="text-primary text-3xl font-bold">
                {stats.withExperience}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Atualizados recentemente
              </div>
              <div className="text-warning text-3xl font-bold">
                {stats.recentUpdates}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Com documentos
              </div>
              <div className="text-3xl font-bold">{stats.withDocuments}</div>
            </Card>
          </div>
        ) : tab === 'candidates' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
                <Search className="text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou cargo..."
                  className="bg-transparent text-sm outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="archived">Arquivado</option>
                  <option value="blacklisted">Bloqueado</option>
                </select>
                <input
                  type="text"
                  placeholder="Filtrar por habilidade..."
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Filtrar por cidade..."
                  className="rounded-lg border px-3 py-1.5 text-sm"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                />
              </div>
            </div>

            {filteredCandidates.length === 0 ? (
              <Card className="p-6">
                <p className="text-muted-foreground">
                  Nenhum candidato encontrado.
                </p>
              </Card>
            ) : (
              <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
                <table className="divide-border min-w-full divide-y">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                        Candidato
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                        Perfil
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                        Localização
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {filteredCandidates.map((candidate) => {
                      const person = candidate.person;
                      return (
                        <tr
                          key={candidate.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="text-foreground px-4 py-3 text-sm font-medium">
                            {person?.full_name || '—'}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {candidate.headline || '—'}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {person?.city ? (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {person.city}
                                {person.state && `, ${person.state}`}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium',
                                getStatusColor(candidate.status),
                              )}
                            >
                              {getStatusLabel(candidate.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openProfile(candidate)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : tab === 'profile' && selectedCandidate ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                Perfil do Candidato
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTab('candidates')}
              >
                Voltar para lista
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-1">
                <Card className="p-6">
                  <h4 className="text-foreground mb-4 font-semibold">
                    Dados pessoais
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-muted-foreground text-xs font-semibold uppercase">
                        Nome
                      </div>
                      <div className="text-sm">
                        {selectedCandidate.person?.full_name || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs font-semibold uppercase">
                        Email
                      </div>
                      <div className="text-sm">
                        {selectedCandidate.person?.email || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs font-semibold uppercase">
                        Telefone
                      </div>
                      <div className="text-sm">
                        {selectedCandidate.person?.phone || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs font-semibold uppercase">
                        Localização
                      </div>
                      <div className="text-sm">
                        {selectedCandidate.person?.city ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {selectedCandidate.person.city}
                            {selectedCandidate.person.state &&
                              `, ${selectedCandidate.person.state}`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs font-semibold uppercase">
                        Status
                      </div>
                      <div className="text-sm">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium',
                            getStatusColor(selectedCandidate.status),
                          )}
                        >
                          {getStatusLabel(selectedCandidate.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="text-foreground mb-4 font-semibold">
                    Informações profissionais
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-muted-foreground text-xs font-semibold uppercase">
                        Headline
                      </div>
                      <div className="text-sm">
                        {selectedCandidate.headline || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs font-semibold uppercase">
                        Fonte
                      </div>
                      <div className="text-sm">
                        {selectedCandidate.source || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs font-semibold uppercase">
                        Disponibilidade
                      </div>
                      <div className="text-sm">
                        {selectedCandidate.availability
                          ? JSON.stringify(selectedCandidate.availability)
                          : '—'}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4 lg:col-span-2">
                <Card className="p-6">
                  <h4 className="text-foreground mb-4 font-semibold">
                    Experiências
                  </h4>
                  {selectedCandidate.experiences?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Nenhuma experiência registrada.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCandidate.experiences?.map((exp) => (
                        <div
                          key={exp.id}
                          className="border-border border-b pb-3 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{exp.position}</div>
                            <div className="text-muted-foreground text-xs">
                              {formatDate(exp.start_date)} —{' '}
                              {exp.end_date
                                ? formatDate(exp.end_date)
                                : 'Atual'}
                            </div>
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {exp.company}
                          </div>
                          {exp.description && (
                            <div className="text-muted-foreground mt-1 text-sm">
                              {exp.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h4 className="text-foreground mb-4 font-semibold">
                    Formação
                  </h4>
                  {selectedCandidate.education?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Nenhuma formação registrada.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCandidate.education?.map((edu) => (
                        <div
                          key={edu.id}
                          className="border-border border-b pb-3 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{edu.course}</div>
                            <div className="text-muted-foreground text-xs">
                              {formatDate(edu.start_date)} —{' '}
                              {edu.end_date
                                ? formatDate(edu.end_date)
                                : 'Atual'}
                            </div>
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {edu.institution}
                          </div>
                          {edu.degree && (
                            <div className="text-muted-foreground text-sm">
                              {edu.degree}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h4 className="text-foreground mb-4 font-semibold">
                    Habilidades
                  </h4>
                  {selectedCandidate.skills?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Nenhuma habilidade registrada.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills?.map((skill) => (
                        <span
                          key={skill.id}
                          className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs"
                        >
                          {skill.name}
                          {skill.level && ` (${skill.level})`}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h4 className="text-foreground mb-4 font-semibold">
                    Idiomas
                  </h4>
                  {selectedCandidate.languages?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Nenhum idioma registrado.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.languages?.map((lang) => (
                        <span
                          key={lang.id}
                          className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs"
                        >
                          {lang.language} ({lang.level})
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ModuleWorkspace>
  );
}

