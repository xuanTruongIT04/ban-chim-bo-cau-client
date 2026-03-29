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
import { adminProductApi } from '../adminProductApi';

const mockGet = axiosInstance.get as ReturnType<typeof vi.fn>;
const mockPost = axiosInstance.post as ReturnType<typeof vi.fn>;
const mockPut = axiosInstance.put as ReturnType<typeof vi.fn>;
const mockPatch = axiosInstance.patch as ReturnType<typeof vi.fn>;
const mockDelete = axiosInstance.delete as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('adminProductApi.list', () => {
  it('calls GET /admin/products with query params', async () => {
    const mockResponse = {
      data: {
        data: [],
        links: { first: '/admin/products?page=1', last: '/admin/products?page=1', prev: null, next: null },
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
      },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    await adminProductApi.list({ page: 1, per_page: 20 });

    expect(mockGet).toHaveBeenCalledWith('/admin/products', { params: { page: 1, per_page: 20 } });
  });

  it('returns paginated response', async () => {
    const paginatedData = {
      data: [{ id: 1, name: 'Bồ câu trắng', price_vnd: 150000 }],
      links: { first: '/admin/products?page=1', last: '/admin/products?page=1', prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
    };
    mockGet.mockResolvedValueOnce({ data: paginatedData });

    const result = await adminProductApi.list({ page: 1 });

    expect(result).toEqual(paginatedData);
  });
});

describe('adminProductApi.getById', () => {
  it('calls GET /admin/products/:id', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { id: 1, name: 'Test' } } });

    await adminProductApi.getById(1);

    expect(mockGet).toHaveBeenCalledWith('/admin/products/1');
  });

  it('returns product from response.data.data', async () => {
    const product = { id: 1, name: 'Bồ câu trắng', price_vnd: 150000 };
    mockGet.mockResolvedValueOnce({ data: { data: product } });

    const result = await adminProductApi.getById(1);

    expect(result).toEqual(product);
  });
});

describe('adminProductApi.create', () => {
  it('calls POST /admin/products with payload', async () => {
    const payload = { name: 'New Product', price_vnd: 100000, unit_type: 'con' as const, category_id: 1 };
    mockPost.mockResolvedValueOnce({ data: { data: { id: 5, ...payload } } });

    await adminProductApi.create(payload);

    expect(mockPost).toHaveBeenCalledWith('/admin/products', payload);
  });
});

describe('adminProductApi.update', () => {
  it('calls PUT /admin/products/:id with payload', async () => {
    const payload = { name: 'Updated Product', price_vnd: 200000 };
    mockPut.mockResolvedValueOnce({ data: { data: { id: 1, ...payload } } });

    await adminProductApi.update(1, payload);

    expect(mockPut).toHaveBeenCalledWith('/admin/products/1', payload);
  });
});

describe('adminProductApi.delete', () => {
  it('calls DELETE /admin/products/:id', async () => {
    mockDelete.mockResolvedValueOnce({ data: { success: true } });

    await adminProductApi.delete(1);

    expect(mockDelete).toHaveBeenCalledWith('/admin/products/1');
  });
});

describe('adminProductApi.toggleActive', () => {
  it('calls PATCH /admin/products/:id/toggle-active', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: { id: 1, is_active: false } } });

    await adminProductApi.toggleActive(1);

    expect(mockPatch).toHaveBeenCalledWith('/admin/products/1/toggle-active');
  });
});

describe('adminProductApi.uploadImage', () => {
  it('calls POST /admin/products/:id/images with FormData', async () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    mockPost.mockResolvedValueOnce({ data: { data: { id: 1, url: 'https://example.com/image.jpg' } } });

    await adminProductApi.uploadImage(1, file);

    expect(mockPost).toHaveBeenCalledTimes(1);
    const [url, body, config] = mockPost.mock.calls[0];
    expect(url).toBe('/admin/products/1/images');
    expect(body).toBeInstanceOf(FormData);
    // CRITICAL: Content-Type should NOT be manually set — axios detects FormData
    expect(config).toBeUndefined();
  });

  it('includes is_primary flag when specified', async () => {
    const file = new File(['content'], 'primary.jpg', { type: 'image/jpeg' });
    mockPost.mockResolvedValueOnce({ data: { data: { id: 1, url: 'https://example.com/image.jpg', is_primary: true } } });

    await adminProductApi.uploadImage(1, file, true);

    const [, body] = mockPost.mock.calls[0];
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('is_primary')).toBe('1');
  });
});

describe('adminProductApi.setPrimaryImage', () => {
  it('calls PATCH /admin/products/:productId/images/:imageId/primary', async () => {
    mockPatch.mockResolvedValueOnce({ data: { data: {} } });

    await adminProductApi.setPrimaryImage(1, 5);

    expect(mockPatch).toHaveBeenCalledWith('/admin/products/1/images/5/primary');
  });
});

describe('adminProductApi.deleteImage', () => {
  it('calls DELETE /admin/products/:productId/images/:imageId', async () => {
    mockDelete.mockResolvedValueOnce({ data: { success: true } });

    await adminProductApi.deleteImage(1, 5);

    expect(mockDelete).toHaveBeenCalledWith('/admin/products/1/images/5');
  });
});

describe('adminProductApi.adjustStock', () => {
  it('calls POST /admin/products/:id/stock-adjustments with payload', async () => {
    const payload = { delta: 10, adjustment_type: 'nhap_hang' as const, note: 'Nhập hàng mới' };
    mockPost.mockResolvedValueOnce({ data: { data: { id: 1 } } });

    await adminProductApi.adjustStock(1, payload);

    expect(mockPost).toHaveBeenCalledWith('/admin/products/1/stock-adjustments', payload);
  });
});
