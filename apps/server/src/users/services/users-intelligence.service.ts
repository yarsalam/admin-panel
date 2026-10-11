import { Injectable } from '@nestjs/common';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Injectable()
export class UsersIntelligenceService {
  constructor(private readonly api: UserApiClientService) {}

  async getChurnSummary() {
    try {
      return await this.api.get('/admin-api/users/churn/summary');
    } catch {
      return null;
    }
  }

  async getAtRiskUsers(threshold = 0.7, limit = 100) {
    try {
      return await this.api.get(
        `/admin-api/users/churn/at-risk?threshold=${threshold}&limit=${limit}`,
      );
    } catch {
      return [];
    }
  }

  async getCohorts(weeks = 8) {
    try {
      return await this.api.get(`/admin-api/users/cohorts?weeks=${weeks}`);
    } catch {
      return [];
    }
  }

  async getTimeToFirstMatch(days = 30) {
    try {
      return await this.api.get(
        `/admin-api/users/time-to-first-match?days=${days}`,
      );
    } catch {
      return null;
    }
  }

  async getTimeToFirstConversation(days = 30) {
    try {
      return await this.api.get(
        `/admin-api/users/time-to-first-conversation?days=${days}`,
      );
    } catch {
      return null;
    }
  }
}
