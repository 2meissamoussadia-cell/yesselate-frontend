/**
 * Navigation BMO v2 — Export central (phases BTP, bmoModules)
 */

export * from './types';
export * from './constants';
export * from './utils';
export * from './permissions';
export { navigationConfig, pathToIdMap } from './config';
export {
  bmoFilConducteurPhases,
  bmoPhasesWithSuggestedModule,
  getPhaseByPath,
  type BMOPhaseId,
  type BMOPhaseEntry,
} from './bmoFilConducteur';
export {
  bmoModules,
  bmoModuleGroupLabels,
  bmoModulesById,
  getModuleByPath,
  getModuleChildren,
  getSubNavContextFromSitemap,
  bmoSitemap,
  type BMOModuleId,
  type BMOModuleGroup,
  type BMOModule,
  type BMOModuleEntry,
  type BmoSitemap,
  type BmoSitemapGroup,
  type BmoSitemapModule,
  type BmoSitemapChild,
} from './bmoModules';
