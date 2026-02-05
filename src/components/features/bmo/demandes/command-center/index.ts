/**
 * Export central des composants Command Center pour Demandes
 */

export { DemandesCommandSidebar, demandesCategories } from './DemandesCommandSidebar';
export type { DemandesCategory, DemandesMainCategory } from './DemandesCommandSidebar';

export { DemandesSidebar } from './DemandesSidebar';

export {
  DemandesSubNavigation,
  demandesSubCategoriesMap,
  demandesFiltersMap,
} from './DemandesSubNavigation';
export type { DemandesSubCategory } from './DemandesSubNavigation';

export { DemandesKPIBar } from './DemandesKPIBar';
export type { DemandesKPIData } from './DemandesKPIBar';

export { DemandesContentRouter } from './DemandesContentRouter';

export { DemandesCommandPalette } from './DemandesCommandPalette';

export { DemandesModals } from './DemandesModals';
