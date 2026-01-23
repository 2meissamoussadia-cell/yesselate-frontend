/**
 * Configuration de la navigation du Dashboard
 * Définit la structure hiérarchique des vues (main > sub > leaf)
 */

export interface DashboardNavigationLeaf {
  label: string;
  component: string;
}

export interface DashboardNavigationSub {
  label: string;
  leaf?: Record<string, DashboardNavigationLeaf>;
}

export interface DashboardNavigationMain {
  label: string;
  sub?: Record<string, DashboardNavigationSub>;
}

export type DashboardNavigationConfig = Record<string, DashboardNavigationMain>;

export const dashboardNavigationConfig: DashboardNavigationConfig = {
  overview: {
    label: "Vue d'ensemble",
    sub: {
      summary: {
        label: "Synthèse",
        leaf: {
          dashboard: { 
            label: "Dashboard principal", 
            component: "SummaryDashboardPage" 
          },
          points: { 
            label: "Points clés", 
            component: "SummaryPointsPage" 
          }
        }
      },
      kpis: {
        label: "KPIs",
        leaf: {
          projet: { 
            label: "KPIs Projet", 
            component: "ProjetKpiPage" 
          },
          budget: { 
            label: "KPIs Budget", 
            component: "BudgetKpiPage" 
          }
        }
      }
    }
  },
  performance: {
    label: "Performance & KPIs",
    sub: {
      validations: {
        label: "Validations",
        leaf: {
          global: { 
            label: "Vue globale", 
            component: "ValidationsGlobalPage" 
          }
        }
      }
    }
  }
};

/**
 * Helper pour obtenir le label d'une section
 */
export function getNavigationLabel(
  main: string,
  sub?: string | null,
  leaf?: string | null
): string {
  const mainConfig = dashboardNavigationConfig[main];
  if (!mainConfig) return main;

  if (sub && mainConfig.sub?.[sub]) {
    const subConfig = mainConfig.sub[sub];
    if (leaf && subConfig.leaf?.[leaf]) {
      return subConfig.leaf[leaf].label;
    }
    return subConfig.label;
  }

  return mainConfig.label;
}

/**
 * Helper pour obtenir le nom du composant à afficher
 */
export function getNavigationComponent(
  main: string,
  sub?: string | null,
  leaf?: string | null
): string | null {
  const mainConfig = dashboardNavigationConfig[main];
  if (!mainConfig) return null;

  if (sub && mainConfig.sub?.[sub]) {
    const subConfig = mainConfig.sub[sub];
    if (leaf && subConfig.leaf?.[leaf]) {
      return subConfig.leaf[leaf].component;
    }
  }

  return null;
}

