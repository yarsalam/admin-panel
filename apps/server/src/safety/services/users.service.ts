import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class UsersService {
  private aiVerificationUrl: string;

  constructor(
    private userApi: UserApiClientService,
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.aiVerificationUrl =
      config.get('AI_VERIFICATION_URL') || 'http://ai_verification:8017';
  }

  getProfile(userId: number) {
    return this.userApi
      .get(`/admin-api/safety/users/${userId}/profile`)
      .catch(() => null);
  }
  getImages(userId: number) {
    return this.userApi
      .get(`/admin-api/safety/users/${userId}/images`)
      .catch(() => []);
  }
  getActivity(userId: number) {
    return this.userApi
      .get(`/admin-api/safety/users/${userId}/activity`)
      .catch(() => null);
  }
  getFinancial(userId: number) {
    return this.userApi
      .get(`/admin-api/safety/users/${userId}/financial`)
      .catch(() => null);
  }
  getReports(userId: number) {
    return this.userApi
      .get(`/admin-api/safety/users/${userId}/reports`)
      .catch(() => []);
  }
  getModerationLogs(userId: number) {
    return this.userApi
      .get(`/admin-api/safety/users/${userId}/moderation-logs`)
      .catch(() => []);
  }
  getAiAssistantAdvice(userId: number) {
    return this.userApi
      .get(`/admin-api/safety/users/${userId}/ai-advice`)
      .catch(() => null);
  }
  reAnalyzeUser(userId: number, bio: string, messages: string[]) {
    return this.userApi
      .post(`/admin-api/safety/users/${userId}/re-analyze`, { bio, messages })
      .catch(() => null);
  }

  async verifyFace(selfieBuffer: Buffer, profileBuffer: Buffer) {
    try {
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('selfie', selfieBuffer, 'selfie.jpg');
      form.append('profile_photo', profileBuffer, 'profile.jpg');
      const { data } = await firstValueFrom(
        this.http.post(`${this.aiVerificationUrl}/verify`, form, {
          headers: form.getHeaders(),
        }),
      );
      return data;
    } catch {
      return null;
    }
  }
}
