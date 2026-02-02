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

    // Pilotage (SubSidebar) : gouvernance, calendrier, analytics, hse — chargement dynamique via overview/summary
    if (main === 'pilotage' && (sub === 'gouvernance' || sub === 'calendrier' || sub === 'analytics' || sub === 'hse')) {
      const data = await this.repo.loadOverviewSummaryDashboard(ctx);
      return OverviewSummaryDashboardSchema.parse(data);
    }

    // Phase P2: performance/kpis/* — mêmes données que overview (loaders front appellent performance/kpis/*)
    if (main === 'performance' && sub === 'kpis' && leaf === 'projets') {
      return this.repo.loadKpisProjets(ctx);
    }
    if (main === 'performance' && sub === 'kpis' && leaf === 'demandes') {
      return this.repo.loadKpisDemandes(ctx);
    }
    if (main === 'performance' && sub === 'kpis' && leaf === 'budget') {
      // Mock KpisBudgetData pour BudgetKpiPage (backend réel à brancher plus tard)
      const total = 4_200_000_000;
      const consomme = 3_100_000_000;
      const reste = total - consomme;
      const pourcentage = total > 0 ? Math.round((consomme / total) * 100) : 0;
      return {
        budget: { total, consomme, reste, pourcentage },
        parCategorie: [
          { categorie: 'Bâtiment', budget: 1_800_000_000, consomme: 1_350_000_000, pourcentage: 75, evolution: 2, alert: 'ok' as const },
          { categorie: 'VRD', budget: 1_200_000_000, consomme: 980_000_000, pourcentage: 82, evolution: -1, alert: 'warning' as const },
          { categorie: 'Équipements', budget: 1_200_000_000, consomme: 770_000_000, pourcentage: 64, evolution: 0, alert: 'ok' as const },
        ],
        parProjet: [
          { projetId: 'p1', projetNom: 'Villa Diamniadio', budget: 36_400_000, consomme: 24_700_000, reste: 11_700_000, pourcentage: 68 },
          { projetId: 'p2', projetNom: 'Complexe Résidentiel', budget: 28_200_000, consomme: 22_100_000, reste: 6_100_000, pourcentage: 78 },
          { projetId: 'p3', projetNom: 'Infrastructure Route', budget: 45_800_000, consomme: 48_200_000, reste: 0, pourcentage: 105 },
        ],
      };
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

    // ========== Performance Validation (mock) ==========
    if (main === 'performance' && sub === 'validation') {
      const now = new Date().toISOString().split('T')[0];
      if (leaf === 'en-attente') {
        return {
          validations: [
            { id: 'VAL-001', type: 'bc' as const, titre: 'BC Matériaux Chantier A', bureau: 'BMO', demandeur: 'J. Dupont', montant: 4500000, montantFormatted: '4.5M XOF', dateCreation: '2026-01-25', dateLimite: '2026-01-30', urgent: true, enRetard: false, niveau: 2, etapeActuelle: 'Validation DAF' },
            { id: 'VAL-002', type: 'facture' as const, titre: 'Facture Fournisseur X', bureau: 'BF', demandeur: 'M. Martin', montant: 1200000, montantFormatted: '1.2M XOF', dateCreation: '2026-01-20', dateLimite: '2026-01-22', urgent: true, enRetard: true, niveau: 1, etapeActuelle: 'Rapprochement BC' },
            { id: 'VAL-003', type: 'avenant' as const, titre: 'Avenant Contrat Villa Fann', bureau: 'BCG', demandeur: 'S. Diallo', montant: 8500000, montantFormatted: '8.5M XOF', dateCreation: '2026-01-28', dateLimite: '2026-02-05', urgent: false, enRetard: false, niveau: 1, etapeActuelle: 'Vérification technique' },
          ],
          stats: { total: 3, urgentes: 2, normales: 1, enRetard: 1 },
        };
      }
      if (leaf === 'validees') {
        return {
          validations: [
            { id: 'V-101', type: 'bc' as const, titre: 'BC Équipement', bureau: 'BMO', demandeur: 'J. Dupont', montant: 3200000, montantFormatted: '3.2M XOF', dateValidation: '2026-01-27', validePar: 'DAF', dureeValidation: 2 },
            { id: 'V-102', type: 'facture' as const, titre: 'Facture ACME', bureau: 'BF', demandeur: 'M. Martin', montant: 980000, montantFormatted: '980K XOF', dateValidation: '2026-01-26', validePar: 'Comptabilité', dureeValidation: 1 },
          ],
          stats: { total: 45, cetteSemaine: 12, ceMois: 45, tempsMoyen: 2.5 },
        };
      }
      if (leaf === 'rejetees') {
        return {
          validations: [
            { id: 'R-201', type: 'bc' as const, titre: 'BC Non conforme', bureau: 'BMO', demandeur: 'J. Dupont', montant: 1500000, montantFormatted: '1.5M XOF', dateRejet: '2026-01-24', rejetePar: 'DAF', motif: 'Devis obsolète' },
          ],
          stats: { total: 8, cetteSemaine: 2, ceMois: 8, tauxRejet: 0.15 },
        };
      }
    }

    // ========== Performance Budget (mock) ==========
    if (main === 'performance' && sub === 'budget') {
      if (leaf === 'consommation') {
        return {
          consommation: [
            { id: 'c1', projet: 'Villa Diamniadio', categorie: 'Bâtiment', bureau: 'BMO', budgetInitial: 36400000, budgetConsomme: 24700000, budgetRestant: 11700000, pourcentage: 68, tendance: 'up' as const },
            { id: 'c2', projet: 'Complexe Résidentiel', categorie: 'VRD', bureau: 'BF', budgetInitial: 28200000, budgetConsomme: 22100000, budgetRestant: 6100000, pourcentage: 78, tendance: 'stable' as const },
            { id: 'c3', categorie: 'Équipements', bureau: 'BCG', budgetInitial: 12000000, budgetConsomme: 8500000, budgetRestant: 3500000, pourcentage: 71, tendance: 'down' as const },
          ],
          stats: { totalConsomme: 55300000, totalBudget: 76600000, pourcentage: 72, parProjet: 2, parCategorie: 3 },
        };
      }
      if (leaf === 'restant') {
        return {
          budgetRestant: [
            { id: 'r1', projet: 'Villa Diamniadio', categorie: 'Bâtiment', bureau: 'BMO', budgetInitial: 36400000, budgetConsomme: 24700000, budgetRestant: 11700000, pourcentageRestant: 32, isCritique: false },
            { id: 'r2', projet: 'Lot 4 Infra', categorie: 'VRD', bureau: 'BF', budgetInitial: 15000000, budgetConsomme: 13800000, budgetRestant: 1200000, pourcentageRestant: 8, isCritique: true },
          ],
          stats: { totalRestant: 12900000, parProjet: 2, parCategorie: 2, critique: 1 },
        };
      }
      if (leaf === 'previsions') {
        return {
          previsions: [
            { id: 'p1', periode: '2026-02', projet: 'Villa Diamniadio', categorie: 'Bâtiment', budgetPrevu: 5000000, budgetRealise: 0, variance: 0, variancePourcentage: 0 },
            { id: 'p2', periode: '2026-Q1', categorie: 'VRD', budgetPrevu: 25000000, budgetRealise: 18500000, variance: -6500000, variancePourcentage: -26 },
          ],
          stats: { totalPrevu: 120000000, ceMois: 15000000, ceTrimestre: 45000000, cetteAnnee: 120000000 },
        };
      }
      if (leaf === 'analyse') {
        return {
          analyses: [
            { id: 'a1', projet: 'Villa Diamniadio', categorie: 'Bâtiment', periode: '2026-01', budgetInitial: 36400000, budgetConsomme: 24700000, budgetPrevu: 24000000, variance: 700000, variancePourcentage: 2.9, tendance: 'up' as const },
          ],
          stats: { variance: 700000, tendance: 2.5, ecartType: 1.2, projetsSurBudget: 8 },
          tendances: [
            { periode: '2026-01', consommation: 55300000, prevision: 52000000 },
            { periode: '2025-12', consommation: 48500000, prevision: 50000000 },
          ],
        };
      }
    }

    // ========== Performance Delays (mock) ==========
    if (main === 'performance' && sub === 'delays') {
      const today = new Date().toISOString().split('T')[0];
      if (leaf === 'critiques') {
        return {
          retards: [
            { id: 'D1', projet: 'Chantier A', type: 'validation' as const, titre: 'Validation BC retardée', bureau: 'BMO', dateEcheance: '2026-01-15', dateActuelle: today, joursRetard: 16, impactBudget: 500000, impactBudgetFormatted: '500K XOF', priorite: 'critical' as const, cause: 'Attente pièce justificative' },
            { id: 'D2', type: 'paiement' as const, titre: 'Paiement fournisseur échu', bureau: 'BF', dateEcheance: '2026-01-20', dateActuelle: today, joursRetard: 11, impactBudget: 1200000, impactBudgetFormatted: '1.2M XOF', priorite: 'critical' as const },
          ],
          stats: { total: 2, plus30Jours: 0, plus60Jours: 0, impactBudget: 1700000 },
        };
      }
      if (leaf === 'moyens') {
        return {
          retards: [
            { id: 'M1', projet: 'Chantier B', type: 'demande' as const, titre: 'Demande avenant en cours', bureau: 'BCG', dateEcheance: '2026-01-25', dateActuelle: today, joursRetard: 6, tendance: 'stable' as const },
          ],
          stats: { total: 1, entre7et30Jours: 1, entre30et60Jours: 0, enAmelioration: 0 },
        };
      }
      if (leaf === 'analyse-causes') {
        return {
          analyses: [
            { id: 'AC1', cause: 'Pièces justificatives manquantes', occurrences: 12, projetsAffectes: 5, impactMoyen: 8, tendance: 'down' as const, actionsCorrectives: ['Checklist fournisseur'] },
            { id: 'AC2', cause: 'Délai validation hiérarchique', occurrences: 8, projetsAffectes: 4, impactMoyen: 5, tendance: 'stable' as const },
          ],
          stats: { causesIdentifiees: 2, causesRecurrentes: 1, projetsAffectes: 6, tendance: -5 },
        };
      }
    }

    // ========== Performance Indicators (mock) ==========
    if (main === 'performance' && sub === 'indicators') {
      if (leaf === 'synthese') {
        return {
          synthese: [
            { id: 's1', kpi: 'Délai moyen validation', valeur: 2.5, cible: 3, statut: 'atteint' as const, tendance: 'down' as const, evolution: -10 },
            { id: 's2', kpi: 'Taux consommation budget', valeur: 72, cible: 80, statut: 'atteint' as const, tendance: 'stable' as const, evolution: 2 },
            { id: 's3', kpi: 'Retards critiques', valeur: 2, cible: 0, statut: 'critique' as const, tendance: 'up' as const, evolution: 100 },
          ],
          stats: { scoreGlobal: 68, kpisAtteints: 2, kpisEnRetard: 1, tendance: 1 },
        };
      }
      if (leaf === 'projets') {
        return {
          projets: [
            { id: 'pr1', nom: 'Villa Diamniadio', bureau: 'BMO', progression: 68, statut: 'dans-les-temps' as const, budgetConsomme: 24700000, budgetPrevu: 36400000 },
            { id: 'pr2', nom: 'Complexe Résidentiel', bureau: 'BF', progression: 78, statut: 'en-avance' as const, budgetConsomme: 22100000, budgetPrevu: 28200000 },
            { id: 'pr3', nom: 'Lot 4 Infra', bureau: 'BCG', progression: 55, statut: 'en-retard' as const, joursRetard: 12, budgetConsomme: 13800000, budgetPrevu: 15000000 },
          ],
          stats: { total: 3, enAvance: 1, enRetard: 1, dansLesTemps: 1 },
        };
      }
      if (leaf === 'demandes') {
        return {
          demandes: [
            { id: 'dm1', type: 'BC', titre: 'BC Matériaux', bureau: 'BMO', statut: 'en-attente' as const, dateCreation: '2026-01-28', delaiTraitement: undefined },
            { id: 'dm2', type: 'Facture', titre: 'Facture Fournisseur', bureau: 'BF', statut: 'traitee' as const, dateCreation: '2026-01-20', dateTraitement: '2026-01-26', delaiTraitement: 6 },
          ],
          stats: { total: 247, traitees: 180, enCours: 42, enAttente: 25 },
        };
      }
      if (leaf === 'budget') {
        return {
          budget: [
            { id: 'b1', projet: 'Villa Diamniadio', categorie: 'Bâtiment', budgetAlloue: 36400000, budgetConsomme: 24700000, budgetRestant: 11700000, pourcentage: 68 },
            { id: 'b2', projet: 'Complexe Résidentiel', categorie: 'VRD', budgetAlloue: 28200000, budgetConsomme: 22100000, budgetRestant: 6100000, pourcentage: 78 },
          ],
          stats: { totalAlloue: 76600000, totalConsomme: 55300000, pourcentage: 72, reste: 21300000 },
        };
      }
    }

    // ========== Performance Trends (mock) ==========
    if (main === 'performance' && sub === 'trends') {
      if (leaf === 'mensuelles') {
        return {
          trends: [
            { id: 'tm1', mois: '2026-01', label: 'Janvier 2026', projets: 42, demandes: 247, budgetConsomme: 55300000, budgetPrevu: 52000000, retards: 2, scorePerformance: 72, evolution: 2, tendance: 'up' as const },
            { id: 'tm2', mois: '2025-12', label: 'Décembre 2025', projets: 40, demandes: 230, budgetConsomme: 48500000, budgetPrevu: 50000000, retards: 3, scorePerformance: 70, evolution: -1, tendance: 'down' as const },
          ],
          stats: { totalMois: 12, moyenneScore: 71, meilleurMois: '2026-01', pireMois: '2025-11', evolutionGlobale: 2 },
        };
      }
      if (leaf === 'trimestrielles') {
        return {
          trends: [
            { id: 'tt1', trimestre: '2026-Q1', label: 'Q1 2026', projets: 42, demandes: 680, budgetConsomme: 145000000, budgetPrevu: 150000000, retards: 5, scorePerformance: 72, evolution: 3, tendance: 'up' as const },
            { id: 'tt2', trimestre: '2025-Q4', label: 'Q4 2025', projets: 40, demandes: 620, budgetConsomme: 138000000, budgetPrevu: 140000000, retards: 8, scorePerformance: 69, evolution: -2, tendance: 'down' as const },
          ],
          stats: { totalTrimestres: 4, moyenneScore: 70, meilleurTrimestre: '2026-Q1', pireTrimestre: '2025-Q3', evolutionGlobale: 3 },
        };
      }
      if (leaf === 'annuelles') {
        return {
          trends: [
            { id: 'ta1', annee: '2026', projets: 42, demandes: 2500, budgetConsomme: 580000000, budgetPrevu: 620000000, retards: 18, scorePerformance: 72, evolution: 4, tendance: 'up' as const },
            { id: 'ta2', annee: '2025', projets: 38, demandes: 2200, budgetConsomme: 520000000, budgetPrevu: 550000000, retards: 25, scorePerformance: 68, evolution: -1, tendance: 'down' as const },
          ],
          stats: { totalAnnees: 2, moyenneScore: 70, meilleureAnnee: '2026', pireAnnee: '2025', evolutionGlobale: 4 },
        };
      }
    }

    // ========== Performance Comparison (mock) ==========
    if (main === 'performance' && sub === 'comparison') {
      if (leaf === 'bureaux') {
        return {
          comparaisons: [
            { id: 'cb1', bureau: 'BMO', projets: 12, demandes: 85, budgetConsomme: 185000000, budgetPrevu: 200000000, retards: 2, scorePerformance: 78, rang: 1, ecartMoyen: 5 },
            { id: 'cb2', bureau: 'BF', projets: 10, demandes: 72, budgetConsomme: 142000000, budgetPrevu: 165000000, retards: 4, scorePerformance: 72, rang: 2, ecartMoyen: -2 },
            { id: 'cb3', bureau: 'BCG', projets: 8, demandes: 58, budgetConsomme: 98000000, budgetPrevu: 120000000, retards: 5, scorePerformance: 65, rang: 3, ecartMoyen: -8 },
          ],
          stats: { totalBureaux: 3, meilleurBureau: 'BMO', pireBureau: 'BCG', ecartMoyen: -1.5, moyenneScore: 72 },
        };
      }
      if (leaf === 'projets') {
        return {
          comparaisons: [
            { id: 'cp1', projet: 'Villa Diamniadio', bureau: 'BMO', progression: 68, budgetConsomme: 24700000, budgetPrevu: 36400000, retards: 0, scorePerformance: 85, rang: 1, ecartMoyen: 10 },
            { id: 'cp2', projet: 'Complexe Résidentiel', bureau: 'BF', progression: 78, budgetConsomme: 22100000, budgetPrevu: 28200000, retards: 0, scorePerformance: 82, rang: 2, ecartMoyen: 5 },
          ],
          stats: { totalProjets: 2, meilleurProjet: 'Villa Diamniadio', pireProjet: 'Lot 4 Infra', ecartMoyen: 2, moyenneScore: 75 },
        };
      }
      if (leaf === 'periode') {
        return {
          comparaisons: [
            { id: 'cper1', periode: '2026-01', label: 'Janvier 2026', projets: 42, demandes: 247, budgetConsomme: 55300000, budgetPrevu: 52000000, retards: 2, scorePerformance: 72, evolution: 2 },
            { id: 'cper2', periode: '2025-12', label: 'Décembre 2025', projets: 40, demandes: 230, budgetConsomme: 48500000, budgetPrevu: 50000000, retards: 3, scorePerformance: 70, evolution: -1 },
          ],
          stats: { meilleurePeriode: '2026-01', pirePeriode: '2025-11', tendance: 2, evolution: 2, moyenneScore: 71 },
        };
      }
      if (leaf === 'benchmarking') {
        return {
          benchmarks: [
            { id: 'bm1', kpi: 'Délai moyen validation (j)', valeurActuelle: 2.5, valeurStandard: 3, ecart: -16.7, statut: 'au-dessus' as const, secteur: 'BTP Sénégal' },
            { id: 'bm2', kpi: 'Taux consommation budget %', valeurActuelle: 72, valeurStandard: 75, ecart: -4, statut: 'au-dessus' as const, secteur: 'BTP Sénégal' },
            { id: 'bm3', kpi: 'Retards critiques', valeurActuelle: 2, valeurStandard: 1, ecart: 100, statut: 'en-dessous' as const, secteur: 'BTP Sénégal' },
          ],
          stats: { kpisAuDessus: 2, kpisEnDessous: 1, kpisDansLaMoyenne: 0, scoreGlobal: 68 },
        };
      }
    }

    // ========== Performance Stocks (mock, fallback si stocksRepo non dispo) ==========
    if (main === 'performance' && sub === 'stocks') {
      if (leaf === 'overview') {
        return {
          stocks: [
            { id: 'st1', article: 'Ciment CPA 42.5', categorie: 'Matériaux', quantite: 450, quantiteMin: 100, quantiteMax: 500, valeurUnitaire: 5500, valeurTotale: 2475000, statut: 'normal' as const, dernierMouvement: '2026-01-28' },
            { id: 'st2', article: 'Fer à béton T12', categorie: 'Matériaux', quantite: 25, quantiteMin: 50, quantiteMax: 200, valeurUnitaire: 1200, valeurTotale: 30000, statut: 'critique' as const, dernierMouvement: '2026-01-27' },
            { id: 'st3', article: 'Peinture façade', categorie: 'Finitions', quantite: 80, quantiteMin: 60, quantiteMax: 150, valeurUnitaire: 8500, valeurTotale: 680000, statut: 'faible' as const, dernierMouvement: '2026-01-26' },
          ],
          stats: { totalArticles: 150, valeurTotale: 12500000, articlesFaibles: 5, articlesCritiques: 2 },
        };
      }
      if (leaf === 'trends') {
        return {
          tendances: [
            { id: 'tst1', article: 'Ciment CPA 42.5', categorie: 'Matériaux', periode: '2026-01', quantiteInitiale: 520, quantiteActuelle: 450, variation: -70, tendance: 'down' as const },
            { id: 'tst2', article: 'Fer à béton T12', categorie: 'Matériaux', periode: '2026-01', quantiteInitiale: 80, quantiteActuelle: 25, variation: -55, tendance: 'down' as const },
          ],
          stats: { articlesEnBaisse: 2, articlesStables: 10, articlesEnHausse: 3, valeurTotale: 12500000 },
        };
      }
    }

    // Fallback : retour vide
    return {};
  }

}
