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
import { checkoutApi } from '../checkoutApi';

const mockPost = axiosInstance.post as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkoutApi.submit', () => {
  const validPayload = {
    customer_name: 'Nguyen Van A',
    customer_phone: '0901234567',
    delivery_address: '123 Le Loi, Quan 1, TP.HCM',
  };

  it('calls POST /checkout with payload', async () => {
    const orderResponse = { id: 1, customer_name: 'Nguyen Van A', order_status: 'pending' };
    mockPost.mockResolvedValueOnce({ data: { data: orderResponse } });

    await checkoutApi.submit(validPayload, 'idem-key-123');

    expect(mockPost).toHaveBeenCalledWith('/checkout', validPayload, expect.objectContaining({
      headers: expect.objectContaining({ 'Idempotency-Key': 'idem-key-123' }),
    }));
  });

  it('sends Idempotency-Key header', async () => {
    const orderResponse = { id: 1, customer_name: 'Nguyen Van A', order_status: 'pending' };
    mockPost.mockResolvedValueOnce({ data: { data: orderResponse } });

    await checkoutApi.submit(validPayload, 'unique-key-xyz');

    const callArgs = mockPost.mock.calls[0];
    expect(callArgs[2].headers['Idempotency-Key']).toBe('unique-key-xyz');
  });

  it('returns OrderResource from response.data.data', async () => {
    const orderResource = { id: 42, customer_name: 'Nguyen Van A', order_status: 'pending' };
    mockPost.mockResolvedValueOnce({ data: { data: orderResource } });

    const result = await checkoutApi.submit(validPayload, 'idem-key-456');

    expect(result).toEqual(orderResource);
  });

  it('does NOT include note field in payload', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { id: 1 } } });

    await checkoutApi.submit(validPayload, 'idem-key-789');

    const sentPayload = mockPost.mock.calls[0][1];
    expect(sentPayload).not.toHaveProperty('note');
  });

  it('does NOT include payment_method in payload', async () => {
    mockPost.mockResolvedValueOnce({ data: { data: { id: 1 } } });

    await checkoutApi.submit(validPayload, 'idem-key-abc');

    const sentPayload = mockPost.mock.calls[0][1];
    expect(sentPayload).not.toHaveProperty('payment_method');
  });
});
