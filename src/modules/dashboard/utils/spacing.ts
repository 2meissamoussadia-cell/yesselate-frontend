/**
 * Système d'espacement cohérent pour le dashboard
 * 
 * Basé sur une échelle de 4px (base unit)
 * - xs: 4px (0.25rem)
 * - sm: 8px (0.5rem)
 * - md: 12px (0.75rem)
 * - base: 16px (1rem)
 * - lg: 24px (1.5rem)
 * - xl: 32px (2rem)
 * - 2xl: 48px (3rem)
 */

export const SPACING = {
  // Padding
  padding: {
    xs: 'p-1',      // 4px
    sm: 'p-2',      // 8px
    md: 'p-3',      // 12px
    base: 'p-4',    // 16px
    lg: 'p-6',      // 24px
    xl: 'p-8',      // 32px
  },
  
  // Padding horizontal
  paddingX: {
    xs: 'px-1',
    sm: 'px-2',
    md: 'px-3',
    base: 'px-4',
    lg: 'px-6',
    xl: 'px-8',
  },
  
  // Padding vertical
  paddingY: {
    xs: 'py-1',
    sm: 'py-2',
    md: 'py-3',
    base: 'py-4',
    lg: 'py-6',
    xl: 'py-8',
  },
  
  // Gap (pour flex/grid)
  gap: {
    xs: 'gap-1',    // 4px
    sm: 'gap-2',    // 8px
    md: 'gap-3',    // 12px
    base: 'gap-4',  // 16px
    lg: 'gap-6',    // 24px
    xl: 'gap-8',    // 32px
  },
  
  // Space-y (vertical spacing)
  spaceY: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-3',
    base: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
  
  // Responsive spacing patterns
  responsive: {
    // Padding responsive: mobile -> desktop
    padding: {
      sm: 'p-2 sm:p-4',      // 8px mobile, 16px desktop
      md: 'p-4 sm:p-6',      // 16px mobile, 24px desktop
      lg: 'p-4 sm:p-6 lg:p-8', // 16px mobile, 24px tablet, 32px desktop
    },
    
    // Gap responsive
    gap: {
      sm: 'gap-2 sm:gap-4',      // 8px mobile, 16px desktop
      md: 'gap-3 sm:gap-4 lg:gap-6', // 12px mobile, 16px tablet, 24px desktop
      lg: 'gap-4 sm:gap-6',      // 16px mobile, 24px desktop
    },
    
    // Space-y responsive
    spaceY: {
      sm: 'space-y-2 sm:space-y-4',      // 8px mobile, 16px desktop
      md: 'space-y-4 sm:space-y-6',      // 16px mobile, 24px desktop
      lg: 'space-y-4 sm:space-y-6 lg:space-y-8', // 16px mobile, 24px tablet, 32px desktop
    },
  },
} as const;

/**
 * Helper pour générer des classes d'espacement cohérentes
 */
export const spacing = {
  // Padding
  p: (size: keyof typeof SPACING.padding) => SPACING.padding[size],
  px: (size: keyof typeof SPACING.paddingX) => SPACING.paddingX[size],
  py: (size: keyof typeof SPACING.paddingY) => SPACING.paddingY[size],
  
  // Gap
  gap: (size: keyof typeof SPACING.gap) => SPACING.gap[size],
  
  // Space-y
  spaceY: (size: keyof typeof SPACING.spaceY) => SPACING.spaceY[size],
  
  // Responsive
  responsive: {
    padding: (size: keyof typeof SPACING.responsive.padding) => SPACING.responsive.padding[size],
    gap: (size: keyof typeof SPACING.responsive.gap) => SPACING.responsive.gap[size],
    spaceY: (size: keyof typeof SPACING.responsive.spaceY) => SPACING.responsive.spaceY[size],
  },
};
