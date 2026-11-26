import { resolveCorsOrigins } from './cors-origins';

describe('resolveCorsOrigins', () => {
  it('parses and trims configured origins', () => {
    expect(
      resolveCorsOrigins(
        'production',
        ' https://admin.example.com, https://admin-alt.example.com ',
      ),
    ).toEqual([
      'https://admin.example.com',
      'https://admin-alt.example.com',
    ]);
  });

  it('fails closed when production has no allowed origins', () => {
    expect(() => resolveCorsOrigins('production', '')).toThrow(
      'ADMIN_CORS_ORIGINS',
    );
  });

  it('keeps local origins only as a development fallback', () => {
    expect(resolveCorsOrigins('development', '')).toEqual([
      'http://localhost:3000',
      'http://192.168.0.133:3000',
    ]);
  });
});
