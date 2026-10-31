import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { RolesGuard } from '../../admin/common/guards/roles.guard';
import { Roles } from '../../admin/common/decorators/roles.decorator';
import { AiPackControlService } from '../services/ai-pack-control.service';

type AuthenticatedRequest = Request & {
  user?: { email?: string; sub?: number };
};

@Controller('infrastructure/ai-packs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('superadmin')
export class AiPackControlController {
  constructor(private readonly service: AiPackControlService) {}

  private actor(request: AuthenticatedRequest): string {
    return request.user?.email || ('admin:' + (request.user?.sub ?? 'unknown'));
  }

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Get('jobs/:jobId')
  getJob(@Param('jobId') jobId: string) {
    return this.service.getJob(jobId);
  }

  @Post('progressive-test')
  progressiveTest(@Req() request: AuthenticatedRequest) {
    return this.service.progressiveTest(this.actor(request));
  }

  @Post('stop-all')
  stopAll(
    @Body() body: { confirm?: boolean },
    @Req() request: AuthenticatedRequest,
  ) {
    if (!body || body.confirm !== true) {
      throw new BadRequestException('برای توقف همهٔ پک‌ها تأیید صریح لازم است.');
    }
    return this.service.stopAll(true, this.actor(request));
  }

  @Post('packs/:pack/:action')
  packAction(
    @Param('pack') pack: string,
    @Param('action') action: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.packAction(pack, action, this.actor(request));
  }
}
