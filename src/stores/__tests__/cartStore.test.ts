import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cartStore';

// Reset store state before each test
beforeEach(() => {
  useCartStore.setState({ cartToken: null });
});

describe('cartStore — initial state', () => {
  it('has cartToken=null initially', () => {
    expect(useCartStore.getState().cartToken).toBeNull();
  });

  it('does NOT have items array', () => {
    const state = useCartStore.getState() as Record<string, unknown>;
    expect(state.items).toBeUndefined();
  });
});

describe('cartStore — setCartToken', () => {
  it('stores the provided token', () => {
    useCartStore.getState().setCartToken('test-cart-token-123');
    expect(useCartStore.getState().cartToken).toBe('test-cart-token-123');
  });

  it('can update to a different token', () => {
    useCartStore.getState().setCartToken('token-a');
    useCartStore.getState().setCartToken('token-b');
    expect(useCartStore.getState().cartToken).toBe('token-b');
  });
});

describe('cartStore — clearCartToken', () => {
  it('resets cartToken to null', () => {
    useCartStore.getState().setCartToken('some-token');
    useCartStore.getState().clearCartToken();
    expect(useCartStore.getState().cartToken).toBeNull();
  });
});

describe('cartStore — persist config', () => {
  it('uses cart_token_storage as the localStorage key', () => {
    const persistApi = (useCartStore as unknown as {
      persist: { getOptions: () => { name: string } };
    }).persist;
    const options = persistApi.getOptions();
    expect(options.name).toBe('cart_token_storage');
  });
});
