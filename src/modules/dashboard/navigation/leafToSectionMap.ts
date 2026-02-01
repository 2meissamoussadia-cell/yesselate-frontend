/**
 * Mapping leaf (subSubCategory) → section DashboardHome à afficher.
 * Quand une section du sub-sidebar est cliquée, seule cette section s'affiche.
 */

export type DashboardSectionFocus =
  | 'vueFinances'
  | 'hse'
  | 'risques'
  | 'indicateurs'
  | 'activite'
  | 'phase4';

/** Leaf ids (dashboard pilotage/dashboard) → section unique à afficher */
export const LEAF_TO_SECTION: Record<string, DashboardSectionFocus> = {
  // Vue DG - KPIs
  'vue-dg-kpis': 'indicateurs',
  'vue-dg-kpis-financiers': 'vueFinances',
  'vue-dg-kpis-budget': 'vueFinances',
  'vue-dg-kpis-consommation': 'vueFinances',
  'vue-dg-kpis-tresorerie': 'vueFinances',
  'vue-dg-kpis-operations': 'phase4',
  'vue-dg-kpis-chantiers': 'phase4',
  'vue-dg-kpis-avancement': 'phase4',
  'vue-dg-kpis-hse': 'hse',
  'vue-dg-kpis-accidents': 'hse',
  'vue-dg-kpis-conformite': 'hse',
  // Vue DG - Santé portefeuille
  'vue-dg-sante': 'phase4',
  'vue-dg-sante-synthese': 'phase4',
  'vue-dg-sante-phase4': 'phase4',
  'vue-dg-sante-critiques': 'phase4',
  'vue-dg-sante-tous': 'phase4',
  'vue-dg-sante-finances': 'vueFinances',
};

export function getSectionFocusForLeaf(leaf: string | null | undefined): DashboardSectionFocus | undefined {
  if (!leaf) return undefined;
  return LEAF_TO_SECTION[leaf];
}
