import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const ALLOWED_PACKS = new Set([
  'matching-pack',
  'seo-pack',
  'revenue-pack',
  'safety-pack',
]);
const ALLOWED_ACTIONS = new Set(['start', 'stop', 'test']);

@Injectable()
export class AiPackControlService {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = (this.config.get<string>('AI_PACK_CONTROL_URL') ?? '').replace(/\/+$/, '');
    this.token = this.config.get<string>('AI_PACK_CONTROL_TOKEN') ?? '';
  }

  private assertConfigured(): void {
    if (!this.baseUrl || this.token.length < 48) {
      throw new ServiceUnavailableException(
        'کنترل‌کنندهٔ پک‌های هوش مصنوعی هنوز روی سرور نصب یا پیکربندی نشده است.',
      );
    }
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
    actor = 'admin',
  ): Promise<T> {
    this.assertConfigured();
    try {
      const response = await firstValueFrom(
        this.http.request<T>({
          method,
          url: this.baseUrl + path,
          data: body,
          timeout: method === 'GET' ? 15000 : 20000,
          headers: {
            Authorization: 'Bearer ' + this.token,
            'X-Admin-Actor': actor.slice(0, 80),
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        typeof error?.response?.data?.error === 'string'
          ? error.response.data.error
          : 'اتصال به کنترل‌کنندهٔ پک‌ها برقرار نشد.';
      if (status === 409) throw new BadRequestException(message);
      if (status === 400) throw new BadRequestException(message);
      if (status === 401 || status === 403) {
        throw new ServiceUnavailableException(
          'احراز هویت کنترل‌کنندهٔ پک‌ها ناموفق است؛ تنظیمات داخلی بررسی شود.',
        );
      }
      throw new BadGatewayException(message);
    }
  }

  getStatus(): Promise<Record<string, unknown>> {
    return this.request('GET', '/v1/status');
  }

  getJob(jobId: string): Promise<Record<string, unknown>> {
    if (!/^[a-f0-9]{16}$/.test(jobId)) {
      throw new BadRequestException('شناسهٔ عملیات معتبر نیست.');
    }
    return this.request('GET', '/v1/jobs/' + jobId);
  }

  progressiveTest(actor: string): Promise<Record<string, unknown>> {
    return this.request('POST', '/v1/test-progressive', {}, actor);
  }

  stopAll(confirm: boolean, actor: string): Promise<Record<string, unknown>> {
    if (confirm !== true) {
      throw new BadRequestException('برای توقف همهٔ پک‌ها تأیید صریح لازم است.');
    }
    return this.request('POST', '/v1/stop-all', { confirm: true }, actor);
  }

  packAction(
    pack: string,
    action: string,
    actor: string,
  ): Promise<Record<string, unknown>> {
    if (!ALLOWED_PACKS.has(pack) || !ALLOWED_ACTIONS.has(action)) {
      throw new BadRequestException('پک یا عملیات در فهرست مجاز نیست.');
    }
    return this.request(
      'POST',
      '/v1/packs/' + pack + '/' + action,
      {},
      actor,
    );
  }
}
