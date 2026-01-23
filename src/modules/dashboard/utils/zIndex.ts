/**
 * Système de z-index cohérent pour le dashboard
 * 
 * Hiérarchie :
 * - base: 0-9 (contenu normal)
 * - navigation: 10-19 (sidebars, breadcrumbs)
 * - dropdowns: 20-29 (menus déroulants)
 * - overlays: 30-39 (modals, tooltips)
 * - notifications: 40-49 (toasts, alerts)
 * - critical: 50+ (modals critiques, loading overlays)
 */

export const Z_INDEX = {
  // Base content
  base: 0,
  
  // Navigation
  navigation: 10,
  sidebar: 11,
  breadcrumbs: 12,
  subNavigation: 13,
  
  // Dropdowns
  dropdown: 20,
  dropdownMenu: 21,
  select: 22,
  
  // Overlays
  overlay: 30,
  tooltip: 31,
  popover: 32,
  
  // Notifications
  notification: 40,
  alert: 41,
  
  // Critical
  modal: 50,
  modalOverlay: 51,
  loading: 52,
} as const;

/**
 * Helper pour générer des classes Tailwind z-index
 */
export const zIndexClass = (level: keyof typeof Z_INDEX): string => {
  return `z-[${Z_INDEX[level]}]`;
};
