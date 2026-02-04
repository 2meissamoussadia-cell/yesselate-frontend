/**
 * Design Tokens pour le Dashboard
 * Système de design harmonisé pour tous les composants
 */

// ============================================
// COULEURS - Palette sobre "logiciel métier"
// ============================================

export const colors = {
  // Backgrounds
  bg: {
    primary: 'bg-slate-950',
    secondary: 'bg-slate-900/40',
    tertiary: 'bg-slate-900/30',
    hover: 'bg-slate-900/45',
    active: 'bg-slate-900/55',
    panel: 'bg-slate-900/40',
    card: 'bg-slate-900/30',
  },
  // Borders
  border: {
    default: 'border-slate-800/60',
    hover: 'border-slate-700/60',
    focus: 'border-slate-700/60',
    accent: 'border-slate-800/70',
  },
  // Text
  text: {
    primary: 'text-slate-100',
    secondary: 'text-slate-200',
    tertiary: 'text-slate-300',
    muted: 'text-slate-400',
    disabled: 'text-slate-500',
  },
  // Accent colors (pour KPIs, badges, etc.)
  accent: {
    emerald: {
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      borderHover: 'border-emerald-500/35',
      text: 'text-emerald-300',
      icon: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      borderHover: 'border-amber-500/35',
      text: 'text-amber-300',
      icon: 'text-amber-400',
    },
    rose: {
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      borderHover: 'border-red-500/35',
      text: 'text-red-300',
      icon: 'text-red-400',
    },
    blue: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      borderHover: 'border-blue-500/35',
      text: 'text-blue-300',
      icon: 'text-blue-400',
    },
    slate: {
      bg: 'bg-slate-500/5',
      border: 'border-slate-500/20',
      borderHover: 'border-slate-500/35',
      text: 'text-slate-300',
      icon: 'text-slate-400',
    },
  },
} as const;

// ============================================
// ESPACEMENTS - Système cohérent
// ============================================

export const spacing = {
  // Padding
  padding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-6',
    // Responsive
    responsive: 'p-4 sm:p-5',
    responsiveLg: 'p-4 sm:p-6',
  },
  // Padding horizontal
  paddingX: {
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-5',
    xl: 'px-6',
  },
  // Padding vertical
  paddingY: {
    sm: 'py-2',
    md: 'py-3',
    lg: 'py-4',
  },
  // Gap
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
    // Responsive
    responsive: 'gap-3 sm:gap-4',
  },
  // Margin
  margin: {
    xs: 'mb-1',
    sm: 'mb-2',
    md: 'mb-3',
    lg: 'mb-4',
    xl: 'mb-6',
    // Responsive
    responsive: 'mb-3 sm:mb-4',
  },
} as const;

// ============================================
// BORDURES - Rayons harmonisés
// ============================================
// Usage : sm = champs, badges | md = boutons, cartes | lg = panneaux, modales
export const borderRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const;

// ============================================
// COULEUR D'ACCENT PRINCIPALE - Boutons, focus, liens
// ============================================
export const accentPrimary = {
  bg: 'bg-sky-500',
  bgHover: 'hover:bg-sky-600',
  text: 'text-sky-400',
  ring: 'focus:ring-sky-500/50 focus:ring-2',
  border: 'border-sky-500/50',
} as const;

// ============================================
// Z-INDEX - Couches d'empilement
// ============================================
export const zIndex = {
  dropdown: 50,
  sticky: 10,
  modal: 110,
  toast: 120,
  tooltip: 130,
} as const;

// ============================================
// RÉDUCTION DES MOUVEMENTS - Accessibilité
// ============================================
export const reducedMotion = 'motion-reduce:transition-none motion-reduce:animate-none' as const;

// ============================================
// OMBRES - Système cohérent
// ============================================

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  // Hover
  hover: 'hover:shadow-xl hover:shadow-black/25',
  // Focus
  focus: 'focus:ring-2 focus:ring-blue-500/40',
} as const;

// ============================================
// TRANSITIONS - Durées harmonisées
// ============================================

export const transitions = {
  // Durées
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
  // Types
  all: 'transition-all',
  colors: 'transition-colors',
  transform: 'transition-transform',
  // Combinaisons courantes
  standard: 'transition-all duration-200',
  colorsStandard: 'transition-colors duration-200',
} as const;

// ============================================
// TYPOGRAPHIE - Tailles harmonisées
// ============================================

export const typography = {
  // Labels
  label: {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
  },
  // Body
  body: {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  },
  // Headings
  heading: {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  },
  // Font weights
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
} as const;

