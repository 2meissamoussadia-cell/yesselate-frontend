// lib/server/dashboard/services/dashboardReadService.ts
import type { RequestContext } from '../context';
import type { ReadModelsRepo } from '../repositories/ReadModelsRepo';
import { OverviewSummaryDashboardSchema } from '../schemas';
import { SqlReadModelsRepoAchats } from '../repositories/SqlReadModelsRepo.Achats';
import { SqlReadModelsRepoReporting } from '../repositories/SqlReadModelsRepo.Reporting';
import { SqlReadModelsRepoStocks } from '../repositories/SqlReadModelsRepo.Stocks';
import { SqlReadModelsRepoCompliance } from '../repositories/SqlReadModelsRepo.Compliance';
import { can } from '../../security/policy';
import type { PaginationOptions } from '../types/pagination';

/**
 * Options pour les requêtes de données
 */
export interface GetDataOptions {
  pagination?: PaginationOptions;
}

export class DashboardReadService {
  constructor(
    private readonly repo: ReadModelsRepo,
    private readonly achatsRepo = new SqlReadModelsRepoAchats(),
    private readonly reportingRepo = new SqlReadModelsRepoReporting(),
    private readonly stocksRepo = new SqlReadModelsRepoStocks(),
    private readonly complianceRepo = new SqlReadModelsRepoCompliance()
  ) {}

  async getData(
    main: string, 
    sub: string | null, 
    leaf: string | null, 
    ctx: RequestContext,
    options: GetDataOptions = {}
  ) {
    // Dispatcher simple ; on pourra factoriser par mapping si besoin
    if (main === 'overview' && sub === 'summary' && leaf === 'dashboard') {
      const data = await this.repo.loadOverviewSummaryDashboard(ctx);
      return OverviewSummaryDashboardSchema.parse(data); // validation zod
    }

    if (main === 'overview' && sub === 'kpis' && leaf === 'projets') {
      return this.repo.loadKpisProjets(ctx);
    }

    if (main === 'overview' && sub === 'kpis' && leaf === 'demandes') {
      return this.repo.loadKpisDemandes(ctx);
    }

    // Phase P3: KPIs Finance
    if (main === 'overview' && sub === 'kpis' && leaf === 'finance') {
      return this.repo.loadKpisFinance(ctx);
    }

    // Phase P5: Modules ERP - Achats/Contrats
    if (main === 'performance' && sub === 'achats') {
      // Phase P10: Vérifier permission + feature flag
      if (!can(ctx as any, { perm: 'achats:view', flag: 'module.achats' })) {
        throw new Error('Forbidden: module achats non accessible');
      }
      switch (leaf) {
        case 'dashboard':
        case 'overview':
          return this.achatsRepo.loadOverview(ctx);
        case 'trends':
          return this.achatsRepo.loadTrends(ctx);
        case 'fournisseurs':
          return this.achatsRepo.loadFournisseurs(ctx);
        case 'commandes':
        case 'open-orders':
          return this.achatsRepo.loadOpenOrders(ctx);
        default:
          // Fallback vers overview si leaf non reconnu
          return this.achatsRepo.loadOverview(ctx);
      }
    }

    // Phase P6: Modules ERP - Stocks
    if (main === 'performance' && sub === 'stocks') {
      // Phase P10: Vérifier permission + feature flag
      if (!can(ctx as any, { perm: 'stocks:view', flag: 'module.stocks' })) {
        throw new Error('Forbidden: module stocks non accessible');
      }
      switch (leaf) {
        case 'dashboard':
        case 'overview':
          return this.stocksRepo.loadStocksOverview(ctx);
        case 'trends':
          return this.stocksRepo.loadStocksTrends(ctx);
        default:
          return this.stocksRepo.loadStocksOverview(ctx);
      }
    }

    // Phase P6: Modules ERP - Matériel
    if (main === 'performance' && sub === 'materiel') {
      // Phase P10: Vérifier permission + feature flag (même module que stocks)
      if (!can(ctx as any, { perm: 'materiel:view', flag: 'module.materiel' })) {
        throw new Error('Forbidden: module materiel non accessible');
      }
      switch (leaf) {
        case 'dashboard':
        case 'overview':
          return this.stocksRepo.loadMaterielOverview(ctx);
        default:
          return this.stocksRepo.loadMaterielOverview(ctx);
      }
    }

    // Phase P7: Reporting Direction
    // Support pour performance::reporting::* (existant)
    if (main === 'performance' && sub === 'reporting') {
      // Phase P10: Vérifier permission + feature flag
      if (!can(ctx as any, { perm: 'reporting:view', flag: 'module.reporting' })) {
        throw new Error('Forbidden: module reporting non accessible');
      }
      switch (leaf) {
        case 'dashboard':
        case 'overview':
          return this.reportingOverview(ctx);
        case 'tendances':
        case 'trends':
          return this.reportingTrends(ctx);
        case 'bureaux':
          return this.reportingByBureau(ctx);
        case 'chantiers':
          return this.reportingByChantier(ctx);
        default:
          // Fallback vers overview si leaf non reconnu
          return this.reportingOverview(ctx);
      }
    }

    // Phase P7: Reporting Direction (alternative path)
    // Support pour decisions::reporting::* (nouveau sous-arbre)
    if (main === 'decisions' && sub === 'reporting') {
      switch (leaf) {
        case 'dashboard':
        case 'overview':
          return this.reportingOverview(ctx);
        case 'tendances':
        case 'trends':
          return this.reportingTrends(ctx);
        case 'bureaux':
          return this.reportingByBureau(ctx);
        case 'chantiers':
          return this.reportingByChantier(ctx);
        default:
          // Fallback vers overview si leaf non reconnu
          return this.reportingOverview(ctx);
      }
    }

    // Phase P8: Conformité & Marchés publics
    if (main === 'performance' && sub === 'compliance') {
      // Phase P10: Vérifier permission + feature flag
      if (!can(ctx as any, { perm: 'compliance:view', flag: 'module.compliance' })) {
        throw new Error('Forbidden: module compliance non accessible');
      }
      switch (leaf) {
        case 'dashboard':
          return this.complianceRepo.loadOverview(ctx);
        case 'backlog':
          return this.complianceRepo.loadBacklog(ctx);
        case 'documents':
          return this.complianceRepo.loadMissingDocs(ctx);
        case 'lots':
          return this.complianceRepo.loadLotsOpen(ctx);
        default:
          return this.complianceRepo.loadOverview(ctx);
      }
    }

    // Fallback : retour vide
    return {};
  }

}
