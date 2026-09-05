import type { MatchResult } from '@/types/domain/matching';
import { cn } from '@/utils';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface MatchBreakdownProps {
  match: MatchResult;
}

export function MatchBreakdown({ match }: MatchBreakdownProps) {
  const { breakdown, score } = match;

  const getPctColor = (pct: number): string => {
    if (pct >= 70) return 'text-success';
    if (pct >= 40) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getIcon = (matched: boolean, pct: number) => {
    if (matched && pct >= 70) return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (pct >= 40) return <AlertCircle className="h-4 w-4 text-warning" />;
    return <Circle className="h-4 w-4 text-muted-foreground/50" />;
  };

  return (
    <div className="border-t pt-3">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-foreground text-sm font-semibold">
          Por que esta vaga combina com você?
        </h4>
        <span className="text-foreground text-sm font-bold">{score}%</span>
      </div>

      <div className="mb-3 h-2 w-full rounded-full bg-muted">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="space-y-2 text-xs">
        {breakdown.map((item) => {
          const pct = item.percentage;
          return (
            <div
              key={item.label}
              className="flex items-start gap-2"
            >
              {getIcon(item.matched, pct)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">
                    {item.label}
                  </span>
                  <span className={cn('font-medium', getPctColor(pct))}>
                    {item.score}/{item.maxScore} ({pct}%)
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  {item.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
