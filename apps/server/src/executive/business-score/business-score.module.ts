import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BusinessScoreSnapshot } from './entities/business-score-snapshot.entity';

import { BusinessScoreService } from './business-score.service';
import { BusinessScoreController } from './business-score.controller';
import { BusinessScoreCron } from './business-score.cron';

import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessScoreSnapshot]),
    IntelligenceModule,
  ],
  controllers: [BusinessScoreController],
  providers: [BusinessScoreService, BusinessScoreCron],
  exports: [BusinessScoreService],
})
export class BusinessScoreModule {}
