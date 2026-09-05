import { cn } from '@/utils';

interface MatchScoreBadgeProps {
  score: number;
  compact?: boolean;
}

const SCORE_TIERS = [
  { min: 90, label: 'Excelente match', color: 'text-success' },
  { min: 80, label: 'Ótimo match', color: 'text-success' },
  { min: 70, label: 'Bom match', color: 'text-warning' },
  { min: 60, label: 'Match razoável', color: 'text-warning' },
  { min: 0, label: 'Match baixo', color: 'text-muted-foreground' },
] as const;

function getScoreTier(score: number): (typeof SCORE_TIERS)[number] {
  return SCORE_TIERS.find((t) => score >= t.min) ?? SCORE_TIERS[4];
}

function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const tier = getScoreTier(score);

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-300', tier.color)}
        />
      </svg>
      <span
        className={cn(
          'text-xs font-bold',
          score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-muted-foreground',
        )}
      >
        {score}%
      </span>
    </div>
  );
}

export function MatchScoreBadge({ score, compact = false }: MatchScoreBadgeProps) {
  const tier = getScoreTier(score);

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
          score >= 80
            ? 'bg-success/10 text-success'
            : score >= 60
              ? 'bg-warning/10 text-warning'
              : 'bg-muted/10 text-muted-foreground',
        )}
      >
        <ScoreRing score={score} size={20} />
        <span>{score}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ScoreRing score={score} />
      <div className="flex flex-col">
        <span className={cn('text-sm font-semibold', tier.color)}>
          {score}% de compatibilidade
        </span>
        <span className="text-muted-foreground text-xs">{tier.label}</span>
      </div>
    </div>
  );
}
