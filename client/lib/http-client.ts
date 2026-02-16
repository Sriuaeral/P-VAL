import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { normalizeDateFields, formatToDDMMYYYY } from './utils';
import { config, getCurrentApiUrl, getEnvironment, shouldUseAzureFunctions, getCurrentDate, getCurrentTime, getCurrentTimestamp } from './config';
// import { AuthContext } from '@/contexts/AuthContext';

// Enterprise HTTP Client with SaaS Best Practices
export class HttpClient {
  private static instance: HttpClient;
  private axiosInstance: AxiosInstance;
  private retryQueue: Map<string, { count: number; timestamp: number }> = new Map();
  private circuitBreaker: Map<string, { failures: number; lastFailure: number; state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }> = new Map();

  private constructor() {
    const environment = getEnvironment();
    const baseURL = getCurrentApiUrl('');
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: config.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
        'X-Client-Platform': 'web',
        'X-Environment': environment,
      },
    });

    console.log('🌐 HTTP Client initialized:', {
      environment,
      baseURL,
      timeout: config.apiTimeout,
      useAzureFunctions: shouldUseAzureFunctions(),
    });

    this.setupInterceptors();
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication and logging
    this.axiosInstance.interceptors.request.use(
      async (requestConfig) => {
        // Add authentication token
        const token = this.getAuthToken();
        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        // Add Azure Functions API key for production
        if (config.isProduction && config.azureFunctionsApiKey) {
          requestConfig.headers['x-functions-key'] = config.azureFunctionsApiKey;
        }

        // Add request ID for tracing
        requestConfig.headers['X-Request-ID'] = this.generateRequestId();

        // Add current date and time as query parameters
        this.addDateTimeParams(requestConfig);

        // Normalize date fields in params and body to DD-MM-YYYY
        // Normalize known date-like params if present
        if (requestConfig.params) {
          requestConfig.params = normalizeDateFields(requestConfig.params);
          // Ensure our auto-injected date uses DD-MM-YYYY format
          if ((requestConfig.params as any).date) {
            (requestConfig.params as any).date = formatToDDMMYYYY((requestConfig.params as any).date);
          }
        }

        // Normalize body
        if (requestConfig.data) {
          requestConfig.data = normalizeDateFields(requestConfig.data);
        }

        // Log request in development
        if (config.isDevelopment) {
          console.log('🌐 HTTP Request:', {
            method: requestConfig.method?.toUpperCase(),
            url: requestConfig.url,
            headers: requestConfig.headers,
            data: requestConfig.data,
            timestamp: new Date().toISOString(),
          });
        }

        return requestConfig;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and retry logic
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Reset circuit breaker on success
        const endpoint = this.getEndpointFromUrl(response.config.url || '');
        this.resetCircuitBreaker(endpoint);
        
        // Clear retry queue on success
        this.retryQueue.delete(endpoint);

        // Log response in development
        if (config.isDevelopment) {
          console.log('✅ HTTP Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
            timestamp: new Date().toISOString(),
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const endpoint = this.getEndpointFromUrl(error.config?.url || '');
        
        // Handle circuit breaker
        if (this.isCircuitBreakerOpen(endpoint)) {
          throw new Error(`Service temporarily unavailable for ${endpoint}`);
        }

        // Handle different error types
        if (error.response?.status === 401) {
          // Handle authentication errors
          this.handleAuthError();
          throw new Error('Authentication required');
        } else if (error.response?.status === 429) {
          // Handle rate limiting with exponential backoff
          const retryAfter = error.response.headers['retry-after'] || '60';
          console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
          throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds`);
        } else if (error.response?.status >= 500) {
          // Handle server errors with retry logic
          return this.handleRetryableError(error, endpoint);
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          // Handle network errors
          return this.handleRetryableError(error, endpoint);
        }

        // Log error
        console.error('❌ HTTP Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
          timestamp: new Date().toISOString(),
        });

        this.recordCircuitBreakerFailure(endpoint);
        return Promise.reject(error);
      }
    );
  }

  private async handleRetryableError(error: AxiosError, endpoint: string): Promise<any> {
    const retryInfo = this.retryQueue.get(endpoint);
    const retryCount = retryInfo?.count || 0;
    const retryTimestamp = retryInfo?.timestamp || Date.now();
    
    // Clear old retry attempts (older than 5 minutes)
    if (Date.now() - retryTimestamp > 5 * 60 * 1000) {
      this.retryQueue.delete(endpoint);
      return this.handleRetryableError(error, endpoint);
    }
    
    if (retryCount < config.retry.maxAttempts && config.features.enableRetryLogic) {
      this.retryQueue.set(endpoint, { count: retryCount + 1, timestamp: retryTimestamp });
      
      const delay = config.retry.backoffDelay * Math.pow(2, retryCount);
      console.warn(`Retrying request to ${endpoint} in ${delay}ms (attempt ${retryCount + 1})`);
      
      await this.delay(delay);
      
      try {
        return await this.axiosInstance.request(error.config!);
      } catch (retryError) {
        // Don't recursively call handleRetryableError - let the response interceptor handle it
        throw retryError;
      }
    } else {
      // Clear the queue after max attempts
      this.retryQueue.delete(endpoint);
      this.recordCircuitBreakerFailure(endpoint);
      throw error;
    }
  }

  private handleAuthError(): void {
    // Clear auth token and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('isAuthenticated');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEndpointFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  private isCircuitBreakerOpen(endpoint: string): boolean {
    if (!config.features.enableCircuitBreaker) return false;
    
    const breaker = this.circuitBreaker.get(endpoint);
    if (!breaker) return false;

    const now = Date.now();
    const timeSinceLastFailure = now - breaker.lastFailure;

    if (breaker.state === 'OPEN' && timeSinceLastFailure < 60000) { // 1 minute
      return true;
    }

    if (breaker.state === 'OPEN' && timeSinceLastFailure >= 60000) {
      breaker.state = 'HALF_OPEN';
    }

    return false;
  }

  private recordCircuitBreakerFailure(endpoint: string): void {
    if (!config.features.enableCircuitBreaker) return;

    const breaker = this.circuitBreaker.get(endpoint) || { failures: 0, lastFailure: 0, state: 'CLOSED' as const };
    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= 5) {
      breaker.state = 'OPEN';
      console.warn(`Circuit breaker opened for ${endpoint} due to ${breaker.failures} failures`);
    }

    this.circuitBreaker.set(endpoint, breaker);
  }

  private resetCircuitBreaker(endpoint: string): void {
    if (!config.features.enableCircuitBreaker) return;

    const breaker = this.circuitBreaker.get(endpoint);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'CLOSED';
      this.circuitBreaker.set(endpoint, breaker);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Add current date and time as query parameters
  private addDateTimeParams(requestConfig: any): void {
    // Add to existing params or create new params object
    const existingParams = requestConfig.params || {};
    requestConfig.params = {
      ...existingParams,
      date: getCurrentDate(),        // DD-MM-YYYY format
      time: getCurrentTime(),        // HH:MM format
      timestamp: getCurrentTimestamp(), // ISO timestamp for precise timing
    };
  }

  // Public API methods
  public async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data;
  }

  public async post<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  }

  public async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, config);
    return response.data;
  }

  public async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }

  public async patch<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data, config);
    return response.data;
  }

  // Utility methods
  public createQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }


  // Get circuit breaker status
  public getCircuitBreakerStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    this.circuitBreaker.forEach((breaker, endpoint) => {
      status[endpoint] = {
        state: breaker.state,
        failures: breaker.failures,
        lastFailure: new Date(breaker.lastFailure).toISOString(),
      };
    });
    return status;
  }
}

// Export singleton instance
export const httpClient = HttpClient.getInstance();
export default httpClient;
