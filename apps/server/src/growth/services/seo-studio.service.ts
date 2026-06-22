// apps/server/src/growth/services/seo-studio.service.ts
import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class SeoStudioService {
  constructor(private readonly api: UserApiClientService) {}

  async getContentIdeas() {
    try {
      return await this.api.get('/admin-api/growth/seo-studio/content-ideas');
    } catch {
      return [];
    }
  }
  async getHighIntentContent() {
    try {
      return await this.api.get(
        '/admin-api/growth/seo-studio/high-intent-content',
      );
    } catch {
      return [];
    }
  }
  async getBehavioralKeywords() {
    try {
      return await this.api.get(
        '/admin-api/growth/seo-studio/behavioral-keywords',
      );
    } catch {
      return [];
    }
  }
  async getKeywordRankings(keyword?: string) {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    try {
      return await this.api.get(
        `/admin-api/growth/seo-studio/keyword-rankings${params}`,
      );
    } catch {
      return [];
    }
  }
  async getSERPFeatures(keyword: string) {
    try {
      return await this.api.get(
        `/admin-api/growth/seo-studio/serp-features?keyword=${encodeURIComponent(keyword)}`,
      );
    } catch {
      return [];
    }
  }
  async getCompetitorAnalysis() {
    try {
      return await this.api.get(
        '/admin-api/growth/seo-studio/competitor-analysis',
      );
    } catch {
      return [];
    }
  }
  async getCompetitorChanges() {
    try {
      return await this.api.get(
        '/admin-api/growth/seo-studio/competitor-changes',
      );
    } catch {
      return [];
    }
  }
  async getAIRecommendations() {
    try {
      return await this.api.get(
        '/admin-api/growth/seo-studio/ai-recommendations',
      );
    } catch {
      return [];
    }
  }
  async getGoogleTrends(keyword: string, geo?: string) {
    try {
      return await this.api.get(
        `/admin-api/growth/seo-studio/google-trends?keyword=${encodeURIComponent(keyword)}&geo=${geo || 'IR'}`,
      );
    } catch {
      return null;
    }
  }
  async getKeywordGap(domain: string, competitors: string[]) {
    try {
      return await this.api.post('/admin-api/growth/seo-studio/keyword-gap', {
        domain,
        competitors,
      });
    } catch {
      return [];
    }
  }
}
