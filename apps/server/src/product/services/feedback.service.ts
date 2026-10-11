import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class FeedbackService {
  constructor(private api: UserApiClientService) {}

  async getMetrics() {
    return this.api
      .get('/admin-api/product/feedback/metrics')
      .catch(() => ({}));
  }
  async getConversionInsights() {
    return this.api
      .get('/admin-api/product/feedback/conversion-insights')
      .catch(() => []);
  }
  async getTopFeatures() {
    return this.api
      .get('/admin-api/product/feedback/top-features')
      .catch(() => []);
  }
  async trainIncremental(feedback: any) {
    return this.api
      .post('/admin-api/product/feedback/train-incremental', feedback)
      .catch(() => null);
  }
  async trainBatch(feedbacks: any[]) {
    return this.api
      .post('/admin-api/product/feedback/train-batch', feedbacks)
      .catch(() => null);
  }
  async predictConversion(feedback: any) {
    return this.api
      .post('/admin-api/product/feedback/predict', feedback)
      .catch(() => null);
  }
  async listFeedback(limit = 100) {
    return this.api
      .get('/admin-api/product/feedback/list', { limit })
      .catch(() => []);
  }
}
