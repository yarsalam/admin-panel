import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ExecutiveSeoSummaryService {
  private readonly userApiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.userApiUrl =
      this.config.get<string>('USER_API_BASE_URL') ?? 'http://localhost:5001';

    this.apiKey = this.config.get<string>('USER_API_KEY') ?? '';
  }

  async getSummary() {
    try {
      const { data } = await axios.get(
        `${this.userApiUrl}/admin-api/seo/dashboard`,
        {
          headers: {
            'x-api-key': this.apiKey,
          },
        },
      );

      const technical = data?.technical ?? {};

      const recommendations =
        data?.competitor?.opportunities?.missingKeywords ?? [];

      return {
        overallScore: technical.seoScore ?? 0,

        grade:
          technical.seoScore >= 90 ? 'A' : technical.seoScore >= 70 ? 'B' : 'C',

        topRecommendations: recommendations.slice(0, 3),

        clicks: technical.clicks ?? 0,

        impressions: technical.impressions ?? 0,

        avgCTR: technical.avgCTR ?? 0,

        avgPosition: technical.avgPosition ?? 0,

        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Executive SEO summary failed:', error.message);

      return {
        overallScore: 0,
        grade: 'N/A',
        topRecommendations: [],
        generatedAt: new Date(),
      };
    }
  }
}
