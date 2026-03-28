import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Mock dependencies before importing the module under test
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
  },
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      token: null,
      clearAuth: vi.fn(),
    })),
  },
}));

vi.mock('../../lib/navigationService', () => ({
  navigateTo: vi.fn(),
}));

vi.mock('../../config/env', () => ({
  env: {
    apiBaseUrl: 'http://localhost:8000/api',
    isDev: true,
    isProd: false,
  },
}));

import { message } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { navigateTo } from '../../lib/navigationService';
import { axiosInstance, _resetIsRefreshing } from '../axiosInstance';

// Cast mocks for type safety
const mockGetState = useAuthStore.getState as ReturnType<typeof vi.fn>;
const mockNavigateTo = navigateTo as ReturnType<typeof vi.fn>;
const mockMessageError = message.error as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  // Reset module-level isRefreshing flag between tests
  _resetIsRefreshing();
  // Default: no token
  mockGetState.mockReturnValue({ token: null, clearAuth: vi.fn() });
});

// Helper to get the response interceptor's rejected handler
function getResponseInterceptorRejected(): (error: AxiosError) => Promise<never> {
  const interceptors = (axiosInstance.interceptors.response as unknown as {
    handlers: Array<{ rejected: (error: AxiosError) => Promise<never> }>;
  }).handlers;
  const handler = interceptors[interceptors.length - 1];
  return handler.rejected;
}

// Helper to get the request interceptor's fulfilled handler
function getRequestInterceptorFulfilled(): (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig {
  const interceptors = (axiosInstance.interceptors.request as unknown as {
    handlers: Array<{
      fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
    }>;
  }).handlers;
  const handler = interceptors[interceptors.length - 1];
  return handler.fulfilled;
}

function makeAxiosError(status: number, data: unknown = {}): AxiosError {
  return {
    response: { status, data } as AxiosResponse,
    config: {},
    isAxiosError: true,
    name: 'AxiosError',
    message: `Request failed with status code ${status}`,
    toJSON: () => ({}),
  } as unknown as AxiosError;
}

// --- Base configuration ---

describe('axiosInstance — base configuration', () => {
  it('baseURL matches env.apiBaseUrl', () => {
    expect(axiosInstance.defaults.baseURL).toBe('http://localhost:8000/api');
  });
});

// --- Request interceptor ---

describe('axiosInstance — request interceptor', () => {
  it('adds Authorization header when token exists in authStore', () => {
    const mockClearAuth = vi.fn();
    mockGetState.mockReturnValue({ token: 'my-test-token', clearAuth: mockClearAuth });

    const fulfilled = getRequestInterceptorFulfilled();
    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = fulfilled(config);

    expect(result.headers['Authorization']).toBe('Bearer my-test-token');
  });

  it('does NOT add Authorization header when token is null', () => {
    mockGetState.mockReturnValue({ token: null, clearAuth: vi.fn() });

    const fulfilled = getRequestInterceptorFulfilled();
    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = fulfilled(config);

    expect(result.headers['Authorization']).toBeUndefined();
  });
});

// --- Response interceptor: 401 ---

describe('axiosInstance — response interceptor: 401', () => {
  it('calls clearAuth and navigateTo on 401 response', async () => {
    const mockClearAuth = vi.fn();
    mockGetState.mockReturnValue({ token: 'stale-token', clearAuth: mockClearAuth });

    const rejected = getResponseInterceptorRejected();
    await expect(rejected(makeAxiosError(401))).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(mockClearAuth).toHaveBeenCalled();
    expect(mockNavigateTo).toHaveBeenCalledWith('/admin/login');
  });

  it('shows session-expired message on 401', async () => {
    const mockClearAuth = vi.fn();
    mockGetState.mockReturnValue({ token: 'stale-token', clearAuth: mockClearAuth });

    const rejected = getResponseInterceptorRejected();
    await expect(rejected(makeAxiosError(401))).rejects.toBeDefined();

    expect(mockMessageError).toHaveBeenCalledWith(
      expect.stringContaining('đăng nhập'),
    );
  });

  it('does not double-redirect on concurrent 401s (isRefreshing flag)', async () => {
    const mockClearAuth = vi.fn();
    mockGetState.mockReturnValue({ token: 'stale-token', clearAuth: mockClearAuth });

    const rejected = getResponseInterceptorRejected();

    // Fire two 401s sequentially within the same isRefreshing window
    // First call should trigger the redirect
    await expect(rejected(makeAxiosError(401))).rejects.toBeDefined();
    // Second call should be blocked by isRefreshing
    await expect(rejected(makeAxiosError(401))).rejects.toBeDefined();

    // navigateTo should only be called once due to isRefreshing flag
    expect(mockNavigateTo).toHaveBeenCalledTimes(1);
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
  });
});

// --- Response interceptor: 5xx ---

describe('axiosInstance — response interceptor: 5xx', () => {
  it('shows error toast on 500 response', async () => {
    const rejected = getResponseInterceptorRejected();
    await expect(rejected(makeAxiosError(500))).rejects.toBeDefined();

    expect(mockMessageError).toHaveBeenCalledWith(expect.stringContaining('máy chủ'));
  });

  it('shows error toast on 503 response', async () => {
    const rejected = getResponseInterceptorRejected();
    await expect(rejected(makeAxiosError(503))).rejects.toBeDefined();

    expect(mockMessageError).toHaveBeenCalledWith(expect.stringContaining('máy chủ'));
  });
});

// --- Response interceptor: 422 (FOUND-05) ---

describe('axiosInstance — response interceptor: 422', () => {
  it('does NOT call message.error on 422 — passes through to call-site handlers (FOUND-05)', async () => {
    const rejected = getResponseInterceptorRejected();
    const error = makeAxiosError(422, {
      message: 'The given data was invalid.',
      errors: { email: ['The email field is required.'] },
    });

    await expect(rejected(error)).rejects.toMatchObject({ response: { status: 422 } });

    // message.error should NOT be called for 422 — call-site concern
    expect(mockMessageError).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it('422 error includes original response data for call-site consumption', async () => {
    const rejected = getResponseInterceptorRejected();
    const validationData = {
      message: 'The given data was invalid.',
      errors: { email: ['The email field is required.'] },
    };
    const error = makeAxiosError(422, validationData);

    let caughtError: AxiosError | null = null;
    try {
      await rejected(error);
    } catch (e) {
      caughtError = e as AxiosError;
    }

    expect(caughtError?.response?.data).toEqual(validationData);
  });
});
