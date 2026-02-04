/**
 * Tokens de design pour le layout BMO
 * 
 * Source de vérité pour:
 * - Largeurs de sidebar
 * - Breakpoints
 * - Z-index
 * - Espacements
 */

// =============================================================================
// LARGEURS DE SIDEBAR — Source de vérité unique
// =============================================================================

export const SIDEBAR_WIDTH = {
  /** Sidebar principale collapsed (icônes seules) */
  collapsed: 56, // w-14
  /** Sidebar principale expanded (icônes + labels) - Conforme Outlook */
  expanded: 224, // w-56
  /** Module sub-sidebar (dossiers/catégories) - Conforme Outlook 220px */
  module: 220,
  /** Module sub-sidebar min */
  moduleMin: 200,
  /** Module sub-sidebar max */
  moduleMax: 280,
} as const;

export const SIDEBAR_WIDTH_CLASS = {
  collapsed: 'w-14', // 56px
  expanded: 'w-56', // 224px
  module: 'w-[220px]', // Conforme Outlook
  moduleMin: 'min-w-[200px]',
  moduleMax: 'max-w-[280px]', // Conforme Outlook
} as const;

// =============================================================================
// LARGEURS DE PANNEAU — Pour OutlookLikeLayout
// =============================================================================

export const PANEL_WIDTH = {
  /** Liste d'éléments (messages, alertes, etc.) */
  list: 400,
  listMin: 320,
  listMax: 500,
  /** Panneau de détail min width */
  detailMin: 400,
} as const;

export const PANEL_WIDTH_CLASS = {
  list: 'w-[400px]',
  listMin: 'min-w-[320px]',
  listMax: 'max-w-[500px]',
  detailMin: 'min-w-[400px]',
} as const;

// =============================================================================
// BREAKPOINTS — Alignés avec TailwindCSS
// =============================================================================

export const BREAKPOINT = {
  /** Mobile : < 640px */
  sm: 640,
  /** Tablette : 640px - 768px */
  md: 768,
  /** Desktop : 768px - 1024px */
  lg: 1024,
  /** Large Desktop : 1024px - 1280px */
  xl: 1280,
  /** Extra Large : > 1280px */
  '2xl': 1536,
} as const;

/** Breakpoint pour basculer la sidebar mobile */
export const SIDEBAR_MOBILE_BREAKPOINT = BREAKPOINT.md; // 768px

// =============================================================================
// Z-INDEX — Échelle standardisée pour éviter les chevauchements
// =============================================================================

export const Z_INDEX = {
  /** Éléments de base (cartes, conteneurs) */
  base: 0,
  /** Dropdowns, menus contextuels */
  dropdown: 10,
  /** Éléments sticky (headers, footers de table) */
  sticky: 20,
  /** Overlays (arrière-plan de modals) */
  overlay: 30,
  /** Modals et dialogs */
  modal: 40,
  /** Sidebar mobile */
  sidebarMobile: 50,
  /** Topbar */
  topbar: 45,
  /** Notifications toast */
  toast: 60,
  /** Tooltips */
  tooltip: 70,
  /** Command palette / search */
  commandPalette: 80,
} as const;

// =============================================================================
// ESPACEMENTS — Grille 8px
// =============================================================================

export const SPACING = {
  '0': 0,
  '1': 4,  // 0.25rem
  '2': 8,  // 0.5rem
  '3': 12, // 0.75rem
  '4': 16, // 1rem
  '5': 20, // 1.25rem
  '6': 24, // 1.5rem
  '8': 32, // 2rem
  '10': 40, // 2.5rem
  '12': 48, // 3rem
  '16': 64, // 4rem
} as const;

// =============================================================================
// TRANSITIONS — Durées standardisées
// =============================================================================

export const TRANSITION = {
  /** Très rapide (hover) */
  fast: 100,
  /** Standard (toggles, collapses) */
  base: 200,
  /** Lente (sidebar collapse, modals) */
  slow: 300,
  /** Très lente (page transitions) */
  slower: 500,
} as const;

export const TRANSITION_CLASS = {
  fast: 'duration-100',
  base: 'duration-200',
  slow: 'duration-300',
  slower: 'duration-500',
} as const;

// =============================================================================
// HAUTEURS FIXES
// =============================================================================

export const HEIGHT = {
  /** Topbar */
  topbar: 44, // h-11
  /** Liste item standard */
  listItem: 80,
  /** Liste item compact */
  listItemCompact: 64,
} as const;

// =============================================================================
// TYPES EXPORTS
// =============================================================================

export type SidebarWidthKey = keyof typeof SIDEBAR_WIDTH;
export type BreakpointKey = keyof typeof BREAKPOINT;
export type ZIndexKey = keyof typeof Z_INDEX;
export type SpacingKey = keyof typeof SPACING;
export type TransitionKey = keyof typeof TRANSITION;
