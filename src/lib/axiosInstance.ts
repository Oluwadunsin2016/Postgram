// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5000',
  baseURL: 'https://postgram-backend-vdty.vercel.app', 
  withCredentials: true,
});


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
