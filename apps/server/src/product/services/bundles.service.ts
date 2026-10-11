import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class BundlesService {
  constructor(private api: UserApiClientService) {}

  async getAll() {
    return this.api.get('/admin-api/product/bundles').catch(() => []);
  }
  async create(dto: any) {
    return this.api.post('/admin-api/product/bundles', dto);
  }
  async update(id: number, dto: any) {
    return this.api.patch(`/admin-api/product/bundles/${id}`, dto);
  }
  async remove(id: number) {
    return this.api.delete(`/admin-api/product/bundles/${id}`);
  }
}
