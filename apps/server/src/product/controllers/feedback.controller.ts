import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { FeedbackService } from '../services/feedback.service';

@Controller('product/feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private service: FeedbackService) {}

  @Get('metrics') getMetrics() {
    return this.service.getMetrics();
  }
  @Get('conversion-insights') getConversionInsights() {
    return this.service.getConversionInsights();
  }
  @Get('top-features') getTopFeatures() {
    return this.service.getTopFeatures();
  }
  @Post('train-incremental') trainIncremental(@Body() feedback: any) {
    return this.service.trainIncremental(feedback);
  }
  @Post('train-batch') trainBatch(@Body() feedbacks: any[]) {
    return this.service.trainBatch(feedbacks);
  }
  @Post('predict') predict(@Body() feedback: any) {
    return this.service.predictConversion(feedback);
  }
  @Get('list') list(@Query('limit', ParseIntPipe) limit: number) {
    return this.service.listFeedback(limit);
  }
}
