// src/__tests__/hooks/useForm.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from '../../hooks/useForm';

describe('useForm', () => {
  it('initializes with provided values', () => {
    const initialValues = { email: 'test@example.com', password: '' };
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.values).toEqual(initialValues);
  });

  it('updates values on change', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'new@example.com', type: 'text' },
      } as unknown);
    });

    expect(result.current.values.email).toBe('new@example.com');
  });

  it('handles checkbox changes', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { agreeToTerms: false },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'agreeToTerms', checked: true, type: 'checkbox' },
      } as unknown);
    });

    expect(result.current.values.agreeToTerms).toBe(true);
  });

  it('validates on blur', () => {
    const validate = vi.fn((values) => {
      const errors: unknown = {};
      if (!values.email) {
        errors.email = 'Required';
      }
      return errors;
    });

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validate,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(validate).toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Required');
    expect(result.current.touched.email).toBe(true);
  });

  it('clears error when field is edited', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validate: (values) => (values.email ? {} : { email: 'Required' }),
        onSubmit: vi.fn(),
      })
    );

    // Trigger error
    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Required');

    // Edit field
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com', type: 'text' },
      } as unknown);
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('validates before submit', async () => {
    const validate = vi.fn((values) => ({
      email: !values.email ? 'Required' : undefined,
    }));
    const onSubmit = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validate,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown);
    });

    expect(validate).toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when validation passes', async () => {
    const onSubmit = vi.fn();
    const validate = () => ({});

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com' },
        validate,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown);
    });

    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('sets isSubmitting during submit', async () => {
    const onSubmit = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com' },
        onSubmit,
      })
    );

    expect(result.current.isSubmitting).toBe(false);

    const submitPromise = act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown);
    });

    // During submission
    expect(result.current.isSubmitting).toBe(true);

    await submitPromise;

    // After submission
    expect(result.current.isSubmitting).toBe(false);
  });

  it('marks all fields as touched on submit attempt', async () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '', name: '' },
        validate: () => ({ email: 'Required' }),
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.touched).toEqual({});

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown);
    });

    expect(result.current.touched).toEqual({
      email: true,
      password: true,
      name: true,
    });
  });

  it('resets form to initial values', () => {
    const initialValues = { email: 'initial@example.com', password: '' };
    const { result } = renderHook(() =>
      useForm({
        initialValues,
        onSubmit: vi.fn(),
      })
    );

    // Change values
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'changed@example.com', type: 'text' },
      } as unknown);
    });

    // Set errors and touched
    act(() => {
      result.current.setFieldError('email', 'Error');
      result.current.handleBlur('email');
    });

    expect(result.current.values.email).toBe('changed@example.com');
    expect(result.current.errors.email).toBe('Error');
    expect(result.current.touched.email).toBe(true);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('allows setting individual field values', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setFieldValue('email', 'manual@example.com');
    });

    expect(result.current.values.email).toBe('manual@example.com');
  });

  it('allows setting all values at once', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setValues({ email: 'new@example.com', password: 'secret' });
    });

    expect(result.current.values).toEqual({
      email: 'new@example.com',
      password: 'secret',
    });
  });

  it('allows setting field errors manually', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setFieldError('email', 'Custom error');
    });

    expect(result.current.errors.email).toBe('Custom error');
  });
});