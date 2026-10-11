import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { RiskService } from '../services/risk.service';

@Controller('safety/risk')
@UseGuards(JwtAuthGuard)
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get(':userId')
  getRisk(@Param('userId', ParseIntPipe) userId: number) {
    return this.riskService.calculateRisk(userId);
  }
}
