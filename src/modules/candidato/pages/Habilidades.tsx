import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { Award, Pencil, Trash2, Plus } from 'lucide-react';
import { candidateSkillsRepository } from '@/modules/candidato/repositories/candidate-skills.repository';
import { SkillDialog } from '@/modules/candidato/components/candidate/SkillDialog';
import type { CandidateSkill } from '@/modules/candidato/types/candidate';

const CANDIDATO_HOME = '/candidato';

export default function CandidateHabilidades() {
  const { candidate, isLoading, error, refetch } = useCandidato();
  const { addToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CandidateSkill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm || !candidate) return;

    try {
      await candidateSkillsRepository.delete(deleteConfirm, candidate.id);
      addToast({ type: 'success', message: 'Habilidade removida!' });
      await refetch();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao remover habilidade. Tente novamente.',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <SEO
        title={`Minhas habilidades — ${COMPANY.name}`}
        description="Gerencie suas competências técnicas"
        noindex
      />

      <div className="space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              Habilidades
            </h1>
            <p className="text-muted-foreground mt-1">
              Competências técnicas para aparecer em vagas compatíveis.
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
            Nova habilidade
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
          emptyDescription="Complete seu cadastro para gerenciar suas habilidades."
        >
          {candidate && (
            <>
              {candidate.skills?.length === 0 ? (
                <div className="py-8 text-center">
                  <Award className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">
                    Nenhuma habilidade cadastrada.
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Adicione habilidades para aumentar seu match em vagas.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {candidate.skills?.map((s) => (
                    <li
                      key={s.id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Award className="text-primary h-5 w-5" />
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {s.name}
                          </p>
                          {s.level && (
                            <Badge variant="outline" className="text-xs">
                              {s.level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(s);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(s.id)}
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

      <SkillDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editing) {
            await candidateSkillsRepository.update(editing.id, candidate.id, data);
          } else {
            await candidateSkillsRepository.create({
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
        title="Remover habilidade?"
        message="Essa ação não pode ser desfeita. A habilidade será removida permanentemente."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

