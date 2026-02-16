import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { errorHandler } from '@/lib/error-handler';
import { observability } from '@/lib/observability';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to observability
    observability.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Create structured error
    const saasError = errorHandler.createError(
      error.message,
      'REACT_ERROR_BOUNDARY',
      500,
      {
        operation: 'component_render',
        componentStack: errorInfo.componentStack,
      },
      false,
      'Something went wrong while rendering this component. Please try refreshing the page.'
    );

    this.setState({
      error: saasError,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(saasError, errorInfo);
    }

    console.error('🚨 Error Boundary caught an error:', {
      error: saasError,
      errorInfo,
      errorId: this.state.errorId,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We're sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details */}
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details</h3>
                  <div className="text-sm text-red-700 space-y-1">
                    <p><strong>Message:</strong> {this.state.error.userMessage}</p>
                    <p><strong>Error ID:</strong> <code className="bg-red-100 px-1 rounded">{this.state.errorId}</code></p>
                    {import.meta.env.MODE === 'development' && (
                      <>
                        <p><strong>Technical Details:</strong></p>
                        <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
                          {this.state.error.message}
                        </pre>
                        {this.state.errorInfo && (
                          <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                <Button
                  onClick={this.handleRefresh}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Page
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  If this problem persists, please contact support with the Error ID above.
                </p>
                <p className="mt-1">
                  You can also try refreshing the page or going back to the home page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  const throwError = (error: Error) => {
    throw error;
  };

  const handleError = (error: Error, context?: Record<string, any>) => {
    // Log error to observability
    observability.trackError(error, context);
    
    // Create structured error
    const saasError = errorHandler.createError(
      error.message,
      'FUNCTIONAL_COMPONENT_ERROR',
      500,
      {
        operation: 'functional_component',
        ...context,
      },
      false,
      'An error occurred in the application. Please try again.'
    );

    throw saasError;
  };

  return { throwError, handleError };
};

// Higher-order component for error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
