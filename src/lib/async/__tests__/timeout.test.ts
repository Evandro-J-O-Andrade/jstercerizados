import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  useTimeout,
  useTimeoutRunner,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_WARNING_MS,
} from '@/lib/async';
import { renderHook, act } from '@testing-library/react';

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes in idle state', () => {
    const { result } = renderHook(() => useTimeout());
    expect(result.current.status).toBe('idle');
    expect(result.current.isTimeout).toBe(false);
  });

  it('transitions to loading after start', () => {
    const { result } = renderHook(() => useTimeout());
    act(() => result.current.start());
    expect(result.current.status).toBe('loading');
  });

  it('transitions to warning after warningMs', () => {
    const { result } = renderHook(() => useTimeout({ warningMs: 100 }));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.status).toBe('warning');
  });

  it('transitions to timed_out after timeoutMs', () => {
    const { result } = renderHook(() => useTimeout({ timeoutMs: 500 }));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.status).toBe('timed_out');
    expect(result.current.isTimeout).toBe(true);
  });

  it('resets to idle from any state', () => {
    const { result } = renderHook(() => useTimeout());
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10000));
    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');
    expect(result.current.isTimeout).toBe(false);
  });

  it('stops and clears timers', () => {
    const { result } = renderHook(() => useTimeout({ timeoutMs: 500 }));
    act(() => result.current.start());
    act(() => result.current.stop());
    expect(result.current.status).toBe('idle');
  });

  it('exports default constants', () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(8000);
    expect(DEFAULT_WARNING_MS).toBe(2000);
  });
});

describe('useTimeoutRunner', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      shouldClearTimeout: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the action and sets data on success', async () => {
    const { result } = renderHook(() =>
      useTimeoutRunner(() => Promise.resolve('data-value')),
    );

    await act(async () => {
      const data = await result.current.run();
      expect(data).toBe('data-value');
    });

    expect(result.current.data).toBe('data-value');
    expect(result.current.error).toBeNull();
  });

  it('sets error when action throws', async () => {
    const { result } = renderHook(() =>
      useTimeoutRunner(() => Promise.reject(new Error('test error'))),
    );

    await act(async () => {
      await expect(result.current.run()).rejects.toThrow('test error');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('test error');
  });
});
