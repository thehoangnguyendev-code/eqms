/**
 * API Client Configuration
 * Central place for all API calls
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { secureStorage, safeRandomUUID } from '@/utils/security';
import { ROUTES } from '@/app/routes.constants';

// API Base URL - will be loaded from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add auth token, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = secureStorage.getItem('authToken', true);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add correlation ID for request tracking
    config.headers['X-Correlation-ID'] = safeRandomUUID();

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors, transform data, etc.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          console.error('🔒 Unauthorized - redirecting to login');
          secureStorage.removeItem('authToken');
          secureStorage.removeItem('user');
          window.location.href = ROUTES.LOGIN;
          break;

        case 403:
          // Forbidden - show permission error
          console.error('🚫 Forbidden - insufficient permissions');
          break;

        case 404:
          // Not found
          console.error('🔍 Resource not found');
          break;

        case 422:
          // Validation error
          console.error('⚠️ Validation Error:', data);
          break;

        case 500:
          // Server error
          console.error('💥 Server Error');
          break;

        default:
          console.error(`❌ Error ${status}:`, data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('📡 Network Error - No response received');
    } else {
      // Something else happened
      console.error('❌ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete<T>(url, config),
};

// File upload helper
export const uploadFile = async (
  url: string,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export default apiClient;
