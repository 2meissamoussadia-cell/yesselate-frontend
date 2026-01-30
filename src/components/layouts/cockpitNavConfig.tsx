/**
 * Configuration de navigation par défaut pour le CockpitLayout
 * Utilisé par toutes les pages du portail maître-ouvrage
 */

import {
  Home,
  Activity,
  FileSpreadsheet,
  LayoutDashboard,
  AlertTriangle,
  Wallet,
  ClipboardList,
  Calendar,
  Building2,
  Users,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  CheckSquare,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { NavSection, CommandItem, KPIItem } from "./CockpitLayout";

// ---------------------------------------------------------------------------
// Navigation par défaut (Cockpit DG)
// ---------------------------------------------------------------------------

export const DEFAULT_NAV_SECTIONS: NavSection[] = [
  {
    id: "vues",
    title: "Vues",
    items: [
      { id: "accueil", label: "Vue d'accueil", icon: Home, href: "/maitre-ouvrage/cockpit" },
      { id: "kpis", label: "KPIs", icon: Activity, href: "/maitre-ouvrage/cockpit/kpis" },
      { id: "rapports", label: "Rapports", icon: FileSpreadsheet, href: "/maitre-ouvrage/cockpit/rapports" },
    ],
  },
  {
    id: "acces-rapide",
    title: "Accès rapide",
    items: [
      { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard, href: "/maitre-ouvrage/dashboard" },
      { id: "alerts", label: "Retards critiques", icon: AlertTriangle, href: "/maitre-ouvrage/alerts" },
      { id: "budget", label: "Budget & coûts", icon: Wallet, href: "/maitre-ouvrage/finances" },
      { id: "decisions", label: "Décisions DG", icon: ClipboardList, href: "/maitre-ouvrage/decisions" },
    ],
  },
  {
    id: "modules",
    title: "Modules",
    items: [
      { id: "alertes", label: "Centre d'alertes", icon: AlertTriangle, href: "/maitre-ouvrage/alerts" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Navigation Gouvernance
// ---------------------------------------------------------------------------

export const GOVERNANCE_NAV_SECTIONS: NavSection[] = [
  {
    id: "gouvernance",
    title: "Gouvernance",
    items: [
      { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, href: "/maitre-ouvrage/governance/dashboard" },
      { id: "decisions", label: "Décisions", icon: ClipboardList, href: "/maitre-ouvrage/governance/decisions" },
      { id: "tendances", label: "Tendances", icon: TrendingUp, href: "/maitre-ouvrage/governance/tendances" },
    ],
  },
  {
    id: "arbitrages",
    title: "Arbitrages",
    items: [
      { id: "en-attente", label: "En attente", icon: AlertTriangle, href: "/maitre-ouvrage/governance/arbitrages/en-attente" },
      { id: "validees", label: "Décisions validées", icon: CheckSquare, href: "/maitre-ouvrage/governance/arbitrages/decisions-validees" },
      { id: "historique", label: "Historique", icon: FileText, href: "/maitre-ouvrage/governance/arbitrages/historique" },
    ],
  },
  {
    id: "synthese",
    title: "Synthèse",
    items: [
      { id: "projets", label: "Projets", icon: Briefcase, href: "/maitre-ouvrage/governance/synthese/projets" },
      { id: "budget", label: "Budget", icon: Wallet, href: "/maitre-ouvrage/governance/synthese/budget" },
      { id: "risques", label: "Risques", icon: AlertTriangle, href: "/maitre-ouvrage/governance/synthese/risques" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Navigation Calendrier
// ---------------------------------------------------------------------------

export const CALENDAR_NAV_SECTIONS: NavSection[] = [
  {
    id: "calendrier",
    title: "Calendrier",
    items: [
      { id: "agenda", label: "Agenda", icon: Calendar, href: "/maitre-ouvrage/calendrier/agenda" },
      { id: "gantt", label: "Gantt global", icon: LayoutDashboard, href: "/maitre-ouvrage/calendrier/gantt/global" },
      { id: "timeline", label: "Timeline", icon: Activity, href: "/maitre-ouvrage/calendrier/timeline/global" },
    ],
  },
  {
    id: "jalons",
    title: "Jalons",
    items: [
      { id: "a-venir", label: "À venir", icon: Calendar, href: "/maitre-ouvrage/calendrier/jalons/a-venir" },
      { id: "retards", label: "Retards", icon: AlertTriangle, href: "/maitre-ouvrage/calendrier/jalons/retards" },
      { id: "sla-risque", label: "SLA à risque", icon: Shield, href: "/maitre-ouvrage/calendrier/jalons/sla-risque" },
    ],
  },
  {
    id: "absences",
    title: "Absences",
    items: [
      { id: "global", label: "Vue globale", icon: Users, href: "/maitre-ouvrage/calendrier/absences/global" },
      { id: "equipe", label: "Par équipe", icon: Users, href: "/maitre-ouvrage/calendrier/absences/equipe" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Navigation Chantiers
// ---------------------------------------------------------------------------

export const CHANTIERS_NAV_SECTIONS: NavSection[] = [
  {
    id: "chantiers",
    title: "Chantiers",
    items: [
      { id: "liste", label: "Liste des chantiers", icon: Building2, href: "/maitre-ouvrage/chantiers" },
      { id: "carte", label: "Carte", icon: LayoutDashboard, href: "/maitre-ouvrage/chantiers/carte" },
      { id: "planning", label: "Planning", icon: Calendar, href: "/maitre-ouvrage/chantiers/planning" },
      { id: "programmes", label: "Programmes", icon: Briefcase, href: "/maitre-ouvrage/chantiers/programmes" },
    ],
  },
  {
    id: "suivi",
    title: "Suivi",
    items: [
      { id: "demandes", label: "Demandes", icon: FileText, href: "/maitre-ouvrage/demandes" },
      { id: "engagements", label: "Engagements", icon: CheckSquare, href: "/maitre-ouvrage/engagements" },
      { id: "finances", label: "Finances", icon: Wallet, href: "/maitre-ouvrage/finances" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Navigation Alertes
// ---------------------------------------------------------------------------

export const ALERTS_NAV_SECTIONS: NavSection[] = [
  {
    id: "alertes",
    title: "Alertes",
    items: [
      { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard, href: "/maitre-ouvrage/alerts" },
      { id: "critiques", label: "Critiques", icon: AlertTriangle, href: "/maitre-ouvrage/alerts/critiques" },
      { id: "qualite", label: "Qualité", icon: Shield, href: "/maitre-ouvrage/alerts/qualite" },
    ],
  },
  {
    id: "projets",
    title: "Projets",
    items: [
      { id: "retards", label: "Retards", icon: AlertTriangle, href: "/maitre-ouvrage/alerts/projets/retards" },
      { id: "blocages", label: "Blocages", icon: AlertTriangle, href: "/maitre-ouvrage/alerts/projets/blocages" },
      { id: "jalons", label: "Jalons", icon: Calendar, href: "/maitre-ouvrage/alerts/projets/jalons" },
    ],
  },
  {
    id: "sla",
    title: "SLA",
    items: [
      { id: "depasse", label: "Dépassés", icon: AlertTriangle, href: "/maitre-ouvrage/alerts/sla/depasse" },
      { id: "risque", label: "À risque", icon: Shield, href: "/maitre-ouvrage/alerts/sla/risque" },
      { id: "attente", label: "En attente", icon: Activity, href: "/maitre-ouvrage/alerts/sla/attente" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Navigation Paramètres
// ---------------------------------------------------------------------------

export const SETTINGS_NAV_SECTIONS: NavSection[] = [
  {
    id: "parametres",
    title: "Paramètres",
    items: [
      { id: "general", label: "Général", icon: Settings, href: "/maitre-ouvrage/parametres" },
      { id: "referentiels", label: "Référentiels", icon: FileSpreadsheet, href: "/maitre-ouvrage/parametres/referentiels" },
    ],
  },
  {
    id: "admin",
    title: "Administration",
    items: [
      { id: "logs", label: "Logs système", icon: FileText, href: "/maitre-ouvrage/system-logs" },
      { id: "audit", label: "Audit", icon: Shield, href: "/maitre-ouvrage/audit" },
    ],
  },
];

// ---------------------------------------------------------------------------
// KPIs par défaut
// ---------------------------------------------------------------------------

export const DEFAULT_KPIS: KPIItem[] = [
  { id: "demandes", label: "Demandes", value: "247", trend: 12, trendType: "up", color: "blue" },
  { id: "validations", label: "Validations", value: "89%", trend: 3, trendType: "up", color: "emerald" },
  { id: "blocages", label: "Blocages", value: "5", color: "amber" },
  { id: "decisions", label: "Décisions en attente", value: "8", color: "rose" },
];

// ---------------------------------------------------------------------------
// Helper pour créer des commandes
// ---------------------------------------------------------------------------

export function createCommand(
  id: string,
  label: string,
  icon: LucideIcon,
  options?: { primary?: boolean; onClick?: () => void; href?: string }
): CommandItem {
  const Icon = icon;
  return {
    id,
    label,
    icon: <Icon className="h-4 w-4" />,
    primary: options?.primary ?? false,
    onClick: options?.onClick,
    href: options?.href,
  };
}

// ---------------------------------------------------------------------------
// Mapping module → navigation
// ---------------------------------------------------------------------------

export const MODULE_NAV_MAP: Record<string, NavSection[]> = {
  cockpit: DEFAULT_NAV_SECTIONS,
  governance: GOVERNANCE_NAV_SECTIONS,
  calendrier: CALENDAR_NAV_SECTIONS,
  chantiers: CHANTIERS_NAV_SECTIONS,
  alerts: ALERTS_NAV_SECTIONS,
  parametres: SETTINGS_NAV_SECTIONS,
};

/**
 * Récupère la navigation appropriée selon le pathname
 */
export function getNavSectionsForPath(pathname: string): NavSection[] {
  if (pathname.includes("/governance")) return GOVERNANCE_NAV_SECTIONS;
  if (pathname.includes("/calendrier")) return CALENDAR_NAV_SECTIONS;
  if (pathname.includes("/chantiers")) return CHANTIERS_NAV_SECTIONS;
  if (pathname.includes("/alerts")) return ALERTS_NAV_SECTIONS;
  if (pathname.includes("/parametres")) return SETTINGS_NAV_SECTIONS;
  return DEFAULT_NAV_SECTIONS;
}
