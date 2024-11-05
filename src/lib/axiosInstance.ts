// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // Update to match your Node server URL
  withCredentials: true, // Ensures cookies and credentials are sent with requests
});

// Add a request interceptor to include headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Set headers here if necessary
    if (!(config.data instanceof FormData)) { 
    config.headers['Content-Type'] = 'application/json';
    }
    config.headers['Authorization'] = `Bearer ${localStorage.getItem('postgramToken')}`; // Add token if required
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
