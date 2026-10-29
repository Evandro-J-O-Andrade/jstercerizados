import { Link } from 'react-router-dom';
import { resolveIcon } from '@/utils/navigation-icons';
import { useAuth } from '@/contexts/AuthContext';

interface CandidatoHeaderProps {
  onMenuClick: () => void;
  onNavigate?: () => void;
}

export function CandidatoHeader({
  onMenuClick,
  onNavigate,
}: CandidatoHeaderProps) {
  const { person } = useAuth();

  const fullName = person?.full_name || 'Candidato';

  return (
    <header className="bg-card border-border sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 text-sm font-medium transition-colors lg:hidden"
        >
          ☰
        </button>
        <Link
          to="/"
          data-source="mobile-header"
          onClick={onNavigate}
          className="text-muted-foreground hover:text-foreground hidden items-center gap-1.5 text-sm font-medium transition-colors sm:flex"
        >
          {(() => {
            const Icon = resolveIcon('Home');
            return <Icon className="h-4 w-4" />;
          })()}
          <span>Voltar para o site</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="text-foreground truncate text-sm font-medium">
              {fullName}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              Bem vindo ao seu painel de candidaturas
            </p>
          </div>
        </div>
      </div>

      <Link
        to="/"
        data-source="header-back-mobile"
        onClick={onNavigate}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors lg:hidden"
      >
        {(() => {
          const Icon = resolveIcon('ArrowLeft');
          return <Icon className="h-4 w-4" />;
        })()}
        <span>Voltar</span>
      </Link>
      <div className="w-8 lg:hidden" />
    </header>
  );
}
