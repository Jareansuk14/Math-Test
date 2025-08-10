import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Import store dynamically to avoid circular dependency
      import('../store/authStore').then(({ useAuthStore }) => {
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
        
        // Clear query cache if available
        if (typeof window !== 'undefined' && (window as any).clearQueryCache) {
          (window as any).clearQueryCache();
        }
        
        // Redirect to home page, not /login
        window.location.href = '/';
      });
    }
    
    return Promise.reject(error);
  }
);

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);