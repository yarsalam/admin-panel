import { ConfigService } from '@nestjs/config';

export function getRequiredJwtSecret(config: ConfigService): string {
  const secret = config.getOrThrow<string>('JWT_SECRET');
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  }
  return secret;
}
