import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class ReportsService {
  constructor(private userApi: UserApiClientService) {}

  async getReports(status?: string) {
    const params = status ? { status } : {};
    return this.userApi.get('/reports', params).catch(() => []);
  }

  async confirmReport(reportId: number) {
    return this.userApi.post(`/reports/${reportId}/confirm`);
  }
  async rejectReport(reportId: number) {
    return this.userApi.post(`/reports/${reportId}/reject`);
  }
  async blockUser(reportId: number, adminId: string) {
    return this.userApi.post(`/reports/${reportId}/block`, { adminId });
  }
  async unblockUser(targetUserId: number) {
    return this.userApi.post(`/users/${targetUserId}/unblock`);
  }
}
