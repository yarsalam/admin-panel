import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { ModerationService } from '../services/moderation.service';

@Controller('safety/moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('images') getFlaggedImages() {
    return this.moderationService.getFlaggedImages();
  }
  @Get('messages') getFlaggedMessages() {
    return this.moderationService.getFlaggedMessages();
  }

  @Post('approve/:type/:id')
  approve(
    @Param('type') type: 'image' | 'message',
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.moderationService.approveContent(type, id);
  }

  @Post('reject/:type/:id')
  reject(
    @Param('type') type: 'image' | 'message',
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.moderationService.rejectContent(type, id);
  }

  @Post('check')
  manualCheck(
    @Body() body: { text: string; senderId: number; receiverId: number },
  ) {
    return this.moderationService.reModerate(
      body.text,
      body.senderId,
      body.receiverId,
    );
  }

  @Post('batch-check') batchCheck(@Body() items: any[]) {
    return this.moderationService.batchModerate(items);
  }
  @Get('stats') getStats() {
    return this.moderationService.getModerationStats();
  }
  @Post('cache/clear') clearCache() {
    return this.moderationService.clearModerationCache();
  }
}
