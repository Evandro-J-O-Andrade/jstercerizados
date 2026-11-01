import { ModuleWorkspace } from '@/components/legacy/portal/ModuleWorkspace';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/fallback';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, User } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRecrutamento } from '@/modules/recrutamento/RecrutamentoContext';

export default function RecrutamentoCandidatoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidates, isLoading, error, refetchCandidates } = useRecrutamento();
  const candidate = candidates.find((item) => item.id === id);

  return (
    <ModuleWorkspace
      title="Detalhe do Candidato"
      description="Visualize e gerencie o perfil do candidato"
      icon={User}
      breadcrumbItems={[
        { label: 'Recrutamento' },
        { label: 'Candidatos' },
        { label: `ID: ${id}` },
      ]}
    >
      {isLoading ? (
        <div
          className="flex h-64 items-center justify-center"
          role="status"
          aria-busy="true"
        >
          <LoadingSpinner size="sm" />
          <span className="sr-only">Carregando perfil do candidato…</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => void refetchCandidates()}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : !candidate ? (
        <EmptyState
          title="Candidato não encontrado"
          description="O candidato pode não pertencer ao tenant selecionado ou não está mais disponível."
          actionLabel="Voltar para candidatos"
          onAction={() => navigate('/dashboard/recrutamento/candidatos')}
        />
      ) : (
        <div className="space-y-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard/recrutamento/candidatos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para candidatos
            </Link>
          </Button>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold">
                  {candidate.person?.full_name || 'Nome não informado'}
                </h2>
                {candidate.headline && (
                  <p className="text-muted-foreground mt-1">
                    {candidate.headline}
                  </p>
                )}
              </div>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs font-semibold uppercase">
                  E-mail
                </dt>
                <dd className="mt-1 break-all">
                  {candidate.person?.email || 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs font-semibold uppercase">
                  Telefone
                </dt>
                <dd className="mt-1">
                  {candidate.person?.phone || 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs font-semibold uppercase">
                  Status
                </dt>
                <dd className="mt-1 capitalize">{candidate.status}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs font-semibold uppercase">
                  Atualizado em
                </dt>
                <dd className="mt-1">
                  {new Date(candidate.updated_at).toLocaleDateString('pt-BR')}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      )}
    </ModuleWorkspace>
  );
}
