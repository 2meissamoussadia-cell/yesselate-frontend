/**
 * Utilitaires pour gérer les Safe Area Insets (iPhone encoche, barres système)
 * 
 * Utilise les variables CSS env() pour gérer les zones sûres sur iOS
 */

/**
 * Classes Tailwind pour safe area insets
 */
export const SAFE_AREA = {
  // Padding avec safe area
  paddingTop: 'pt-[env(safe-area-inset-top)]',
  paddingBottom: 'pb-[env(safe-area-inset-bottom)]',
  paddingLeft: 'pl-[env(safe-area-inset-left)]',
  paddingRight: 'pr-[env(safe-area-inset-right)]',
  
  // Margin avec safe area
  marginTop: 'mt-[env(safe-area-inset-top)]',
  marginBottom: 'mb-[env(safe-area-inset-bottom)]',
  marginLeft: 'ml-[env(safe-area-inset-left)]',
  marginRight: 'mr-[env(safe-area-inset-right)]',
  
  // Combinaisons courantes
  paddingVertical: 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
  paddingHorizontal: 'pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
  paddingAll: 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
  
  // Avec fallback (padding normal + safe area)
  paddingBottomWithFallback: 'pb-4 pb-[calc(1rem+env(safe-area-inset-bottom))]',
  paddingTopWithFallback: 'pt-4 pt-[calc(1rem+env(safe-area-inset-top))]',
} as const;

/**
 * Helper pour générer des classes safe area
 */
export const safeArea = {
  pt: () => SAFE_AREA.paddingTop,
  pb: () => SAFE_AREA.paddingBottom,
  pl: () => SAFE_AREA.paddingLeft,
  pr: () => SAFE_AREA.paddingRight,
  py: () => SAFE_AREA.paddingVertical,
  px: () => SAFE_AREA.paddingHorizontal,
  p: () => SAFE_AREA.paddingAll,
  pbFallback: () => SAFE_AREA.paddingBottomWithFallback,
  ptFallback: () => SAFE_AREA.paddingTopWithFallback,
};
