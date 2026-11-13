import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../../admin/common/decorators/roles.decorator';
import { RolesGuard } from '../../admin/common/guards/roles.guard';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Controller('exec/revenue')
@UseGuards(JwtAuthGuard)
export class RevenueController {
  constructor(private readonly api: UserApiClientService) {}

  private query(params: Record<string, string | number | undefined>): string {
    const entries = Object.entries(params)
      .filter((entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== '');
    return entries.length
      ? `?${new URLSearchParams(entries.map(([key, value]) => [key, String(value)])).toString()}`
      : '';
  }

  @Get('monthly')
  async monthly(@Query('months') months?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/monthly${this.query({ months, currency })}`);
  }

  @Get('historical')
  async historical(@Query('days') days?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/historical${this.query({ days, currency })}`);
  }

  @Get('forecast')
  async forecast(@Query('days') days = '90', @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/forecast${this.query({ days, currency })}`);
  }

  @Get('anomalies')
  async anomalies(@Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/anomalies${this.query({ currency })}`);
  }

  @Get('strategic-decisions')
  async strategicDecisions(@Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/strategic-decisions${this.query({ currency })}`);
  }

  @Get('acquisition-growth')
  async acquisitionGrowth(
    @Query('days') days = '90',
    @Query('currency') currency = 'IRT',
  ) {
    return this.api.get(
      `/admin-api/revenue/acquisition-growth${this.query({ days, currency })}`,
    );
  }

  @Post('acquisition-costs')
  @UseGuards(RolesGuard)
  @Roles('superadmin')
  async createAcquisitionCost(
    @Body() body: {
      source: string;
      medium?: string | null;
      campaign?: string | null;
      campaignId?: string | null;
      category: string;
      amount: number;
      currency: string;
      occurredAt: string;
      notes?: string | null;
      idempotencyKey: string;
    },
    @Req() request: any,
  ) {
    return this.api.post('/admin-api/revenue/acquisition-costs', {
      ...body,
      createdBy: String(request.user?.id ?? request.user?.sub ?? 'superadmin'),
    });
  }

  @Get('ltv-by-source')
  async ltvBySource(@Query('days') days?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/ltv-by-source${this.query({ days, currency })}`);
  }

  /** Backward-compatible overview. */
  @Get('overview')
  async overview(@Query('currency') currency = 'IRT') {
    const [ltvRaw, monthly] = await Promise.all([
      this.api.get(`/admin-api/revenue/ltv-by-source${this.query({ currency })}`),
      this.api.get(`/admin-api/revenue/monthly${this.query({ currency })}`),
    ]);
    const ltvBySource: Record<string, number> = {};
    if (Array.isArray(ltvRaw)) {
      for (const row of ltvRaw) {
        if (row?.source) ltvBySource[row.source] = row.ltv ?? 0;
      }
    }
    return { currency, ltvBySource, monthlyRevenue: monthly ?? [] };
  }

  @Get('mrr')
  async mrr(@Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/mrr${this.query({ currency })}`);
  }

  @Get('by-product')
  async byProduct(@Query('days') days?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/by-product${this.query({ days, currency })}`);
  }

  @Get('by-gender')
  async byGender(@Query('days') days?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/by-gender${this.query({ days, currency })}`);
  }

  @Get('arppu')
  async arppu(@Query('days') days?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/arppu${this.query({ days, currency })}`);
  }

  @Get('cohort')
  async cohort(@Query('months') months?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/cohort${this.query({ months, currency })}`);
  }

  @Get('funnel')
  async funnel(@Query('days') days?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/funnel${this.query({ days, currency })}`);
  }

  @Get('churn')
  async churn(@Query('days') days?: string) {
    return this.api.get(`/admin-api/revenue/churn${this.query({ days })}`);
  }

  @Get('concentration')
  async concentration(@Query('days') days?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/concentration${this.query({ days, currency })}`);
  }

  @Get('forecast-accuracy')
  async forecastAccuracy(@Query('days') days?: string, @Query('currency') currency = 'IRT') {
    return this.api.get(`/admin-api/revenue/forecast-accuracy${this.query({ days, currency })}`);
  }
}
