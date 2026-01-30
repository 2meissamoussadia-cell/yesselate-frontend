/**
 * Configuration de navigation DG : 6 blocs métier (référence ERP-BTP)
 * Types NavNode / NavRequires : voir types/dashboardNavigationTypes.ts
 */

import type { DashboardMainCategory, NavNode, NavRequires } from '../types/dashboardNavigationTypes';
import {
  LayoutDashboard,
  Gauge,
  Building2,
  Calendar,
  LineChart,
  BarChart3,
  AlertTriangle,
  FolderKanban,
  FileText,
  Hammer,
  Ban,
  Scale,
  Wallet,
  CheckCircle2,
  TrendingUp,
  Landmark,
  Inbox,
  MapPin,
  Users,
  Ticket,
  FileEdit,
  UserCircle,
  Target,
  ClipboardList,
  Network,
  MessageSquare,
  Video,
  Mail,
  BookOpen,
  ShieldCheck,
  ScrollText,
  Database,
  Bot,
  Settings,
} from 'lucide-react';

/** Ré-export pour compatibilité des imports existants */
export type { NavNode, NavRequires } from '../types/dashboardNavigationTypes';

/** Base URL maître-ouvrage (pas /dg) */
const base = '/maitre-ouvrage';

/**
 * Navigation dashboard : 6 blocs métier.
 * Chaque entrée = un écran métier précis (ERP-BTP).
 */
export const dashboardNavigationConfig: Record<DashboardMainCategory, NavNode> = {
  pilotage: {
    id: 'pilotage',
    label: 'PILOTAGE',
    icon: Gauge,
    requires: { perm: 'dashboard:read' },
    children: [
      { id: 'dashboard', label: 'Cockpit DG', icon: Gauge, to: '/dg/cockpit', requires: { perm: 'dashboard:read', roles: ['DG', 'DIRECTION'] } },
      { id: 'alertes', label: "Centre d'alertes", icon: AlertTriangle, badge: 4, badgeType: 'critical' },
      { id: 'gouvernance', label: 'Gouvernance & décisions', icon: Building2, badge: 7, badgeType: 'warning' },
      { id: 'calendrier', label: 'Calendrier & échéances', icon: Calendar },
      { id: 'analytics', label: 'Analytics & rapports', icon: LineChart },
    ],
  },
  chantiers: {
    id: 'chantiers',
    label: 'CHANTIERS & MARCHÉS',
    icon: FolderKanban,
    requires: { perm: 'dashboard:read' },
    children: [
      { id: 'portefeuille', label: 'Portefeuille chantiers', icon: FolderKanban },
      { id: 'demandes', label: 'Demandes & devis', icon: FileText },
      { id: 'execution', label: 'Exécution chantiers', icon: Hammer },
      { id: 'dossiers-bloques', label: 'Dossiers bloqués', icon: Ban, badge: 4, badgeType: 'critical' },
      { id: 'litiges', label: 'Arbitrages & litiges', icon: Scale, badge: 3, badgeType: 'warning' },
    ],
  },
  finance: {
    id: 'finance',
    label: 'FINANCE',
    icon: Wallet,
    requires: { perm: 'dashboard:read' },
    children: [
      { id: 'budget', label: 'Budget & engagements', icon: Wallet },
      { id: 'validation-paiements', label: 'Validation paiements', icon: CheckCircle2, badge: 5, badgeType: 'warning' },
      { id: 'tresorerie', label: 'Trésorerie', icon: Landmark },
      { id: 'gains-pertes', label: 'Gains & pertes', icon: TrendingUp },
      { id: 'recouvrements', label: 'Recouvrements', icon: Inbox, badge: 4, badgeType: 'warning' },
    ],
  },
  clients: {
    id: 'clients',
    label: 'CLIENTS & COMMERCIAL',
    icon: Users,
    requires: { perm: 'dashboard:read' },
    children: [
      { id: 'projets', label: 'Projets en cours', icon: MapPin, badge: 8, badgeType: 'default' },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'tickets', label: 'Tickets clients / SAV', icon: Ticket, badge: 2, badgeType: 'warning' },
      { id: 'propositions', label: 'Propositions commerciales', icon: FileEdit },
    ],
  },
  rh: {
    id: 'rh',
    label: 'RH & RESSOURCES',
    icon: UserCircle,
    requires: { perm: 'dashboard:read' },
    children: [
      { id: 'employes', label: 'Employés & agents', icon: UserCircle, badge: 8, badgeType: 'default' },
      { id: 'missions', label: 'Missions & affectations', icon: Target, badge: 2, badgeType: 'default' },
      { id: 'evaluations', label: 'Évaluations', icon: BarChart3, badge: 2, badgeType: 'default' },
      { id: 'demandes-rh', label: 'Demandes RH', icon: ClipboardList, badge: 10, badgeType: 'critical' },
      { id: 'organigramme', label: 'Organigramme', icon: Network },
    ],
  },
  systeme: {
    id: 'systeme',
    label: 'COMMUNICATION & SYSTÈME',
    icon: Settings,
    requires: { perm: 'dashboard:read' },
    children: [
      { id: 'echanges', label: 'Échanges structures', icon: MessageSquare },
      { id: 'conferences', label: 'Conférences décisionnelles', icon: Video },
      { id: 'messages', label: 'Messages externes', icon: Mail },
      { id: 'registre-decisions', label: 'Registre des décisions', icon: BookOpen },
      { id: 'audit', label: 'Audit & conformité', icon: ShieldCheck },
      { id: 'journal-actions', label: 'Journal des actions', icon: ScrollText },
      { id: 'logs', label: 'Logs système', icon: Database },
      { id: 'ia', label: 'IA & assistants', icon: Bot },
      { id: 'parametres', label: 'Paramètres', icon: Settings },
    ],
  },
};

// Helper functions
export function findNavNodeById(
  mainCategory: DashboardMainCategory,
  subCategory?: string,
  subSubCategory?: string
): NavNode | undefined {
  const mainNode = dashboardNavigationConfig[mainCategory];
  if (!mainNode) return undefined;

  if (!subCategory) return mainNode;

  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;

  if (!subSubCategory) return subNode;

  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(
  mainCategory: DashboardMainCategory
): NavNode[] {
  const key = (mainCategory && typeof mainCategory === 'string' ? mainCategory.toLowerCase() : 'pilotage') as DashboardMainCategory;
  const mainNode = dashboardNavigationConfig[key];
  return mainNode?.children ?? [];
}

export function getSubSubCategories(
  mainCategory: DashboardMainCategory,
  subCategory: string
): NavNode[] {
  const key = (mainCategory && typeof mainCategory === 'string' ? mainCategory.toLowerCase() : 'pilotage') as DashboardMainCategory;
  const mainNode = dashboardNavigationConfig[key];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children ?? [];
}
