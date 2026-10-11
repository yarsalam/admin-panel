import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BusinessScoreService } from './business-score.service';

@Injectable()
export class BusinessScoreCron {
  constructor(private readonly service: BusinessScoreService) {}

  @Cron('0 2 * * *') // هر شب ساعت ۲
  async handleSnapshot() {
    await this.service.saveTodaysSnapshot();
  }
}
