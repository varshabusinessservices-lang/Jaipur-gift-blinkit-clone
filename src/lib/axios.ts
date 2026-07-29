
import axios from 'axios';
import { config } from '../config/env';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (reqConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        reqConfig.headers['x-refresh-token'] = refreshToken;
      }
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);


// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${config.apiBaseUrl}/auth/refresh-token`, { refreshToken });
        if (data.success && data.data) {
          useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
          processQueue(null, data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return axios(originalRequest);
        } else {
           throw new Error('Refresh failed');
        }
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
