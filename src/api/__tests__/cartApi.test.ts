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
import { cartApi } from '../cartApi';

const mockGet = axiosInstance.get as ReturnType<typeof vi.fn>;
const mockPost = axiosInstance.post as ReturnType<typeof vi.fn>;
const mockPatch = axiosInstance.patch as ReturnType<typeof vi.fn>;
const mockDelete = axiosInstance.delete as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('cartApi.create', () => {
  it('calls POST /cart', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { token: 'cart-token-abc', expires_at: '2026-04-01T00:00:00Z' } } });

    await cartApi.create();

    expect(mockPost).toHaveBeenCalledWith('/cart');
  });

  it('returns token and expires_at from response.data.data', async () => {
    const cartData = { token: 'cart-token-abc', expires_at: '2026-04-01T00:00:00Z' };
    mockPost.mockResolvedValueOnce({ data: { data: cartData } });

    const result = await cartApi.create();

    expect(result).toEqual(cartData);
  });
});

describe('cartApi.get', () => {
  it('calls GET /cart', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { id: 1, token: 'abc', items: [], total_amount: 0 } } });

    await cartApi.get();

    expect(mockGet).toHaveBeenCalledWith('/cart');
  });

  it('returns CartData from response.data.data', async () => {
    const cartData = { id: 1, token: 'abc', expires_at: '2026-04-01', items: [], total_amount: 0 };
    mockGet.mockResolvedValueOnce({ data: { data: cartData } });

    const result = await cartApi.get();

    expect(result).toEqual(cartData);
  });
});

describe('cartApi.addItem', () => {
  it('calls POST /cart/items with product_id and quantity', async () => {
    const updatedCart = { id: 1, token: 'abc', expires_at: '2026-04-01', items: [], total_amount: 0 };
    mockPost.mockResolvedValueOnce({ data: { data: updatedCart } });

    await cartApi.addItem(1, 2);

    expect(mockPost).toHaveBeenCalledWith('/cart/items', { product_id: 1, quantity: 2 });
  });
});

describe('cartApi.updateItem', () => {
  it('calls PATCH /cart/items/:itemId with quantity', async () => {
    const updatedCart = { id: 1, token: 'abc', expires_at: '2026-04-01', items: [], total_amount: 0 };
    mockPatch.mockResolvedValueOnce({ data: { data: updatedCart } });

    await cartApi.updateItem(5, 3);

    expect(mockPatch).toHaveBeenCalledWith('/cart/items/5', { quantity: 3 });
  });
});

describe('cartApi.removeItem', () => {
  it('calls DELETE /cart/items/:itemId', async () => {
    mockDelete.mockResolvedValueOnce({ data: null });

    await cartApi.removeItem(5);

    expect(mockDelete).toHaveBeenCalledWith('/cart/items/5');
  });

  it('returns void', async () => {
    mockDelete.mockResolvedValueOnce({ data: null });

    const result = await cartApi.removeItem(5);

    expect(result).toBeUndefined();
  });
});
