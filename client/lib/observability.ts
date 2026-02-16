// Enterprise Observability for SaaS Platform
export interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  tags: Record<string, string>;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: string;
  success: boolean;
  errorCode?: string;
}

export interface UserAction {
  action: string;
  userId?: string;
  plantId?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export class ObservabilityService {
  private static instance: ObservabilityService;
  private metrics: MetricData[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private userActions: UserAction[] = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceObserver();
  }

  public static getInstance(): ObservabilityService {
    if (!ObservabilityService.instance) {
      ObservabilityService.instance = new ObservabilityService();
    }
    return ObservabilityService.instance;
  }

  // Performance monitoring
  public trackPerformance(operation: string, startTime: number, success: boolean, errorCode?: string): void {
    const duration = Date.now() - startTime;
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      success,
      errorCode,
    };

    this.performanceMetrics.push(metric);

    // Keep only last 1000 performance metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Log slow operations
    if (duration > 5000) { // 5 seconds
      console.warn(`🐌 Slow operation detected: ${operation} took ${duration}ms`);
    }

    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.log(`📊 Performance: ${operation} - ${duration}ms (${success ? 'success' : 'failed'})`);
    }
  }

  // User action tracking
  public trackUserAction(action: string, metadata: Record<string, any> = {}): void {
    const userAction: UserAction = {
      action,
      userId: this.getCurrentUserId(),
      plantId: this.getCurrentPlantId(),
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.userActions.push(userAction);

    // Keep only last 500 user actions
    if (this.userActions.length > 500) {
      this.userActions = this.userActions.slice(-500);
    }

    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.log(`👤 User Action: ${action}`, metadata);
    }
  }

  // Custom metrics
  public trackMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    const metric: MetricData = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags: {
        sessionId: this.sessionId,
        userId: this.getCurrentUserId() || 'anonymous',
        ...tags,
      },
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.log(`📈 Metric: ${name} = ${value}`, tags);
    }
  }

  // API call tracking
  public trackApiCall(endpoint: string, method: string, duration: number, success: boolean, statusCode?: number): void {
    this.trackPerformance(`API_${method}_${endpoint}`, Date.now() - duration, success, statusCode?.toString());
    this.trackMetric('api_calls_total', 1, {
      endpoint,
      method,
      status: success ? 'success' : 'error',
      statusCode: statusCode?.toString() || 'unknown',
    });
  }

  // Page load tracking
  public trackPageLoad(page: string, loadTime: number): void {
    this.trackPerformance(`PAGE_LOAD_${page}`, Date.now() - loadTime, true);
    this.trackMetric('page_load_time', loadTime, { page });
    this.trackUserAction('page_view', { page, loadTime });
  }

  // Error tracking
  public trackError(error: Error, context: Record<string, any> = {}): void {
    this.trackMetric('errors_total', 1, {
      errorType: error.constructor.name,
      errorMessage: error.message,
      ...context,
    });

    this.trackUserAction('error_occurred', {
      errorType: error.constructor.name,
      errorMessage: error.message,
      ...context,
    });

    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.error('🚨 Error tracked:', error, context);
    }
  }

  // Business metrics
  public trackBusinessMetric(metricName: string, value: number, plantId?: string): void {
    this.trackMetric(`business_${metricName}`, value, {
      plantId: plantId || 'global',
      category: 'business',
    });
  }

  // Get analytics data
  public getAnalytics(): {
    sessionId: string;
    performanceMetrics: PerformanceMetric[];
    userActions: UserAction[];
    metrics: MetricData[];
    summary: {
      totalApiCalls: number;
      averageResponseTime: number;
      errorRate: number;
      mostUsedFeatures: string[];
    };
  } {
    const apiCalls = this.performanceMetrics.filter(m => m.operation.startsWith('API_'));
    const successfulCalls = apiCalls.filter(m => m.success);
    const failedCalls = apiCalls.filter(m => !m.success);

    const averageResponseTime = successfulCalls.length > 0
      ? successfulCalls.reduce((sum, m) => sum + m.duration, 0) / successfulCalls.length
      : 0;

    const errorRate = apiCalls.length > 0 ? (failedCalls.length / apiCalls.length) * 100 : 0;

    const actionCounts: Record<string, number> = {};
    this.userActions.forEach(action => {
      actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
    });

    const mostUsedFeatures = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action]) => action);

    return {
      sessionId: this.sessionId,
      performanceMetrics: this.performanceMetrics,
      userActions: this.userActions,
      metrics: this.metrics,
      summary: {
        totalApiCalls: apiCalls.length,
        averageResponseTime,
        errorRate,
        mostUsedFeatures,
      },
    };
  }

  // Export data for external monitoring
  public exportData(): string {
    const analytics = this.getAnalytics();
    return JSON.stringify(analytics, null, 2);
  }

  // Clear all data
  public clearData(): void {
    this.metrics = [];
    this.performanceMetrics = [];
    this.userActions = [];
  }

  // Private helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : null;
    } catch {
      return null;
    }
  }

  private getCurrentPlantId(): string | null {
    try {
      const path = window.location.pathname;
      const match = path.match(/\/plants\/([^\/]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  private initializePerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.trackPageLoad(window.location.pathname, navEntry.loadEventEnd - navEntry.navigationStart);
            }
          });
        });

        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }
}

// Export singleton instance
export const observability = ObservabilityService.getInstance();

// Utility functions for easy tracking
export const trackPerformance = (operation: string, startTime: number, success: boolean, errorCode?: string): void => {
  observability.trackPerformance(operation, startTime, success, errorCode);
};

export const trackUserAction = (action: string, metadata: Record<string, any> = {}): void => {
  observability.trackUserAction(action, metadata);
};

export const trackMetric = (name: string, value: number, tags: Record<string, string> = {}): void => {
  observability.trackMetric(name, value, tags);
};

export const trackApiCall = (endpoint: string, method: string, duration: number, success: boolean, statusCode?: number): void => {
  observability.trackApiCall(endpoint, method, duration, success, statusCode);
};

export const trackError = (error: Error, context: Record<string, any> = {}): void => {
  observability.trackError(error, context);
};

// Performance decorator for methods
export function trackPerformanceMethod(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const operation = operationName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;
      let errorCode: string | undefined;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        errorCode = error instanceof Error ? error.constructor.name : 'Unknown';
        throw error;
      } finally {
        observability.trackPerformance(operation, startTime, success, errorCode);
      }
    };
  };
}
