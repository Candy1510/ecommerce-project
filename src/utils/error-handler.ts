// src/utils/error-handler.ts
import { toast } from '../stores/useToastStore';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export class ApiError extends Error implements AppError {
  code?: string;
  status?: number;
  details?: Record<string, unknown>;

  constructor(message: string, status?: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Error message mapping
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request. Please check your input.',
  401: 'You are not authenticated. Please log in.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. This resource may already exist.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Bad gateway. The server is temporarily unavailable.',
  503: 'Service unavailable. Please try again later.',
  504: 'Gateway timeout. The server took too long to respond.',
};

// Get user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    return error.message;
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
};

// Get status-specific error message
export const getStatusErrorMessage = (status: number): string => {
  return ERROR_MESSAGES[status] || 'An error occurred. Please try again.';
};

// Type guard for error-like objects coming from the API client
const isErrorLike = (
  error: unknown
): error is {
  message?: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
} => {
  return typeof error === 'object' && error !== null;
};

// Handle API error response
export const handleApiError = (error: unknown): ApiError => {
  if (isErrorLike(error) && error.status) {
    const message = error.message || getStatusErrorMessage(error.status);
    return new ApiError(message, error.status, error.code, error.details);
  }

  if (
    (isErrorLike(error) && error.message === 'Network error occurred') ||
    !navigator.onLine
  ) {
    throw new NetworkError();
  }

  return new ApiError(getErrorMessage(error));
};

// Display error toast
export const showErrorToast = (error: unknown) => {
  const message = getErrorMessage(error);
  toast.error(message);
};

// Log error to external service (placeholder)
export const logError = (error: Error, context?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // Example:
  // Sentry.captureException(error, { extra: context });
};

// Retry logic for failed requests
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> => {
  const { retries = 3, delay = 1000, onRetry } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        if (onRetry) {
          onRetry(attempt, lastError);
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError!;
};

// Check if error is retryable
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof NetworkError) {
    return true;
  }

  if (error instanceof ApiError) {
    // Retry on specific status codes
    return [408, 429, 500, 502, 503, 504].includes(error.status || 0);
  }

  return false;
};