import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class AiOpsService {
  constructor(private readonly api: UserApiClientService) {}

  async getOverview() {
    try {
      return await this.api.get('/admin-api/ai-ops/overview');
    } catch {
      return null;
    }
  }
}
