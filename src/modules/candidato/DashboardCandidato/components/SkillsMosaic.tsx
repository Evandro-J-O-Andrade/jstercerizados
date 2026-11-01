import { Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';

export function SkillsMosaic() {
  const { candidate } = useCandidato();
  const skills = (candidate?.skills || []).slice(0, 14);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Competências e habilidades
            </h3>
            <p className="text-sm text-slate-500">
              O que você sabe fazer
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <a href="/candidato/habilidades">
            Gerenciar
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="p-6">
        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <Sparkles className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Nenhuma habilidade cadastrada
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Adicione suas principais habilidades
            </p>
            <Button className="mt-4" size="sm" asChild>
              <a href="/candidato/habilidades">
                <Sparkles className="mr-2 h-4 w-4" />
                Adicionar habilidades
              </a>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill.id}
                variant="outline"
                className="border-violet-200 bg-violet-50/70 px-3 py-1 text-sm text-violet-800"
              >
                {skill.name}
                {skill.level ? (
                  <span className="ml-1.5 text-violet-600/80">• {skill.level}</span>
                ) : null}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
