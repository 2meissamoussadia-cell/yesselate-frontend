/**
 * Mapping entre les labels de navigation et les identifiants (main, sub, leaf)
 * Permet de faire correspondre les labels affichés dans l'UI avec les routes
 */

export const NAV_MAP = {
  "Dashboard principal": { main: "overview", sub: "summary", leaf: "dashboard" },
  "Points clés": { main: "overview", sub: "summary", leaf: "points" },
  "Budget": { main: "overview", sub: "summary", leaf: "budget" },
  "KPIs Projet": { main: "overview", sub: "kpis", leaf: "projet" },
  "KPIs Budget": { main: "overview", sub: "kpis", leaf: "budget" },
  "Vue globale": { main: "performance", sub: "validations", leaf: "global" },
} as const;

export type NavigationLabel = keyof typeof NAV_MAP;

/**
 * Obtient les identifiants de navigation à partir d'un label
 */
export function getNavigationFromLabel(label: string): { main: string; sub: string; leaf: string } | null {
  const nav = NAV_MAP[label as NavigationLabel];
  if (!nav) return null;
  return { main: nav.main, sub: nav.sub, leaf: nav.leaf };
}

/**
 * Obtient le label à partir des identifiants de navigation
 */
export function getLabelFromNavigation(main: string, sub: string | null, leaf: string | null): string | null {
  for (const [label, nav] of Object.entries(NAV_MAP)) {
    if (nav.main === main && nav.sub === sub && nav.leaf === leaf) {
      return label;
    }
  }
  return null;
}

/**
 * Vérifie si un label existe dans le mapping
 */
export function hasNavigationLabel(label: string): label is NavigationLabel {
  return label in NAV_MAP;
}

/**
 * Liste tous les labels disponibles
 */
export function getAllNavigationLabels(): NavigationLabel[] {
  return Object.keys(NAV_MAP) as NavigationLabel[];
}

