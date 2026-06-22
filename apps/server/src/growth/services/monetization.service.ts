// apps/server/src/growth/services/monetization.service.ts
import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class MonetizationService {
  constructor(private readonly api: UserApiClientService) {}

  async predict(userId: number, features: any, candidates: string[]) {
    try {
      return await this.api.post('/admin-api/growth/monetization/predict', {
        userId,
        features,
        candidates,
      });
    } catch {
      return null;
    }
  }
  async sendFeedback(data: {
    userId: number;
    variant: string;
    features: any;
    label: number;
  }) {
    try {
      return await this.api.post(
        '/admin-api/growth/monetization/feedback',
        data,
      );
    } catch {
      return null;
    }
  }
  async getFeedbackCount() {
    try {
      return await this.api.get(
        '/admin-api/growth/monetization/feedback-count',
      );
    } catch {
      return { count: 0 };
    }
  }
  async retrain() {
    try {
      return await this.api.post('/admin-api/growth/monetization/retrain', {});
    } catch {
      return null;
    }
  }
  async train() {
    try {
      return await this.api.post('/admin-api/growth/monetization/train', {});
    } catch {
      return null;
    }
  }
}
