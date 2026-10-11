import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { ExperimentsService } from '../services/experiments.service';

@Controller('product/experiments')
@UseGuards(JwtAuthGuard)
export class ExperimentsController {
  constructor(private service: ExperimentsService) {}

  @Post('run-ab')
  runAB(@Body() body: { userId: number; variantA: string; variantB: string }) {
    return this.service.runAB(body.userId, body.variantA, body.variantB);
  }
}
