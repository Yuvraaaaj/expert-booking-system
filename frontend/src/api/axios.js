import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Attach auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = {
      message: 'Something went wrong. Please try again.',
      status: null,
      data: null,
    };

    if (error.response) {
      // Server responded with error status
      normalized.status  = error.response.status;
      normalized.data    = error.response.data;
      normalized.message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Server error (${error.response.status})`;

      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Optionally redirect to login
      }
    } else if (error.request) {
      // Request made but no response received
      normalized.message = 'Network error. Check your connection.';
    } else {
      normalized.message = error.message || normalized.message;
    }

    // Attach normalized error info to the thrown object
    error.normalized = normalized;
    return Promise.reject(error);
  }
);

export default api;
