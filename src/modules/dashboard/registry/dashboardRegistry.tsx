/**
 * Registry centralisé pour les vues du Dashboard
 * Système de chargement de données et rendu conditionnel basé sur la navigation
 */

'use client';

import React from 'react';
import { FileText, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardAdvancedView } from '../components/DashboardAdvancedView';
import type {
  DashboardMainCategory,
} from '../types/dashboardNavigationTypes';

export type NavKey = {
  main: DashboardMainCategory;
  sub?: string | null;
  subSub?: string | null;
};

export type DataResult<T = any> = {
  key: string;
  data: T;
  fetchedAt: number;
};

export type LoaderFn = (nav: NavKey) => Promise<DataResult>;

export type ViewEntry = {
  id: string;
  title: string;
  // rendu (composant) : reçoit nav + data
  render: (args: { nav: NavKey; data: any }) => React.ReactElement;
  // data loader : optionnel (si vue pure)
  loader?: LoaderFn;
  // cache TTL ms
  ttl?: number;
};

// Helper pour construire une clé stable
export const navToKey = (nav: NavKey) =>
  `${nav.main}::${nav.sub ?? ''}::${nav.subSub ?? ''}`;

// Helper pour créer une vue par défaut (fallback)
const createDefaultView = (title: string, description?: string): ViewEntry => ({
  id: `default-${title.toLowerCase().replace(/\s+/g, '-')}`,
  title,
  render: ({ nav }) => (
    <div className="p-6 space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        {description && (
          <p className="text-slate-400 text-sm">{description}</p>
        )}
      </div>
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6 text-center">
        <p className="text-slate-300 mb-2">Vue en cours de développement</p>
        <p className="text-sm text-slate-500">
          Navigation: {nav.main} → {nav.sub || 'N/A'} → {nav.subSub || 'N/A'}
        </p>
      </div>
    </div>
  ),
});

// --------------------------
// Exemple de loaders (fake)
// --------------------------
// Plus tard: remplace par fetch('/api/...') ou services.
const loadOverviewSummaryDashboard: LoaderFn = async (nav) => {
  // simulate
  await new Promise((r) => setTimeout(r, 150));
  
  // Générer des données de tendances pour les 30 derniers jours
  const generateTrendData = (days: number = 30) => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        demandes: Math.floor(200 + Math.random() * 100),
        validations: 0.85 + Math.random() * 0.1,
        budget: 0.6 + Math.random() * 0.15,
      });
    }
    return data;
  };

  // Générer des données mensuelles pour comparaison
  const generateMonthlyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    return months.map((month, index) => ({
      month,
      actuel: index === months.length - 1 ? 247 : Math.floor(200 + Math.random() * 80),
      precedent: index === months.length - 2 ? 235 : Math.floor(190 + Math.random() * 70),
    }));
  };

  // Générer des données par catégorie
  const generateCategoryData = () => [
    { category: 'Demandes RH', count: 89, percentage: 36 },
    { category: 'Validation BC', count: 67, percentage: 27 },
    { category: 'Décisions', count: 45, percentage: 18 },
    { category: 'Projets', count: 34, percentage: 14 },
    { category: 'Autres', count: 12, percentage: 5 },
  ];

  // Générer des données de tableau détaillé
  const generateTableData = () => [
    { id: 'D001', type: 'Demande RH', statut: 'En attente', priorite: 'Haute', date: '2024-01-15', bureau: 'Paris' },
    { id: 'D002', type: 'Validation BC', statut: 'Validé', priorite: 'Moyenne', date: '2024-01-14', bureau: 'Lyon' },
    { id: 'D003', type: 'Décision', statut: 'En cours', priorite: 'Critique', date: '2024-01-13', bureau: 'Marseille' },
    { id: 'D004', type: 'Projet', statut: 'Validé', priorite: 'Haute', date: '2024-01-12', bureau: 'Paris' },
    { id: 'D005', type: 'Demande RH', statut: 'Rejeté', priorite: 'Basse', date: '2024-01-11', bureau: 'Lyon' },
    { id: 'D006', type: 'Validation BC', statut: 'En attente', priorite: 'Haute', date: '2024-01-10', bureau: 'Paris' },
    { id: 'D007', type: 'Décision', statut: 'Validé', priorite: 'Moyenne', date: '2024-01-09', bureau: 'Marseille' },
    { id: 'D008', type: 'Projet', statut: 'En cours', priorite: 'Haute', date: '2024-01-08', bureau: 'Lyon' },
  ];

  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      kpis: { 
        demandes: 247, 
        validations: 0.89, 
        budget: 0.67,
        // KPIs supplémentaires
        blocages: 5,
        risques: 3,
        decisions: 8,
        conformite: 0.94,
      },
      highlights: [
        { id: 'H1', text: '3 risques critiques détectés', type: 'critical' },
        { id: 'H2', text: '5 blocages nécessitent une attention', type: 'warning' },
        { id: 'H3', text: '8 décisions en attente de validation', type: 'info' },
      ],
      trends: generateTrendData(30),
      monthlyComparison: generateMonthlyData(),
      categoryDistribution: generateCategoryData(),
      tableData: generateTableData(),
      // Données pour comparaison
      previousPeriod: {
        demandes: 235,
        validations: 0.86,
        budget: 0.64,
      },
    },
  };
};

