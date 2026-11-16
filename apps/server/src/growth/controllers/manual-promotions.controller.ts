import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { ManualPromotionsService } from '../services/manual-promotions.service';

@Controller('growth/manual-promotions')
@UseGuards(JwtAuthGuard)
export class ManualPromotionsController {
  constructor(private readonly service: ManualPromotionsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  disable(@Param('id') id: string) {
    return this.service.disable(id);
  }

  @Get(':id/report')
  report(@Param('id') id: string) {
    return this.service.report(id);
  }
}
