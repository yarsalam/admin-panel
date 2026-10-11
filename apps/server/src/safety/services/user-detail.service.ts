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
    return this.userApi.get(`${this.u(id)}/profile`).catch(() => null);
  }
  getImages(id: number) {
    return this.userApi.get(`${this.u(id)}/images`).catch(() => []);
  }
  getActivity(id: number) {
    return this.userApi.get(`${this.u(id)}/activity`).catch(() => null);
  }
  getFinancial(id: number) {
    return this.userApi.get(`${this.u(id)}/financial`).catch(() => null);
  }
  getReports(id: number) {
    return this.userApi.get(`${this.u(id)}/reports`).catch(() => []);
  }
  getModerationLogs(id: number) {
    return this.userApi.get(`${this.u(id)}/moderation-logs`).catch(() => []);
  }
  getAiAdvice(id: number) {
    return this.userApi.get(`${this.u(id)}/ai-advice`).catch(() => null);
  }

  // ── موجود در SafetyUserDetailController ──────────────────────────
  getTrust(id: number) {
    return this.userApi.get(`${this.u(id)}/trust`).catch(() => null);
  }
  getDevices(id: number) {
    return this.userApi.get(`${this.u(id)}/devices`).catch(() => []);
  }
  getPhones(id: number) {
    return this.userApi.get(`${this.u(id)}/phones`).catch(() => []);
  }
  getPersonality(id: number) {
    return this.userApi.get(`${this.u(id)}/personality`).catch(() => null);
  }
  getBadges(id: number) {
    return this.userApi.get(`${this.u(id)}/badges`).catch(() => null);
  }
  getMetrics(id: number) {
    return this.userApi.get(`${this.u(id)}/metrics`).catch(() => null);
  }
  getNotifications(id: number) {
    return this.userApi
      .get(`${this.u(id)}/notifications`)
      .then((res) => {
        console.log('[DEBUG] notifications raw:', JSON.stringify(res));
        return res;
      })
      .catch(() => []);
  }
  getRelations(id: number, type?: string) {
    return this.userApi
      .get(`${this.u(id)}/relations`, type ? { type } : {})
      .catch(() => []);
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

    const v = (r: PromiseSettledResult<any>) =>
      r.status === 'fulfilled' ? r.value : null;

    return {
      profile: v(profile),
      trust: v(trust),
      devices: v(devices),
      phones: v(phones),
      personality: v(personality),
      badges: v(badges),
      relations: v(relations),
      reports: v(reports),
      moderationLogs: v(modLogs),
      notifications: v(notifications),
      metrics: v(metrics),
      activity: v(activity),
      financial: v(financial),
      aiAdvice: v(aiAdvice),
      images: v(images),
    };
  }
}
