// apps/server/src/safety/services/user-detail.service.ts
import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class UserDetailService {
  constructor(private userApi: UserApiClientService) {}

  private u(id: number) {
    return `/admin-api/safety/users/${id}`;
  }

  // ── موجود در SafetyUsersController ───────────────────────────────
  getProfile(id: number) {
    return this.userApi.get(`${this.u(id)}/profile`);
  }
  getImages(id: number) {
    return this.userApi.get(`${this.u(id)}/images`);
  }
  getActivity(id: number) {
    return this.userApi.get(`${this.u(id)}/activity`);
  }
  getFinancial(id: number) {
    return this.userApi.get(`${this.u(id)}/financial`);
  }
  getReports(id: number) {
    return this.userApi.get(`${this.u(id)}/reports`);
  }
  getModerationLogs(id: number) {
    return this.userApi.get(`${this.u(id)}/moderation-logs`);
  }
  getAiAdvice(id: number) {
    return this.userApi.get(`${this.u(id)}/ai-advice`);
  }

  // ── موجود در SafetyUserDetailController ──────────────────────────
  getTrust(id: number) {
    return this.userApi.get(`${this.u(id)}/trust`);
  }
  getDevices(id: number) {
    return this.userApi.get(`${this.u(id)}/devices`);
  }
  getPhones(id: number) {
    return this.userApi.get(`${this.u(id)}/phones`);
  }
  getPersonality(id: number) {
    return this.userApi.get(`${this.u(id)}/personality`);
  }
  getBadges(id: number) {
    return this.userApi.get(`${this.u(id)}/badges`);
  }
  getMetrics(id: number) {
    return this.userApi.get(`${this.u(id)}/metrics`);
  }
  getNotifications(id: number) {
    return this.userApi.get(`${this.u(id)}/notifications`);
  }
  getRelations(id: number, type?: string) {
    return this.userApi.get(`${this.u(id)}/relations`, type ? { type } : {});
  }

  // ── Actions ───────────────────────────────────────────────────────
  overrideTrust(id: number, score: number, reason: string) {
    return this.userApi.post(`${this.u(id)}/trust/override`, { score, reason });
  }
  flagDevice(id: number, deviceId: string, reason: string) {
    return this.userApi.post(`${this.u(id)}/devices/${deviceId}/flag`, {
      reason,
    });
  }
  revokeDevice(id: number, deviceId: string) {
    return this.userApi.delete(`${this.u(id)}/devices/${deviceId}`);
  }
  blockPhone(id: number, phoneId: number) {
    return this.userApi.post(`${this.u(id)}/phones/${phoneId}/block`);
  }
  requeueImage(id: number, imageId: number) {
    return this.userApi.post(`${this.u(id)}/images/${imageId}/requeue`);
  }
  approveImage(id: number, imageId: number) {
    return this.userApi.patch(`${this.u(id)}/images/${imageId}/approve`);
  }
  rejectImage(id: number, imageId: number, reason?: string) {
    return this.userApi.patch(`${this.u(id)}/images/${imageId}/reject`, {
      reason,
    });
  }
  deleteImage(id: number, imageId: number) {
    return this.userApi.delete(`${this.u(id)}/images/${imageId}`);
  }
  removeRelation(id: number, targetId: number) {
    return this.userApi.delete(`${this.u(id)}/relations/${targetId}`);
  }
  sendNotification(
    id: number,
    payload: { title: string; body: string; channels?: string[] },
  ) {
    return this.userApi.post(`${this.u(id)}/notifications/send`, payload);
  }

  // ── 360 aggregate ─────────────────────────────────────────────────
  async get360(id: number) {
    const [
      profile,
      trust,
      devices,
      phones,
      personality,
      badges,
      relations,
      reports,
      modLogs,
      notifications,
      metrics,
      activity,
      financial,
      aiAdvice,
      images,
    ] = await Promise.allSettled([
      this.getProfile(id),
      this.getTrust(id),
      this.getDevices(id),
      this.getPhones(id),
      this.getPersonality(id),
      this.getBadges(id),
      this.getRelations(id),
      this.getReports(id),
      this.getModerationLogs(id),
      this.getNotifications(id),
      this.getMetrics(id),
      this.getActivity(id),
      this.getFinancial(id),
      this.getAiAdvice(id),
      this.getImages(id),
    ]);

    const fields = {
      profile, trust, devices, phones, personality, badges, relations, reports,
      moderationLogs: modLogs, notifications, metrics, activity, financial,
      aiAdvice, images,
    };
    const value = (
      result: PromiseSettledResult<any>,
      fallback: any = null,
    ) => (result.status === 'fulfilled' ? result.value : fallback);
    const errors = Object.fromEntries(
      Object.entries(fields)
        .filter(([, result]) => result.status === 'rejected')
        .map(([key]) => [key, true]),
    );
    return {
      profile: value(profile),
      trust: value(trust),
      devices: value(devices, []),
      phones: value(phones, []),
      personality: value(personality),
      badges: value(badges),
      relations: value(relations, []),
      reports: value(reports, []),
      moderationLogs: value(modLogs, []),
      notifications: value(notifications, []),
      metrics: value(metrics),
      activity: value(activity),
      financial: value(financial),
      aiAdvice: value(aiAdvice),
      images: value(images, []),
      _errors: errors,
    };
  }
}
