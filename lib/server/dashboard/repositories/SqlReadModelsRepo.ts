// lib/server/dashboard/repositories/SqlReadModelsRepo.ts
import { pgPool } from '@/lib/server/db/pool';
import type { ReadModelsRepo } from './ReadModelsRepo';
import type { RequestContext } from '../context';
import type {
  OverviewSummaryDashboardData,
  KpisProjetsData,
  KpisDemandesData,
  KpisFinanceData,
  KpisAchatsData,
  KpisStocksData,
  KpisMaterielData,
} from '@/modules/dashboard/types/dashboard.readmodels';
import { parseScopes } from '../abac';
import { SqlReadModelsRepoStocks } from './SqlReadModelsRepo.Stocks';

/**
 * Repository SQL pour les Read Models
 * Phase P2-C/2: Utilise pgPool pour requêtes SQL directes avec ABAC fort
 */
export class SqlReadModelsRepo implements ReadModelsRepo {
  /**
   * Construit le prédicat WHERE pour le tenant
   */
  private tenantWhere(): string {
    return `tenant_id = $1::uuid`;
  }

  async loadOverviewSummaryDashboard(ctx: RequestContext): Promise<OverviewSummaryDashboardData> {
    const client = await pgPool.connect();
    try {
      const agg = await client.query(
        `SELECT demandes_total, validations_ratio, budget_ratio,
                blocages_actifs, risques_critiques, decisions_en_attente, conformite_ratio
         FROM rm_kpis_overview
         WHERE ${this.tenantWhere()}
         LIMIT 1`,
        [ctx.tenantId]
      );

      const row = agg.rows[0] ?? {
        demandes_total: 0,
        validations_ratio: 0,
        budget_ratio: 0,
        blocages_actifs: 0,
        risques_critiques: 0,
        decisions_en_attente: 0,
        conformite_ratio: 0,
      };

      const trendsRes = await client.query(
        `SELECT date::text AS date, demandes, validations, budget
         FROM rm_trends_daily
         WHERE ${this.tenantWhere()}
         ORDER BY date ASC`,
        [ctx.tenantId]
      );

      // Phase P3: Charger les KPIs Finance pour enrichir l'overview
      let financeKpis: {
        rat?: number;
        rap?: number;
        resteAFacturer?: number;
        dso?: number;
        facturesImpayees?: number;
        caRealise30j?: number;
      } = {};
      let financeTrends: Array<{ date: string; rat: number; rap: number; encaissements: number }> = [];

      try {
        const financeResult = await client.query(
          `SELECT rat_ht, rap_mois_ht, reste_a_facturer_ht, dso_jours
           FROM rm_finance_overview
           WHERE ${this.tenantWhere()}
           LIMIT 1`,
          [ctx.tenantId]
        );

        if (financeResult.rows[0]) {
          const financeRow = financeResult.rows[0];
          
          // Calculer factures impayées
          const facturesImpayeesRes = await client.query(
            `SELECT COALESCE(SUM(f.montant_ht), 0) AS total
             FROM factures f
             LEFT JOIN encaissements e ON e.facture_id = f.id
             WHERE f.tenant_id = $1::uuid
               AND f.statut = 'emise'
               AND e.id IS NULL
               AND f.echeance_le < CURRENT_DATE`,
            [ctx.tenantId]
          );

          // CA réalisé (30 jours)
          const caRealiseRes = await client.query(
            `SELECT COALESCE(SUM(e.montant_ht), 0) AS total
             FROM encaissements e
             INNER JOIN factures f ON f.id = e.facture_id
             WHERE e.tenant_id = $1::uuid
               AND e.regle_le >= CURRENT_DATE - INTERVAL '30 days'`,
            [ctx.tenantId]
          );

          financeKpis = {
            rat: Number(financeRow.rat_ht),
            rap: Number(financeRow.rap_mois_ht),
            resteAFacturer: Number(financeRow.reste_a_facturer_ht),
            dso: Number(financeRow.dso_jours),
            facturesImpayees: Number(facturesImpayeesRes.rows[0]?.total || 0),
            caRealise30j: Number(caRealiseRes.rows[0]?.total || 0),
          };
        }

        const financeTrendsRes = await client.query(
          `SELECT date::text AS date, facture_emise_ht, encaisse_ht, raf_journalier_ht
           FROM rm_finance_trends
           WHERE ${this.tenantWhere()}
           ORDER BY date ASC`,
          [ctx.tenantId]
        );

        financeTrends = financeTrendsRes.rows.map((r) => ({
          date: String(r.date),
          rat: Number(r.raf_journalier_ht), // RàF journalier
          rap: Number(r.facture_emise_ht),  // Factures émises
          encaissements: Number(r.encaisse_ht),
        }));
      } catch (error) {
        // Si les vues finance n'existent pas encore, on continue sans
        console.warn('[SqlReadModelsRepo] Vues finance non disponibles, continuation sans KPIs finance');
      }

      return {
        kpis: {
          demandes: Number(row.demandes_total),
          validations: Number(row.validations_ratio),
          budget: Number(row.budget_ratio),
          blocages: Number(row.blocages_actifs),
          risques: Number(row.risques_critiques),
          decisions: Number(row.decisions_en_attente),
          conformite: Number(row.conformite_ratio),
          // Phase P3: KPIs Finance
          ...financeKpis,
        },
        trends: trendsRes.rows.map((r) => ({
          date: String(r.date),
          demandes: Number(r.demandes),
          validations: Number(r.validations),
          budget: Number(r.budget),
        })),
        // Phase P3: Trends Finance
        financeTrends: financeTrends.length > 0 ? financeTrends : undefined,
        monthlyComparison: [], // À enrichir si nécessaire
        categoryDistribution: [], // À enrichir si nécessaire
        tableData: [], // À enrichir si nécessaire
        previousPeriod: { demandes: 0, validations: 0, budget: 0 },
      };
    } catch (error) {
      console.error('[SqlReadModelsRepo] Error loading overview summary dashboard:', error);
      // Fallback vers données vides en cas d'erreur
      return {
        kpis: {
          demandes: 0,
          validations: 0,
          budget: 0,
          blocages: 0,
          risques: 0,
          decisions: 0,
          conformite: 0,
        },
        trends: [],
        monthlyComparison: [],
        categoryDistribution: [],
        tableData: [],
        previousPeriod: { demandes: 0, validations: 0, budget: 0 },
      };
    } finally {
      client.release();
    }
  }

