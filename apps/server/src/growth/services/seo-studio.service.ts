// apps/server/src/growth/services/seo-studio.service.ts
import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class SeoStudioService {
  constructor(private readonly api: UserApiClientService) {}

  async getContentIdeas() {
    try {
      return await this.api.get('/admin-api/seo/content-opportunities');
    } catch {
      return [];
    }
  }

  async getHighIntentContent() {
    try {
      return await this.api.get('/admin-api/seo/content-opportunities');
    } catch {
      return [];
    }
  }

  async getBehavioralKeywords() {
    try {
      return await this.api.get('/admin-api/seo/behavioral-keywords');
    } catch {
      return [];
    }
  }

  // async getKeywordRankings(keyword?: string) {
  //   try {
  //     const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  //     return await this.api.get(`/admin-api/seo/keywords-ranking${params}`);
  //   } catch {
  //     return [];
  //   }
  // }

  async getSERPFeatures(keyword: string) {
    try {
      return await this.api.get(
        `/admin-api/seo/serp-features?keyword=${encodeURIComponent(keyword)}`,
      );
    } catch {
      return null;
    }
  }

  async getCompetitorAnalysis() {
    try {
      return await this.api.get('/admin-api/seo/competitor-analysis');
    } catch {
      return [];
    }
  }

  async getCompetitorChanges() {
    return [];
  }

  async getAIRecommendations() {
    try {
      return await this.api.get('/admin-api/seo/recommendations');
    } catch {
      return [];
    }
  }

  async getGoogleTrends(keyword: string, geo?: string) {
    try {
      return await this.api.get(
        `/admin-api/seo/google-trends?keyword=${encodeURIComponent(keyword)}&geo=${geo ?? 'IR'}`,
      );
    } catch {
      return null;
    }
  }

  async getKeywordGap(domain: string, competitors: string[]) {
    try {
      return await this.api.post('/admin-api/seo/keyword-gap', {
        domain,
        competitors,
      });
    } catch {
      return {};
    }
  }

  async getFullSeoScore() {
    try {
      const res = await this.api.get<{
        success: boolean;
        data: { metrics: any; score: any };
      }>('/admin-api/seo/full-score');

      // unwrap
      return {
        metrics: res.data?.metrics,
        score: res.data?.score,
      };
    } catch {
      return null;
    }
  }

  async getRecommendations(userId: string) {
    try {
      return await this.api.get(
        `/admin-api/seo/aeo/recommendations?userId=${userId}`,
      );
    } catch {
      return null;
    }
  }

  // async getKeywordRankings(keyword?: string) {
  //   try {
  //     const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  //     return await this.api.get(`/admin-api/seo/keywords-ranking${params}`);
  //   } catch {
  //     return [];
  //   }
  // }
  async getKeywordRankings(keyword?: string) {
    try {
      const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
      const url = `/admin-api/seo/keywords-ranking${params}`;
      console.log('[SEO] calling:', this.api['baseUrl'] + url); // ← debug
      const result = await this.api.get(url);
      console.log(
        '[SEO] result count:',
        Array.isArray(result) ? result.length : result,
      );
      return result;
    } catch (e) {
      console.error('[SEO] getKeywordRankings failed:', e.message);
      return [];
    }
  }
}
