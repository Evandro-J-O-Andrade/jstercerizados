/**
 * AdminMasterCandidatoEditarPage — edição administrativa autorizada.
 *
 * Edição limitada aos campos do perfil `candidates` suportados pelo schema.
 * Não altera portal /candidato, não executa decisões de seleção e não faz hard delete.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserRoundSearch } from 'lucide-react';
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace';
import { RouteLoadingFallback } from '@/components/ui/RouteLoadingFallback';
import { ErrorState } from '@/components/fallback/ErrorState';
import { EmptyState } from '@/components/fallback/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { classifyUuidRouteParam } from '@/utils/uuid';
import {
  createAdminCandidateService,
  type AdminCandidateService,
} from '../../services/candidates.service';
import type { AdminCandidateDetail } from '../../repositories/candidates.repository';

type CandidateStatus = 'active' | 'inactive' | 'archived' | 'blacklisted';

export default function AdminMasterCandidatoEditarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idParam = useMemo(() => classifyUuidRouteParam(id), [id]);
  const validId = idParam.kind === 'valid' ? idParam.value : null;
  const service = useMemo<AdminCandidateService>(
    () => createAdminCandidateService(),
    [],
  );
  const [item, setItem] = useState<AdminCandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
    headline: '',
    status: 'active' as CandidateStatus,
    source: '',
  });

  const load = useCallback(async () => {
    if (!validId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await service.getCandidate(validId);
    if (result.error) {
      setError(result.error);
      setItem(null);
    } else {
      setItem(result.candidate);
      if (result.candidate) {
        setForm({
          headline: result.candidate.headline ?? '',
          status: (result.candidate.status as CandidateStatus) ?? 'active',
          source: result.candidate.source ?? '',
        });
      }
    }
    setLoading(false);
  }, [validId, service]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    if (!validId) return;
    setSaving(true);
    setSaveError(null);
    const result = await service.updateCandidate(validId, {
      headline: form.headline.trim() || null,
      status: form.status,
      source: form.source.trim() || null,
    });
    setSaving(false);
    if ('error' in result) {
      setSaveError(result.error);
      return;
    }
    navigate(`/dashboard/admin-master/candidatos/${validId}`);
  };

  if (!validId) {
    return (
      <ModuleWorkspace
        title="Candidato não localizado"
        icon={UserRoundSearch}
        homeRoute="/dashboard/global"
      >
        <div>
          <EmptyState
            title="Não foi possível localizar este cadastro"
            description="O link do candidato pode estar incompleto ou incorreto."
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
      title={item?.person?.full_name ? `Editar: ${item.person.full_name}` : 'Editar candidato'}
      description="Edição administrativa limitada aos campos suportados do perfil de candidato."
      icon={UserRoundSearch}
      homeRoute="/dashboard/global"
      breadcrumbItems={[
        { label: 'Central 24H', href: '/dashboard/global' },
        { label: 'Gestão de Candidatos', href: '/dashboard/admin-master/candidatos' },
        { label: 'Editar' },
      ]}
      actions={
        <Button asChild variant="outline">
          <Link to={validId ? `/dashboard/admin-master/candidatos/${validId}` : '/dashboard/admin-master/candidatos'}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Link>
        </Button>
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
        <Card className="max-w-2xl space-y-4 p-5" aria-busy={saving}>
          {saveError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {saveError}
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="headline" className="text-sm font-medium">Título profissional</label>
            <Input
              id="headline"
              value={form.headline}
              onChange={(event) => setForm((s) => ({ ...s, headline: event.target.value }))}
              placeholder="Ex.: Auxiliar administrativo"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(event) =>
                setForm((s) => ({ ...s, status: event.target.value as CandidateStatus }))
              }
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="archived">Arquivado</option>
              <option value="blacklisted">Bloqueado</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="source" className="text-sm font-medium">Origem</label>
            <Input
              id="source"
              value={form.source}
              onChange={(event) => setForm((s) => ({ ...s, source: event.target.value }))}
              placeholder="Ex.: portal, indicação, importação"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Campos de identidade (pessoa) e relações sensíveis não são alterados aqui sem contrato administrativo explícito.
          </p>
          <div className="flex items-center gap-2">
            <Button onClick={() => void onSave()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </Card>
      )}
    </ModuleWorkspace>
  );
}
