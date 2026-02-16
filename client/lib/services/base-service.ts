import { httpClient } from '../http-client';
import { config } from '../config';

// Base service class with common SaaS patterns
export abstract class BaseService {
  protected readonly httpClient = httpClient;
  protected readonly cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  protected readonly cachePrefix: string;
  
  // Call deduplication - prevent multiple simultaneous calls to the same endpoint
  private readonly pendingCalls = new Map<string, Promise<any>>();
  
  // Failure tracking - track failed endpoints to avoid immediate retries
  private readonly failedEndpoints = new Map<string, { 
    lastFailure: number; 
    failureCount: number; 
    backoffUntil: number;
  }>();

  constructor(serviceName: string) {
    this.cachePrefix = `${serviceName}_`;
  }

  // Generic cache operations
  protected setCache<T>(key: string, data: T, ttl: number = config.cacheDuration): void {
    if (!config.features.enableCaching) return;
    
    const cacheKey = `${this.cachePrefix}${key}`;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  protected getCache<T>(key: string): T | null {
    if (!config.features.enableCaching) return null;

    const cacheKey = `${this.cachePrefix}${key}`;
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.data as T;
  }

  protected clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(`${this.cachePrefix}${pattern}`);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache for this service
      for (const key of this.cache.keys()) {
        if (key.startsWith(this.cachePrefix)) {
          this.cache.delete(key);
        }
      }
    }
  }

  // Call deduplication helper
  private getCallKey(method: string, endpoint: string): string {
    return `${method}:${endpoint}`;
  }

  // Check if endpoint is in backoff period
  private isEndpointInBackoff(endpoint: string): boolean {
    const failure = this.failedEndpoints.get(endpoint);
    if (!failure) return false;
    
    return Date.now() < failure.backoffUntil;
  }

  // Record endpoint failure
  private recordEndpointFailure(endpoint: string): void {
    const now = Date.now();
    const existing = this.failedEndpoints.get(endpoint);
    
    const failureCount = existing ? existing.failureCount + 1 : 1;
    const backoffDuration = Math.min(30000 * Math.pow(2, failureCount - 1), 300000); // Max 5 minutes
    
    this.failedEndpoints.set(endpoint, {
      lastFailure: now,
      failureCount,
      backoffUntil: now + backoffDuration,
    });
    
    console.warn(`Endpoint ${endpoint} failed ${failureCount} times. Backing off for ${backoffDuration}ms`);
  }

  // Record endpoint success
  private recordEndpointSuccess(endpoint: string): void {
    this.failedEndpoints.delete(endpoint);
  }

  // Generic API methods with error handling and deduplication
  protected async get<T>(endpoint: string, useCache: boolean = true): Promise<T> {
    const callKey = this.getCallKey('GET', endpoint);
    
    // Check if there's already a pending call for this endpoint
    if (this.pendingCalls.has(callKey)) {
      console.log(`Deduplicating call to ${endpoint} - returning existing promise`);
      return this.pendingCalls.get(callKey)!;
    }

    // Check if endpoint is in backoff period
    if (this.isEndpointInBackoff(endpoint)) {
      const failure = this.failedEndpoints.get(endpoint);
      const remainingTime = Math.ceil((failure!.backoffUntil - Date.now()) / 1000);
      throw new Error(`Endpoint ${endpoint} is temporarily unavailable. Please try again in ${remainingTime} seconds.`);
    }

    const cacheKey = `get_${endpoint}`;
    
    if (useCache) {
      const cached = this.getCache<T>(cacheKey);
      if (cached) return cached;
    }

    // Create the API call promise
    const apiCall = this.executeGetCall<T>(endpoint, cacheKey, useCache);
    
    // Store the promise to prevent duplicate calls
    this.pendingCalls.set(callKey, apiCall);
    
    try {
      const result = await apiCall;
      this.recordEndpointSuccess(endpoint);
      return result;
    } finally {
      // Always clean up the pending call
      this.pendingCalls.delete(callKey);
    }
  }

  private async executeGetCall<T>(endpoint: string, cacheKey: string, useCache: boolean): Promise<T> {
    try {
      const data = await this.httpClient.get<T>(endpoint);
      
      if (useCache) {
        this.setCache(cacheKey, data);
      }
      
      return data;
    } catch (error) {
      this.recordEndpointFailure(endpoint);
      console.error(`Error in ${this.constructor.name}.get:`, error);
      throw this.handleError(error, 'GET', endpoint);
    }
  }

  protected async post<T>(endpoint: string, data: any, invalidateCache: boolean = true): Promise<T> {
    const callKey = this.getCallKey('POST', endpoint);
    
    // Check if there's already a pending call for this endpoint
    if (this.pendingCalls.has(callKey)) {
      console.log(`Deduplicating POST call to ${endpoint} - returning existing promise`);
      return this.pendingCalls.get(callKey)!;
    }

    const apiCall = this.executePostCall<T>(endpoint, data, invalidateCache);
    this.pendingCalls.set(callKey, apiCall);
    
    try {
      const result = await apiCall;
      this.recordEndpointSuccess(endpoint);
      return result;
    } finally {
      this.pendingCalls.delete(callKey);
    }
  }

  private async executePostCall<T>(endpoint: string, data: any, invalidateCache: boolean): Promise<T> {
    try {
      const result = await this.httpClient.post<T>(endpoint, data);
      
      if (invalidateCache) {
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      this.recordEndpointFailure(endpoint);
      console.error(`Error in ${this.constructor.name}.post:`, error);
      throw this.handleError(error, 'POST', endpoint);
    }
  }

  protected async put<T>(endpoint: string, data: any, invalidateCache: boolean = true): Promise<T> {
    try {
      const result = await this.httpClient.put<T>(endpoint, data);
      
      if (invalidateCache) {
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.put:`, error);
      throw this.handleError(error, 'PUT', endpoint);
    }
  }

  protected async delete<T>(endpoint: string, invalidateCache: boolean = true): Promise<T> {
    try {
      const result = await this.httpClient.delete<T>(endpoint);
      
      if (invalidateCache) {
        this.clearCache();
      }
      
      return result;
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.delete:`, error);
      throw this.handleError(error, 'DELETE', endpoint);
    }
  }

  // Error handling with SaaS-specific patterns
  protected handleError(error: any, method: string, endpoint: string): Error {
    const serviceName = this.constructor.name;
    
    // Log error for monitoring
    console.error(`[${serviceName}] ${method} ${endpoint} failed:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Transform error into user-friendly message
    if (error.response?.status === 404) {
      return new Error('Resource not found');
    } else if (error.response?.status === 403) {
      return new Error('Access denied');
    } else if (error.response?.status === 429) {
      return new Error('Too many requests. Please try again later.');
    } else if (error.response?.status >= 500) {
      return new Error('Service temporarily unavailable. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR') {
      return new Error('Network error. Please check your connection.');
    }

    return new Error(error.message || 'An unexpected error occurred');
  }


  // Get failed endpoints status
  public getFailedEndpointsStatus(): Record<string, {
    failureCount: number;
    lastFailure: string;
    backoffUntil: string;
    isInBackoff: boolean;
  }> {
    const status: Record<string, any> = {};
    
    for (const [endpoint, failure] of this.failedEndpoints.entries()) {
      status[endpoint] = {
        failureCount: failure.failureCount,
        lastFailure: new Date(failure.lastFailure).toISOString(),
        backoffUntil: new Date(failure.backoffUntil).toISOString(),
        isInBackoff: this.isEndpointInBackoff(endpoint),
      };
    }
    
    return status;
  }

  // Clear failed endpoints (useful for testing or manual recovery)
  public clearFailedEndpoints(): void {
    this.failedEndpoints.clear();
    console.log('Cleared all failed endpoint tracking');
  }

  // Get service metrics
  public getMetrics(): {
    cacheSize: number;
    cacheHitRate: number;
    circuitBreakerStatus: Record<string, any>;
    pendingCalls: number;
    failedEndpoints: number;
  } {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0, // TODO: Implement hit rate tracking
      circuitBreakerStatus: this.httpClient.getCircuitBreakerStatus(),
      pendingCalls: this.pendingCalls.size,
      failedEndpoints: this.failedEndpoints.size,
    };
  }
}
