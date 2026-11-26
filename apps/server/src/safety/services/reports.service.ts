import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

const REPORTS_API_PATH = '/admin-api/safety/reports';

@Injectable()
export class ReportsService {
  constructor(private userApi: UserApiClientService) {}

  async getReports(status?: string) {
    const params = status ? { status } : {};
    return this.userApi.get(REPORTS_API_PATH, params);
  }

  async confirmReport(reportId: number) {
    return this.userApi.post(`${REPORTS_API_PATH}/${reportId}/confirm`);
  }

  async rejectReport(reportId: number) {
    return this.userApi.post(`${REPORTS_API_PATH}/${reportId}/reject`);
  }

  async blockUser(reportId: number, adminId: string) {
    return this.userApi.post(`${REPORTS_API_PATH}/${reportId}/block`, { adminId });
  }

  async unblockUser(targetUserId: number) {
    return this.userApi.post(`${REPORTS_API_PATH}/unblock/${targetUserId}`);
  }
}
