import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retry, calculateDelay, withRetry } from '@/lib/async';

describe('calculateDelay', () => {
  it('calculates linear delay for first attempt', () => {
    expect(calculateDelay(1, 500, 2, 10000)).toBe(500);
  });

  it('applies exponential factor for subsequent attempts', () => {
    expect(calculateDelay(1, 500, 2, 10000)).toBe(500);
    expect(calculateDelay(2, 500, 2, 10000)).toBe(1000);
    expect(calculateDelay(3, 500, 2, 10000)).toBe(2000);
  });

  it('caps delay at maxDelay', () => {
    expect(calculateDelay(10, 100, 2, 1000)).toBe(1000);
  });
});

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the value on successful first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds eventually', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const promise = retry(fn, { retries: 3, delay: 100, factor: 1 });

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting retries', async () => {
    const error = new Error('always fail');
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.reject(error);
    };

    const result = retry(fn, { retries: 2, delay: 100, factor: 1 });
    const rejection = expect(result).rejects.toThrow('always fail');

    await vi.advanceTimersByTimeAsync(200);

    await rejection;
    expect(callCount).toBe(3);
  });

  it('does not retry when shouldRetry returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fatal'));

    const promise = retry(fn, {
      retries: 3,
      shouldRetry: () => false,
    });

    await expect(promise).rejects.toThrow('fatal');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry callback with error and attempt number', async () => {
    const onRetry = vi.fn();
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValue('success');

    const promise = retry(fn, { retries: 3, delay: 100, factor: 1, onRetry });

    await vi.advanceTimersByTimeAsync(100);
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('wraps a function with retry behavior', async () => {
    const original = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const wrapped = withRetry(original, { retries: 2, delay: 50, factor: 1 });

    const promise = wrapped('arg1', 'arg2');

    await vi.advanceTimersByTimeAsync(50);
    const result = await promise;

    expect(result).toBe('ok');
    expect(original).toHaveBeenCalledWith('arg1', 'arg2');
    expect(original).toHaveBeenCalledTimes(2);
  });

  it('passes through the error after exhausting retries', async () => {
    const error = new Error('boom');
    let callCount = 0;
    const original = () => {
      callCount++;
      return Promise.reject(error);
    };

    const wrapped = withRetry(original, { retries: 1, delay: 50, factor: 1 });

    const result = wrapped();
    const rejection = expect(result).rejects.toThrow('boom');

    await vi.advanceTimersByTimeAsync(50);

    await rejection;
    expect(callCount).toBe(2);
  });
});
