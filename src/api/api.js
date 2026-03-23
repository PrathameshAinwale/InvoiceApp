import axios from 'axios';

const API = axios.create({
  baseURL:         'http://localhost:5000/api',
  withCredentials: true,   // ✅ send cookies with every request automatically
});

// Attach Authorization header from localStorage token as fallback
API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export default API;