  async loadKpisProjets(ctx: RequestContext): Promise<KpisProjetsData> {
    const client = await pgPool.connect();
    try {
      const scopes = buildScopeWhereFragment(parseScopes(ctx));
      const whereParts: string[] = [];
      const values: any[] = [];

      // Tenant (toujours présent)
      whereParts.push(this.tenantWhere());
      values.push(ctx.tenantId);

      // Scopes bureau/chantier
      let paramIndex = 1; // $1 déjà utilisé pour tenantId
      if (scopes.bureaux.length) {
        paramIndex++;
        whereParts.push(`bureau_code = ANY($${paramIndex})`);
        values.push(scopes.bureaux);
      }
      if (scopes.chantiers.length) {
        paramIndex++;
        whereParts.push(`chantier_code = ANY($${paramIndex})`);
        values.push(scopes.chantiers);
      }

      const whereSql = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

      const res = await client.query(
        `SELECT id, nom, statut, progression, budget::float, consomme::float
         FROM rm_kpis_projets
         ${whereSql}
         ORDER BY nom ASC`,
        values
      );

      const projets = res.rows.map((r) => ({
        id: r.id,
        nom: r.nom,
        statut: r.statut as 'En cours' | 'En attente' | 'Terminé',
        progression: Number(r.progression),
        budget: Number(r.budget),
        consomme: Number(r.consomme),
      }));

      const total = projets.length;
      const enCours = projets.filter((p) => p.statut === 'En cours').length;
      const termines = projets.filter((p) => p.statut === 'Terminé').length;
      const enAttente = projets.filter((p) => p.statut === 'En attente').length;

      return { projets, total, enCours, termines, enAttente };
    } catch (error) {
      console.error('[SqlReadModelsRepo] Error loading KPIs projets:', error);
      return {
        projets: [],
        total: 0,
        enCours: 0,
        termines: 0,
        enAttente: 0,
      };
    } finally {
      client.release();
    }
  }

