import { BriefcaseBusiness, ArrowRight, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { formatDate } from '@/utils';

function formatPeriod(startDate?: string | null, endDate?: string | null) {
  if (!startDate) return 'Período não informado';
  const start = formatDate(startDate);
  if (!endDate) return `${start} — Atual`;
  return `${start} — ${formatDate(endDate)}`;
}

export function ExperienceTimeline() {
  const { candidate } = useCandidato();
  const experiences = (candidate?.experiences || [])
    .slice()
    .sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Trajetória profissional
            </h3>
            <p className="text-sm text-slate-500">
              Suas experiências mais recentes
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href="/candidato/experiencia">
            Gerenciar
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="p-6">
        {experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <BriefcaseBusiness className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Nenhuma experiência cadastrada
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Adicione suas experiências anteriores para dar mais força ao seu
              currículo
            </p>
            <Button className="mt-4" size="sm" asChild>
              <a href="/candidato/experiencia">
                <BriefcaseBusiness className="mr-2 h-4 w-4" />
                Adicionar experiência
              </a>
            </Button>
          </div>
        ) : (
          <div className="relative space-y-6">
            <div className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-px bg-slate-200" />
            {experiences.map((exp) => (
              <article key={exp.id} className="relative flex gap-4">
                <div className="relative z-10 mt-1 h-6 w-6 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-900">
                      {exp.position}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatPeriod(exp.start_date, exp.end_date)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {exp.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
