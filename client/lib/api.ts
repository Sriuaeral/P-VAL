import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { config, getCurrentApiUrl } from './config';
import { normalizeDateFields, formatToDDMMYYYY } from './utils';

// Create axios instance with dynamic configuration based on environment
const api: AxiosInstance = axios.create({
  baseURL: getCurrentApiUrl(''), // Use environment-appropriate base URL
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding API keys, etc.
api.interceptors.request.use(
  (requestConfig) => {
    // Add Azure Functions API key if available and in production
    if (config.isProduction && config.azureFunctionsApiKey) {
      requestConfig.headers['x-functions-key'] = config.azureFunctionsApiKey;
    }
    
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 429) {
      // Handle rate limiting
      console.warn('Rate limit exceeded, please try again later');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Azure Function error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

// API service class for Azure Functions
export class ApiService {
  // Generic API methods
  static async get<T>(endpoint: string, axiosConfig?: AxiosRequestConfig): Promise<T> {
    try {
      // (Removed erroneous import from config)
      const fullUrl = `${api.defaults.baseURL}${endpoint}`;
      console.log('🌐 API Service - GET request:', {
        endpoint,
        fullUrl,
        environment: config.environment,
        axiosConfig
      });
      
      // Apply normalization using utils
      if (axiosConfig?.params) {
        axiosConfig.params = normalizeDateFields(axiosConfig.params);
        if ((axiosConfig.params as any).date) {
          (axiosConfig.params as any).date = formatToDDMMYYYY((axiosConfig.params as any).date);
        }
      }
      const response = await api.get<T>(endpoint, axiosConfig);
      console.log('✅ API Service - GET response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ API Service - GET error for ${endpoint}:`, error);
      throw error;
    }
  }

  static async post<T>(endpoint: string, data: any, axiosConfig?: AxiosRequestConfig): Promise<T> {
    try {
      const fullUrl = `${api.defaults.baseURL}${endpoint}`;
      console.log('🌐 API Service - POST request:', {
        endpoint,
        fullUrl,
        environment: config.environment,
        data,
        axiosConfig
      });
      
      // Normalize date fields in body and params
      if (axiosConfig?.params) {
        axiosConfig.params = normalizeDateFields(axiosConfig.params);
        if ((axiosConfig.params as any).date) {
          (axiosConfig.params as any).date = formatToDDMMYYYY((axiosConfig.params as any).date);
        }
      }
      if (data) {
        data = normalizeDateFields(data);
      }

      const response = await api.post<T>(endpoint, data, axiosConfig);
      console.log('✅ API Service - POST response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ API Service - POST error for ${endpoint}:`, error);
      throw error;
    }
  }

  static async put<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      // Normalize date fields
      if (config?.params) {
        config.params = normalizeDateFields(config.params);
        if ((config.params as any).date) {
          (config.params as any).date = formatToDDMMYYYY((config.params as any).date);
        }
      }
      if (data) {
        data = normalizeDateFields(data);
      }
      const response = await api.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error putting to ${endpoint}:`, error);
      throw error;
    }
  }

  static async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      // Normalize date fields in params only
      if (config?.params) {
        config.params = normalizeDateFields(config.params);
        if ((config.params as any).date) {
          (config.params as any).date = formatToDDMMYYYY((config.params as any).date);
        }
      }
      const response = await api.delete<T>(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  }

  static async patch<T>(endpoint: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      // Normalize date fields
      if (config?.params) {
        config.params = normalizeDateFields(config.params);
        if ((config.params as any).date) {
          (config.params as any).date = formatToDDMMYYYY((config.params as any).date);
        }
      }
      if (data) {
        data = normalizeDateFields(data);
      }
      const response = await api.patch<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error patching ${endpoint}:`, error);
      throw error;
    }
  }

  // Utility method to create query parameters
  static createQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // Method to handle Azure Functions specific responses
  static async getAzureFunctionResponse<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.get<{ success: boolean; data: T; error?: string }>(endpoint, config);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Azure Function returned an error');
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching from Azure Function ${endpoint}:`, error);
      throw error;
    }
  }

  // Work Order specific methods
  static async completeWorkOrder(workOrderId: string, completionData?: {
    completedBy?: string;
    completionNotes?: string;
    completionDate?: Date;
  }): Promise<any> {
    try {
      const endpoint = `/workorders/${workOrderId}/complete`;
      const data = {
        completedBy: completionData?.completedBy || "Current User",
        completionNotes: completionData?.completionNotes || "",
        completionDate: completionData?.completionDate || new Date().toISOString(),
        status: "Completed"
      };
      
      console.log('🌐 API Service - Completing work order:', {
        workOrderId,
        endpoint,
        data
      });
      
      const response = await api.post(endpoint, data);
      console.log('✅ API Service - Work order completed:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ API Service - Error completing work order ${workOrderId}:`, error);
      throw error;
    }
  }

  static async updateWorkOrder(workOrderId: string, updateData: any): Promise<any> {
    try {
      const endpoint = `/workorders/${workOrderId}`;
      
      console.log('🌐 API Service - Updating work order:', {
        workOrderId,
        endpoint,
        updateData
      });
      
      const response = await api.put(endpoint, updateData);
      console.log('✅ API Service - Work order updated:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ API Service - Error updating work order ${workOrderId}:`, error);
      throw error;
    }
  }

  static async addComment(workOrderId: string, commentData: {
    message: string;
    type?: "update" | "comment" | "escalation";
    author?: string;
    role?: string;
  }): Promise<any> {
    try {
      const endpoint = `/workorders/${workOrderId}/comments`;
      const data = {
        message: commentData.message,
        type: commentData.type || "comment",
        author: commentData.author || "Current User",
        role: commentData.role || "Engineer",
        timestamp: new Date().toISOString(),
      };
      
      console.log('🌐 API Service - Adding comment:', {
        workOrderId,
        endpoint,
        data
      });
      
      const response = await api.post(endpoint, data);
      console.log('✅ API Service - Comment added:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ API Service - Error adding comment to work order ${workOrderId}:`, error);
      throw error;
    }
  }
}

// Export the axios instance for direct use if needed
export { api };

// Export default API service
export default ApiService;
