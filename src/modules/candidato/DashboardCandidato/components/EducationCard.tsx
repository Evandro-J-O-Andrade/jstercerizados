import { GraduationCap, BookOpen, ArrowRight, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { formatDate } from '@/utils';

export function EducationCard() {
  const { candidate } = useCandidato();
  const education = candidate?.education || [];
  const courses = candidate?.courses || [];

  const items = [
    ...education.map((e) => ({
      id: e.id,
      type: 'education' as const,
      title: e.course,
      subtitle: e.institution,
      meta: e.end_date
        ? formatDate(e.end_date)
        : e.start_date
          ? `Iniciado em ${formatDate(e.start_date)}`
          : null,
      degree: e.degree,
    })),
    ...courses.map((c) => ({
      id: c.id,
      type: 'course' as const,
      title: c.name,
      subtitle: c.institution,
      meta: c.completed_at ? `Concluído em ${formatDate(c.completed_at)}` : null,
      hours: c.hours,
    })),
  ].slice(0, 4);

  const hasItems = items.length > 0;

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Formação e cursos
            </h3>
            <p className="text-sm text-slate-500">
              Escolaridade, qualificações e certificações
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href="/candidato/formacao">
            Gerenciar
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="p-6">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <Award className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Ainda sem formação ou cursos
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Adicione sua formação e qualificações para fortalecer seu perfil
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" asChild>
                <a href="/candidato/formacao">Adicionar formação</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="/candidato/cursos">Adicionar curso</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  {item.type === 'education' ? (
                    <GraduationCap className="h-4 w-4" />
                  ) : (
                    <BookOpen className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate font-medium text-slate-900">
                      {item.title}
                    </p>
                    {item.type === 'education' && item.degree && (
                      <Badge variant="secondary" className="text-xs">
                        {item.degree}
                      </Badge>
                    )}
                    {item.type === 'course' && item.hours && (
                      <Badge variant="secondary" className="text-xs">
                        {item.hours}h
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {item.subtitle}
                  </p>
                  {item.meta && (
                    <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