// ============================================
// TOUCH TARGETS - Mobile (44x44px minimum, recommandation Apple/Google)
// ============================================

export const touchTarget = {
  min: 'min-h-[44px] min-w-[44px]',
  tap: 'min-h-[44px] min-w-[44px] flex items-center justify-center',
  iconButton: 'min-h-[44px] min-w-[44px] p-3 flex items-center justify-center rounded-xl',
} as const;

// ============================================
// ACCESSIBILITÉ WCAG 2.1 - Contraste 4.5:1 minimum
// ============================================

export const a11y = {
  // Contraste texte sur fond sombre (ratio 7:1+ pour AAA)
  textHighContrast: 'text-white dark:text-slate-50',
  textMediumContrast: 'text-slate-900 dark:text-slate-100',
  textLowContrast: 'text-slate-700 dark:text-slate-300',
  // Focus visible (WCAG 2.4.7)
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
  // Skip link (navigation clavier)
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:rounded-md',
  // Announcement pour lecteurs d'écran
  srOnly: 'sr-only',
  // Reduction de mouvement
  reducedMotion: 'motion-reduce:transition-none motion-reduce:animate-none',
} as const;

// ============================================
// SÉMANTIQUE DE STATUT - Couleurs conventionnelles
// ============================================

export const statusColors = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/50',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/50',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-800/50',
    text: 'text-sky-700 dark:text-sky-300',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  neutral: {
    bg: 'bg-slate-50 dark:bg-slate-900/50',
    border: 'border-slate-200 dark:border-slate-800/50',
    text: 'text-slate-700 dark:text-slate-300',
    icon: 'text-slate-600 dark:text-slate-400',
  },
} as const;

// ============================================
// LAYOUT OUTLOOK - Largeurs et panneaux
// ============================================

export const outlookLayout = {
  // Largeurs des panneaux
  sidebar: {
    collapsed: 'w-14',
    expanded: 'w-56',
    transition: 'transition-[width] duration-200 ease-out',
  },
  subSidebar: {
    min: 'min-w-[200px]',
    default: 'w-64',
    max: 'max-w-xs',
  },
  listPane: {
    min: 'min-w-[280px]',
    default: 'w-80',
    max: 'max-w-md',
  },
  detailPane: {
    min: 'min-w-[400px]',
    default: 'flex-1',
  },
  // Séparateurs redimensionnables
  resizeHandle: 'w-1 hover:w-2 bg-transparent hover:bg-sky-500/30 cursor-col-resize transition-all',
} as const;

// ============================================
// ÉTATS INTERACTIFS - Hover/Focus/Active
// ============================================

export const interactive = {
  // Hover
  hover: {
    bg: 'hover:bg-slate-900/45',
    border: 'hover:border-slate-700/60',
    scale: 'hover:scale-[1.02]',
    translate: 'hover:translate-y-[-1px]',
    shadow: 'hover:shadow-xl hover:shadow-black/25',
  },
  // Focus
  focus: {
    outline: 'focus:outline-none',
    ring: 'focus:ring-2 focus:ring-blue-500/40',
    combined: 'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
  },
  // Active
  active: {
    bg: 'active:bg-slate-900/55',
    translate: 'active:translate-y-[1px]',
  },
  // Disabled
  disabled: {
    opacity: 'disabled:opacity-50',
    cursor: 'disabled:cursor-not-allowed',
  },
} as const;

// ============================================
// COMPOSANTS PRÉDÉFINIS - Classes réutilisables
// ============================================

export const components = {
  // Card cliquable
  clickableCard: [
    colors.bg.card,
    colors.border.default,
    borderRadius.lg,
    spacing.padding.responsive,
    transitions.colorsStandard,
    interactive.hover.bg,
    interactive.hover.border,
    interactive.focus.combined,
    'text-left',
    'min-w-0',
    'overflow-hidden',
  ].join(' '),
  
  // Panel
  panel: [
    colors.bg.panel,
    colors.border.default,
    borderRadius.lg,
    spacing.padding.responsiveLg,
  ].join(' '),
  
  // Button standard
  button: [
    colors.bg.secondary,
    colors.border.default,
    borderRadius.md,
    spacing.paddingX.md,
    spacing.paddingY.sm,
    transitions.colorsStandard,
    interactive.hover.bg,
    interactive.focus.combined,
  ].join(' '),
  
  // Input
  input: [
    colors.bg.secondary,
    colors.border.default,
    borderRadius.md,
    spacing.paddingX.md,
    spacing.paddingY.sm,
    colors.text.secondary,
    transitions.colorsStandard,
    interactive.focus.combined,
  ].join(' '),
} as const;
