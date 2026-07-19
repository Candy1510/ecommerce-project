// src/__tests__/stores/useToastStore.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToastStore, toast } from '../../stores/useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToastStore());
    act(() => {
      result.current.clearAll();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with no toasts', () => {
    const { result } = renderHook(() => useToastStore());
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast({
        type: 'success',
        message: 'Test message',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: 'success',
      message: 'Test message',
    });
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it('removes a toast', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast({
        type: 'info',
        message: 'Test message',
      });
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('clears all toasts', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast({ type: 'success', message: 'Message 1' });
      result.current.addToast({ type: 'error', message: 'Message 2' });
      result.current.addToast({ type: 'warning', message: 'Message 3' });
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.toasts).toEqual([]);
  });

  it('auto-removes toast after default duration', async () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast({
        type: 'success',
        message: 'Auto-remove test',
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    // Fast-forward time and run pending timers
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve(); // Allow setTimeout callback to execute
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('auto-removes toast after custom duration', async () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast({
        type: 'success',
        message: 'Custom duration test',
        duration: 3000,
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    // Fast-forward time and run pending timers
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('does not auto-remove when duration is 0', async () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast({
        type: 'info',
        message: 'Persistent toast',
        duration: 0,
      });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  describe('toast helper functions', () => {
    it('toast.success adds success toast', () => {
      act(() => {
        toast.success('Success message');
      });

      const { result } = renderHook(() => useToastStore());
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('success');
      expect(result.current.toasts[0].message).toBe('Success message');
    });

    it('toast.error adds error toast', () => {
      act(() => {
        toast.error('Error message');
      });

      const { result } = renderHook(() => useToastStore());
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('error');
    });

    it('toast.warning adds warning toast', () => {
      act(() => {
        toast.warning('Warning message');
      });

      const { result } = renderHook(() => useToastStore());
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('warning');
    });

    it('toast.info adds info toast', () => {
      act(() => {
        toast.info('Info message');
      });

      const { result } = renderHook(() => useToastStore());
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].type).toBe('info');
    });

    it('accepts custom duration in helper functions', () => {
      act(() => {
        toast.success('Custom duration', 10000);
      });

      const { result } = renderHook(() => useToastStore());
      expect(result.current.toasts[0].duration).toBe(10000);
    });
  });

  it('generates unique IDs for each toast', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast({ type: 'success', message: 'Message 1' });
      result.current.addToast({ type: 'success', message: 'Message 2' });
    });

    const id1 = result.current.toasts[0].id;
    const id2 = result.current.toasts[1].id;

    expect(id1).not.toBe(id2);
  });
});