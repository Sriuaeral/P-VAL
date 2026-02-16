// Enterprise Error Handler for SaaS Platform
export interface ErrorContext {
  userId?: string;
  plantId?: string;
  operation?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export interface SaaSError extends Error {
  code: string;
  statusCode: number;
  context: ErrorContext;
  isRetryable: boolean;
  userMessage: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: SaaSError; timestamp: string }> = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Create structured error
  public createError(
    message: string,
    code: string,
    statusCode: number = 500,
    context: Partial<ErrorContext> = {},
    isRetryable: boolean = false,
    userMessage?: string
  ): SaaSError {
    const error = new Error(message) as SaaSError;
    error.code = code;
    error.statusCode = statusCode;
    error.context = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    };
    error.isRetryable = isRetryable;
    error.userMessage = userMessage || this.getUserFriendlyMessage(code, statusCode);

    // Log error
    this.logError(error);

    return error;
  }

  // Handle different types of errors
  public handleApiError(error: any, context: Partial<ErrorContext> = {}): SaaSError {
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const code = this.getErrorCodeFromStatus(statusCode);
      
      return this.createError(
        error.response.data?.message || error.message,
        code,
        statusCode,
        context,
        this.isRetryableStatus(statusCode),
        this.getUserFriendlyMessage(code, statusCode)
      );
    } else if (error.request) {
      // Network error
      return this.createError(
        'Network error occurred',
        'NETWORK_ERROR',
        0,
        context,
        true,
        'Unable to connect to the server. Please check your internet connection.'
      );
    } else {
      // Other error
      return this.createError(
        error.message || 'An unexpected error occurred',
        'UNKNOWN_ERROR',
        500,
        context,
        false,
        'An unexpected error occurred. Please try again.'
      );
    }
  }

  // Handle authentication errors
  public handleAuthError(error: any, context: Partial<ErrorContext> = {}): SaaSError {
    return this.createError(
      'Authentication failed',
      'AUTH_ERROR',
      401,
      context,
      false,
      'Your session has expired. Please log in again.'
    );
  }

  // Handle validation errors
  public handleValidationError(
    message: string,
    field?: string,
    context: Partial<ErrorContext> = {}
  ): SaaSError {
    return this.createError(
      message,
      'VALIDATION_ERROR',
      400,
      { ...context, field },
      false,
      `Invalid input: ${message}`
    );
  }

  // Handle rate limiting
  public handleRateLimitError(
    retryAfter?: number,
    context: Partial<ErrorContext> = {}
  ): SaaSError {
    const message = retryAfter 
      ? `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      : 'Rate limit exceeded. Please try again later.';

    return this.createError(
      message,
      'RATE_LIMIT_ERROR',
      429,
      context,
      true,
      message
    );
  }

  // Get user-friendly error messages
  private getUserFriendlyMessage(code: string, statusCode: number): string {
    const messages: Record<string, string> = {
      'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection.',
      'AUTH_ERROR': 'Your session has expired. Please log in again.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'RATE_LIMIT_ERROR': 'Too many requests. Please wait a moment and try again.',
      'NOT_FOUND': 'The requested resource was not found.',
      'FORBIDDEN': 'You do not have permission to access this resource.',
      'SERVER_ERROR': 'The server is experiencing issues. Please try again later.',
      'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable. Please try again later.',
    };

    if (messages[code]) {
      return messages[code];
    }

    // Fallback based on status code
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Get error code from HTTP status
  private getErrorCodeFromStatus(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'AUTH_ERROR';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 429:
        return 'RATE_LIMIT_ERROR';
      case 500:
        return 'SERVER_ERROR';
      case 502:
      case 503:
      case 504:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  // Check if status code is retryable
  private isRetryableStatus(statusCode: number): boolean {
    return [408, 429, 500, 502, 503, 504].includes(statusCode);
  }

  // Log error for monitoring
  private logError(error: SaaSError): void {
    this.errorLog.push({
      error,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (import.meta.env.MODE === 'development') {
      console.error('🚨 SaaS Error:', {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        statusCode: error.statusCode,
        context: error.context,
        isRetryable: error.isRetryable,
        stack: error.stack,
      });
    }

    // TODO: Send to monitoring service in production
    // this.sendToMonitoringService(error);
  }

  // Get error statistics
  public getErrorStats(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    recentErrors: Array<{ error: SaaSError; timestamp: string }>;
  } {
    const errorsByCode: Record<string, number> = {};
    
    this.errorLog.forEach(({ error }) => {
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;
    });

    return {
      totalErrors: this.errorLog.length,
      errorsByCode,
      recentErrors: this.errorLog.slice(-10), // Last 10 errors
    };
  }

  // Clear error log
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  // Send to monitoring service (placeholder)
  private async sendToMonitoringService(error: SaaSError): Promise<void> {
    // TODO: Implement integration with monitoring service
    // Examples: Sentry, LogRocket, DataDog, etc.
    console.log('Would send to monitoring service:', error);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility function for easy error creation
export const createError = (
  message: string,
  code: string,
  statusCode: number = 500,
  context: Partial<ErrorContext> = {},
  isRetryable: boolean = false,
  userMessage?: string
): SaaSError => {
  return errorHandler.createError(message, code, statusCode, context, isRetryable, userMessage);
};

// Utility function for handling API errors
export const handleApiError = (error: any, context: Partial<ErrorContext> = {}): SaaSError => {
  return errorHandler.handleApiError(error, context);
};
