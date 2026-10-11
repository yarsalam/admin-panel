import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { ReportsService } from '../services/reports.service';

@Controller('safety/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get() getAll(@Query('status') status?: string) {
    return this.reportsService.getReports(status);
  }
  @Post(':id/confirm') confirm(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.confirmReport(id);
  }
  @Post(':id/reject') reject(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.rejectReport(id);
  }
  @Post(':id/block') blockUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('adminId') adminId: string,
  ) {
    return this.reportsService.blockUser(id, adminId);
  }
  @Post('unblock/:userId') unblockUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.reportsService.unblockUser(userId);
  }
}
