import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axiosInstance before importing authApi
vi.mock('../axiosInstance', () => ({
  axiosInstance: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { axiosInstance } from '../axiosInstance';
import { authApi } from '../authApi';

const mockPost = axiosInstance.post as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authApi.login', () => {
  it('sends POST to /admin/login with email and password', async () => {
    const mockResponse = {
      data: { success: true, data: { token: 'test-token-123', expires_at: '2026-04-28T00:00:00Z' } },
    };
    mockPost.mockResolvedValueOnce(mockResponse);

    await authApi.login({ email: 'admin@example.com', password: 'secret' });

    expect(mockPost).toHaveBeenCalledWith('/admin/login', {
      email: 'admin@example.com',
      password: 'secret',
    });
  });

  it('returns { access_token, token_type } on success', async () => {
    const mockResponse = {
      data: { success: true, data: { token: 'test-token-abc', expires_at: '2026-04-28T00:00:00Z' } },
    };
    mockPost.mockResolvedValueOnce(mockResponse);

    const result = await authApi.login({ email: 'admin@example.com', password: 'secret' });

    expect(result).toEqual({ access_token: 'test-token-abc', token_type: 'Bearer' });
  });

  it('handles response with "file" prefix (backend bug workaround)', async () => {
    const mockResponse = {
      data: 'file{"success":true,"data":{"token":"test-token-file","expires_at":"2026-04-28T00:00:00Z"}}',
    };
    mockPost.mockResolvedValueOnce(mockResponse);

    const result = await authApi.login({ email: 'admin@example.com', password: 'secret' });

    expect(result).toEqual({ access_token: 'test-token-file', token_type: 'Bearer' });
  });

  it('propagates error when POST fails', async () => {
    const error = new Error('Network Error');
    mockPost.mockRejectedValueOnce(error);

    await expect(authApi.login({ email: 'admin@example.com', password: 'wrong' })).rejects.toThrow(
      'Network Error',
    );
  });
});

describe('authApi.getMe', () => {
  it('throws error (backend has no /me route yet)', async () => {
    await expect(authApi.getMe()).rejects.toThrow('GET /me not implemented in backend');
  });
});

describe('authApi.logout', () => {
  it('sends POST to /admin/logout', async () => {
    mockPost.mockResolvedValueOnce({ data: null });

    await authApi.logout();

    expect(mockPost).toHaveBeenCalledWith('/admin/logout');
  });

  it('returns void (undefined) on success', async () => {
    mockPost.mockResolvedValueOnce({ data: null });

    const result = await authApi.logout();

    expect(result).toBeUndefined();
  });

  it('propagates error when logout POST fails', async () => {
    const error = new Error('Network Error');
    mockPost.mockRejectedValueOnce(error);

    await expect(authApi.logout()).rejects.toThrow('Network Error');
  });
});
