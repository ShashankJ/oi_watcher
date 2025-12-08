import axios from 'axios';

// Create an axios instance with base URL from environment variable
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
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

