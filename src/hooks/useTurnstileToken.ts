import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getTurnstileScriptUrl,
  getTurnstileSiteKey,
} from '@/utils/turnstile-config';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    __turnstileLoadingPromise?: Promise<void>;
  }
}

let loadingPromise: Promise<void> | null = null;

export function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${getTurnstileScriptUrl()}"]`,
    );
    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Turnstile script load failed')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = getTurnstileScriptUrl();
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Turnstile script load failed'));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export interface UseTurnstileTokenResult {
  token: string | null;
  error: string | null;
  loading: boolean;
  reset: () => void;
}

export function useTurnstileToken(
  containerRef: React.RefObject<HTMLElement | null>,
  options: { enabled?: boolean } = {},
): UseTurnstileTokenResult {
  const { enabled = true } = options;
  const siteKey = getTurnstileSiteKey();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const widgetIdRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setToken(null);
  }, []);

  useEffect(() => {
    if (!enabled || !siteKey) {
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setLoading(true);

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || !container) return;
        widgetIdRef.current = window.turnstile.render(container, {
          sitekey: siteKey,
          callback: (t) => {
            if (!cancelled) {
              setToken(t);
              setError(null);
            }
          },
          'error-callback': () => {
            if (!cancelled) {
              setError('Falha ao verificar CAPTCHA. Tente novamente.');
              setToken(null);
            }
          },
          'expired-callback': () => {
            if (!cancelled) {
              setToken(null);
            }
          },
        });
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [enabled, siteKey, containerRef]);

  return { token, error, loading, reset };
}
