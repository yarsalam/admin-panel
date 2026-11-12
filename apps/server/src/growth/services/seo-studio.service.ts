import { BadRequestException, Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class SeoStudioService {
  constructor(private readonly api: UserApiClientService) {}

  async getContentIdeas() {
    return this.api.get('/admin-api/seo/content-opportunities');
  }

  async getAcquisition(days = 30) {
    if (!Number.isSafeInteger(days) || days < 1 || days > 365) {
      throw new BadRequestException('days must be an integer between 1 and 365');
    }
    return this.api.get(`/admin-api/seo/acquisition?days=${days}`);
  }

  async getHealthSummary() {
    return this.api.get('/admin-api/seo/admin-dashboard');
  }
}
