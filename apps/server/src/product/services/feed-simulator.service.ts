import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class FeedSimulatorService {
  constructor(private api: UserApiClientService) {}

  async simulateFeed(userId: number, params?: any) {
    return this.api
      .get('/admin-api/product/feed-simulator', { userId, ...params })
      .catch(() => []);
  }

  async analyzeImage(url: string) {
    return this.api
      .post('/admin-api/product/feed-simulator/analyze-image', { url })
      .catch(() => null);
  }
}
