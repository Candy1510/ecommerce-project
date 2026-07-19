// src/__tests__/utils/error-handler.test.ts
import { describe, it, expect, vi } from 'vitest';
import {
  ApiError,
  NetworkError,
  ValidationError,
  getErrorMessage,
  getStatusErrorMessage,
  handleApiError,
  isRetryableError,
  retry,
} from '../../utils/error-handler';

// Mock toast
vi.mock('../../stores/useToastStore', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('Error Classes', () => {
  describe('ApiError', () => {
    it('creates ApiError with all properties', () => {
      const error = new ApiError('Not found', 404, 'NOT_FOUND', { id: '123' });

      expect(error.message).toBe('Not found');
      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.details).toEqual({ id: '123' });
      expect(error.name).toBe('ApiError');
    });

    it('creates ApiError with minimal properties', () => {
      const error = new ApiError('Server error');

      expect(error.message).toBe('Server error');
      expect(error.status).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('NetworkError', () => {
    it('creates NetworkError with default message', () => {
      const error = new NetworkError();

      expect(error.message).toBe('Network error occurred. Please check your connection.');
      expect(error.name).toBe('NetworkError');
    });

    it('creates NetworkError with custom message', () => {
      const error = new NetworkError('Custom network error');

      expect(error.message).toBe('Custom network error');
    });
  });

  describe('ValidationError', () => {
    it('creates ValidationError with errors object', () => {
      const errors = {
        email: ['Invalid format', 'Required'],
        password: ['Too short'],
      };
      const error = new ValidationError('Validation failed', errors);

      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
    });
  });
});

describe('getErrorMessage', () => {
  it('extracts message from ApiError', () => {
    const error = new ApiError('API error message', 500);
    expect(getErrorMessage(error)).toBe('API error message');
  });

  it('extracts message from NetworkError', () => {
    const error = new NetworkError('Network issue');
    expect(getErrorMessage(error)).toBe('Network issue');
  });

  it('extracts message from ValidationError', () => {
    const error = new ValidationError('Validation failed', {});
    expect(getErrorMessage(error)).toBe('Validation failed');
  });

  it('extracts message from standard Error', () => {
    const error = new Error('Standard error');
    expect(getErrorMessage(error)).toBe('Standard error');
  });

  it('handles string errors', () => {
    expect(getErrorMessage('String error')).toBe('String error');
  });

  it('returns default message for unknown errors', () => {
    expect(getErrorMessage({ random: 'object' })).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });
});

describe('getStatusErrorMessage', () => {
  it('returns correct message for 400', () => {
    expect(getStatusErrorMessage(400)).toBe('Bad request. Please check your input.');
  });

  it('returns correct message for 401', () => {
    expect(getStatusErrorMessage(401)).toBe('You are not authenticated. Please log in.');
  });

  it('returns correct message for 404', () => {
    expect(getStatusErrorMessage(404)).toBe('The requested resource was not found.');
  });

  it('returns correct message for 500', () => {
    expect(getStatusErrorMessage(500)).toBe('Server error. Please try again later.');
  });

  it('returns default message for unknown status', () => {
    expect(getStatusErrorMessage(999)).toBe('An error occurred. Please try again.');
  });
});

describe('handleApiError', () => {
  it('creates ApiError from error with status', () => {
    const error = {
      status: 404,
      message: 'Not found',
      code: 'NOT_FOUND',
    };

    const apiError = handleApiError(error);

    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.status).toBe(404);
    expect(apiError.message).toBe('Not found');
  });

  it('uses status-specific message when message is not provided', () => {
    const error = { status: 403 };

    const apiError = handleApiError(error);

    expect(apiError.message).toBe('You do not have permission to perform this action.');
  });

  it('throws NetworkError when offline', () => {
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const error = { message: 'Network error occurred' };

    expect(() => handleApiError(error)).toThrow(NetworkError);

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine,
    });
  });

  it('creates ApiError from generic error', () => {
    const error = new Error('Generic error');

    const apiError = handleApiError(error);

    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.message).toBe('Generic error');
  });
});

describe('isRetryableError', () => {
  it('returns true for NetworkError', () => {
    const error = new NetworkError();
    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for retryable status codes', () => {
    const retryableCodes = [408, 429, 500, 502, 503, 504];

    retryableCodes.forEach((code) => {
      const error = new ApiError('Error', code);
      expect(isRetryableError(error)).toBe(true);
    });
  });

  it('returns false for non-retryable status codes', () => {
    const nonRetryableCodes = [400, 401, 403, 404];

    nonRetryableCodes.forEach((code) => {
      const error = new ApiError('Error', code);
      expect(isRetryableError(error)).toBe(false);
    });
  });

  it('returns false for generic errors', () => {
    const error = new Error('Generic error');
    expect(isRetryableError(error)).toBe(false);
  });
});

describe('retry', () => {
  it('succeeds on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await retry(fn, { retries: 3 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await retry(fn, { retries: 3, delay: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

    await expect(retry(fn, { retries: 2, delay: 10 })).rejects.toThrow('Always fails');

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('calls onRetry callback', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockResolvedValue('success');

    const onRetry = vi.fn();

    await retry(fn, { retries: 3, delay: 10, onRetry });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('uses exponential backoff', async () => {
    vi.useFakeTimers();

    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const promise = retry(fn, { retries: 3, delay: 100 });

    // First retry: 100ms * 1
    await vi.advanceTimersByTimeAsync(100);

    // Second retry: 100ms * 2
    await vi.advanceTimersByTimeAsync(200);

    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);

    vi.restoreAllMocks();
  });
});