const loadOverviewSummaryHighlights: LoaderFn = async (nav) => {
  await new Promise((r) => setTimeout(r, 120));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      points: [
        { id: 'P1', label: 'Blocages', value: 5 },
        { id: 'P2', label: 'Décisions en attente', value: 8 },
      ],
    },
  };
};

// Loader pour les KPIs Projets
const loadOverviewKpisProjets: LoaderFn = async (nav) => {
  await new Promise((r) => setTimeout(r, 150));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      projets: [
        { id: 'P001', nom: 'Projet Alpha', statut: 'En cours', progression: 65, budget: 150000, consomme: 97500 },
        { id: 'P002', nom: 'Projet Beta', statut: 'En attente', progression: 0, budget: 80000, consomme: 0 },
        { id: 'P003', nom: 'Projet Gamma', statut: 'Terminé', progression: 100, budget: 200000, consomme: 195000 },
        { id: 'P004', nom: 'Projet Delta', statut: 'En cours', progression: 45, budget: 120000, consomme: 54000 },
        { id: 'P005', nom: 'Projet Epsilon', statut: 'En cours', progression: 80, budget: 95000, consomme: 76000 },
      ],
      total: 5,
      enCours: 3,
      termines: 1,
      enAttente: 1,
    },
  };
};

// Loader pour les KPIs Demandes
const loadOverviewKpisDemandes: LoaderFn = async (nav) => {
  await new Promise((r) => setTimeout(r, 150));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      demandes: [
        { id: 'D001', type: 'Demande RH', statut: 'En attente', priorite: 'Haute', date: '2024-01-15', bureau: 'Paris' },
        { id: 'D002', type: 'Validation BC', statut: 'Validé', priorite: 'Moyenne', date: '2024-01-14', bureau: 'Lyon' },
        { id: 'D003', type: 'Décision', statut: 'En cours', priorite: 'Critique', date: '2024-01-13', bureau: 'Marseille' },
        { id: 'D004', type: 'Projet', statut: 'Validé', priorite: 'Haute', date: '2024-01-12', bureau: 'Paris' },
        { id: 'D005', type: 'Demande RH', statut: 'Rejeté', priorite: 'Basse', date: '2024-01-11', bureau: 'Lyon' },
      ],
      total: 247,
      enAttente: 89,
      validees: 123,
      rejetees: 35,
    },
  };
};

// Loader pour les KPIs Budget
const loadOverviewKpisBudget: LoaderFn = async (nav) => {
  await new Promise((r) => setTimeout(r, 150));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      budget: {
        total: 1000000,
        consomme: 670000,
        reste: 330000,
        pourcentage: 67,
      },
      parCategorie: [
        { categorie: 'Projets', budget: 500000, consomme: 350000, pourcentage: 70 },
        { categorie: 'Demandes RH', budget: 300000, consomme: 200000, pourcentage: 67 },
        { categorie: 'Infrastructure', budget: 200000, consomme: 120000, pourcentage: 60 },
      ],
      tendances: [
        { mois: 'Jan', budget: 150000, consomme: 120000 },
        { mois: 'Fév', budget: 150000, consomme: 135000 },
        { mois: 'Mar', budget: 150000, consomme: 140000 },
        { mois: 'Avr', budget: 150000, consomme: 145000 },
        { mois: 'Mai', budget: 150000, consomme: 130000 },
      ],
    },
  };
};

