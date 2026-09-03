import { useCallback, useMemo, useState } from 'react';
import { retry, type RetryOptions } from '@/lib/async/retry';
import { DEFAULT_TIMEOUT_MS, DEFAULT_WARNING_MS } from '@/lib/async/timeout';
import { normalizeError, type NormalizedError } from '@/lib/error-normalizer';

export type AsyncStatus =
  'idle' | 'loading' | 'warning' | 'success' | 'timeout' | 'error';

export interface UseAsyncOptions extends Omit<RetryOptions, 'onRetry'> {
  timeoutMs?: number;
  warningMs?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (normalized: NormalizedError, raw: unknown) => void;
  onTimeout?: () => void;
  onRetry?: (error: unknown, attempt: number) => void;
}

export interface UseAsyncResult<T> {
  data: T | null;
  error: NormalizedError | null;
  status: AsyncStatus;
  isIdle: boolean;
  isLoading: boolean;
  isWarning: boolean;
  isSuccess: boolean;
  isTimeout: boolean;
  isError: boolean;
  isSettled: boolean;
  attempts: number;
  run: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

const DEFAULT_OPTIONS: Required<
  Omit<
    UseAsyncOptions,
    'onSuccess' | 'onError' | 'onTimeout' | 'onRetry' | 'shouldRetry'
  >
> = {
  retries: 0,
  delay: 500,
  factor: 2,
  maxDelay: 10000,
  timeoutMs: DEFAULT_TIMEOUT_MS,
  warningMs: DEFAULT_WARNING_MS,
};

export function useAsync<T>(
  action: (...args: unknown[]) => Promise<T>,
  options: UseAsyncOptions = {},
): UseAsyncResult<T> {
  const {
    retries = DEFAULT_OPTIONS.retries,
    delay = DEFAULT_OPTIONS.delay,
    factor = DEFAULT_OPTIONS.factor,
    maxDelay = DEFAULT_OPTIONS.maxDelay,
    timeoutMs = DEFAULT_OPTIONS.timeoutMs,
    warningMs = DEFAULT_OPTIONS.warningMs,
    shouldRetry,
    onSuccess,
    onError,
    onTimeout,
    onRetry,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<NormalizedError | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [attempts, setAttempts] = useState(0);

  const run = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setStatus('loading');
      setError(null);
      setAttempts(0);

      let warningTimer: ReturnType<typeof setTimeout> | null = null;
      let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

      warningTimer = setTimeout(() => {
        setStatus((current) => (current === 'loading' ? 'warning' : current));
      }, warningMs);

      timeoutTimer = setTimeout(() => {
        setStatus((current) =>
          current === 'loading' || current === 'warning' ? 'timeout' : current,
        );
        onTimeout?.();
      }, timeoutMs);

      const clearTimers = () => {
        if (warningTimer) clearTimeout(warningTimer);
        if (timeoutTimer) clearTimeout(timeoutTimer);
      };

      try {
        const result = await retry(() => action(...args), {
          retries,
          delay,
          factor,
          maxDelay,
          shouldRetry,
          onRetry: (err, attempt) => {
            setAttempts(attempt);
            onRetry?.(err, attempt);
          },
        });

        clearTimers();
        setData(result);
        setStatus('success');
        onSuccess?.(result);
        return result;
      } catch (raw) {
        clearTimers();
        const normalized = normalizeError(raw);
        setError(normalized);
        setStatus((current) => (current === 'timeout' ? 'timeout' : 'error'));
        onError?.(normalized, raw);
        return null;
      }
    },
    [
      action,
      retries,
      delay,
      factor,
      maxDelay,
      shouldRetry,
      warningMs,
      timeoutMs,
      onSuccess,
      onError,
      onTimeout,
      onRetry,
    ],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus('idle');
    setAttempts(0);
  }, []);

  return useMemo(
    () => ({
      data,
      error,
      status,
      attempts,
      isIdle: status === 'idle',
      isLoading: status === 'loading' || status === 'warning',
      isWarning: status === 'warning',
      isSuccess: status === 'success',
      isTimeout: status === 'timeout',
      isError: status === 'error',
      isSettled:
        status === 'success' || status === 'error' || status === 'timeout',
      run,
      reset,
    }),
    [data, error, status, attempts, run, reset],
  );
}
