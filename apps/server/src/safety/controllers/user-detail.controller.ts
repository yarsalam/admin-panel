import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { UserDetailService } from '../services/user-detail.service';

@Controller('safety/users')
@UseGuards(JwtAuthGuard)
export class UserDetailController {
  constructor(private readonly svc: UserDetailService) {}

  @Get(':id/360')
  get360(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get360(id);
  }

  @Get(':id/trust')
  getTrust(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getTrust(id);
  }

  @Post(':id/trust/override')
  overrideTrust(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { score: number; reason: string },
  ) {
    return this.svc.overrideTrust(id, body.score, body.reason);
  }

  @Get(':id/devices')
  getDevices(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getDevices(id);
  }

  @Post(':id/devices/:deviceId/flag')
  flagDevice(
    @Param('id', ParseIntPipe) id: number,
    @Param('deviceId') deviceId: string,
    @Body() body: { reason: string },
  ) {
    return this.svc.flagDevice(id, deviceId, body.reason);
  }

  @Delete(':id/devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeDevice(
    @Param('id', ParseIntPipe) id: number,
    @Param('deviceId') deviceId: string,
  ) {
    return this.svc.revokeDevice(id, deviceId);
  }

  @Get(':id/phones')
  getPhones(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getPhones(id);
  }

  @Post(':id/phones/:phoneId/block')
  blockPhone(
    @Param('id', ParseIntPipe) id: number,
    @Param('phoneId', ParseIntPipe) phoneId: number,
  ) {
    return this.svc.blockPhone(id, phoneId);
  }

  @Get(':id/relations')
  getRelations(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type?: string,
  ) {
    return this.svc.getRelations(id, type);
  }

  @Delete(':id/relations/:targetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRelation(
    @Param('id', ParseIntPipe) id: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.svc.removeRelation(id, targetId);
  }

  @Get(':id/personality')
  getPersonality(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getPersonality(id);
  }

  @Get(':id/badges')
  getBadges(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getBadges(id);
  }

  @Get(':id/metrics')
  getMetrics(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getMetrics(id);
  }

  @Get(':id/notifications')
  getNotifications(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit = '20',
  ) {
    return this.svc.getNotifications(id);
  }

  @Post(':id/notifications/send')
  sendNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title: string; body: string; channels?: string[] },
  ) {
    return this.svc.sendNotification(id, body);
  }

  @Post(':id/images/:imageId/requeue')
  requeueImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.svc.requeueImage(id, imageId);
  }

  @Patch(':id/images/:imageId/approve')
  approveImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.svc.approveImage(id, imageId);
  }

  @Patch(':id/images/:imageId/reject')
  rejectImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() body: { reason?: string },
  ) {
    return this.svc.rejectImage(id, imageId, body.reason);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.svc.deleteImage(id, imageId);
  }

  @Get(':id/images')
  getImages(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getImages(id);
  }
}
