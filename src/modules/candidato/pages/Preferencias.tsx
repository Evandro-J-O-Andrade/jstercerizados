import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import {
  Target,
  Pencil,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { candidatePreferencesRepository } from '@/modules/candidato/repositories/candidate-preferences.repository';
import { PreferencesDialog } from '@/modules/candidato/components/candidate/PreferencesDialog';

const CANDIDATO_HOME = '/candidato';

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function renderList(label: string, items: string[] | null): React.ReactNode {
  if (!items || items.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">
        {label}: nenhum definido
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export default function CandidatePreferencias() {
  const { candidate, preferences, isLoading, error, refetch } = useCandidato();
  const { addToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

  const hasPreferences = !!preferences;

  const handleDelete = async () => {
    if (!preferences || !candidate) return;

    try {
      await candidatePreferencesRepository.delete(preferences.id);
      addToast({ type: 'success', message: 'Preferências removidas!' });
      await refetch();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao remover preferências. Tente novamente.',
      });
    } finally {
      setDeleteConfirm(false);
    }
  };

  const handleConfirm = async (data: {
    desired_roles: string[] | null;
    desired_locations: string[] | null;
    salary_min: number | null;
    salary_max: number | null;
    contract_types: string[] | null;
    shifts: string[] | null;
    work_modes: string[] | null;
    max_distance_km: number | null;
    available_from: string | null;
    matching_enabled: boolean;
    receive_match_alerts: boolean;
  }) => {
    if (!candidate) return;

    if (preferences) {
      await candidatePreferencesRepository.update(preferences.id, data);
    } else {
      await candidatePreferencesRepository.create({
        candidate_id: candidate.id,
        ...data,
      });
    }
    await refetch();
  };

  return (
    <>
      <SEO
        title={`Minhas preferências — ${COMPANY.name}`}
        description="Configure suas preferências de vaga e matching"
        noindex
      />

      <div className="space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              Preferências
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure suas preferências para aparecer em vagas compatíveis.
            </p>
          </div>
          {!hasPreferences && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Definir preferências
            </Button>
          )}
        </header>

        <ContentBoundary
          status={
            isLoading
              ? 'loading'
              : error
                ? 'error'
                : candidate
                  ? 'success'
                  : 'empty'
          }
          error={error}
          onRetry={() => void refetch()}
          homeRoute={CANDIDATO_HOME}
          emptyTitle="Cadastro de candidato não encontrado"
          emptyDescription="Complete seu cadastro para definir suas preferências."
        >
          {candidate &&
            (hasPreferences ? (
              <Card variant="default" className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <h2 className="text-foreground text-lg font-semibold">
                    Preferências de vaga
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(true)}
                    >
                      <XCircle className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Cargos desejados</p>
                    {renderList('Cargos', preferences?.desired_roles ?? null)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Localizações</p>
                    {renderList('Localizações', preferences?.desired_locations ?? null)}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Salário mínimo</p>
                      <p className="text-sm">{formatCurrency(preferences?.salary_min)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Salário máximo</p>
                      <p className="text-sm">{formatCurrency(preferences?.salary_max)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tipos de contrato</p>
                      {renderList('Contratos', preferences?.contract_types ?? null)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Turnos</p>
                      {renderList('Turnos', preferences?.shifts ?? null)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Modalidades</p>
                      {renderList('Modalidades', preferences?.work_modes ?? null)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Distância máxima (km)</p>
                      <p className="text-sm">
                        {preferences?.max_distance_km
                          ? `${preferences.max_distance_km} km`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Disponível a partir de</p>
                      <p className="text-sm">
                        {preferences?.available_from
                          ? new Date(preferences.available_from).toLocaleDateString(
                              'pt-BR',
                            )
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="border-border mt-4 flex items-center gap-4 border-t pt-3">
                    <div className="flex items-center gap-2">
                      {preferences?.matching_enabled ? (
                        <CheckCircle2 className="text-green-500 h-5 w-5" />
                      ) : (
                        <XCircle className="text-muted-foreground h-5 w-5" />
                      )}
                      <span className="text-sm">Matching ativado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {preferences?.receive_match_alerts ? (
                        <CheckCircle2 className="text-green-500 h-5 w-5" />
                      ) : (
                        <XCircle className="text-muted-foreground h-5 w-5" />
                      )}
                      <span className="text-sm">Alertas de matching</span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="py-8 text-center">
                <Target className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                <p className="text-muted-foreground">
                  Nenhuma preferência configurada.
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Defina suas preferências para receber vagas compatíveis.
                </p>
              </div>
            ))}
        </ContentBoundary>
      </div>

      <PreferencesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirm}
        initialData={preferences}
        onSuccess={() => refetch()}
      />

      <ConfirmDialog
        open={deleteConfirm}
        title="Remover preferências?"
        message="Essa ação não pode ser desfeita. Suas preferências serão removidas permanentemente."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </>
  );
}

