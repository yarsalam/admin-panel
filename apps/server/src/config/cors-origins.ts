export function resolveCorsOrigins(
  nodeEnv = process.env.NODE_ENV,
  configuredOrigins =
    process.env.ADMIN_CORS_ORIGINS ?? process.env.CORS_ORIGINS,
): string[] {
  const origins = (configuredOrigins ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (nodeEnv === 'production' && origins.length === 0) {
    throw new Error(
      'ADMIN_CORS_ORIGINS must contain the allowed production web origins.',
    );
  }

  return origins.length > 0
    ? origins
    : ['http://localhost:3000', 'http://192.168.0.133:3000'];
}
