import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class AlgorithmTuningService {
  constructor(private api: UserApiClientService) {}

  async getPhaseWeights() {
    return this.api
      .get('/admin-api/product/algorithm-tuning/phase-weights')
      .catch(() => ({}));
  }
  async setPhaseWeight(key: string, value: number) {
    return this.api.post('/admin-api/product/algorithm-tuning/phase-weights', {
      key,
      value,
    });
  }
  async getFeatureWeights(type: string) {
    return this.api
      .get('/admin-api/product/algorithm-tuning/feature-weights', { type })
      .catch(() => []);
  }
  async updateFeatureWeight(type: string, index: number, value: number) {
    return this.api.post(
      '/admin-api/product/algorithm-tuning/feature-weights',
      { type, index, value },
    );
  }
  async getDiversityParams() {
    return this.api
      .get('/admin-api/product/algorithm-tuning/diversity')
      .catch(() => ({ epsilon: 0.1 }));
  }
  async updateDiversityParams(params: any) {
    return this.api.post(
      '/admin-api/product/algorithm-tuning/diversity',
      params,
    );
  }
  async testScores(userId: number, candidateIds: number[]) {
    return this.api
      .post('/admin-api/product/algorithm-tuning/test-scores', {
        userId,
        candidateIds,
      })
      .catch(() => []);
  }
  async getUserFeatures(userId: number) {
    return this.api
      .get('/admin-api/product/algorithm-tuning/user-features', { userId })
      .catch(() => null);
  }
}
