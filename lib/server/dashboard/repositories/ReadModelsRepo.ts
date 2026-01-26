// lib/server/dashboard/repositories/ReadModelsRepo.ts
import type { RequestContext } from '../context';
import type {
  OverviewSummaryDashboardData, KpisProjetsData, KpisDemandesData, KpisFinanceData,
  KpisAchatsData, KpisStocksData, KpisMaterielData,
} from '@/modules/dashboard/types/dashboard.readmodels';

export interface ReadModelsRepo {
  loadOverviewSummaryDashboard(ctx: RequestContext): Promise<OverviewSummaryDashboardData>;
  loadKpisProjets(ctx: RequestContext): Promise<KpisProjetsData>;
  loadKpisDemandes(ctx: RequestContext): Promise<KpisDemandesData>;
  // Phase P3: KPIs Finance
  loadKpisFinance(ctx: RequestContext): Promise<KpisFinanceData>;
  // Phase P4: Modules ERP
  loadKpisAchats(ctx: RequestContext): Promise<KpisAchatsData>;
  loadKpisStocks(ctx: RequestContext): Promise<KpisStocksData>;
  loadKpisMateriel(ctx: RequestContext): Promise<KpisMaterielData>;
}
