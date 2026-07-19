// src/__tests__/hooks/useDebounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBe('first');

    // Change value
    rerender({ value: 'second' });

    // Value should not change immediately
    expect(result.current).toBe('first');

    // Fast-forward time
    vi.advanceTimersByTime(500);

    // Now value should be updated
    await waitFor(() => {
      expect(result.current).toBe('second');
    });
  });

  it('cancels previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    // Rapid changes
    rerender({ value: 'second' });
    vi.advanceTimersByTime(200);

    rerender({ value: 'third' });
    vi.advanceTimersByTime(200);

    rerender({ value: 'fourth' });
    vi.advanceTimersByTime(200);

    // Still showing original value
    expect(result.current).toBe('first');

    // Wait for full delay from last change
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe('fourth');
    });
  });

  it('uses custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });

    // 500ms should not be enough
    vi.advanceTimersByTime(500);
    expect(result.current).toBe('first');

    // 1000ms should update
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe('second');
    });
  });

  it('works with different types', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 123 } }
    );

    expect(result.current).toBe(123);

    rerender({ value: 456 });
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toBe(456);
    });
  });

  it('works with objects', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { name: 'John' } } }
    );

    expect(result.current).toEqual({ name: 'John' });

    rerender({ value: { name: 'Jane' } });
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current).toEqual({ name: 'Jane' });
    });
  });
});