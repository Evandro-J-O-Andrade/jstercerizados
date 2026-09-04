import { Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Building2,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidate } from '@/contexts/CandidateContext';
import { SEO } from '@/components/ui/SEO';
import { COMPANY } from '@/config';

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
  const { favorites, isLoading, error, toggleFavorite } = useCandidate();

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

        {error && (
          <Card className="border-destructive/40 bg-destructive/5 p-4">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : favorites.length === 0 ? (
          <Card className="p-8 text-center">
            <Heart className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
            <p className="text-foreground font-medium">
              Você ainda não favoritou nenhuma vaga
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Clique no coração nas vagas para salvá-las aqui.
            </p>
            <Link
              to="/candidato/vagas"
              className="text-primary mt-3 inline-block text-sm hover:underline"
            >
              Ver vagas →
            </Link>
          </Card>
        ) : (
          <ul className="space-y-3">
            {favorites.map((fav) => {
              const job = fav.job;
              if (!job) return null;
              return (
                <li key={fav.id}>
                  <Card className="p-5">
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
                          onClick={() => void toggleFavorite(job.id)}
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
        )}

        {favorites.length > 0 && (
          <div className="text-center">
            <Link
              to="/candidato/vagas"
              className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
            >
              <Briefcase className="h-4 w-4" />
              Explorar mais vagas
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
