import { describe, expect, it } from '@jest/globals';
import { getRequiredJwtSecret } from './security-config';

describe('getRequiredJwtSecret', () => {
  it('returns a sufficiently long configured secret', () => {
    const secret = 'a'.repeat(32);
    expect(
      getRequiredJwtSecret({ getOrThrow: () => secret } as any),
    ).toBe(secret);
  });

  it('rejects short secrets', () => {
    expect(() =>
      getRequiredJwtSecret({ getOrThrow: () => 'short' } as any),
    ).toThrow('at least 32 characters');
  });

  it('rejects a missing secret', () => {
    expect(() =>
      getRequiredJwtSecret({
        getOrThrow: () => {
          throw new Error('missing');
        },
      } as any),
    ).toThrow('missing');
  });
});
