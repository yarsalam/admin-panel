import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class TicketsService {
  private aiSupportUrl: string;

  constructor(
    private http: HttpService,
    private config: ConfigService,
    private userApi: UserApiClientService,
  ) {
    this.aiSupportUrl =
      config.get('AI_SUPPORT_URL') || 'http://ai_support:8016';
  }

  async getTickets(status?: string, priority?: string) {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    return this.userApi
      .get('/admin-api/safety/tickets', params)
      .catch(() => []);
  }

  async getTicketDetail(ticketId: number) {
    return this.userApi
      .get(`/admin-api/safety/tickets/${ticketId}`)
      .catch(() => null);
  }

  // ✅ اصلاح: باید از userApi بره به backend اصلی
  async getAIAnalysis(ticketId: number) {
    return this.userApi
      .get(`/admin-api/safety/tickets/${ticketId}/ai-analysis`)
      .catch(() => null);
  }

  async resolveTicket(ticketId: number, resolution: string) {
    return this.userApi.post(`/admin-api/safety/tickets/${ticketId}/resolve`, {
      resolution,
    });
  }

  async addMessage(ticketId: number, userId: number, content: string) {
    return this.userApi.post(`/admin-api/safety/tickets/${ticketId}/messages`, {
      userId,
      content,
    });
  }

  async reAnalyzeTicket(ticketId: number, content: string, userId: number) {
    return this.userApi.post(
      `/admin-api/safety/tickets/${ticketId}/re-analyze`,
      { content, userId },
    );
  }
}
