import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserApiClientModule } from '../admin/common/api-client/user-api-client.module';
import { FeedSimulatorController } from './controllers/feed-simulator.controller';
import { AlgorithmTuningController } from './controllers/algorithm-tuning.controller';
import { FeedbackController } from './controllers/feedback.controller';
import { BundlesController } from './controllers/bundles.controller';
import { ExperimentsController } from './controllers/experiments.controller';
import { FeedSimulatorService } from './services/feed-simulator.service';
import { AlgorithmTuningService } from './services/algorithm-tuning.service';
import { FeedbackService } from './services/feedback.service';
import { BundlesService } from './services/bundles.service';
import { ExperimentsService } from './services/experiments.service';

@Module({
  imports: [HttpModule, UserApiClientModule],
  controllers: [
    FeedSimulatorController,
    AlgorithmTuningController,
    FeedbackController,
    BundlesController,
    ExperimentsController,
  ],
  providers: [
    FeedSimulatorService,
    AlgorithmTuningService,
    FeedbackService,
    BundlesService,
    ExperimentsService,
  ],
})
export class ProductModule {}
