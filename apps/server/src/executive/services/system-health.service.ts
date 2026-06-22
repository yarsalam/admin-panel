import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SystemHealthService {
  private aiOpsUrl: string;
  private readonly services = [
    { name: 'ai_verification', url: 'http://ai_verification:8017' },
    { name: 'ai_moderation', url: 'http://ai_moderation:8018' },
    { name: 'ai_image', url: 'http://ai_image:8100' },
    { name: 'embedded_ai', url: 'http://embedded_ai:8100' },
    { name: 'ai_seo', url: 'http://ai_seo:8021' },
    { name: 'ai_revenue', url: 'http://ai_revenue:8006' },
    { name: 'ai_ops', url: 'http://ai_ops:8025' },
  ];

  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {
    this.aiOpsUrl = this.config.get('AI_OPS_URL') || 'http://ai_ops:8025';
  }

  async getSystemMetrics() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.aiOpsUrl}/metrics/latest`),
      );
      return data;
    } catch {
      return null;
    }
  }

  async getIssues() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.aiOpsUrl}/issues`),
      );
      return data;
    } catch {
      return [];
    }
  }

  async getServicesHealth() {
    return Promise.all(
      this.services.map(async (svc) => {
        try {
          const res = await firstValueFrom(
            this.httpService.get(`${svc.url}/health`, { timeout: 2000 }),
          );
          return { name: svc.name, status: 'up', details: res.data };
        } catch {
          return { name: svc.name, status: 'down' };
        }
      }),
    );
  }

  async getSecurityReport() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.aiOpsUrl}/security/report`),
      );
      return data;
    } catch {
      return null;
    }
  }
}
