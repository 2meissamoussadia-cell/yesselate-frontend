import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Public } from '../auth/public.decorator';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.analyticsService.getHealth();
  }

  @Get('kpis')
  getKpis() {
    return this.analyticsService.getKpis();
  }

  @Get('segments')
  getSegments() {
    return this.analyticsService.getSegments();
  }
}
