import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { RevenueService } from '../services/revenue.service';

@Controller('exec/revenue')
@UseGuards(JwtAuthGuard)
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get('overview') getOverview() {
    return this.revenueService.getRevenueOverview();
  }
  @Get('forecast') getForecast(
    @Query('days', new DefaultValuePipe(90), ParseIntPipe) days: number,
  ) {
    return this.revenueService.getForecast(days);
  }
  @Get('anomalies') getAnomalies() {
    return this.revenueService.getAnomalies();
  }
  @Get('strategic') getStrategicDecisions() {
    return this.revenueService.getStrategicDecisions();
  }
}
