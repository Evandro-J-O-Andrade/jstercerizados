import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Building2,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { ContentBoundary } from '@/components/feedback/ContentBoundary';
import { useToast } from '@/components/feedback/ToastContext';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

const CANDIDATO_HOME = '/candidato';

const CONTRACT_LABELS: Record<string, string> = {
  clt: 'CLT',
  internship: 'Estágio',
  temporary: 'Temporário',
  freelance: 'Freelance',
  contracted: 'Contratado',
  cd: 'CD',
};

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: 'Presencial',
  hybrid: 'Híbrido',
  remote: 'Remoto',
};

export default function CandidateFavoritas() {
const { favorites, isLoading, error, toggleFavorite, refetchFavorites } =
    useCandidato();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <>
      <SEO
        title={`Vagas favoritas — ${COMPANY.name}`}
        description="Suas vagas favoritadas"
        noindex
      />

      <div className="space-y-6">
        <header>
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            Vagas favoritas
          </h1>
          <p className="text-muted-foreground mt-1">
            As vagas que você marcou para acompanhar.
          </p>
        </header>

        <ContentBoundary
          status={
            isLoading
              ? 'loading'
              : error
                ? 'error'
                : favorites.length === 0
                  ? 'empty'
                  : 'success'
          }
          error={error}
          onRetry={() => void refetchFavorites()}
          homeRoute={CANDIDATO_HOME}
          emptyTitle="Você ainda não favoritou nenhuma vaga"
          emptyDescription="Clique no coração nas vagas para salvá-las aqui."
          emptyActionLabel="Ver vagas"
          onEmptyAction={() => navigate('/candidato/vagas')}
        >
          <ul className="space-y-3">
            {favorites.map((fav) => {
              const job = fav.job;
              if (!job) return null;
              return (
                <li key={fav.id}>
                  <Card variant="interactive" hover className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-foreground text-base font-semibold">
                          {job.title}
                        </h3>
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          {job.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.city}
                              {job.state ? `/${job.state}` : ''}
                            </span>
                          )}
                          {job.contract_type && (
                            <span>
                              {CONTRACT_LABELS[job.contract_type] ??
                                job.contract_type}
                            </span>
                          )}
                          {job.work_mode && (
                            <span>
                              {WORK_MODE_LABELS[job.work_mode] ?? job.work_mode}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(job.id)}
                          aria-label="Remover dos favoritos"
                        >
                          <Heart className="fill-destructive text-destructive h-5 w-5" />
                        </Button>
                        <Link to={`/vagas/${job.slug}`}>
                          <Button variant="primary" size="sm">
                            <ExternalLink className="mr-1 h-4 w-4" />
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 text-center">
            <Link
              to="/candidato/vagas"
              className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
            >
              <Briefcase className="h-4 w-4" />
              Explorar mais vagas
            </Link>
          </div>
        </ContentBoundary>
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Remover dos favoritos?"
        message="Tem certeza que deseja remover esta vaga dos seus favoritos?"
        confirmLabel="Remover"
        variant="danger"
        onConfirm={async () => {
          if (!deleteConfirm) return;
          await toggleFavorite(deleteConfirm);
          addToast({
            type: 'success',
            message: 'Vaga removida dos favoritos.',
          });
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}

