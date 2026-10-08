import { Briefcase, MapPin, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils';

export function ProfileSummary() {
  const { person } = useAuth();
  const { candidate } = useCandidato();

  const firstName = person?.full_name?.split(' ')[0] || 'Candidato';
  const headline = candidate?.headline || 'Título profissional não definido';
  const availability = candidate?.availability as Record<
    string,
    unknown
  > | null;
  const workMode = availability?.work_mode as string | undefined;
  const city = availability?.city as string | undefined;
  const state = availability?.state as string | undefined;

  const salaryMin = candidate?.salary_expectation_min;
  const salaryMax = candidate?.salary_expectation_max;
  const salaryType = candidate?.salary_type;

  return (
    <Card className="bg-primary/5 border-primary/10 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary rounded-xl p-3">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-foreground text-xl font-semibold">
              Olá, {firstName} 👋
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Continue avançando no seu perfil profissional
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {headline && headline !== 'Título profissional não definido' && (
            <span className="text-foreground font-medium">{headline}</span>
          )}

          {workMode && (
            <span className="text-muted-foreground flex items-center gap-1">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              {workMode === 'onsite'
                ? 'Presencial'
                : workMode === 'hybrid'
                  ? 'Híbrido'
                  : 'Remoto'}
            </span>
          )}

          {(city || state) && (
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {city}
              {state ? `, ${state}` : ''}
            </span>
          )}

          {(salaryMin || salaryMax) && (
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {salaryType === 'monthly'
                ? 'Mensal'
                : salaryType === 'range'
                  ? 'Faixa'
                  : 'A combinar'}
              {salaryMin || salaryMax
                ? ` — ${formatCurrency(salaryMin ?? 0)}`
                : ''}
              {salaryMax ? ` a ${formatCurrency(salaryMax)}` : ''}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
