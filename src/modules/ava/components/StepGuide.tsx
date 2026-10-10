import { CheckCircle2, Circle } from 'lucide-react';
import type { TutorialStep } from '../types';

interface StepGuideProps {
  steps: TutorialStep[];
  currentStep: number;
  onStepSelect: (index: number) => void;
  className?: string;
}

export function StepGuide({
  steps,
  currentStep,
  onStepSelect,
  className,
}: StepGuideProps) {
  if (steps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma etapa registrada para este tutorial.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-foreground mb-3 text-sm font-semibold">
        Passo a passo ({steps.length} etapas)
      </h3>
      <ol className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onStepSelect(index)}
                className={`flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors ${
                  isCurrent
                    ? 'border-primary/30 bg-primary/5'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="text-success h-5 w-5" />
                  ) : (
                    <Circle
                      className={`h-5 w-5 ${
                        isCurrent ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block text-sm font-medium">
                    {step.order + 1}. {step.title}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {step.description}
                  </span>
                  {step.tip && (
                    <span className="text-primary mt-1 block text-xs">
                      Dica: {step.tip}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
