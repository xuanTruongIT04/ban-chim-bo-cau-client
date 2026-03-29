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
import { adminOrderApi } from '../adminOrderApi';

const mockGet = axiosInstance.get as ReturnType<typeof vi.fn>;
const mockPost = axiosInstance.post as ReturnType<typeof vi.fn>;
const mockPatch = axiosInstance.patch as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('adminOrderApi.list', () => {
  it('calls GET /admin/orders with filter params', async () => {
    const mockResponse = {
      data: {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
        links: { first: '/admin/orders?page=1', last: '/admin/orders?page=1', prev: null, next: null },
      },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    const params = { 'filter[status]': 'cho_xac_nhan', page: 1, per_page: 20 };
    await adminOrderApi.list(params);

    expect(mockGet).toHaveBeenCalledWith('/admin/orders', { params });
  });

  it('returns paginated order response', async () => {
    const paginatedData = {
      data: [{ id: 1, customer_name: 'Nguyen Van A', order_status: 'cho_xac_nhan' }],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      links: { first: '/admin/orders?page=1', last: '/admin/orders?page=1', prev: null, next: null },
    };
    mockGet.mockResolvedValueOnce({ data: paginatedData });

    const result = await adminOrderApi.list({});

    expect(result).toEqual(paginatedData);
  });
});

describe('adminOrderApi.getById', () => {
  it('calls GET /admin/orders/:id', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { id: 1, customer_name: 'Test' } } });

    await adminOrderApi.getById(1);

    expect(mockGet).toHaveBeenCalledWith('/admin/orders/1');
  });

  it('returns order from response.data.data', async () => {
    const order = { id: 1, customer_name: 'Nguyen Van A', order_status: 'cho_xac_nhan' };
    mockGet.mockResolvedValueOnce({ data: { data: order } });

    const result = await adminOrderApi.getById(1);

    expect(result).toEqual(order);
  });
});

describe('adminOrderApi.updateStatus', () => {
  it('calls PATCH /admin/orders/:id/status with status body', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { id: 1, order_status: 'xac_nhan' } } });

    await adminOrderApi.updateStatus(1, 'xac_nhan');

    expect(mockPatch).toHaveBeenCalledWith('/admin/orders/1/status', { status: 'xac_nhan' });
  });
});

describe('adminOrderApi.cancel', () => {
  it('calls POST /admin/orders/:id/cancel (NOT PATCH /status with huy)', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { id: 1, order_status: 'huy' } } });

    await adminOrderApi.cancel(1);

    // CRITICAL: Must be POST /cancel, not PATCH /status
    expect(mockPost).toHaveBeenCalledWith('/admin/orders/1/cancel');
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('calls POST with no body', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { id: 1 } } });

    await adminOrderApi.cancel(1);

    expect(mockPost).toHaveBeenCalledWith('/admin/orders/1/cancel');
    expect(mockPost.mock.calls[0]).toHaveLength(1); // only URL, no body argument
  });
});

describe('adminOrderApi.confirmPayment', () => {
  it('calls PATCH /admin/orders/:id/payment-status', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { id: 1, payment_status: 'da_thanh_toan' } } });

    await adminOrderApi.confirmPayment(1);

    expect(mockPatch).toHaveBeenCalledWith('/admin/orders/1/payment-status');
  });
});

describe('adminOrderApi.setDeliveryMethod', () => {
  it('calls PATCH /admin/orders/:id/delivery-method with method body', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { id: 1, delivery_method: 'giao_hang' } } });

    await adminOrderApi.setDeliveryMethod(1, 'giao_hang');

    expect(mockPatch).toHaveBeenCalledWith('/admin/orders/1/delivery-method', { method: 'giao_hang' });
  });
});
