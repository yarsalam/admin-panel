import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../admin/common/guards/jwt-auth.guard';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

@Controller('exec/revenue')
@UseGuards(JwtAuthGuard)
export class RevenueController {
  constructor(private readonly api: UserApiClientService) {}

  // ─── endpointهای موجود ───────────────────────────────────────────────────

  @Get('monthly')
  async monthly(@Query('months') months?: string) {
    const params = months ? `?months=${months}` : '';
    return this.api.get(`/admin-api/revenue/monthly${params}`);
  }

  @Get('historical')
  async historical(@Query('days') days?: string) {
    const params = days ? `?days=${days}` : '';
    return this.api.get(`/admin-api/revenue/historical${params}`);
  }

  @Get('forecast')
  async forecast(@Query('days') days = 90) {
    return this.api.get(`/admin-api/revenue/forecast?days=${days}`);
  }

  @Get('anomalies')
  async anomalies() {
    return this.api.get('/admin-api/revenue/anomalies');
  }

  @Get('strategic-decisions')
  async strategicDecisions() {
    return this.api.get('/admin-api/revenue/strategic-decisions');
  }

  @Get('ltv-by-source')
  async ltvBySource() {
    return this.api.get('/admin-api/revenue/ltv-by-source');
  }

  /** overview — ترکیب ltv و monthly برای backward compat */
  @Get('overview')
  async overview() {
    const [ltvRaw, monthly] = await Promise.all([
      this.api.get('/admin-api/revenue/ltv-by-source'),
      this.api.get('/admin-api/revenue/monthly'),
    ]);
    const ltvBySource: Record<string, number> = {};
    if (Array.isArray(ltvRaw)) {
      for (const row of ltvRaw) {
        if (row?.source) ltvBySource[row.source] = row.ltv ?? 0;
      }
    }
    return { ltvBySource, monthlyRevenue: monthly ?? [] };
  }

  // ─── endpointهای جدید ────────────────────────────────────────────────────

  /** MRR / ARR / MRR Growth */
  @Get('mrr')
  async mrr() {
    return this.api.get('/admin-api/revenue/mrr');
  }

  /** درآمد به تفکیک محصول (VIP، Boost، Credit Pack، …) */
  @Get('by-product')
  async byProduct() {
    return this.api.get('/admin-api/revenue/by-product');
  }

  /** درآمد به تفکیک جنسیت */
  @Get('by-gender')
  async byGender() {
    return this.api.get('/admin-api/revenue/by-gender');
  }

  /** ARPPU و Paying User Rate */
  @Get('arppu')
  async arppu() {
    return this.api.get('/admin-api/revenue/arppu');
  }

  /** Cohort Revenue — درآمد کاربران بر اساس ماه جذب */
  @Get('cohort')
  async cohort() {
    return this.api.get('/admin-api/revenue/cohort');
  }

  /** Revenue Conversion Funnel */
  @Get('funnel')
  async funnel() {
    return this.api.get('/admin-api/revenue/funnel');
  }

  /** Churn Revenue — lost / recovered / expansion / NRR */
  @Get('churn')
  async churn() {
    return this.api.get('/admin-api/revenue/churn');
  }

  /** Revenue Concentration — top 1% / 5% / 10% */
  @Get('concentration')
  async concentration() {
    return this.api.get('/admin-api/revenue/concentration');
  }

  /** Forecast Accuracy — MAPE / RMSE */
  @Get('forecast-accuracy')
  async forecastAccuracy() {
    return this.api.get('/admin-api/revenue/forecast-accuracy');
  }
}
