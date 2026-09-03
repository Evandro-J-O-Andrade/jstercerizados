import { useEffect, useRef, useState } from 'react';

export const DEFAULT_TIMEOUT_MS = 8000;
export const DEFAULT_WARNING_MS = 2000;

export interface UseTimeoutOptions {
  timeoutMs?: number;
  warningMs?: number;
}

export type TimeoutStatus = 'idle' | 'loading' | 'warning' | 'timed_out';

export function useTimeout({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningMs = DEFAULT_WARNING_MS,
}: UseTimeoutOptions = {}) {
  const [status, setStatus] = useState<TimeoutStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  };

  const start = () => {
    setStatus('loading');
    clearTimers();

    warningTimerRef.current = setTimeout(() => {
      setStatus('warning');
    }, warningMs);

    timerRef.current = setTimeout(() => {
      setStatus('timed_out');
    }, timeoutMs);
  };

  const reset = () => {
    clearTimers();
    setStatus('idle');
  };

  const stop = () => {
    clearTimers();
    setStatus('idle');
  };

  useEffect(() => clearTimers, []);

  return { status, start, stop, reset, isTimeout: status === 'timed_out' };
}

export function useTimeoutRunner<T>(
  action: () => Promise<T> | T,
  {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    warningMs = DEFAULT_WARNING_MS,
  }: UseTimeoutOptions = {},
) {
  const timeout = useTimeout({ timeoutMs, warningMs });
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const run = async (overrideAction?: () => Promise<T> | T) => {
    const fn = overrideAction ?? action;
    timeout.start();
    setIsPending(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      timeout.stop();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      timeout.stop();
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const reset = () => {
    timeout.reset();
    setError(null);
    setData(null);
    setIsPending(false);
  };

  return {
    data,
    error,
    isPending,
    isTimeout: timeout.isTimeout,
    status: timeout.status,
    run,
    reset,
  };
}
