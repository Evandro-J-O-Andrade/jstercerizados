import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { Languages, Pencil, Trash2, Plus } from 'lucide-react';
import { candidateLanguagesRepository } from '@/modules/candidato/repositories/candidate-languages.repository';
import { LanguageDialog } from '@/modules/candidato/components/candidate/LanguageDialog';
import type { CandidateLanguage } from '@/modules/candidato/types/candidate';

const CANDIDATO_HOME = '/candidato';

export default function CandidateIdiomas() {
  const { candidate, isLoading, error, refetch } = useCandidato();
  const { addToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CandidateLanguage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm || !candidate) return;

    try {
      await candidateLanguagesRepository.delete(deleteConfirm, candidate.id);
      addToast({ type: 'success', message: 'Idioma removido!' });
      await refetch();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao remover idioma. Tente novamente.',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <SEO
        title={`Meus idiomas — ${COMPANY.name}`}
        description="Gerencie seus idiomas e níveis de proficiência"
        noindex
      />

      <div className="space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              Idiomas
            </h1>
            <p className="text-muted-foreground mt-1">
              Idiomas que você domina e seus níveis de proficiência.
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
            Novo idioma
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
          emptyDescription="Complete seu cadastro para gerenciar seus idiomas."
        >
          {candidate && (
            <>
              {candidate.languages?.length === 0 ? (
                <div className="py-8 text-center">
                  <Languages className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">
                    Nenhum idioma cadastrado.
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Idiomas são importantes para vagas internacionais e de grande porte.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {candidate.languages?.map((l) => (
                    <li
                      key={l.id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Languages className="text-primary h-5 w-5" />
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {l.language}
                          </p>
                          {l.level && (
                            <p className="text-muted-foreground text-xs">
                              {l.level}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(l);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(l.id)}
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

      <LanguageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editing) {
            await candidateLanguagesRepository.update(editing.id, candidate.id, data);
          } else {
            await candidateLanguagesRepository.create({
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
        title="Remover idioma?"
        message="Essa ação não pode ser desfeita. O idioma será removido permanentemente."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

