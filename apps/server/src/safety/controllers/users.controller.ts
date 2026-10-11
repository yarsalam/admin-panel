import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('safety/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/profile') getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProfile(id);
  }
  @Get(':id/activity') getActivity(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getActivity(id);
  }
  @Get(':id/financial') getFinancial(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getFinancial(id);
  }
  @Get(':id/reports') getReports(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getReports(id);
  }
  @Get(':id/moderation-logs') getModerationLogs(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.getModerationLogs(id);
  }
  @Get(':id/ai-advice') getAiAdvice(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getAiAssistantAdvice(id);
  }

  @Post(':id/re-analyze')
  reAnalyze(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { bio: string; messages: string[] },
  ) {
    return this.usersService.reAnalyzeUser(id, body.bio, body.messages);
  }

  @Post(':id/verify-face')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'selfie' }, { name: 'profile_photo' }]),
  )
  verifyFace(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      selfie: Express.Multer.File[];
      profile_photo: Express.Multer.File[];
    },
  ) {
    return this.usersService.verifyFace(
      files.selfie[0].buffer,
      files.profile_photo[0].buffer,
    );
  }
}
