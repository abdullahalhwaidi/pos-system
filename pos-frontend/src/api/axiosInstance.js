import axios from 'axios';

// 1. Create an Axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 2. Setup Request Interceptor to attach the token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Setup Response Interceptor to handle session expiration or unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 (Unauthorized/Token expired) or 403 (Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Remove expired/invalid token and role from storage
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Redirect to login page if the user is not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;