'use client';

/**
 * Sidebar navigation BMO v2 — utilise lib/navigation (bmoModules) + useNavigation.
 * Overlay : contenu dans un wrapper fixe ; icônes Lucide depuis bmoModules.
 */

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useNavigation } from '@/hooks/navigation';
import { isNavigationLink, isNavigationSection } from '@/lib/navigation/types';
import type { NavigationItem, NavigationLink, NavigationSection } from '@/lib/navigation/types';
import { bmoModulesById } from '@/lib/navigation/bmoModules';
import type { BMOModuleId } from '@/lib/navigation/bmoModules';
import type { SidebarBadgeProps } from './SidebarBadge';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import type { SidebarHeaderUser } from './SidebarHeader';

function navBadgeVariantToSidebar(
  v?: string
): SidebarBadgeProps['variant'] {
  if (v === 'danger') return 'critical';
  if (v === 'warning' || v === 'success') return v;
  return 'default';
}

/** Icône : Lucide depuis bmoModules si module BMO, sinon fallback string */
function renderIconForItem(
  itemId: string,
  icon: NavigationLink['icon'] | NavigationSection['icon']
): React.ReactNode {
  const module = bmoModulesById.get(itemId as BMOModuleId);
  if (module) {
    const Icon = module.icon;
    return <Icon className="h-5 w-5 flex-shrink-0" aria-hidden />;
  }
  if (icon != null && typeof icon === 'string')
    return <span className="text-base flex-shrink-0" aria-hidden>{icon}</span>;
  return null;
}

/** Rend un item (link ou section) avec enfants récursifs */
function NavItemRenderer({
  item,
  isLinkActive,
  isSectionOpen,
  toggleSection,
  getBadgeCount,
  hasPermission,
  renderIcon,
}: {
  item: NavigationItem;
  isLinkActive: (href: string, exact?: boolean) => boolean;
  isSectionOpen: (id: string) => boolean;
  toggleSection: (id: string) => void;
  getBadgeCount: (id: string) => number | undefined;
  hasPermission: (item: NavigationItem) => boolean;
  renderIcon: (itemId: string, icon: NavigationLink['icon'] | NavigationSection['icon']) => React.ReactNode;
}): React.ReactNode {
  if (!hasPermission(item)) return null;

  if (isNavigationLink(item)) {
    const count = getBadgeCount(item.id) ?? item.badge?.count;
    const num = typeof count === 'number' ? count : parseInt(String(count ?? 0), 10);
    return (
      <SidebarItem
        key={item.id}
        id={item.id}
        label={item.label}
        icon={renderIcon(item.id, item.icon)}
        href={item.href}
        isActive={isLinkActive(item.href, item.exact)}
        badge={num > 0 ? num : undefined}
        badgeVariant={item.badge ? navBadgeVariantToSidebar(item.badge.variant) : undefined}
        ariaLabel={item.ariaLabel}
      />
    );
  }

  if (isNavigationSection(item) && item.children?.length) {
    const isExpanded = isSectionOpen(item.id);
    const count = getBadgeCount(item.id) ?? item.badge?.count;
    const num = typeof count === 'number' ? count : parseInt(String(count ?? 0), 10);
    const isActive = item.children.some(
      (c) => isNavigationLink(c) && isLinkActive(c.href)
    );
    const childrenNodes = item.children.map((child) =>
      NavItemRenderer({
        item: child,
        isLinkActive,
        isSectionOpen,
        toggleSection,
        getBadgeCount,
        hasPermission,
        renderIcon,
      })
    ).filter(Boolean);

    if (childrenNodes.length === 0) return null;

    return (
      <SidebarSection
        key={item.id}
        id={item.id}
        label={item.label}
        icon={renderIcon(item.id, item.icon)}
        badge={num > 0 ? num : undefined}
        badgeVariant={item.badge ? navBadgeVariantToSidebar(item.badge.variant) : undefined}
        isExpanded={isExpanded}
        isActive={isActive}
        onToggle={() => toggleSection(item.id)}
        ariaLabel={item.ariaLabel}
      >
        {childrenNodes}
      </SidebarSection>
    );
  }

  return null;
}

export interface NavigationSidebarProps {
  /** Overlay ouvert (visible) */
  open?: boolean;
  onToggle?: () => void;
  /** Bloc utilisateur optionnel (header) */
  user?: SidebarHeaderUser;
  className?: string;
}

export function NavigationSidebar({
  open = true,
  onToggle,
  user,
  className,
}: NavigationSidebarProps) {
  const nav = useNavigation();

  const renderIcon = useCallback(
    (itemId: string, icon: NavigationLink['icon'] | NavigationSection['icon']): React.ReactNode =>
      renderIconForItem(itemId, icon),
    []
  );

  const sections = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (const item of nav.items) {
      if (!isNavigationSection(item) || !item.children?.length) continue;
      const groupLabel = item.label;
      const childrenNodes = item.children.map((child) =>
        NavItemRenderer({
          item: child,
          isLinkActive: nav.isLinkActive,
          isSectionOpen: nav.isSectionOpen,
          toggleSection: nav.toggleSection,
          getBadgeCount: (id) => nav.getBadgeCount(id) ?? undefined,
          hasPermission: nav.hasPermission,
          renderIcon,
        })
      ).filter(Boolean);
      if (childrenNodes.length === 0) continue;
      out.push(
        <div
          key={item.id}
          className="mb-4"
          role="group"
          aria-labelledby={`nav-section-${item.id}`}
        >
          <h2
            id={`nav-section-${item.id}`}
            className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500/80"
          >
            {groupLabel}
          </h2>
          <ul className="space-y-0.5" role="list">
            {childrenNodes.map((node, i) => (
              <li key={i} role="none">
                {node}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return out;
  }, [
    nav.items,
    nav.isLinkActive,
    nav.isSectionOpen,
    nav.toggleSection,
    nav.getBadgeCount,
    nav.hasPermission,
    renderIcon,
  ]);

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col overflow-x-hidden bg-slate-950/95 border-r border-slate-800/60',
        'transition-all duration-300 ease-out',
        className
      )}
      role="navigation"
      aria-label="Navigation principale BMO"
    >
      <SidebarHeader
        collapsed={false}
        title="YESSALATE BMO"
        version="V1.0"
        user={user}
      />
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 scrollbar-thin"
        aria-label="Sections de navigation"
      >
        {sections}
      </nav>
      <SidebarFooter
        collapsed={false}
        onToggleCollapse={onToggle}
      />
    </aside>
  );
}

export default NavigationSidebar;
