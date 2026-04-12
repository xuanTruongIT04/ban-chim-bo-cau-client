import axios from 'axios';
import { message } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { navigateTo } from '../lib/navigationService';
import { env } from '../config/env';

export const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject auth tokens and handle FormData Content-Type
axiosInstance.interceptors.request.use((config) => {
  // When sending FormData, remove the default Content-Type so axios auto-sets multipart/form-data with boundary
  // NOTE: Use AxiosHeaders method instead of `delete` operator — Axios 1.x AxiosHeaders
  // is a class instance where bracket-delete may silently fail.
  if (config.data instanceof FormData) {
    config.headers.set('Content-Type', false as unknown as string);
  }

  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Phase 2: Inject cart token for cart and checkout routes
  const cartToken = useCartStore.getState().cartToken;
  if (cartToken && (config.url?.includes('/cart') || config.url?.includes('/checkout'))) {
    config.headers['X-Cart-Token'] = cartToken;
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

// Global response transform: backend may return "file" prefix before JSON
axiosInstance.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string') {
      const jsonStart = response.data.indexOf('{');
      const jsonArrayStart = response.data.indexOf('[');
      const start = jsonStart >= 0 && jsonArrayStart >= 0
        ? Math.min(jsonStart, jsonArrayStart)
        : jsonStart >= 0 ? jsonStart : jsonArrayStart;
      if (start > 0) {
        try {
          response.data = JSON.parse(response.data.substring(start));
        } catch {
          // leave as-is if parse fails
        }
      }
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // D-26: 401 → clear auth, redirect to admin login
    // Phase 2: Skip admin redirect when error is cart-specific (CART_TOKEN_REQUIRED, CART_NOT_FOUND)
    // Guard: only redirect if the user actually HAD an admin token — prevents guest users
    // calling admin endpoints (e.g. order status refresh) from being bounced to /admin/login.
    const errorCode = error.response?.data?.code;
    const hadAdminToken = !!useAuthStore.getState().token;
    if (status === 401 && !isRefreshing && hadAdminToken && errorCode !== 'CART_TOKEN_REQUIRED' && errorCode !== 'CART_NOT_FOUND') {
      isRefreshing = true;
      useAuthStore.getState().clearAuth();
      // Per UI-SPEC.md copywriting contract
      message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      navigateTo('/admin/login');
      setTimeout(() => {
        isRefreshing = false;
      }, 1000);
    }

    // 403: Forbidden — user lacks permission
    if (status === 403) {
      message.error('Bạn không có quyền thực hiện thao tác này.');
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