// Loader pour les KPIs Highlights
const loadOverviewKpisHighlights: LoaderFn = async (nav) => {
  await new Promise((r) => setTimeout(r, 150));
  return {
    key: navToKey(nav),
    fetchedAt: Date.now(),
    data: {
      topKPIs: [
        { id: '1', label: 'Taux de conformité global', value: '94%', trend: '+2%' },
        { id: '2', label: 'Projets en retard', value: 3, trend: '-2' },
        { id: '3', label: 'Risques critiques', value: 3, trend: '+1' },
      ],
      risques: [
        { id: 'r1', label: 'Retards projets', severity: 'high', count: 3 },
        { id: 'r2', label: 'Dépassements budget', severity: 'high', count: 2 },
      ],
    },
  };
};

// --------------------------
// Registry
// --------------------------
export const dashboardRegistry: Record<string, ViewEntry> = {
  // overview/summary/dashboard
  'overview::summary::dashboard': {
    id: 'overview-summary-dashboard',
    title: 'Dashboard principal',
    ttl: 60_000,
    loader: loadOverviewSummaryDashboard,
    render: ({ data }) => <DashboardAdvancedView data={data || {}} />,
  },

  // overview/summary/highlights
  'overview::summary::highlights': {
    id: 'overview-summary-highlights',
    title: 'Points clés',
    ttl: 60_000,
    loader: loadOverviewSummaryHighlights,
    render: ({ data }) => (
      <div className="p-4">
        <h2 className="text-slate-100 font-semibold">Points clés</h2>
        <ul className="mt-3 space-y-2">
          {data.points?.map((p: any) => (
            <li
              key={p.id}
              className="text-sm text-slate-200 bg-slate-800/40 border border-slate-700/40 rounded-xl p-3"
            >
              <span className="text-slate-400">{p.label} :</span>{' '}
              <span className="font-semibold">{p.value}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },

  // overview/kpis/highlights
  'overview::kpis::highlights': {
    id: 'overview-kpis-highlights',
    title: 'Synthèse stratégique',
    ttl: 60_000,
    loader: loadOverviewKpisHighlights,
    render: ({ data }) => {
      // Utiliser directement le composant HighlightsKpiPage
      const HighlightsKpiPage = React.lazy(() => import('../components/views/HighlightsKpiPage'));
      return (
        <React.Suspense fallback={<div className="p-6 text-slate-400">Chargement...</div>}>
          <HighlightsKpiPage />
        </React.Suspense>
      );
    },
  },

  // overview/kpis/projets
  'overview::kpis::projets': {
    id: 'overview-kpis-projets',
    title: 'KPIs Projets',
    ttl: 60_000,
    loader: loadOverviewKpisProjets,
    render: ({ data }) => {
      const { projets, total, enCours, termines, enAttente } = data || {};
      
      return (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Indicateurs Projets</h2>
            <p className="text-slate-400 text-sm">Vue détaillée des projets en cours</p>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{total ?? 0}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">En cours</p>
              <p className="text-2xl font-bold text-white">{enCours ?? 0}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Terminés</p>
              <p className="text-2xl font-bold text-white">{termines ?? 0}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-500/20 to-slate-600/10 rounded-xl p-4 border border-slate-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">En attente</p>
              <p className="text-2xl font-bold text-white">{enAttente ?? 0}</p>
            </div>
          </div>

          {/* Liste des projets */}
          {projets && Array.isArray(projets) && projets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Liste des projets</h3>
              <div className="space-y-3">
                {projets.map((projet: any, index: number) => (
                  <div
                    key={projet.id}
                    className={cn(
                      'bg-slate-800/40 border border-slate-700/40 rounded-xl p-4',
                      'hover:border-slate-600/60 hover:bg-slate-800/60 transition-all duration-200',
                      'animate-fadeIn'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-semibold text-white">{projet.nom}</h4>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        projet.statut === 'En cours' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                        projet.statut === 'Terminé' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                        projet.statut === 'En attente' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      )}>
                        {projet.statut}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Progression</span>
                        <span className="text-slate-200 font-medium">{projet.progression}%</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${projet.progression}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Budget</span>
                        <span className="text-slate-200 font-medium">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(projet.consomme)} / {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(projet.budget)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!projets || !Array.isArray(projets) || projets.length === 0) && (
            <div className="text-center py-12">
              <p className="text-slate-400">Aucun projet disponible</p>
            </div>
          )}
        </div>
      );
    },
  },

  // overview/kpis/demandes
  'overview::kpis::demandes': {
    id: 'overview-kpis-demandes',
    title: 'KPIs Demandes',
    ttl: 60_000,
    loader: loadOverviewKpisDemandes,
    render: ({ data }) => {
      const { demandes, total, enAttente, validees, rejetees } = data || {};
      
      return (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Indicateurs Demandes</h2>
            <p className="text-slate-400 text-sm">Vue détaillée des demandes</p>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{total ?? 0}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">En attente</p>
              <p className="text-2xl font-bold text-white">{enAttente ?? 0}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Validées</p>
              <p className="text-2xl font-bold text-white">{validees ?? 0}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-4 border border-red-500/30">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Rejetées</p>
              <p className="text-2xl font-bold text-white">{rejetees ?? 0}</p>
            </div>
          </div>

          {/* Liste des demandes */}
          {demandes && Array.isArray(demandes) && demandes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Dernières demandes</h3>
              <div className="space-y-2">
                {demandes.map((demande: any, index: number) => (
                  <div
                    key={demande.id}
                    className={cn(
                      'bg-slate-800/40 border border-slate-700/40 rounded-xl p-4',
                      'hover:border-slate-600/60 hover:bg-slate-800/60 transition-all duration-200',
                      'animate-fadeIn'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-white">{demande.type}</h4>
                          <span className={cn(
                            'text-xs px-2 py-1 rounded-full',
                            demande.statut === 'Validé' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                            demande.statut === 'En attente' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                            demande.statut === 'En cours' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                            demande.statut === 'Rejeté' && 'bg-red-500/20 text-red-400 border border-red-500/30'
                          )}>
                            {demande.statut}
                          </span>
                          <span className={cn(
                            'text-xs px-2 py-1 rounded-full',
                            demande.priorite === 'Haute' && 'bg-red-500/20 text-red-400',
                            demande.priorite === 'Moyenne' && 'bg-amber-500/20 text-amber-400',
                            demande.priorite === 'Basse' && 'bg-slate-500/20 text-slate-400',
                            demande.priorite === 'Critique' && 'bg-red-600/20 text-red-300'
                          )}>
                            {demande.priorite}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{demande.bureau}</span>
                          <span>•</span>
                          <span>{demande.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!demandes || !Array.isArray(demandes) || demandes.length === 0) && (
            <div className="text-center py-12">
              <p className="text-slate-400">Aucune demande disponible</p>
            </div>
          )}
        </div>
      );
    },
  },

  // overview/kpis/budget
  'overview::kpis::budget': {
    id: 'overview-kpis-budget',
    title: 'KPIs Budget',
    ttl: 60_000,
    loader: loadOverviewKpisBudget,
    render: ({ data }) => {
      const { budget, parCategorie, tendances } = data || {};
      
      const formatCurrency = (value: number) => 
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
      
      return (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Indicateurs Budget</h2>
            <p className="text-slate-400 text-sm">Vue détaillée du budget et consommation</p>
          </div>

          {/* Budget global */}
          {budget && (
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-6 border border-amber-500/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Budget total</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(budget.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Consommé</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(budget.consomme)}</p>
                  <p className="text-sm text-amber-400 mt-1">{budget.pourcentage}%</p>
                </div>
              </div>
              <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${budget.pourcentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                <span>Reste disponible</span>
                <span className="font-semibold text-slate-200">{formatCurrency(budget.reste)}</span>
              </div>
            </div>
          )}

          {/* Budget par catégorie */}
          {parCategorie && Array.isArray(parCategorie) && parCategorie.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Budget par catégorie</h3>
              <div className="space-y-3">
                {parCategorie.map((cat: any, index: number) => (
                  <div
                    key={cat.categorie}
                    className={cn(
                      'bg-slate-800/40 border border-slate-700/40 rounded-xl p-4',
                      'animate-fadeIn'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-semibold text-white">{cat.categorie}</h4>
                      <span className="text-sm text-slate-400">{cat.pourcentage}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                      <span>{formatCurrency(cat.consomme)} / {formatCurrency(cat.budget)}</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${cat.pourcentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tendances */}
          {tendances && Array.isArray(tendances) && tendances.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Tendances mensuelles</h3>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
                <div className="space-y-2">
                  {tendances.map((tendance: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">{tendance.mois}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">{formatCurrency(tendance.consomme)}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400">{formatCurrency(tendance.budget)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    },
  },
};

