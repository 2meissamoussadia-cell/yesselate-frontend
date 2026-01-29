/**
 * Configuration navigation V2
 * Construit le tree (NavigationConfig) à partir de la config existante
 */

import type {
  NavigationConfig,
  NavigationItem,
  NavigationLink,
  NavigationSection,
  NavigationBadge,
} from './types';
import { DEFAULT_SETTINGS } from './constants';
import { buildPathToIdMap } from './utils';
import { navigationConfig as sectionsConfig } from '@/config/navigation';

type OldNavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: NavigationBadge & { count?: number; variant?: string; live?: boolean };
  children?: { id: string; label: string; path?: string; badge?: NavigationBadge; ariaLabel?: string }[];
  ariaLabel?: string;
};
type OldSection = { id: string; title: string; ariaLabel: string; items: OldNavItem[] };

function toBadge(b?: OldNavItem['badge']): NavigationLink['badge'] | undefined {
  if (!b || (typeof b.count === 'number' && b.count <= 0)) return undefined;
  const variant = (b.variant === 'urgent' ? 'danger' : b.variant === 'warning' ? 'warning' : b.variant === 'info' ? 'info' : b.variant === 'success' ? 'success' : 'gray') as NavigationLink['badge'] extends { variant?: infer V } ? V : never;
  return {
    count: b.count ?? 0,
    variant: variant ?? 'primary',
    pulse: false,
    live: 'live' in b ? !!b.live : undefined,
  };
}

function convertItem(item: OldNavItem): NavigationItem {
  if (item.children?.length) {
    const children: NavigationItem[] = item.children.map((sub) => ({
      type: 'link' as const,
      id: sub.id,
      label: sub.label,
      href: sub.path ?? item.path,
      badge: toBadge(sub.badge),
      ariaLabel: sub.ariaLabel,
    }));
    return {
      type: 'section',
      id: item.id,
      label: item.label,
      icon: item.icon,
      badge: toBadge(item.badge),
      ariaLabel: item.ariaLabel,
      children,
    };
  }
  return {
    type: 'link',
    id: item.id,
    label: item.label,
    href: item.path,
    icon: item.icon,
    badge: toBadge(item.badge),
    ariaLabel: item.ariaLabel,
  };
}

function convertSectionsToItems(sections: OldSection[]): NavigationItem[] {
  const items: NavigationItem[] = [];
  for (const section of sections) {
    items.push({
      type: 'section',
      id: section.id,
      label: section.title,
      ariaLabel: section.ariaLabel,
      children: section.items.map(convertItem),
    });
  }
  return items;
}

const items = convertSectionsToItems(sectionsConfig as OldSection[]);

/** Configuration navigation V2 (tree + settings) */
export const navigationConfig: NavigationConfig = {
  items,
  settings: { ...DEFAULT_SETTINGS },
};

/** Map path → id pour highlight actif (dérivée du tree) */
export const pathToIdMap: Record<string, string> = buildPathToIdMap(items);
