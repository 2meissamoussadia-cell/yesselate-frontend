/**
 * Configuration des catégories du Centre de Commandement Gouvernance
 * Module Maître d'Ouvrage - Structure hiérarchique 3 niveaux
 * Route: maitre-ouvrage/governance
 */

import {
  LayoutDashboard,
  Scale,
  AlertTriangle,
  Users,
  ShieldCheck,
  BarChart3,
  Target,
  Clock,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Calendar,
  FileCheck,
  Activity,
} from 'lucide-react';
import type { MainCategoryConfig, SubCategoryConfig, SubSubCategoryConfig } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// DOMAINES PRINCIPAUX (Niveau 1 - 5 domaines)
// ═══════════════════════════════════════════════════════════════════════════

export const mainCategories: MainCategoryConfig[] = [
  {
    id: 'strategic-view',
    label: 'Vue stratégique',
    icon: LayoutDashboard,
    description: 'Tableau de bord consolidé avec KPIs stratégiques',
  },
  {
    id: 'decisions-arbitrages',
    label: 'Décisions & Arbitrages',
    icon: Scale,
    description: 'Décisions stratégiques et arbitrages à fort impact',
    badge: 5,
    badgeType: 'warning',
  },
  {
    id: 'escalations-risks',
    label: 'Escalades & Risques',
    icon: AlertTriangle,
    description: 'Agrégation des escalades critiques et risques majeurs',
    badge: 12,
    badgeType: 'critical',
  },
  {
    id: 'instances-coordination',
    label: 'Instances & Coordination',
    icon: Users,
    description: 'Coordination instances décisionnelles critiques',
  },
  {
    id: 'compliance-performance',
    label: 'Conformité & Performance',
    icon: ShieldCheck,
    description: 'Conformité SLA, engagements et performance',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SOUS-DOMAINES PAR DOMAINE (Niveau 2)
// ═══════════════════════════════════════════════════════════════════════════

export const subCategories: Record<string, SubCategoryConfig[]> = {
  'strategic-view': [
    {
      id: 'executive-dashboard',
      label: 'Tableau de bord exécutif',
      icon: LayoutDashboard,
    },
    {
      id: 'director-kpis',
      label: 'KPI directeurs',
      icon: BarChart3,
    },
    {
      id: 'monthly-summary',
      label: 'Synthèse mensuelle',
      icon: FileText,
    },
  ],
  'decisions-arbitrages': [
    {
      id: 'pending-decisions',
      label: 'Décisions en attente',
      icon: Clock,
      badge: 5,
      badgeType: 'warning',
    },
    {
      id: 'decision-history',
      label: 'Historique décisions',
      icon: FileText,
    },
    {
      id: 'blocking-points',
      label: 'Points de blocage à trancher',
      icon: AlertCircle,
      badge: 3,
      badgeType: 'critical',
    },
  ],
  'escalations-risks': [
    {
      id: 'active-escalations',
      label: 'Escalades en cours',
      icon: AlertTriangle,
      badge: 8,
      badgeType: 'critical',
    },
    {
      id: 'major-risks',
      label: 'Risques majeurs & exposition',
      icon: TrendingUp,
    },
    {
      id: 'critical-blockages',
      label: 'Blocages critiques',
      icon: AlertCircle,
      badge: 4,
      badgeType: 'critical',
    },
  ],
  'instances-coordination': [
    {
      id: 'scheduled-instances',
      label: 'Instances programmées',
      icon: Calendar,
    },
    {
      id: 'minutes-followup',
      label: 'Comptes-rendus & suivi décisions',
      icon: FileCheck,
    },
    {
      id: 'sensitive-projects',
      label: 'Projets sensibles & priorités',
      icon: Target,
    },
  ],
  'compliance-performance': [
    {
      id: 'contract-sla',
      label: 'Conformité contrats & SLA',
      icon: ShieldCheck,
    },
    {
      id: 'commitments',
      label: 'Engagements (budgets, délais)',
      icon: CheckCircle2,
    },
    {
      id: 'resource-utilization',
      label: 'Taux utilisation ressources',
      icon: Activity,
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// VUES SPÉCIFIQUES (Niveau 3 - optionnel, peut être vide)
// ═══════════════════════════════════════════════════════════════════════════

export const subSubCategories: Record<string, SubSubCategoryConfig[]> = {
  'executive-dashboard': [
    { id: 'all', label: 'Vue globale' },
    { id: 'critical', label: 'Critiques', count: 12 },
    { id: 'trends', label: 'Tendances' },
  ],
  'director-kpis': [
    { id: 'projects', label: 'Projets', count: 45 },
    { id: 'budget', label: 'Budget' },
    { id: 'milestones', label: 'Jalons', count: 23 },
    { id: 'risks', label: 'Risques', count: 8 },
  ],
  'monthly-summary': [
    { id: 'current', label: 'Mois en cours' },
    { id: 'previous', label: 'Mois précédent' },
    { id: 'comparison', label: 'Comparaison' },
  ],
  'pending-decisions': [
    { id: 'budget', label: 'Budget', count: 2 },
    { id: 'scope', label: 'Périmètre', count: 1 },
    { id: 'planning', label: 'Planning', count: 1 },
    { id: 'contract', label: 'Contrat', count: 1 },
    { id: 'hr', label: 'RH' },
  ],
  'decision-history': [
    { id: 'last-month', label: 'Dernier mois' },
    { id: 'last-3-months', label: '3 derniers mois' },
    { id: 'by-type', label: 'Par type' },
    { id: 'by-status', label: 'Par statut' },
  ],
  'blocking-points': [
    { id: 'critical', label: 'Critiques', count: 3 },
    { id: 'high', label: 'Élevés', count: 5 },
    { id: 'all', label: 'Tous' },
  ],
  'active-escalations': [
    { id: 'level-1', label: 'Niveau 1', count: 3 },
    { id: 'level-2', label: 'Niveau 2', count: 4 },
    { id: 'level-3', label: 'Niveau 3', count: 1 },
  ],
  'major-risks': [
    { id: 'financial', label: 'Financier', count: 4 },
    { id: 'technical', label: 'Technique', count: 2 },
    { id: 'organizational', label: 'Organisationnel', count: 2 },
  ],
  'critical-blockages': [
    { id: 'urgent', label: 'Urgent', count: 2 },
    { id: 'high', label: 'Élevé', count: 2 },
    { id: 'all', label: 'Tous' },
  ],
  'scheduled-instances': [
    { id: 'upcoming', label: 'À venir', count: 5 },
    { id: 'this-week', label: 'Cette semaine', count: 2 },
    { id: 'this-month', label: 'Ce mois' },
  ],
  'minutes-followup': [
    { id: 'recent', label: 'Récents' },
    { id: 'pending', label: 'En attente', count: 3 },
    { id: 'completed', label: 'Complétés' },
  ],
  'sensitive-projects': [
    { id: 'critical', label: 'Critiques', count: 8 },
    { id: 'strategic', label: 'Stratégiques', count: 5 },
    { id: 'all', label: 'Tous' },
  ],
  'contract-sla': [
    { id: 'on-track', label: 'En cours', count: 15 },
    { id: 'at-risk', label: 'À risque', count: 3 },
    { id: 'late', label: 'En retard', count: 2 },
  ],
  'commitments': [
    { id: 'budget', label: 'Budget' },
    { id: 'deadlines', label: 'Délais', count: 4 },
    { id: 'milestones', label: 'Jalons', count: 12 },
  ],
  'resource-utilization': [
    { id: 'teams', label: 'Équipes' },
    { id: 'productivity', label: 'Productivité' },
    { id: 'recommendations', label: 'Recommandations' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getMainCategory = (id: string) => mainCategories.find(c => c.id === id);
export const getSubCategories = (mainId: string) => subCategories[mainId] || [];
export const getSubCategory = (mainId: string, subId: string) => 
  subCategories[mainId]?.find(s => s.id === subId);
export const getSubSubCategories = (subId: string) => subSubCategories[subId] || [];

// Helper pour obtenir le label d'une sous-catégorie
export const getSubCategoryLabel = (mainId: string, subId: string) => {
  const sub = getSubCategory(mainId, subId);
  return sub?.label || subId;
};

