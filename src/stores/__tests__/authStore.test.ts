import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

// Reset store state before each test
beforeEach(() => {
  useAuthStore.setState({
    token: null,
    user: null,
    isInitializing: true,
  });
});

describe('authStore — initial state', () => {
  it('has token=null initially', () => {
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('has user=null initially', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('has isInitializing=true initially', () => {
    expect(useAuthStore.getState().isInitializing).toBe(true);
  });
});

describe('authStore — setAuth', () => {
  it('updates token and user', () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' as const };
    useAuthStore.getState().setAuth('test-token-123', mockUser);

    const state = useAuthStore.getState();
    expect(state.token).toBe('test-token-123');
    expect(state.user).toEqual(mockUser);
  });
});

describe('authStore — clearAuth', () => {
  it('sets token=null and user=null', () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' as const };
    useAuthStore.getState().setAuth('test-token-123', mockUser);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });
});

describe('authStore — setUser', () => {
  it('updates only the user field without affecting token', () => {
    useAuthStore.setState({ token: 'existing-token', user: null, isInitializing: true });
    const newUser = { id: 2, name: 'Updated', email: 'updated@test.com', role: 'admin' as const };
    useAuthStore.getState().setUser(newUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(newUser);
    expect(state.token).toBe('existing-token');
  });
});

describe('authStore — setInitializing', () => {
  it('sets isInitializing to false', () => {
    useAuthStore.getState().setInitializing(false);
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });

  it('sets isInitializing to true', () => {
    useAuthStore.setState({ token: null, user: null, isInitializing: false });
    useAuthStore.getState().setInitializing(true);
    expect(useAuthStore.getState().isInitializing).toBe(true);
  });
});

describe('authStore — persist partialize', () => {
  it('partialize only includes token (not user or isInitializing)', () => {
    // Access the persist options by inspecting the store's persist config
    // The persist middleware exposes getOptions() via the store's persist property
    const persistApi = (useAuthStore as unknown as { persist: { getOptions: () => { partialize?: (state: Record<string, unknown>) => Record<string, unknown> } } }).persist;
    const options = persistApi.getOptions();
    const partialize = options.partialize;

    if (!partialize) {
      throw new Error('partialize is not configured on auth store');
    }

    const mockState = {
      token: 'some-token',
      user: { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' },
      isInitializing: false,
    };

    const persisted = partialize(mockState as unknown as Parameters<typeof partialize>[0]);
    expect(persisted).toHaveProperty('token', 'some-token');
    expect(persisted).not.toHaveProperty('user');
    expect(persisted).not.toHaveProperty('isInitializing');
  });
});
