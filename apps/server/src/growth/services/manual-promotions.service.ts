import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class ManualPromotionsService {
  constructor(private readonly api: UserApiClientService) {}

  async list() {
    return this.api.get('/admin-api/promotions/manual');
  }

  async create(body: Record<string, any>) {
    return this.api.post('/admin-api/promotions/manual', body);
  }

  async update(id: string, body: Record<string, any>) {
    return this.api.patch('/admin-api/promotions/manual/' + encodeURIComponent(id), body);
  }

  async disable(id: string) {
    return this.api.delete('/admin-api/promotions/manual/' + encodeURIComponent(id));
  }

  async report(id: string) {
    return this.api.get('/admin-api/promotions/manual/' + encodeURIComponent(id) + '/report');
  }
}
