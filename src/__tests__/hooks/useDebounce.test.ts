// src/__tests__/hooks/useDebounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBe('first');

    rerender({ value: 'second' });

    // Value should not change immediately
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('second');
  });

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => vi.advanceTimersByTime(200));

    rerender({ value: 'third' });
    act(() => vi.advanceTimersByTime(200));

    rerender({ value: 'fourth' });
    act(() => vi.advanceTimersByTime(200));

    // Still showing original value — no single timer has run for 500ms
    expect(result.current).toBe('first');

    act(() => vi.advanceTimersByTime(300));

    // Only the final value comes through
    expect(result.current).toBe('fourth');
  });

  it('uses custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('first');

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('second');
  });

  it('works with different types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 1 } }
    );

    rerender({ value: 42 });
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe(42);
  });

  it('works with objects', () => {
    const first = { a: 1 };
    const second = { a: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: first } }
    );

    rerender({ value: second });
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe(second);
  });
});
