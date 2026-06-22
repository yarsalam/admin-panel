import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class SeoService {
  private aiSeoUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly userApiClient: UserApiClientService,
  ) {
    this.aiSeoUrl = this.config.get('AI_SEO_URL') || 'http://ai_seo:8021';
  }

  async getKeywordsRanking() {
    return this.userApiClient
      .get('/admin-api/seo/keywords-ranking')
      .catch(() => []);
  }
  async getContentOpportunities() {
    return this.userApiClient
      .get('/admin-api/seo/content-opportunities')
      .catch(() => []);
  }
  async getCompetitorAnalysis() {
    return this.userApiClient
      .get('/admin-api/seo/competitor-analysis')
      .catch(() => []);
  }
  async getSERPFeatures(keyword: string) {
    return this.userApiClient
      .get(`/admin-api/seo/serp-features`, { keyword })
      .catch(() => null);
  }

  async getSelfLearningRecommendations() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.aiSeoUrl}/teach-admin`),
      );
      return data;
    } catch {
      return null;
    }
  }
}