  async loadKpisDemandes(ctx: RequestContext): Promise<KpisDemandesData> {
    const client = await pgPool.connect();
    try {
      const scopes = buildScopeWhereFragment(parseScopes(ctx));
      const whereParts: string[] = [];
      const values: any[] = [];

      // Tenant (toujours présent)
      whereParts.push(this.tenantWhere());
      values.push(ctx.tenantId);

      // Scope bureau
      if (scopes.bureaux.length) {
        whereParts.push(`bureau_code = ANY($2)`);
        values.push(scopes.bureaux);
      }

      const whereSql = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

      const res = await client.query(
        `SELECT id, type, statut, priorite, created_at::text AS date, bureau_code
         FROM rm_kpis_demandes
         ${whereSql}
         ORDER BY created_at DESC
         LIMIT 200`,
        values
      );

      const demandes = res.rows.map((r) => ({
        id: r.id,
        type: r.type,
        statut: r.statut,
        priorite: r.priorite,
        date: String(r.date),
        bureau: r.bureau_code || '', // Utiliser le code bureau depuis la vue enrichie
      }));

      const total = demandes.length;
      const enAttente = demandes.filter((d) => d.statut === 'En attente').length;
      const validees = demandes.filter((d) => d.statut === 'Validé').length;
      const rejetees = demandes.filter((d) => d.statut === 'Rejeté').length;

      return { demandes, total, enAttente, validees, rejetees };
    } catch (error) {
      console.error('[SqlReadModelsRepo] Error loading KPIs demandes:', error);
      return {
        demandes: [],
        total: 0,
        enAttente: 0,
        validees: 0,
        rejetees: 0,
      };
    } finally {
      client.release();
    }
  }

  async loadKpisFinance(ctx: RequestContext): Promise<KpisFinanceData> {
    const client = await pgPool.connect();
    try {
      // KPIs Finance Overview (structure simplifiée)
      const financeResult = await client.query(
        `SELECT rat_ht, rap_mois_ht, reste_a_facturer_ht, dso_jours
         FROM rm_finance_overview
         WHERE ${this.tenantWhere()}
         LIMIT 1`,
        [ctx.tenantId]
      );

      const row = financeResult.rows[0] ?? {
        rat_ht: 0,
        rap_mois_ht: 0,
        reste_a_facturer_ht: 0,
        dso_jours: 0,
      };

      // Trends Finance (30 jours)
      const trendsResult = await client.query(
        `SELECT date::text AS date, facture_emise_ht, encaisse_ht, raf_journalier_ht
         FROM rm_finance_trends
         WHERE ${this.tenantWhere()}
         ORDER BY date ASC`,
        [ctx.tenantId]
      );

      // Calculer factures impayées (factures émises non payées)
      const facturesImpayeesResult = await client.query(
        `SELECT COALESCE(SUM(f.montant_ht), 0) AS total
         FROM factures f
         LEFT JOIN encaissements e ON e.facture_id = f.id
         WHERE f.tenant_id = $1::uuid
           AND f.statut = 'emise'
           AND e.id IS NULL
           AND f.echeance_le < CURRENT_DATE`,
        [ctx.tenantId]
      );

      // CA réalisé (30 jours) : somme des encaissements
      const caRealiseResult = await client.query(
        `SELECT COALESCE(SUM(e.montant_ht), 0) AS total
         FROM encaissements e
         INNER JOIN factures f ON f.id = e.facture_id
         WHERE e.tenant_id = $1::uuid
           AND e.regle_le >= CURRENT_DATE - INTERVAL '30 days'`,
        [ctx.tenantId]
      );

      return {
        rat: Number(row.rat_ht),
        rap: Number(row.rap_mois_ht),
        resteAFacturer: Number(row.reste_a_facturer_ht),
        dso: Number(row.dso_jours),
        facturesImpayees: Number(facturesImpayeesResult.rows[0]?.total || 0),
        caRealise30j: Number(caRealiseResult.rows[0]?.total || 0),
        trends: trendsResult.rows.map((r) => ({
          date: String(r.date),
          rat: Number(r.raf_journalier_ht), // RàF journalier comme proxy
          rap: Number(r.facture_emise_ht),   // Factures émises comme proxy RAP
          encaissements: Number(r.encaisse_ht),
        })),
        // byBureau non disponible dans cette version simplifiée
        byBureau: undefined,
      };
    } catch (error) {
      console.error('[SqlReadModelsRepo] Error loading KPIs finance:', error);
      return {
        rat: 0,
        rap: 0,
        resteAFacturer: 0,
        dso: 0,
        facturesImpayees: 0,
        caRealise30j: 0,
        trends: [],
      };
    } finally {
      client.release();
    }
  }

