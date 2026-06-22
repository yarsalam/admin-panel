import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class ExperimentsService {
  constructor(private api: UserApiClientService) {}

  async runAB(userId: number, variantA: string, variantB: string) {
    return this.api
      .post('/admin-api/product/experiments/run-ab', {
        userId,
        variantA,
        variantB,
      })
      .catch(() => null);
  }
}
