import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import {
  GraduationCap,
  Pencil,
  Trash2,
  Plus,
  CalendarDays,
} from 'lucide-react';
import { candidateEducationRepository } from '@/modules/candidato/repositories/candidate-education.repository';
import { EducationDialog } from '@/modules/candidato/components/candidate/EducationDialog';
import type { CandidateEducation } from '@/modules/candidato/types/candidate';

const CANDIDATO_HOME = '/candidato';

export default function CandidateFormacao() {
  const { candidate, isLoading, error, refetch } = useCandidato();
  const { addToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CandidateEducation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm || !candidate) return;

    try {
      await candidateEducationRepository.delete(deleteConfirm, candidate.id);
      addToast({ type: 'success', message: 'Formação removida!' });
      await refetch();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao remover formação. Tente novamente.',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  function formatDateRange(start?: string | null, end?: string | null): string {
    if (!start && !end) return '—';
    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      });
    if (start && end) return `${fmt(start)} — ${fmt(end)}`;
    if (start) return `Desde ${fmt(start)}`;
    return `Até ${fmt(end as string)}`;
  }

  return (
    <>
      <SEO
        title={`Minha formação — ${COMPANY.name}`}
        description="Gerencie sua formação acadêmica"
        noindex
      />

      <div className="space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              Formação acadêmica
            </h1>
            <p className="text-muted-foreground mt-1">
              Suas qualificações e estudos realizados.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Nova formação
          </Button>
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
          emptyDescription="Complete seu cadastro para gerenciar sua formação."
        >
          {candidate && (
            <>
              {candidate.education?.length === 0 ? (
                <div className="py-8 text-center">
                  <GraduationCap className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">
                    Nenhuma formação cadastrada.
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Adicione sua formação para aparecer em vagas compatíveis.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {candidate.education?.map((e) => (
                    <li
                      key={e.id}
                      className="border-border flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {e.course ?? '—'}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {e.institution ?? '—'}
                          </p>
                          {e.degree && (
                            <p className="text-muted-foreground text-xs">
                              {e.degree}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDateRange(e.start_date, e.end_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(e);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(e.id)}
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </ContentBoundary>
      </div>

      <EducationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editing) {
            await candidateEducationRepository.update(editing.id, candidate.id, data);
          } else {
            await candidateEducationRepository.create({
              candidate_id: candidate.id,
              ...data,
            });
          }
          await refetch();
        }}
        initialData={editing}
        onSuccess={() => {
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Remover formação?"
        message="Essa ação não pode ser desfeita. A formação será removida permanentemente."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

