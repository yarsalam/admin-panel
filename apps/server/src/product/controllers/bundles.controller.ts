import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { BundlesService } from '../services/bundles.service';

@Controller('product/bundles')
@UseGuards(JwtAuthGuard)
export class BundlesController {
  constructor(private service: BundlesService) {}

  @Get() getAll() {
    return this.service.getAll();
  }
  @Post() create(@Body() dto: any) {
    return this.service.create(dto);
  }
  @Patch(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
