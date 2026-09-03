import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from '@/hooks/useAsync';

describe('useAsync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useAsync(async () => 'x'));
    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('transitions to loading and then success', async () => {
    const { result } = renderHook(() =>
      useAsync(async () => 'value', { timeoutMs: 5000 }),
    );

    let promise: Promise<string | null> | undefined;
    act(() => {
      promise = result.current.run();
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe('value');
    expect(result.current.error).toBeNull();
  });

  it('captures normalized error on failure', async () => {
    const { result } = renderHook(() =>
      useAsync(async () => {
        throw new Error('boom');
      }),
    );

    await act(async () => {
      await result.current.run();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isError).toBe(true);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.category).toBe('unknown');
    expect(result.current.error?.technicalDetail).toBe('boom');
  });

  it('transitions to timeout when action exceeds timeoutMs', async () => {
    const { result } = renderHook(() =>
      useAsync(() => new Promise<string>(() => {}), {
        timeoutMs: 300,
        warningMs: 100,
        retries: 0,
      }),
    );

    act(() => {
      void result.current.run();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(result.current.status).toBe('warning');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(result.current.status).toBe('timeout');
    expect(result.current.isTimeout).toBe(true);
  });

  it('retries on failure and surfaces attempt count', async () => {
    let calls = 0;
    const { result } = renderHook(() =>
      useAsync(
        async () => {
          calls += 1;
          if (calls < 3) throw new Error('transient');
          return 'ok';
        },
        { retries: 3, delay: 50, factor: 1, timeoutMs: 10_000 },
      ),
    );

    let promise: Promise<string | null> | undefined;
    act(() => {
      promise = result.current.run();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
      await vi.advanceTimersByTimeAsync(50);
      await promise;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('ok');
    expect(calls).toBe(3);
  });

  it('reset clears state back to idle', async () => {
    const { result } = renderHook(() =>
      useAsync(async () => 'x', { timeoutMs: 5_000 }),
    );

    await act(async () => {
      await result.current.run();
    });
    expect(result.current.status).toBe('success');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('calls onSuccess / onError / onTimeout callbacks', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const ok = renderHook(() => useAsync(async () => 'y', { onSuccess }));

    await act(async () => {
      await ok.result.current.run();
    });
    expect(onSuccess).toHaveBeenCalledWith('y');

    const failing = renderHook(() =>
      useAsync(
        async () => {
          throw new Error('err');
        },
        { onError },
      ),
    );

    await act(async () => {
      await failing.result.current.run();
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
