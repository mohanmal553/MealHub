import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Add Authorization Token header from sessionStorage
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('mealhub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
