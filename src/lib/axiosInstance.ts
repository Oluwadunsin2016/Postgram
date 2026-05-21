import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
});

const getStoredToken = () => {
  const token = localStorage.getItem('postgramToken');
  if (!token || token === 'null' || token === 'undefined' || token === '[]') return null;
  return token;
};


axiosInstance.interceptors.request.use(
  (config) => {
    if (!(config.data instanceof FormData)) { 
    config.headers['Content-Type'] = 'application/json';
    }
    const token = getStoredToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete config.headers['Authorization'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new Event('postgram:network-restored'));
    return response;
  },
  (error) => {
    if (!error.response || error.message === 'Network Error') {
      window.dispatchEvent(new Event('postgram:network-error'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
