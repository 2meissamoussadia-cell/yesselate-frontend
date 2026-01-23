/**
 * Utilitaires pour Container Queries
 * 
 * Permet un responsive design basé sur la taille du conteneur plutôt que la viewport
 * Nécessite @container sur le parent et @container/<name> pour les queries
 */

/**
 * Classes Tailwind pour container queries
 * Note: Tailwind v3.3+ supporte nativement les container queries avec @container
 */
export const CONTAINER_QUERIES = {
  // Définir un conteneur
  container: '@container',
  
  // Breakpoints de container (basés sur la largeur du conteneur)
  // Ces classes nécessitent que Tailwind soit configuré avec container queries
  sm: '@container/sm',
  md: '@container/md',
  lg: '@container/lg',
  xl: '@container/xl',
  
  // Helper pour créer des classes conditionnelles basées sur la taille du conteneur
  // Exemple: grid-cols-1 @container/sm:grid-cols-2 @container/md:grid-cols-3
  grid: {
    responsive: 'grid-cols-1 @container/sm:grid-cols-2 @container/md:grid-cols-3 @container/lg:grid-cols-4',
    compact: 'grid-cols-1 @container/md:grid-cols-2',
    wide: 'grid-cols-1 @container/sm:grid-cols-2 @container/lg:grid-cols-3',
  },
  
  // Padding responsive basé sur le conteneur
  padding: {
    responsive: 'p-2 @container/sm:p-4 @container/md:p-6',
    compact: 'p-2 @container/md:p-4',
  },
  
  // Gap responsive basé sur le conteneur
  gap: {
    responsive: 'gap-2 @container/sm:gap-4 @container/md:gap-6',
    compact: 'gap-2 @container/md:gap-4',
  },
} as const;

/**
 * Helper pour générer des classes container query
 */
export const containerQuery = {
  // Définir le conteneur
  container: () => CONTAINER_QUERIES.container,
  
  // Grids responsive
  grid: {
    responsive: () => CONTAINER_QUERIES.grid.responsive,
    compact: () => CONTAINER_QUERIES.grid.compact,
    wide: () => CONTAINER_QUERIES.grid.wide,
  },
  
  // Padding responsive
  padding: {
    responsive: () => CONTAINER_QUERIES.padding.responsive,
    compact: () => CONTAINER_QUERIES.padding.compact,
  },
  
  // Gap responsive
  gap: {
    responsive: () => CONTAINER_QUERIES.gap.responsive,
    compact: () => CONTAINER_QUERIES.gap.compact,
  },
};
