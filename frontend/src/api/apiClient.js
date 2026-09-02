import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 20000
});

// Request interceptor to attach JWT Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('interview_ai_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for data extraction & silent refresh handling
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retried, attempt refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data?.success && refreshResponse.data?.data?.accessToken) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          localStorage.setItem('interview_ai_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh token invalid or expired - clear token
        localStorage.removeItem('interview_ai_access_token');
        localStorage.removeItem('interview_ai_user');
      }
    }

    const errorData = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to the server'
    };

    return Promise.reject(errorData);
  }
);

export default apiClient;
