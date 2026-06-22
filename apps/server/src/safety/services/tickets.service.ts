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
    return this.userApi.get('/tickets', params).catch(() => []);
  }

  async getTicketDetail(ticketId: number) {
    return this.userApi.get(`/tickets/${ticketId}`).catch(() => null);
  }

  async getAIAnalysis(ticketId: number) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.aiSupportUrl}/api/tickets/${ticketId}/analysis`),
      );
      return data;
    } catch {
      return null;
    }
  }

  async resolveTicket(ticketId: number, resolution: string) {
    return this.userApi.post(`/tickets/${ticketId}/resolve`, { resolution });
  }

  async addMessage(ticketId: number, userId: number, content: string) {
    return this.userApi.post(`/tickets/${ticketId}/messages`, {
      userId,
      content,
    });
  }

  async reAnalyzeTicket(ticketId: number, content: string, userId: number) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.aiSupportUrl}/api/analyze`, {
          ticketId,
          content,
          userId,
        }),
      );
      return data;
    } catch {
      return null;
    }
  }
}
