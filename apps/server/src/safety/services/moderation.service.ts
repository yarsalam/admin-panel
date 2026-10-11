import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class ModerationService {
  private aiModerationUrl: string;

  constructor(
    private http: HttpService,
    private config: ConfigService,
    private userApi: UserApiClientService,
  ) {
    this.aiModerationUrl =
      config.get('AI_MODERATION_URL') || 'http://ai_moderation:8018';
  }

  async getFlaggedImages() {
    return this.userApi
      .get('/admin-api/safety/moderation/flagged-images')
      .catch(() => []);
  }
  async getFlaggedMessages() {
    return this.userApi
      .get('/admin-api/safety/moderation/flagged-messages')
      .catch(() => []);
  }
  async approveContent(type: 'image' | 'message', id: number) {
    return this.userApi.post(
      `/admin-api/safety/moderation/approve/${type}/${id}`,
    );
  }
  async rejectContent(type: 'image' | 'message', id: number) {
    return this.userApi.post(
      `/admin-api/safety/moderation/reject/${type}/${id}`,
    );
  }

  async reModerate(text: string, senderId: number, receiverId: number) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.aiModerationUrl}/moderate`, {
          text,
          sender_id: senderId,
          receiver_id: receiverId,
        }),
      );
      return data;
    } catch {
      return null;
    }
  }

  async batchModerate(items: any[]) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(`${this.aiModerationUrl}/moderate/batch`, {
          requests: items,
        }),
      );
      return data;
    } catch {
      return null;
    }
  }

  async getModerationStats() {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.aiModerationUrl}/stats`),
      );
      return data;
    } catch {
      return null;
    }
  }

  async clearModerationCache() {
    try {
      // رفع باگ: خواندن secret از env
      const secret =
        this.config.get('AI_MODERATION_ADMIN_SECRET') || 'change-me-in-env';
      const { data } = await firstValueFrom(
        this.http.post(`${this.aiModerationUrl}/admin/cache/clear`, { secret }),
      );
      return data;
    } catch {
      return null;
    }
  }
}
