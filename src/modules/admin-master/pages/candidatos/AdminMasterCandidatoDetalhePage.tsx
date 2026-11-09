/**
 * AdminMasterCandidatoDetalhePage — detalhe administrativo (Admin Master).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, UserRoundSearch } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { classifyUuidRouteParam } from '@/utils/uuid';
import {
  createAdminCandidateService,
  type AdminCandidateService,
} from '../../services/candidates.service';
import type { AdminCandidateDetail } from '../../repositories/candidates.repository';

export default function AdminMasterCandidatoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const idParam = classifyUuidRouteParam(id);
  const service = useMemo<AdminCandidateService>(
    () => createAdminCandidateService(),
    [],
  );
  const [item, setItem] = useState<AdminCandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (idParam.kind !== 'valid') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await service.getCandidate(idParam.value);
    if (result.error) {
      setError(result.error);
      setItem(null);
    } else {
      setItem(result.candidate);
    }
    setLoading(false);
  }, [idParam, service]);

  useEffect(() => {
    void load();
  }, [load]);

  if (idParam.kind === 'missing' || idParam.kind === 'invalid') {
    return (
      <ModuleWorkspace
        title="Candidato inválido"
        icon={UserRoundSearch}
        homeRoute="/dashboard/global"
        breadcrumbItems={[
          { label: 'Central 24H', href: '/dashboard/global' },
          { label: 'Gestão de Candidatos', href: '/dashboard/admin-master/candidatos' },
          { label: 'Detalhe' },
        ]}
      >
        <div>
          <EmptyState
            title="Identificador inválido"
            description="O identificador do candidato não é válido."
          />
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/dashboard/admin-master/candidatos">Voltar</Link>
            </Button>
          </div>
        </div>
      </ModuleWorkspace>
    );
  }

  return (
    <ModuleWorkspace
      title={item?.person?.full_name || 'Detalhe do candidato'}
      description="Consulta administrativa autorizada. Dados reais; sem decisões de seleção e sem hard delete."
      icon={UserRoundSearch}
      homeRoute="/dashboard/global"
      breadcrumbItems={[
        { label: 'Central 24H', href: '/dashboard/global' },
        { label: 'Gestão de Candidatos', href: '/dashboard/admin-master/candidatos' },
        { label: 'Detalhe' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/admin-master/candidatos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          {item ? (
            <Button asChild>
              <Link to={`/dashboard/admin-master/candidatos/${item.id}/editar`}>
                <Edit3 className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <RouteLoadingFallback />
      ) : error ? (
        <ErrorState
          title="Não foi possível carregar o candidato"
          message={error}
          onRetry={() => void load()}
        />
      ) : !item ? (
        <EmptyState
          title="Candidato não encontrado"
          description="O registro não foi encontrado ou não está acessível com o escopo/RLS atual."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3 p-5">
            <h2 className="text-sm font-semibold text-foreground">Identidade</h2>
            <dl className="grid gap-2 text-sm">
              <div><dt className="text-muted-foreground">Nome</dt><dd>{item.person?.full_name || '—'}</dd></div>
              <div><dt className="text-muted-foreground">E-mail</dt><dd>{item.person?.email || '—'}</dd></div>
              <div><dt className="text-muted-foreground">Telefone</dt><dd>{item.person?.phone || '—'}</dd></div>
              <div><dt className="text-muted-foreground">Localidade</dt><dd>{[item.person?.city, item.person?.state].filter(Boolean).join(' / ') || '—'}</dd></div>
              <div><dt className="text-muted-foreground">Pessoa (status)</dt><dd>{item.person?.status || '—'}</dd></div>
            </dl>
          </Card>
          <Card className="space-y-3 p-5">
            <h2 className="text-sm font-semibold text-foreground">Perfil de candidato</h2>
            <dl className="grid gap-2 text-sm">
              <div><dt className="text-muted-foreground">Status</dt><dd>{item.status}</dd></div>
              <div><dt className="text-muted-foreground">Título profissional</dt><dd>{item.headline || '—'}</dd></div>
              <div><dt className="text-muted-foreground">Origem</dt><dd>{item.source || '—'}</dd></div>
              <div><dt className="text-muted-foreground">Tenant</dt><dd className="font-mono text-xs">{item.tenant_id}</dd></div>
              <div><dt className="text-muted-foreground">Atualizado</dt><dd>{new Date(item.updated_at).toLocaleString('pt-BR')}</dd></div>
            </dl>
          </Card>
          <Card className="space-y-3 p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold text-foreground">Candidaturas ({item.applications.length})</h2>
            {item.applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma candidatura registrada.</p>
            ) : (
              <ul className="divide-y divide-border">
                {item.applications.map((app) => (
                  <li key={app.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{app.id}</span>
                    <span>{app.current_stage}</span>
                    <span className="text-muted-foreground">{new Date(app.applied_at).toLocaleDateString('pt-BR')}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </ModuleWorkspace>
  );
}
