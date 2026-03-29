import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { axiosInstance } from '../../axiosInstance';
import { adminDashboardApi } from '../adminDashboardApi';

const mockGet = axiosInstance.get as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('adminDashboardApi.getStats', () => {
  it('calls GET /admin/dashboard', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          orders_by_status: {
            cho_xac_nhan: 5,
            xac_nhan: 3,
            dang_giao: 2,
            hoan_thanh: 10,
            huy: 1,
          },
        },
      },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    await adminDashboardApi.getStats();

    expect(mockGet).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('returns DashboardStats from response.data.data', async () => {
    const stats = {
      orders_by_status: {
        cho_xac_nhan: 5,
        xac_nhan: 3,
        dang_giao: 2,
        hoan_thanh: 10,
        huy: 1,
      },
    };
    mockGet.mockResolvedValueOnce({ data: { success: true, data: stats } });

    const result = await adminDashboardApi.getStats();

    expect(result).toEqual(stats);
  });
});
