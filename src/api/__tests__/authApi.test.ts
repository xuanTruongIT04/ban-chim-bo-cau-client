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
const mockGet = axiosInstance.get as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authApi.login', () => {
  it('sends POST to /auth/login with email and password', async () => {
    const mockResponse = {
      data: { access_token: 'test-token-123', token_type: 'Bearer' },
    };
    mockPost.mockResolvedValueOnce(mockResponse);

    await authApi.login({ email: 'admin@example.com', password: 'secret' });

    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@example.com',
      password: 'secret',
    });
  });

  it('returns { access_token, token_type } on success', async () => {
    const mockResponse = {
      data: { access_token: 'test-token-abc', token_type: 'Bearer' },
    };
    mockPost.mockResolvedValueOnce(mockResponse);

    const result = await authApi.login({ email: 'admin@example.com', password: 'secret' });

    expect(result).toEqual({ access_token: 'test-token-abc', token_type: 'Bearer' });
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
  it('sends GET to /me', async () => {
    const mockResponse = {
      data: { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    await authApi.getMe();

    expect(mockGet).toHaveBeenCalledWith('/me');
  });

  it('returns UserProfile on success', async () => {
    const userProfile = { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' as const };
    mockGet.mockResolvedValueOnce({ data: userProfile });

    const result = await authApi.getMe();

    expect(result).toEqual(userProfile);
  });

  it('propagates error when GET fails', async () => {
    mockGet.mockRejectedValueOnce({ response: { status: 401 } });

    await expect(authApi.getMe()).rejects.toMatchObject({ response: { status: 401 } });
  });
});

describe('authApi.logout', () => {
  it('sends POST to /auth/logout', async () => {
    mockPost.mockResolvedValueOnce({ data: null });

    await authApi.logout();

    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
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
