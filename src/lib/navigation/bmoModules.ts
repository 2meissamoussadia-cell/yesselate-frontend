/**
 * Modules BMO — Dérivés du sitemap JSON (single source of truth).
 * Sidebar et PageTemplate consomment bmoModules ; l'arbre complet (children) est dans bmoSitemap.
 */

import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  AlertTriangle,
  Scale,
  Activity,
  Lightbulb,
  FolderKanban,
  Layout,
  CalendarRange,
  ClipboardList,
  ClipboardCheck,
  PackageCheck,
  Wallet,
  MapPin,
  ShoppingCart,
  Building2,
  ShieldCheck,
  Wrench,
  FileText,
  HelpCircle,
  Settings,
  MessageSquare,
  Video,
  Mail,
  BookOpen,
  ScrollText,
  Database,
  Bot,
} from 'lucide-react';

import bmoSitemapJson from './bmoSitemap.json';

// ——— Types sitemap (alignés sur le JSON) ———

export interface BmoSitemapChild {
  id: string;
  label: string;
  path: string;
}

export interface BmoSitemapModule {
  id: string;
  label: string;
  path: string;
  phaseRange: [number, number];
  /** Description courte (sidebar tooltip, PageTemplate, doc) */
  description?: string;
  /** Titre meta / SEO par module */
  title?: string;
  children?: BmoSitemapChild[];
}

export interface BmoSitemapGroup {
  id: string;
  label: string;
  modules: BmoSitemapModule[];
}

export interface BmoSitemap {
  app: string;
  area: string;
  groups: BmoSitemapGroup[];
}

/** Sitemap BMO complet (phases 0–10). Source unique pour front + doc + sidebar. */
export const bmoSitemap: BmoSitemap = bmoSitemapJson as BmoSitemap;

// ——— Mapping groupe JSON → clé interne ———

const groupIdToKey: Record<string, 'pilotage' | 'execution' | 'support' | 'systeme'> = {
  PILOTAGE: 'pilotage',
  EXECUTION: 'execution',
  SUPPORT: 'support',
  'SYSTÈME': 'systeme',
};

export type BMOModuleGroup = 'pilotage' | 'execution' | 'support' | 'systeme';

/** Icônes par id de module (sidebar, breadcrumbs). */
const moduleIcons: Record<string, LucideIcon> = {
  cockpit: LayoutDashboard,
  alerts: AlertTriangle,
  governance: Scale,
  performance: Activity,
  opportunities: Lightbulb,
  'pre-projet': Lightbulb,
  chantiers: FolderKanban,
  conception: Layout,
  planning: CalendarRange,
  execution: ClipboardList,
  quality: ClipboardCheck,
  receptions: PackageCheck,
  engagements: Wallet,
  foncier: MapPin,
  programmation: ClipboardList,
  achats: ShoppingCart,
  fournisseurs: Building2,
  conformite: ShieldCheck,
  autorisations: ShieldCheck,
  maintenance: Wrench,
  'exploitation-maintenance': Wrench,
  documents: FileText,
  support: HelpCircle,
  admin: Settings,
  echanges: MessageSquare,
  conferences: Video,
  messages: Mail,
  'registre-decisions': BookOpen,
  audit: ShieldCheck,
  'journal-actions': ScrollText,
  logs: Database,
  ia: Bot,
  'parametres-systeme': Settings,
};

export interface BMOModuleEntry {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon: LucideIcon;
  group: BMOModuleGroup;
  /** Phase fil conducteur (0–10) : phaseRange[0] du sitemap */
  phaseId?: number;
  /** Enfants (sous-pages) pour subnav / breadcrumbs */
  children?: BmoSitemapChild[];
  badge?: number;
}

export type BMOModule = BMOModuleEntry;

export type BMOModuleId =
  | 'cockpit'
  | 'alerts'
  | 'governance'
  | 'performance'
  | 'opportunities'
  | 'pre-projet'
  | 'chantiers'
  | 'conception'
  | 'planning'
  | 'execution'
  | 'quality'
  | 'receptions'
  | 'engagements'
  | 'foncier'
  | 'programmation'
  | 'achats'
  | 'fournisseurs'
  | 'conformite'
  | 'autorisations'
  | 'maintenance'
  | 'exploitation-maintenance'
  | 'documents'
  | 'support'
  | 'admin'
  | 'echanges'
  | 'conferences'
  | 'messages'
  | 'registre-decisions'
  | 'audit'
  | 'journal-actions'
  | 'logs'
  | 'ia'
  | 'parametres-systeme';

/** Liste des modules BMO pour la sidebar — générée depuis le sitemap. */
export const bmoModules: BMOModuleEntry[] = bmoSitemap.groups.flatMap((g) => {
  const group = groupIdToKey[g.id] ?? 'support';
  return g.modules.map((m) => ({
    id: m.id,
    label: m.label,
    href: m.path,
    description: m.description,
    icon: moduleIcons[m.id] ?? FileText,
    group,
    phaseId: m.phaseRange[0],
    children: m.children,
    badge: m.id === 'alerts' ? 4 : undefined,
  }));
});

export const bmoModuleGroupLabels: Record<BMOModuleGroup, string> = {
  pilotage: 'PILOTAGE',
  execution: 'EXÉCUTION',
  support: 'SUPPORT',
  systeme: 'COMMUNICATION & SYSTÈME',
};

/** Map id → module pour lookup icône (Sidebar, PageTemplate). */
export const bmoModulesById = new Map<BMOModuleId, BMOModuleEntry>(
  bmoModules.map((m) => [m.id as BMOModuleId, m])
);

/** Retourne le module dont l’href correspond au pathname (premier match par longueur décroissante). */
export function getModuleByPath(pathname: string): BMOModuleEntry | undefined {
  if (!pathname) return undefined;
  const normalized = pathname.replace(/\/$/, '');
  const matches = bmoModules
    .filter((m) => {
      const p = m.href.replace(/\/$/, '');
      return normalized === p || normalized.startsWith(p + '/');
    })
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0];
}

/** Retourne les enfants (sous-pages) d’un module pour subnav / breadcrumbs. */
export function getModuleChildren(moduleId: string): BmoSitemapChild[] {
  for (const g of bmoSitemap.groups) {
    const m = g.modules.find((x) => x.id === moduleId);
    if (m?.children) return m.children;
  }
  return [];
}

/** Construit un SubNavContext à partir des children du sitemap pour ce pathname (si le module a des children). */
export function getSubNavContextFromSitemap(pathname: string): {
  title: string;
  tabs: Array<{ id: string; label: string; path: string }>;
} | null {
  const module = getModuleByPath(pathname);
  if (!module) return null;
  const children = getModuleChildren(module.id);
  if (children.length === 0) return null;
  return {
    title: module.label,
    tabs: children.map((c) => ({ id: c.id, label: c.label, path: c.path })),
  };
}
