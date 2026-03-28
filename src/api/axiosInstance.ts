import axios from 'axios';
import { message } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { navigateTo } from '../lib/navigationService';
import { env } from '../config/env';

export const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// D-25: Request interceptor — inject Bearer token when present
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// D-26, D-27: Response interceptor — handle 401 with isRefreshing flag and 5xx
// Per D-27: use isRefreshing flag to prevent race condition when multiple concurrent
// requests receive 401. Since auth uses re-login (not silent refresh per D-03), the
// flag simplifies to a dedup guard — concurrent 401s only trigger one clearAuth +
// redirect cycle.
//
// FOUND-05 (422 handling): 422 validation errors are NOT globally intercepted.
// They are rejected and passed through to call-site onError handlers which can
// read error.response.data.errors for field-level validation messages.
let isRefreshing = false;

/** Exported for testing only — resets the isRefreshing dedup flag between tests */
export const _resetIsRefreshing = () => {
  isRefreshing = false;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // D-26: 401 → clear auth, redirect to admin login
    if (status === 401 && !isRefreshing) {
      isRefreshing = true;
      useAuthStore.getState().clearAuth();
      // Per UI-SPEC.md copywriting contract
      message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      navigateTo('/admin/login');
      setTimeout(() => {
        isRefreshing = false;
      }, 1000);
    }

    // D-28: 5xx → global error toast
    if (status && status >= 500) {
      message.error('Lỗi máy chủ. Vui lòng thử lại sau.');
    }

    // 422 and all other errors: reject without global handling.
    // Call-site error handlers receive the full AxiosError with
    // error.response.data containing ApiError shape per FOUND-05.
    return Promise.reject(error);
  },
);
