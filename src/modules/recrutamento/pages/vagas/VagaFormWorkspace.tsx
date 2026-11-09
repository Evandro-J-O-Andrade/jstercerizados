import type { ReactNode } from 'react';
import { Building2, CheckCircle2, FileText, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const steps = [
  {
    label: 'Identificação',
    description: 'Título, empresa e estado de publicação',
    icon: FileText,
  },
  {
    label: 'Condições',
    description: 'Contrato, modalidade e remuneração',
    icon: Building2,
  },
  {
    label: 'Conteúdo',
    description: 'Descrição, requisitos e benefícios',
    icon: ListChecks,
  },
  {
    label: 'Validação',
    description: 'Tenant, permissão e persistência real',
    icon: CheckCircle2,
  },
];

export function VagaFormWorkspace({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="space-y-4 xl:sticky xl:top-4">
        <Card className="p-4">
          <h2 className="text-foreground text-sm font-semibold">
            Jornada da vaga
          </h2>
          <ol className="mt-4 space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.label} className="flex gap-3">
                  <span className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="text-foreground text-sm font-medium">
                      {index + 1}. {step.label}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
        <Card variant="outline" className="p-4">
          <p className="text-foreground text-sm font-medium">Contexto seguro</p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            A operação usa o tenant selecionado, permissões efetivas e o
            repository real. Nenhum conteúdo demonstrativo é persistido.
          </p>
        </Card>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
