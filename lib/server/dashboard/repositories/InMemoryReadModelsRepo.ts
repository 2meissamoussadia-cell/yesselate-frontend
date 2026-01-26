// lib/server/dashboard/repositories/InMemoryReadModelsRepo.ts
import type { ReadModelsRepo } from './ReadModelsRepo';
import type { RequestContext } from '../context';
import type {
  OverviewSummaryDashboardData, KpisProjetsData, KpisDemandesData, KpisFinanceData,
  KpisAchatsData, KpisStocksData, KpisMaterielData,
} from '@/modules/dashboard/types/dashboard.readmodels';

export class InMemoryReadModelsRepo implements ReadModelsRepo {
  async loadOverviewSummaryDashboard(_: RequestContext): Promise<OverviewSummaryDashboardData> {
    return {
      kpis: { demandes: 247, validations: 0.89, budget: 0.67, blocages: 5, risques: 3, decisions: 8, conformite: 0.94 },
      trends: [],
      monthlyComparison: [],
      categoryDistribution: [],
      tableData: [],
      previousPeriod: { demandes: 235, validations: 0.86, budget: 0.64 },
    };
  }

  async loadKpisProjets(_: RequestContext): Promise<KpisProjetsData> {
    return {
      projets: [
        { id: 'P001', nom: 'Projet Alpha', statut: 'En cours', progression: 65, budget: 150000, consomme: 97500 },
        { id: 'P002', nom: 'Projet Beta',  statut: 'En attente', progression: 0,  budget: 80000,  consomme: 0     },
      ],
      total: 2, enCours: 1, termines: 0, enAttente: 1,
    };
  }

  async loadKpisDemandes(_: RequestContext): Promise<KpisDemandesData> {
    return {
      demandes: [
        { id: 'D001', type: 'Demande RH',    statut: 'En attente', priorite: 'Haute',   date: '2026-01-10', bureau: 'BMO' },
        { id: 'D002', type: 'Validation BC', statut: 'Validé',     priorite: 'Moyenne', date: '2026-01-11', bureau: 'BF'  },
      ],
      total: 247, enAttente: 89, validees: 123, rejetees: 35,
    };
  }

  async loadKpisFinance(_: RequestContext): Promise<KpisFinanceData> {
    return {
      rat: 1250000,              // Revenu à Terme
      rap: 850000,               // Revenu à Payer
      resteAFacturer: 1250000,   // Reste à Facturer
      dso: 42,                   // Days Sales Outstanding (42 jours)
      facturesImpayees: 320000,  // Factures impayées
      caRealise30j: 2100000,     // CA réalisé (30 jours)
      trends: [],                // Trends vides en mock
    };
  }

  // Phase P5: Modules ERP - Achats/Contrats (version optimisée avec OTIF, variance prix)
  async loadKpisAchats(_: RequestContext): Promise<KpisAchatsData> {
    // Générer des trends pour les 30 derniers jours
    const trends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        bcEmis: Math.floor(Math.random() * 5) + 2,
        blRecus: Math.floor(Math.random() * 4) + 1,
        spendHt: Math.floor(Math.random() * 50000) + 10000,
      };
    });

    return {
      leadTimeJours: 7.5,
      conformiteRatio: 0.92,
      priceVarianceRatio: 0.03, // 3% de variance en moyenne
      spend30dHt: 1250000,
      trends,
      topFournisseurs: [
        {
          id: 'F001',
          code: 'FOUR-001',
          nom: 'Fournisseur Principal',
          nbBl: 15,
          otifRatio: 0.95,
          priceVarRatio: 0.02,
        },
        {
          id: 'F002',
          code: 'FOUR-002',
          nom: 'Matériaux SA',
          nbBl: 12,
          otifRatio: 0.88,
          priceVarRatio: 0.05,
        },
        {
          id: 'F003',
          code: 'FOUR-003',
          nom: 'Équipements BTP',
          nbBl: 8,
          otifRatio: 0.90,
          priceVarRatio: -0.01, // Prix inférieur au prix de référence
        },
      ],
      commandesOuvertes: [
        {
          id: 'BC-001',
          ref: 'BC-2024-001',
          dateEmission: '2024-01-15',
          delaiJours: 11,
          fournisseurCode: 'FOUR-001',
          fournisseurNom: 'Fournisseur Principal',
          bureauCode: 'BMO',
          qteCommande: 100,
          qteRecue: 75,
          qteRestante: 25,
          montantHtCommande: 45000,
        },
        {
          id: 'BC-002',
          ref: 'BC-2024-002',
          dateEmission: '2024-01-18',
          delaiJours: 8,
          fournisseurCode: 'FOUR-002',
          fournisseurNom: 'Matériaux SA',
          bureauCode: 'BF',
          qteCommande: 50,
          qteRecue: 30,
          qteRestante: 20,
          montantHtCommande: 28000,
        },
      ],
    };
  }

  async loadKpisStocks(_: RequestContext): Promise<KpisStocksData> {
    return {
      nbArticles: 150,
      ruptures: 3,
      ruptureRatio: 0.02,
      valeurStockHt: 125000,
      trends: [],
    };
  }

  async loadKpisMateriel(_: RequestContext): Promise<KpisMaterielData> {
    return {
      nbMateriel: 25,
      maintenanceOuverte: 2,
      backlogCuratif: 1,
      tauxDispo: 0.92,
    };
  }
}
