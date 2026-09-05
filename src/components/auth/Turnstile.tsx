import { useRef } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useTurnstileToken } from '@/hooks/useTurnstileToken';
import {
  isTurnstileEnabled,
  getTurnstileSiteKey,
} from '@/utils/turnstile-config';
import { cn } from '@/utils';

export interface TurnstileProps {
  onTokenChange?: (token: string | null) => void;
  className?: string;
}

export function Turnstile({ onTokenChange, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const enabled = isTurnstileEnabled();
  const { token, error, loading, reset } = useTurnstileToken(containerRef, {
    enabled,
  });

  if (onTokenChange) {
    if (token !== null) onTokenChange(token);
  }

  if (!enabled) {
    return (
      <div
        data-turnstile-mode="dev"
        className={cn(
          'text-muted-foreground bg-muted/40 flex items-center gap-2 rounded-md p-2 text-xs',
          className,
        )}
      >
        <ShieldCheck className="h-4 w-4" />
        <span>
          CAPTCHA desativado (defina <code>VITE_TURNSTILE_SITE_KEY</code>).
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        ref={containerRef}
        data-turnstile-mode="managed"
        data-turnstile-site-key={getTurnstileSiteKey()}
        data-turnstile-loading={loading ? 'true' : 'false'}
        data-turnstile-has-token={token ? 'true' : 'false'}
      />
      {error && (
        <div
          role="alert"
          className="text-destructive flex items-center gap-2 text-xs"
        >
          <ShieldAlert className="h-4 w-4" />
          <span>{error}</span>
          <button type="button" onClick={reset} className="underline">
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
