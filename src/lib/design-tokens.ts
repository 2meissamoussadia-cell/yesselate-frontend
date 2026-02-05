/**
 * Design tokens — point d'entrée unique pour l'UI BMO
 * Réexporte les tokens du dashboard (palette slate, espacements, rayons)
 * et les tokens de layout (sidebar, z-index, breakpoints).
 * À utiliser partout pour la cohérence (voir docs/ANALYSE_COHERENCE_INTERFACE_MODULES.md).
 */

export {
  colors,
  spacing,
  borderRadius,
  shadows,
  transitions,
  typography,
  interactive,
  components,
  // Accessibilité WCAG 2.1
  a11y,
  // Couleurs sémantiques de statut
  statusColors,
  // Layout Outlook
  outlookLayout,
  // Touch targets mobile
  touchTarget,
  // Z-index (dashboard)
  zIndex,
  // Accent primary
  accentPrimary,
} from '@/modules/dashboard/utils/dashboardDesignTokens';

// Layout BMO (sidebar, breakpoints, z-index)
export {
  SIDEBAR_MOBILE_BREAKPOINT,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_CLASS,
  Z_INDEX,
} from './design-tokens/index';