  // Phase P5: Modules ERP - Achats/Contrats (version optimisée avec OTIF, variance prix)
  async loadKpisAchats(ctx: RequestContext): Promise<KpisAchatsData> {
    try {
      const { SqlReadModelsRepoAchats } = await import('./SqlReadModelsRepo.Achats');
      const achatsRepo = new SqlReadModelsRepoAchats();

      // Charger toutes les données en parallèle
      const [overview, trends, fournisseurs, openOrders] = await Promise.all([
        achatsRepo.loadOverview(ctx),
        achatsRepo.loadTrends(ctx),
        achatsRepo.loadFournisseurs(ctx),
        achatsRepo.loadOpenOrders(ctx),
      ]);

      // Transformer les données pour correspondre à l'interface KpisAchatsData
      return {
        leadTimeJours: overview.lead_time_j ?? 0,
        conformiteRatio: overview.conformite_ratio,
        priceVarianceRatio: overview.price_variance_ratio,
        spend30dHt: overview.spend_30d_ht,
        trends: trends.map((t) => ({
          date: t.date,
          bcEmis: t.bc_emis,
          blRecus: t.bl_recus,
          spendHt: t.spend_ht,
        })),
        topFournisseurs: fournisseurs.map((f) => ({
          id: f.fournisseur_code, // Utiliser code comme ID (fournisseur_id non disponible)
          code: f.fournisseur_code,
          nom: f.fournisseur_nom,
          nbBl: f.nb_bl,
          otifRatio: f.otif_ratio,
          priceVarRatio: f.price_var_ratio,
        })),
        commandesOuvertes: openOrders.map((o) => ({
          id: o.bc_ref, // Utiliser ref comme ID (bc_id non disponible)
          ref: o.bc_ref,
          dateEmission: o.emis_le ? new Date(o.emis_le).toISOString().split('T')[0] : '',
          delaiJours: 0, // Non disponible dans l'interface simplifiée
          fournisseurCode: o.fournisseur_code,
          fournisseurNom: '', // Non disponible dans l'interface simplifiée
          bureauCode: undefined, // Non disponible dans l'interface simplifiée
          chantierCode: undefined, // Non disponible dans l'interface simplifiée
          qteCommande: o.qte_commande,
          qteRecue: o.qte_recue,
          qteRestante: o.qte_restante,
          montantHtCommande: 0, // Non disponible dans l'interface simplifiée
        })),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const logger = await import('@/modules/dashboard/utils/logger').then(m => m.createLogger('SqlReadModelsRepo'));
      logger.error('Error loading KPIs achats', { tenantId: ctx.tenantId, action: 'loadKpisAchats' }, err);
      return {
        leadTimeJours: 0,
        conformiteRatio: 0,
        priceVarianceRatio: 0,
        spend30dHt: 0,
        trends: [],
        topFournisseurs: [],
        commandesOuvertes: [],
      };
    }
  }

  // Phase P6: Modules ERP - Stocks
  async loadKpisStocks(ctx: RequestContext): Promise<KpisStocksData> {
    const stocksRepo = new SqlReadModelsRepoStocks();
    try {
      const overview = await stocksRepo.loadStocksOverview(ctx);
      const trends = await stocksRepo.loadStocksTrends(ctx);
      
      return {
        nbArticles: Number(overview.nb_articles ?? 0),
        ruptures: Number(overview.ruptures ?? 0),
        ruptureRatio: Number(overview.rupture_ratio ?? 0),
        valeurStockHt: Number(overview.valeur_stock_ht ?? 0),
        trends: trends,
      };
    } catch (error) {
      console.error('[SqlReadModelsRepo] Error loading KPIs stocks:', error);
      return {
        nbArticles: 0,
        ruptures: 0,
        ruptureRatio: 0,
        valeurStockHt: 0,
        trends: [],
      };
    }
  }

  // Phase P6: Modules ERP - Matériel
  async loadKpisMateriel(ctx: RequestContext): Promise<KpisMaterielData> {
    const stocksRepo = new SqlReadModelsRepoStocks();
    try {
      const overview = await stocksRepo.loadMaterielOverview(ctx);
      
      return {
        nbMateriel: Number(overview.nb_materiel ?? 0),
        maintenanceOuverte: Number(overview.maintenance_ouverte ?? 0),
        backlogCuratif: Number(overview.backlog_curatif ?? 0),
        tauxDispo: Number(overview.taux_dispo ?? 0),
      };
    } catch (error) {
      console.error('[SqlReadModelsRepo] Error loading KPIs materiel:', error);
      return {
        nbMateriel: 0,
        maintenanceOuverte: 0,
        backlogCuratif: 0,
        tauxDispo: 0,
      };
    }
  }
}
