import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class SystemHealthService {
  constructor(private readonly api: UserApiClientService) {}

  async getOverview() {
    try {
      return await this.api.get('/admin-api/system-health/overview');
    } catch {
      return null;
    }
  }

  async getServicesStatus() {
    try {
      return await this.api.get('/admin-api/system-health/services-status');
    } catch {
      return null;
    }
  }
}
