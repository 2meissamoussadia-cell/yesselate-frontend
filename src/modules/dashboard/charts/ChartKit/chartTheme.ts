/**
 * Thème de couleurs standardisé pour tous les charts du dashboard
 * Aligné avec le design system "ERP-grade" (sobre, premium, lisible)
 * 
 * Source de vérité unique pour les couleurs de graphiques
 */

// ============================================
// PALETTE DE COULEURS PRINCIPALE
// ============================================

export const chartColors = {
  // Couleurs primaires (pour séries principales)
  primary: {
    main: '#3b82f6',      // blue-500
    light: '#60a5fa',     // blue-400
    dark: '#2563eb',      // blue-600
    alpha: {
      10: 'rgba(59, 130, 246, 0.1)',
      20: 'rgba(59, 130, 246, 0.2)',
      30: 'rgba(59, 130, 246, 0.3)',
      50: 'rgba(59, 130, 246, 0.5)',
    },
  },
  secondary: {
    main: '#10b981',      // emerald-500
    light: '#34d399',     // emerald-400
    dark: '#059669',      // emerald-600
    alpha: {
      10: 'rgba(16, 185, 129, 0.1)',
      20: 'rgba(16, 185, 129, 0.2)',
      30: 'rgba(16, 185, 129, 0.3)',
      50: 'rgba(16, 185, 129, 0.5)',
    },
  },
  // Couleurs sémantiques (pour statuts, alertes)
  success: {
    main: '#10b981',      // emerald-500
    light: '#34d399',     // emerald-400
    alpha: {
      10: 'rgba(16, 185, 129, 0.1)',
      20: 'rgba(16, 185, 129, 0.2)',
    },
  },
  warning: {
    main: '#f59e0b',      // amber-500
    light: '#fbbf24',     // amber-400
    alpha: {
      10: 'rgba(245, 158, 11, 0.1)',
      20: 'rgba(245, 158, 11, 0.2)',
    },
  },
  error: {
    main: '#ef4444',      // red-500
    light: '#f87171',     // red-400
    alpha: {
      10: 'rgba(239, 68, 68, 0.1)',
      20: 'rgba(239, 68, 68, 0.2)',
    },
  },
  info: {
    main: '#06b6d4',      // cyan-500
    light: '#22d3ee',     // cyan-400
    alpha: {
      10: 'rgba(6, 182, 212, 0.1)',
      20: 'rgba(6, 182, 212, 0.2)',
    },
  },
  // Palette étendue (pour multi-séries)
  palette: [
    '#3b82f6',  // blue-500
    '#10b981',  // emerald-500
    '#f59e0b',  // amber-500
    '#ef4444',  // red-500
    '#8b5cf6',  // violet-500
    '#06b6d4',  // cyan-500
    '#f97316',  // orange-500
    '#ec4899',  // pink-500
  ],
} as const;

// ============================================
// COULEURS UI (axes, grid, text)
// ============================================

export const chartUI = {
  // Axes
  axis: {
    stroke: '#64748b',        // slate-500
    tick: '#94a3b8',           // slate-400
    label: '#cbd5e1',          // slate-300
  },
  // Grid
  grid: {
    stroke: 'rgba(148, 163, 184, 0.1)',  // slate-400 avec opacité
    strokeDasharray: '3 3',
  },
  // Tooltip
  tooltip: {
    bg: 'rgba(15, 23, 42, 0.95)',        // slate-950 avec opacité
    border: 'rgba(148, 163, 184, 0.2)',  // slate-400 avec opacité
    text: {
      primary: '#f1f5f9',                // slate-100
      secondary: '#cbd5e1',               // slate-300
    },
  },
  // Legend
  legend: {
    text: '#cbd5e1',                      // slate-300
    icon: '#94a3b8',                      // slate-400
  },
} as const;

// ============================================
// STYLES STANDARDISÉS POUR RECHARTS
// ============================================

export const chartStyles = {
  // Axes communs
  axis: {
    stroke: chartUI.axis.stroke,
    strokeWidth: 1,
    tick: {
      fill: chartUI.axis.tick,
      fontSize: 11,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    style: {
      fontSize: 11,
      fill: chartUI.axis.label,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
  },
  // Grid commun
  grid: {
    stroke: chartUI.grid.stroke,
    strokeDasharray: chartUI.grid.strokeDasharray,
  },
  // Tooltip commun
  tooltip: {
    contentStyle: {
      backgroundColor: chartUI.tooltip.bg,
      border: `1px solid ${chartUI.tooltip.border}`,
      borderRadius: '8px',
      padding: '8px 12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    labelStyle: {
      color: chartUI.tooltip.text.primary,
      fontSize: 12,
      fontWeight: 600,
      marginBottom: '4px',
    },
    itemStyle: {
      color: chartUI.tooltip.text.secondary,
      fontSize: 11,
    },
  },
  // Legend commun
  legend: {
    wrapperStyle: {
      color: chartUI.legend.text,
      fontSize: 12,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    iconType: 'line' as const,
  },
} as const;

// ============================================
// MARGES STANDARDISÉES
// ============================================

export const chartMargins = {
  default: { top: 5, right: 30, left: 0, bottom: 5 },
  withLeftAxis: { top: 5, right: 30, left: 20, bottom: 5 },
  compact: { top: 5, right: 10, left: 0, bottom: 5 },
  spacious: { top: 10, right: 40, left: 20, bottom: 10 },
} as const;

// ============================================
// HAUTEURS STANDARDISÉES
// ============================================

export const chartHeights = {
  xs: 200,
  sm: 256,
  md: 300,
  lg: 400,
  xl: 500,
} as const;

// ============================================
// HELPERS
// ============================================

/**
 * Récupère une couleur de la palette par index (avec rotation)
 */
export function getPaletteColor(index: number): string {
  return chartColors.palette[index % chartColors.palette.length];
}

/**
 * Récupère une couleur sémantique selon le type
 */
export function getSemanticColor(type: 'success' | 'warning' | 'error' | 'info'): string {
  switch (type) {
    case 'success':
      return chartColors.success.main;
    case 'warning':
      return chartColors.warning.main;
    case 'error':
      return chartColors.error.main;
    case 'info':
      return chartColors.info.main;
    default:
      return chartColors.primary.main;
  }
}
