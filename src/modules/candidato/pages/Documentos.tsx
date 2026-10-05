import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';
import { FileText, Pencil, Trash2, Plus, ExternalLink } from 'lucide-react';
import { candidateDocumentsRepository } from '@/modules/candidato/repositories/candidate-documents.repository';
import { DocumentDialog } from '@/modules/candidato/components/candidate/DocumentDialog';
import type { CandidateDocument } from '@/modules/candidato/types/candidate';

const CANDIDATO_HOME = '/candidato';

function documentTypeName(type: string | null | undefined): string {
  if (!type) return 'Documento';
  const map: Record<string, string> = {
    rg: 'RG',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    cnh: 'CNH',
    passport: 'Passaporte',
    diploma: 'Diploma',
    certificado: 'Certificado',
    currriculo: 'Currículo',
    outro: 'Outro',
  };
  return map[type.toLowerCase()] ?? type;
}

export default function CandidateDocumentos() {
  const { candidate, isLoading, error, refetch } = useCandidato();
  const { addToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CandidateDocument | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CandidateDocument | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm || !candidate) return;

    try {
      await candidateDocumentsRepository.delete(deleteConfirm.id, candidate.id);
      addToast({ type: 'success', message: 'Documento removido!' });
      await refetch();
    } catch {
      addToast({
        type: 'error',
        message: 'Erro ao remover documento. Tente novamente.',
      });
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <SEO
        title={`Meus documentos — ${COMPANY.name}`}
        description="Gerencie seus documentos e certificados"
        noindex
      />

      <div className="space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
              Documentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Documentos enviados e certificados.
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
            Enviar documento
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
          emptyDescription="Complete seu cadastro para gerenciar seus documentos."
        >
          {candidate && (
            <>
              {candidate.documents?.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="text-muted-foreground/30 mx-auto mb-3 h-12 w-12" />
                  <p className="text-muted-foreground">
                    Nenhum documento enviado.
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Envie documentos importantes para agilizar seu processo.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {candidate.documents?.map((d) => (
                    <li
                      key={d.id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-primary h-5 w-5" />
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {d.name ?? documentTypeName(d.type)}
                          </p>
                          {d.type && (
                            <Badge variant="outline" className="text-xs">
                              {documentTypeName(d.type)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {d.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(d.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(d)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(d)}
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

      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={async (data) => {
          if (!candidate) return;
          if (editing) {
            await candidateDocumentsRepository.update(editing.id, candidate.id, {
              url: data.url,
              name: data.name,
            });
          } else {
            await candidateDocumentsRepository.create({
              candidate_id: candidate.id,
              url: data.url,
              name: data.name,
              type: 'outro',
            });
          }
          await refetch();
        }}
        onDelete={
          editing
            ? async () => {
                await candidateDocumentsRepository.delete(editing.id, candidate!.id);
                await refetch();
                setEditing(null);
              }
            : undefined
        }
        existingDocument={editing}
        onSuccess={() => {
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Remover documento?"
        message="Essa ação não pode ser desfeita. O documento será removido permanentemente."
        confirmLabel="Remover"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

