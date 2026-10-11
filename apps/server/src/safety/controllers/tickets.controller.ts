import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { TicketsService } from '../services/tickets.service';

@Controller('safety/tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.ticketsService.getTickets(status, priority);
  }

  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getTicketDetail(id);
  }

  @Get(':id/ai-analysis')
  getAIAnalysis(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.getAIAnalysis(id);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Body('resolution') resolution: string,
  ) {
    return this.ticketsService.resolveTicket(id, resolution);
  }

  @Post(':id/message')
  addMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number; content: string },
  ) {
    return this.ticketsService.addMessage(id, body.userId, body.content);
  }

  @Post(':id/re-analyze')
  reAnalyze(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string; userId: number },
  ) {
    return this.ticketsService.reAnalyzeTicket(id, body.content, body.userId);
  }
}
