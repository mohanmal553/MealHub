import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`)
  : '/api';

const API = axios.create({
  baseURL,
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
