import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../axiosInstance', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { axiosInstance } from '../axiosInstance';
import { productApi } from '../productApi';

const mockGet = axiosInstance.get as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('productApi.list', () => {
  it('calls GET /products with params', async () => {
    const mockResponse = {
      data: {
        data: [],
        links: { first: '/products?page=1', last: '/products?page=1', prev: null, next: null },
        meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 },
      },
    };
    mockGet.mockResolvedValueOnce(mockResponse);

    await productApi.list({ page: 1, per_page: 12 });

    expect(mockGet).toHaveBeenCalledWith('/products', { params: { page: 1, per_page: 12 } });
  });

  it('returns paginated response', async () => {
    const paginatedData = {
      data: [{ id: 1, name: 'Bồ câu trắng', price_vnd: 150000 }],
      links: { first: '/products?page=1', last: '/products?page=1', prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
    };
    mockGet.mockResolvedValueOnce({ data: paginatedData });

    const result = await productApi.list({ page: 1 });

    expect(result).toEqual(paginatedData);
  });
});

describe('productApi.getById', () => {
  it('calls GET /products/:id', async () => {
    const productDetail = { id: 5, name: 'Bồ câu nâu', price_vnd: 200000 };
    mockGet.mockResolvedValueOnce({ data: { data: productDetail } });

    await productApi.getById(5);

    expect(mockGet).toHaveBeenCalledWith('/products/5');
  });

  it('returns product detail from response.data.data', async () => {
    const productDetail = { id: 5, name: 'Bồ câu nâu', price_vnd: 200000 };
    mockGet.mockResolvedValueOnce({ data: { data: productDetail } });

    const result = await productApi.getById(5);

    expect(result).toEqual(productDetail);
  });
});
