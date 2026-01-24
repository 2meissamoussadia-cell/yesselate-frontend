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

export const borderRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const;

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
