/**
 * Configuration navigation BMO v2
 * Construit le tree (NavigationConfig) à partir de bmoModules (sitemap JSON).
 * pathToIdMap inclut les modules + enfants du sitemap (paths statiques) pour breadcrumbs / activeId.
 */

import type {
  NavigationConfig,
  NavigationItem,
  NavigationLink,
  NavigationSection,
} from './types';
import { DEFAULT_SETTINGS } from './constants';
import { buildPathToIdMap } from './utils';
import {
  bmoModules,
  bmoModuleGroupLabels,
  bmoSitemap,
  type BMOModule,
} from './bmoModules';

function moduleToLink(item: BMOModule): NavigationLink {
  return {
    type: 'link',
    id: item.id,
    label: item.label,
    href: item.href,
    ariaLabel: item.label,
  };
}

function buildItemsFromBmoModules(): NavigationItem[] {
  const byGroup = {
    pilotage: [] as NavigationLink[],
    execution: [] as NavigationLink[],
    support: [] as NavigationLink[],
    systeme: [] as NavigationLink[],
  };
  for (const item of bmoModules) {
    const bucket = byGroup[item.group as keyof typeof byGroup];
    if (bucket) bucket.push(moduleToLink(item));
  }
  const sections: NavigationSection[] = [
    {
      type: 'section',
      id: 'pilotage',
      label: bmoModuleGroupLabels.pilotage,
      ariaLabel: 'Section Pilotage',
      children: byGroup.pilotage,
    },
    {
      type: 'section',
      id: 'execution',
      label: bmoModuleGroupLabels.execution,
      ariaLabel: 'Section Exécution',
      children: byGroup.execution,
    },
    {
      type: 'section',
      id: 'support',
      label: bmoModuleGroupLabels.support,
      ariaLabel: 'Section Support',
      children: byGroup.support,
    },
    {
      type: 'section',
      id: 'systeme',
      label: bmoModuleGroupLabels.systeme,
      ariaLabel: 'Section Communication & Système',
      children: byGroup.systeme,
    },
  ];
  return sections;
}

const items = buildItemsFromBmoModules();

/** Configuration navigation BMO v2 (modules BTP, 3 groupes) */
export const navigationConfig: NavigationConfig = {
  items,
  settings: { ...DEFAULT_SETTINGS },
};

/** Map path → id depuis les items (modules) */
const pathToIdFromItems = buildPathToIdMap(items);

/** Map path → id depuis le sitemap (enfants statiques, sans [id] / [chantierId]) */
function buildPathToIdMapFromSitemap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const g of bmoSitemap.groups) {
    for (const m of g.modules) {
      if (!m.path.includes('[')) out[m.path] = m.id;
      for (const c of m.children ?? []) {
        if (!c.path.includes('[')) out[c.path] = c.id;
      }
    }
  }
  return out;
}

/** Map path → id pour highlight actif (modules + enfants sitemap) */
export const pathToIdMap: Record<string, string> = {
  ...pathToIdFromItems,
  ...buildPathToIdMapFromSitemap(),
};
