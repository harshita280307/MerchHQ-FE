import axios from 'axios';
import { auth } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://merchhq-be.onrender.com/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Interceptor to attach Firebase token & prevent stale browser caching
axiosClient.interceptors.request.use(async (config) => {
  // Prevent browser GET caching for real-time MongoDB data sync
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  config.headers['Pragma'] = 'no-cache';
  config.headers['Expires'] = '0';

  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.error('Failed to get Firebase ID token:', e);
    }
  }
  return config;
});

export default axiosClient;
