import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { getSafeAuthCallbackError } from '@/lib/auth-callback-error';

/** Tempo máximo aguardando hidratação de sessão/pessoa antes de oferecer recuperação. */
const AUTH_CALLBACK_TIMEOUT_MS = 8000;

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, person, isLoading, resolvePostLoginDestination } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const [waitKey, setWaitKey] = useState(0);
  const deadlineRef = useRef<number | null>(null);

  const safeError = getSafeAuthCallbackError(location.search, location.hash);

  useEffect(() => {
    if (!safeError.hasError) return;
    // Encaminha com mensagem segura; o destino preserva o contexto de login.
    navigate(`/login?error=${encodeURIComponent(safeError.message)}`, { replace: true });
  }, [safeError.hasError, safeError.message, navigate]);

  useEffect(() => {
    if (safeError.hasError) return;
    // Aguarda hidratação completa: autenticação, pessoa e fim do loading.
    if (isAuthenticated && person && !isLoading) {
      const target = resolvePostLoginDestination();
      navigate(target, { replace: true });
    }
  }, [safeError.hasError, isAuthenticated, person, isLoading, navigate, resolvePostLoginDestination]);

  useEffect(() => {
    if (safeError.hasError) return;
    // Sessão/pessoa prontas — nenhum fallback necessário.
    if (isAuthenticated && person) {
      setTimedOut(false);
      return;
    }
    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + AUTH_CALLBACK_TIMEOUT_MS;
    }
    const remaining = Math.max(0, deadlineRef.current - Date.now());
    const timer = window.setTimeout(() => setTimedOut(true), remaining);
    return () => window.clearTimeout(timer);
  }, [safeError.hasError, isAuthenticated, person, isLoading, waitKey]);

  if (safeError.hasError) {
    return null;
  }

  if (timedOut && !(isAuthenticated && person)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div role="alert" className="bg-muted text-foreground mb-6 rounded-xl p-4 text-sm">
            Não foi possível concluir a autenticação agora. Aguarde mais um instante ou volte ao login.
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                deadlineRef.current = Date.now() + AUTH_CALLBACK_TIMEOUT_MS;
                setTimedOut(false);
                setWaitKey((k) => k + 1);
              }}
            >
              Aguardar novamente
            </Button>
            <Button type="button" variant="primary" onClick={() => navigate('/login', { replace: true })}>
              Ir para o login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="md" />
        <p className="text-muted-foreground mt-4 text-sm">
          {isLoading ? 'Finalizando autenticação...' : 'Redirecionando...'}
        </p>
      </div>
    </div>
  );
}

