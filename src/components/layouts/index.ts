/**
 * Layouts réutilisables pour le portail maître-ouvrage
 */

export { CockpitLayout, default as CockpitLayoutDefault } from "./CockpitLayout";
export type {
  CockpitLayoutProps,
  CommandItem,
  KPIItem,
  NavItem,
  NavSection,
  CockpitCommand,
  CockpitKPI,
  CockpitNavItem,
  CockpitNavSection,
} from "./CockpitLayout";

export {
  DEFAULT_NAV_SECTIONS,
  GOVERNANCE_NAV_SECTIONS,
  CALENDAR_NAV_SECTIONS,
  CHANTIERS_NAV_SECTIONS,
  ALERTS_NAV_SECTIONS,
  SETTINGS_NAV_SECTIONS,
  DEFAULT_KPIS,
  MODULE_NAV_MAP,
  createCommand,
  getNavSectionsForPath,
} from "./cockpitNavConfig";
