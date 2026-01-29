'use client';

/**
 * Sidebar navigation V2 — utilise lib/navigation + useNavigation
 * Compose SidebarHeader, sections/items (SidebarSection, SidebarItem), SidebarFooter.
 * Accepte collapsed / onToggleCollapse en mode contrôlé (BMOAppShell).
 */

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/hooks/navigation';
import { isNavigationLink, isNavigationSection } from '@/lib/navigation/types';
import type { NavigationItem, NavigationLink, NavigationSection } from '@/lib/navigation/types';
import type { SidebarBadgeProps } from './SidebarBadge';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import type { SidebarHeaderUser } from './SidebarHeader';

const SIDEBAR_WIDTH_EXPANDED = 288;
const SIDEBAR_WIDTH_COLLAPSED = 80;

function navBadgeVariantToSidebar(
  v?: string
): SidebarBadgeProps['variant'] {
  if (v === 'danger') return 'critical';
  if (v === 'warning' || v === 'success') return v;
  return 'default';
}

/** Rend un item (link ou section) avec enfants récursifs */
function NavItemRenderer({
  item,
  collapsed,
  isLinkActive,
  isSectionOpen,
  toggleSection,
  getBadgeCount,
  hasPermission,
  renderIcon,
}: {
  item: NavigationItem;
  collapsed: boolean;
  isLinkActive: (href: string, exact?: boolean) => boolean;
  isSectionOpen: (id: string) => boolean;
  toggleSection: (id: string) => void;
  getBadgeCount: (id: string) => number | undefined;
  hasPermission: (item: NavigationItem) => boolean;
  renderIcon: (icon: NavigationLink['icon'] | NavigationSection['icon']) => React.ReactNode;
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
        icon={renderIcon(item.icon)}
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
        collapsed,
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
        icon={renderIcon(item.icon)}
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
  /** Contrôle externe (ex: BMOAppShell) — si défini, utilisé à la place de useNavigationState */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Bloc utilisateur optionnel (header) */
  user?: SidebarHeaderUser;
  className?: string;
}

export function NavigationSidebar({
  collapsed: controlledCollapsed,
  onToggleCollapse: controlledToggle,
  user,
  className,
}: NavigationSidebarProps) {
  const nav = useNavigation();
  const isCollapsed = controlledCollapsed ?? nav.isCollapsed;
  const onToggleCollapse = controlledToggle ?? nav.toggleSidebar;

  const renderIcon = useCallback(
    (icon: NavigationLink['icon'] | NavigationSection['icon']): React.ReactNode => {
      if (icon == null) return null;
      if (typeof icon === 'string')
        return <span className="text-base flex-shrink-0" aria-hidden>{icon}</span>;
      return null;
    },
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
          collapsed: isCollapsed,
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
          aria-labelledby={isCollapsed ? undefined : `nav-section-${item.id}`}
        >
          {!isCollapsed && (
            <h2
              id={`nav-section-${item.id}`}
              className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500/80"
            >
              {groupLabel}
            </h2>
          )}
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
    isCollapsed,
    renderIcon,
  ]);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col overflow-x-hidden bg-slate-900 border-r border-slate-700/60',
        'transition-all duration-300 ease-out',
        className
      )}
      style={{
        width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
      role="navigation"
      aria-label="Navigation principale BMO"
    >
      <SidebarHeader
        collapsed={isCollapsed}
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
        collapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </aside>
  );
}

export default NavigationSidebar;
