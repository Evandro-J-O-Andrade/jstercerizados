import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { Award, Pencil, Trash2, Plus, Calendar } from 'lucide-react';
import { candidateCoursesRepository } from '@/modules/candidato/repositories/candidate-courses.repository';
import { CourseDialog } from '@/modules/candidato/components/candidate/CourseDialog';
import type { CandidateCourse } from '@/modules/candidato/types/candidate';

const CANDIDATO_HOME = '/candidato';

export default function CandidateCursos() {
  const { candidate, isLoading, error, refetch } = useCandidato();
  const { addToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CandidateCourse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm || !candidate) return;

    try {
      await candidateCoursesRepository.delete(deleteConfirm, candidate.id);
      addToast({ type: 'success', message: 'Curso removido!' });
      await refetch();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao remover curso. Tente novamente.',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  }

  return (
    <>
      <SEO
        title={`Meus cursos — ${COMPANY.name}`}
        description="Gerencie seus cursos e capacitações"
        noindex
      />

      <div className="space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              Cursos
            </h1>
            <p className="text-muted-foreground mt-1">
              Cursos e capacitações que você realizou.
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
            Novo curso
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
          emptyDescription="Complete seu cadastro para gerenciar seus cursos."
        >
          {candidate && (
            <>
              {candidate.courses?.length === 0 ? (
                <div className="py-8 text-center">
                  <Award className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">
                    Nenhum curso cadastrado.
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Adicione seus cursos para aumentar suas oportunidades.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {candidate.courses?.map((c) => (
                    <li
                      key={c.id}
                      className="border-border flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {c.name ?? '—'}
                          </p>
                          {c.institution && (
                            <p className="text-muted-foreground text-xs">
                              {c.institution}
                            </p>
                          )}
                          {c.hours && (
                            <p className="text-muted-foreground text-xs">
                              {c.hours}h
                            </p>
                          )}
                          {c.completed_at && (
                            <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3" />
                              Concluído em {formatDate(c.completed_at)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(c);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(c.id)}
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

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editing) {
            await candidateCoursesRepository.update(editing.id, candidate.id, data);
          } else {
            await candidateCoursesRepository.create({
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
        title="Remover curso?"
        message="Essa ação não pode ser desfeita. O curso será removido permanentemente."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

