/**
 * Logique pure : quelles sections du Dashboard Home sont dépliées par défaut
 * selon le preset (rôle) et le mode d'affichage.
 * Utilisé par DashboardHome et testé unitairement.
 */

export type DashboardPreset = 'executive' | 'financial' | 'operational' | 'hse' | null;
export type DashboardDisplayMode = 'all' | 'synthetique' | 'critical';

export interface SectionExpandedState {
  vueFinances: boolean;
  hse: boolean;
  risques: boolean;
  indicateurs: boolean;
  activite: boolean;
  phase4: boolean;
}

/**
 * Calcule quelles sections doivent être dépliées selon preset et displayMode.
 * Preset prime sur displayMode quand il est défini.
 */
export function computeSectionExpanded(
  preset: DashboardPreset,
  displayMode: DashboardDisplayMode
): SectionExpandedState {
  return {
    vueFinances:
      preset !== null
        ? preset === 'executive' || preset === 'financial'
        : displayMode === 'all' || displayMode === 'critical',
    hse:
      preset !== null
        ? preset === 'executive' || preset === 'hse'
        : displayMode === 'all',
    risques: preset !== null ? preset === 'executive' : displayMode === 'all',
    indicateurs: preset !== null ? preset === 'executive' : displayMode === 'all',
    activite: preset !== null ? preset === 'executive' : displayMode === 'all',
    phase4:
      preset !== null
        ? preset === 'executive' || preset === 'operational'
        : displayMode === 'all' || displayMode === 'critical',
  };
}
