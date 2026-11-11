import { BriefcaseBusiness, DollarSign, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils';

export function ProfileSummary() {
  const { person } = useAuth();
  const { candidate } = useCandidato();
  const availability = candidate?.availability as Record<
    string,
    unknown
  > | null;
  const workMode = availability?.work_mode as string | undefined;
  const city = availability?.city as string | undefined;
  const state = availability?.state as string | undefined;
  const salaryMin = candidate?.salary_expectation_min;
  const salaryMax = candidate?.salary_expectation_max;

  return (
    <Card className="border-primary/20 from-primary/15 via-card to-card overflow-hidden bg-gradient-to-br p-0">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="ring-background bg-primary/10 text-primary flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-4">
            {candidate?.avatar_url ? (
              <img
                src={candidate.avatar_url}
                alt={`Foto de ${person?.full_name ?? 'candidato'}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
              Meu perfil profissional
            </p>
            <h2 className="text-foreground mt-1 truncate text-xl font-semibold sm:text-2xl">
              {person?.full_name || 'Candidato'}
            </h2>
            <p className="text-muted-foreground mt-1 truncate text-sm">
              {candidate?.headline || 'Adicione seu objetivo profissional'}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/candidato/perfil">Editar perfil</Link>
        </Button>
      </div>
      <div className="border-border bg-card/60 grid gap-3 border-t px-5 py-4 text-sm sm:grid-cols-3 sm:px-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <MapPin className="text-primary h-4 w-4" />
          <span>
            {city || state
              ? [city, state].filter(Boolean).join(', ')
              : 'Localização não informada'}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <BriefcaseBusiness className="text-primary h-4 w-4" />
          <span>
            {workMode === 'onsite'
              ? 'Presencial'
              : workMode === 'hybrid'
                ? 'Híbrido'
                : workMode === 'remote'
                  ? 'Remoto'
                  : 'Modelo de trabalho não informado'}
          </span>
        </div>
        <div className="text-muted-foreground flex items-center gap-2">
          <DollarSign className="text-primary h-4 w-4" />
          <span>
            {salaryMin || salaryMax
              ? `${formatCurrency(salaryMin ?? 0)}${salaryMax ? ` a ${formatCurrency(salaryMax)}` : ''}`
              : 'Pretensão não informada'}
          </span>
        </div>
      </div>
    </Card>
  );
}
