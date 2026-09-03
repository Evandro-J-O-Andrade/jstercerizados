export interface RetryOptions {
  retries?: number;
  delay?: number;
  factor?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

export const DEFAULT_RETRY_OPTIONS: Required<
  Omit<RetryOptions, 'shouldRetry' | 'onRetry'>
> = {
  retries: 3,
  delay: 500,
  factor: 2,
  maxDelay: 10000,
};

export function calculateDelay(
  attempt: number,
  delay: number,
  factor: number,
  maxDelay: number,
): number {
  const rawDelay = delay * Math.pow(factor, attempt - 1);
  return Math.min(rawDelay, maxDelay);
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = DEFAULT_RETRY_OPTIONS.retries,
    delay = DEFAULT_RETRY_OPTIONS.delay,
    factor = DEFAULT_RETRY_OPTIONS.factor,
    maxDelay = DEFAULT_RETRY_OPTIONS.maxDelay,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries || !shouldRetry(err)) {
        throw err;
      }
      onRetry?.(err, attempt + 1);
      const wait = calculateDelay(attempt + 1, delay, factor, maxDelay);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }

  throw lastError;
}

export interface RetryableFn<T> {
  (...args: unknown[]): Promise<T>;
}

export function withRetry<T>(
  fn: RetryableFn<T>,
  options: RetryOptions = {},
): RetryableFn<T> {
  return async (...args: unknown[]): Promise<T> => {
    return retry(() => fn(...args), options);
  };
}
