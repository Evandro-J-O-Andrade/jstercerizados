import {
  FileText,
  Award,
  Star,
  Briefcase,
  GraduationCap,
  Languages,
  File,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCandidato } from '@/modules/candidato/CandidatoContext';
import { cn } from '@/utils';

const PROFILE_SECTIONS = [
  { key: 'professionalSummary', label: 'Resumo profissional', icon: FileText },
  { key: 'skills', label: 'Habilidades', icon: Sparkles },
  { key: 'experiences', label: 'Experiências', icon: Briefcase },
  { key: 'education', label: 'Formação', icon: GraduationCap },
  { key: 'courses', label: 'Cursos', icon: Award },
  { key: 'languages', label: 'Idiomas', icon: Languages },
  { key: 'documents', label: 'Documentos', icon: File },
  { key: 'preferences', label: 'Preferências', icon: Star },
] as const;

const STATE_INFO: Record<
  string,
  { label: string; description: string; color: string }
> = {
  new: {
    label: 'Novo',
    description: 'Candidato recém-criado, sem dados de perfil',
    color: 'bg-muted',
  },
  incomplete_registration: {
    label: 'Cadastro incompleto',
    description: 'Candidato iniciou cadastro mas não concluiu',
    color: 'bg-warning/10 text-warning',
  },
  basic_profile: {
    label: 'Perfil básico',
    description: 'Candidato completou dados pessoais básicos',
    color: 'bg-info/10 text-info',
  },
  complete_profile: {
    label: 'Perfil completo',
    description: 'Candidato completou perfil profissional',
    color: 'bg-primary/10 text-primary',
  },
  complete_resume: {
    label: 'Currículo completo',
    description: 'Candidato enviou currículo e documentos',
    color: 'bg-success/10 text-success',
  },
  active_matching: {
    label: 'Ativo no matching',
    description: 'Candidato com perfil completo e ativo para matching',
    color: 'bg-primary text-primary-foreground',
  },
};

export function ProfileCompletion() {
  const { candidate, candidateContext } = useCandidato();

  const completionPercentage = candidateContext?.completionPercentage ?? 0;
  const profileState = candidateContext?.profileState ?? 'new';
  const stateInfo = STATE_INFO[profileState] || STATE_INFO.new;

  const hasDocuments = candidateContext?.hasDocuments ?? false;
  const hasPreferences = candidateContext?.hasPreferences ?? false;

  const sections = PROFILE_SECTIONS.map((section) => {
    let completed = false;
    switch (section.key) {
      case 'professionalSummary':
        completed = Boolean(
          candidate?.headline && candidate.headline.trim().length > 0,
        );
        break;
      case 'skills':
        completed = Boolean(candidate?.skills && candidate.skills.length > 0);
        break;
      case 'experiences':
        completed = Boolean(
          candidate?.experiences && candidate.experiences.length > 0,
        );
        break;
      case 'education':
        completed = Boolean(
          candidate?.education && candidate.education.length > 0,
        );
        break;
      case 'courses':
        completed = Boolean(candidate?.courses && candidate.courses.length > 0);
        break;
      case 'languages':
        completed = Boolean(
          candidate?.languages && candidate.languages.length > 0,
        );
        break;
      case 'documents':
        completed = hasDocuments;
        break;
      case 'preferences':
        completed = hasPreferences;
        break;
    }
    return {
      ...section,
      completed,
    };
  });

  const completedCount = sections.filter((s) => s.completed).length;
  const totalCount = sections.length;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              Completude do perfil
            </h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {completedCount} de {totalCount} seções completas
            </p>
          </div>
          <div className="text-right">
            <div className="text-foreground text-3xl font-bold">
              {completionPercentage}%
            </div>
            <Badge
              variant={
                profileState === 'active_matching' ? 'success' : 'outline'
              }
              className={cn('mt-1 text-xs', stateInfo.color)}
            >
              {stateInfo.label}
            </Badge>
          </div>
        </div>

        <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <p className="text-muted-foreground mt-3 text-sm">
          {stateInfo.description}
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-foreground mb-4 text-lg font-semibold">
          Seções do perfil
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <div
              key={section.key}
              className={cn(
                'flex items-center gap-3 rounded-lg p-3 transition-colors',
                section.completed
                  ? 'bg-success/5 border-success/10'
                  : 'bg-muted/30 border-border/30',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  section.completed
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <section.icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  section.completed
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {section.label}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
