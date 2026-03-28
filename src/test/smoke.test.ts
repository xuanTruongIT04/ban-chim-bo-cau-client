// Smoke test — verifies test infrastructure is wired correctly
import { describe, it, expect } from 'vitest';

describe('test infrastructure', () => {
  it('should run vitest with jsdom environment', () => {
    expect(typeof window).toBe('object');
  });
});
