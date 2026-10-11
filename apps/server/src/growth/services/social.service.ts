// apps/server/src/growth/services/social.service.ts
import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class SocialService {
  constructor(private readonly api: UserApiClientService) {}

  async scanTelegram() {
    try {
      return await this.api.post('/admin-api/growth/social/scan-telegram', {});
    } catch {
      return null;
    }
  }
  async getBrandSentiment(brand: string) {
    try {
      return await this.api.get(
        `/admin-api/growth/social/brand-sentiment?brand=${encodeURIComponent(brand)}`,
      );
    } catch {
      return null;
    }
  }
  async analyzeTexts(texts: string[]) {
    try {
      return await this.api.post(
        '/admin-api/growth/social/analyze-texts',
        texts,
      );
    } catch {
      return null;
    }
  }
}
