/**
 * Export de la navigation du module Gouvernance
 */

// Navigation config (legacy)
export { gouvernanceNavigation, getDomainById, getSectionById, getBadgeCount } from './gouvernanceNavigationConfig';
export type { GouvernanceNavItem, GouvernanceNavDomain } from './gouvernanceNavigationConfig';

// New 3-level navigation exports
export { GovernanceSidebar } from './GovernanceSidebar';
export { GovernanceSubNavigation } from './GouvernanceSubNavigation';
export { governanceNavigationConfig, findNavNodeById, getSubCategories, getSubSubCategories } from './governanceNavigationConfig';
export type { NavNode } from './governanceNavigationConfig';
export type { GovernanceMainCategory, GovernanceSubCategory, GovernanceSubSubCategory } from '../types/governanceNavigationTypes';

