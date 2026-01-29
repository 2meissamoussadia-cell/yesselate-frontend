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
      const materielOverview = await this.stocksRepo.loadMaterielOverview(ctx);
      const nb = Number((materielOverview as any)?.nb_materiel) || 0;
      const items = Array.from({ length: Math.min(nb || 5, 20) }, (_, i) => ({
        id: `mat-${i + 1}`,
        code: `EQ-${1000 + i}`,
        libelle: ['Pelleteuse', 'Bulldozer', 'Grue', 'Camion', 'Bétonnière'][i % 5],
        statut: ['en_service', 'en_maintenance', 'hors_service'][i % 3],
        bureau: ['BMO', 'BF', 'BJ'][i % 3],
        lastControle: new Date(Date.now() - i * 86400000 * 7).toISOString().split('T')[0],
      }));
      switch (leaf) {
        case 'dashboard':
        case 'overview':
          return { ...materielOverview, items, total: items.length };
        default:
          return { ...materielOverview, items, total: items.length };
      }
    }

    // Performance Bureaux (squelette API + listes)
    if (main === 'performance' && sub === 'bureaux') {
      const bureauCodes = ['bmo', 'bf', 'bj', 'bct', 'bop', 'bcg', 'bja', 'brc', 'bpl', 'bex'];
      const bureauLabels: Record<string, string> = { bmo: 'BMO', bf: 'BF', bj: 'BJ', bct: 'BCT', bop: 'BOP', bcg: 'BCG', bja: 'BJA', brc: 'BRC', bpl: 'BPL', bex: 'BEX' };
      if (leaf === 'all') {
        const items = bureauCodes.map((code, i) => ({
          code,
          label: bureauLabels[code] ?? code.toUpperCase(),
          nbProjets: 3 + (i % 5),
          nbDemandes: 10 + (i % 20),
          tauxAvancement: 0.6 + (i % 4) * 0.1,
        }));
        return { items, total: items.length };
      }
      if (leaf === 'comparaison') {
        const items = bureauCodes.map((code, i) => ({
          code,
          label: bureauLabels[code] ?? code.toUpperCase(),
          nbProjets: 3 + (i % 5),
          nbDemandes: 10 + (i % 20),
          budgetConsomme: 50000 + i * 10000,
          tauxAvancement: 0.6 + (i % 4) * 0.1,
        }));
        return { items, total: items.length };
      }
      const code = leaf ?? 'bmo';
      const bureau = { code, label: bureauLabels[code] ?? code.toUpperCase() };
      const items = Array.from({ length: 5 }, (_, i) => ({
        id: `p-${code}-${i + 1}`,
        nom: `Projet ${code.toUpperCase()} ${i + 1}`,
        statut: ['En cours', 'En attente', 'Terminé'][i % 3],
        avancement: 20 + i * 15,
      }));
      return { bureau, items, total: items.length };
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
          return this.reportingRepo.loadOverview(ctx);
        case 'tendances':
        case 'trends':
          return this.reportingRepo.loadTrends(ctx);
        case 'bureaux':
          return this.reportingRepo.loadByBureau(ctx);
        case 'chantiers':
          return this.reportingRepo.loadByChantier(ctx);
        default:
          // Fallback vers overview si leaf non reconnu
          return this.reportingRepo.loadOverview(ctx);
      }
    }

    // Phase P7: Reporting Direction (alternative path)
    // Support pour decisions::reporting::* (nouveau sous-arbre)
    if (main === 'decisions' && sub === 'reporting') {
      switch (leaf) {
        case 'dashboard':
        case 'overview':
          return this.reportingRepo.loadOverview(ctx);
        case 'tendances':
        case 'trends':
          return this.reportingRepo.loadTrends(ctx);
        case 'bureaux':
          return this.reportingRepo.loadByBureau(ctx);
        case 'chantiers':
          return this.reportingRepo.loadByChantier(ctx);
        default:
          // Fallback vers overview si leaf non reconnu
          return this.reportingRepo.loadOverview(ctx);
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

    // Administration (squelette API + listes mock)
    if (main === 'administration') {
      if (!can(ctx as any, { perm: 'dashboard:admin' }) && !(ctx as any).roles?.includes?.('admin')) {
        throw new Error('Forbidden: administration non accessible');
      }
      switch (sub) {
        case 'settings':
          return {
            dashboard: { theme: 'slate', compactMode: false },
            kpis: { visible: ['demandes', 'budget', 'validations'], refreshInterval: 60 },
            notifications: { email: true, push: true, digest: 'daily' },
          }[leaf ?? 'dashboard'] ?? {};
        case 'users':
          if (leaf === 'liste') {
            return {
              items: [
                { id: 'u1', email: 'admin@example.com', nom: 'Admin', role: 'admin', actif: true, lastLogin: '2026-01-28T10:00:00Z' },
                { id: 'u2', email: 'manager@example.com', nom: 'Manager', role: 'manager', actif: true, lastLogin: '2026-01-27T14:30:00Z' },
                { id: 'u3', email: 'user@example.com', nom: 'User', role: 'user', actif: true, lastLogin: '2026-01-26T09:15:00Z' },
              ],
              total: 3,
            };
          }
          if (leaf === 'permissions') {
            return {
              items: [
                { userId: 'u1', permissions: ['dashboard:read', 'dashboard:write', 'dashboard:admin'], roles: ['admin'] },
                { userId: 'u2', permissions: ['dashboard:read', 'dashboard:write'], roles: ['manager'] },
                { userId: 'u3', permissions: ['dashboard:read'], roles: ['user'] },
              ],
              total: 3,
            };
          }
          return { items: [], total: 0 };
        case 'permissions':
          if (leaf === 'roles') {
            return {
              items: [
                { id: 'admin', label: 'Administrateur', count: 1 },
                { id: 'manager', label: 'Manager', count: 1 },
                { id: 'user', label: 'Utilisateur', count: 1 },
              ],
              total: 3,
            };
          }
          if (leaf === 'acces') {
            return {
              items: [
                { resource: 'dashboard', actions: ['read', 'write'], roles: ['admin', 'manager'] },
                { resource: 'admin', actions: ['read', 'write'], roles: ['admin'] },
              ],
              total: 2,
            };
          }
          return { items: [], total: 0 };
        case 'logs':
          if (leaf === 'activite') {
            return {
              items: [
                { id: 'log1', userId: 'u1', action: 'login', at: '2026-01-28T10:00:00Z', details: {} },
                { id: 'log2', userId: 'u2', action: 'view_dashboard', at: '2026-01-28T09:45:00Z', details: { view: 'overview' } },
                { id: 'log3', userId: 'u3', action: 'export', at: '2026-01-28T09:30:00Z', details: { format: 'csv' } },
              ],
              total: 3,
            };
          }
          if (leaf === 'systeme') {
            return {
              items: [
                { id: 'sys1', level: 'info', message: 'Server started', at: '2026-01-28T08:00:00Z' },
                { id: 'sys2', level: 'warn', message: 'Cache miss', at: '2026-01-28T09:00:00Z' },
              ],
              total: 2,
            };
          }
          return { items: [], total: 0 };
        default:
          return {};
      }
    }

    // Fallback : retour vide
    return {};
  }

}
