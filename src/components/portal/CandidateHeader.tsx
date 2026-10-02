import { Link } from 'react-router-dom';
import { resolveIcon } from '@/utils/navigation-icons';

interface CandidateHeaderProps {
  onMenuClick: () => void;
  onNavigate?: () => void;
}

export function CandidateHeader({
  onMenuClick,
  onNavigate,
}: CandidateHeaderProps) {
  return (
    <header className="bg-card border-border sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 text-sm font-medium transition-colors"
      >
        ☰
      </button>
      <Link
        to="/"
        data-source="mobile-header"
        onClick={onNavigate}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        {(() => {
          const Icon = resolveIcon('ArrowLeft');
          return <Icon className="h-4 w-4" />;
        })()}
        <span>Voltar para o site</span>
      </Link>
      <div className="w-8" />
    </header>
  );
}
