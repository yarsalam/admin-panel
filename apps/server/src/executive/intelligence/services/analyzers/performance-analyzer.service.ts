import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Recommendation } from '../../interfaces/recommendation.interface';

@Injectable()
export class PerformanceAnalyzerService {
  private aiOpsUrl: string;

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.aiOpsUrl = this.config.get('AI_OPS_URL') || 'http://ai_ops:8025';
  }

  async analyze(): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      const metrics = await firstValueFrom(
        this.http.get(`${this.aiOpsUrl}/metrics/latest`),
      )
        .then((r) => r.data)
        .catch(() => null);

      if (!metrics) return recommendations;

      recommendations.push(...this.analyzeCPU(metrics));
      recommendations.push(...this.analyzeMemory(metrics));
      recommendations.push(...this.analyzeLatency(metrics));
      recommendations.push(...this.analyzeQueues(metrics));
      recommendations.push(...this.analyzeErrorRate(metrics));
      recommendations.push(...this.analyzeSlowEndpoints(metrics));
    } catch {
      // silent fail
    }

    return recommendations;
  }

  private analyzeCPU(metrics: any): Recommendation[] {
    const cpu = metrics?.system?.cpu?.average || 0;
    if (cpu <= 70) return [];
    return [
      {
        id: `perf-cpu-${Date.now()}`,
        domain: 'infrastructure',
        title: cpu > 90 ? 'CPU بحرانی است' : 'CPU بالاست',
        description: `میانگین CPU ${cpu.toFixed(1)}٪ است`,
        expectedImpact: 0,
        priority: cpu > 90 ? 'critical' : 'high',
        action: 'بررسی replica ها و بهینه‌سازی Query های سنگین',
        confidence: 0.95,
      },
    ];
  }

  private analyzeMemory(metrics: any): Recommendation[] {
    const ram = metrics?.system?.memory?.percent || 0;
    if (ram <= 80) return [];
    return [
      {
        id: `perf-ram-${Date.now()}`,
        domain: 'infrastructure',
        title: 'مصرف حافظه بالاست',
        description: `حافظه ${ram.toFixed(1)}٪ مصرف شده`,
        expectedImpact: 0,
        priority: ram > 90 ? 'critical' : 'high',
        action: 'بررسی Memory Leak و افزایش RAM سرور',
        confidence: 0.95,
      },
    ];
  }

  private analyzeLatency(metrics: any): Recommendation[] {
    const latency = metrics?.app?.avg_response_time || 0;
    if (latency <= 300) return [];
    return [
      {
        id: `perf-latency-${Date.now()}`,
        domain: 'infrastructure',
        title: 'زمان پاسخ‌دهی کند است',
        description: `میانگین latency ${latency}ms است (هدف: زیر ۳۰۰ms)`,
        expectedImpact: 0,
        priority: latency > 1000 ? 'critical' : 'high',
        action: 'بررسی N+1 Queryها و اضافه کردن Redis Cache',
        confidence: 0.9,
      },
    ];
  }

  private analyzeQueues(metrics: any): Recommendation[] {
    const queueDepth = metrics?.queues?.total_depth || 0;
    if (queueDepth <= 10000) return [];
    return [
      {
        id: `perf-queue-${Date.now()}`,
        domain: 'infrastructure',
        title: 'صف‌های BullMQ پر شده‌اند',
        description: `${queueDepth.toLocaleString()} آیتم در صف منتظر پردازش هستند`,
        expectedImpact: 0,
        priority: queueDepth > 50000 ? 'critical' : 'high',
        action: 'افزایش تعداد worker ها و بررسی کارهای stuck',
        confidence: 0.9,
      },
    ];
  }

  private analyzeErrorRate(metrics: any): Recommendation[] {
    const errorRate = metrics?.app?.error_rate || 0;
    if (errorRate <= 0.01) return [];
    return [
      {
        id: `perf-errors-${Date.now()}`,
        domain: 'infrastructure',
        title: 'نرخ خطا بالاست',
        description: `${(errorRate * 100).toFixed(2)}٪ درخواست‌ها با خطا مواجه می‌شوند`,
        expectedImpact: 0,
        priority: errorRate > 0.05 ? 'critical' : 'high',
        action: 'بررسی لاگ‌ها و رفع خطاهای تکراری',
        confidence: 0.95,
      },
    ];
  }

  private analyzeSlowEndpoints(metrics: any): Recommendation[] {
    const slowEndpoints: any[] = metrics?.app?.slow_endpoints || [];
    if (!slowEndpoints.length) return [];
    const top = slowEndpoints[0];
    return [
      {
        id: `perf-slow-${Date.now()}`,
        domain: 'infrastructure',
        title: 'endpoint های کند شناسایی شد',
        description: `${top.path} با میانگین ${top.avg_ms}ms کندترین endpoint است`,
        expectedImpact: 0,
        priority: top.avg_ms > 2000 ? 'high' : 'medium',
        action: `بهینه‌سازی ${top.path} — احتمالاً N+1 Query دارد`,
        confidence: 0.85,
      },
    ];
  }
}
