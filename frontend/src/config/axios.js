import axios from 'axios';

// Determine base URL based on environment:
// - If REACT_APP_API_URL is set (local dev), use it
// - If running on localhost, use http://localhost:5000 (dev mode)
// - Otherwise, use relative path '/' (Docker container with nginx proxy)
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In browser, check if we're on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  
  // Default to relative path (works with nginx reverse-proxy)
  return '/';
};

// Create an axios instance with base URL from environment variable
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60 seconds timeout (backend may take time to fetch data)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor (optional - for debugging)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor (optional - for error handling)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      // Server responded with error status
      console.error('Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received. Is the backend running?');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

