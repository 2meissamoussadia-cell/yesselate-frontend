'use client';

/**
 * Sidebar YESSALATE BMO — Point d'entrée principal
 * Délègue à NavigationSidebar (lib/navigation + useNavigation).
 * Garde la même API que l'ancienne Sidebar pour BMOAppShell : collapsed, onToggleCollapse, user.
 * badgeCounts est géré en interne par useNavigation() via navigation-store.
 */

import { NavigationSidebar } from './Sidebar/NavigationSidebar';
import type { SidebarHeaderUser } from './Sidebar/SidebarHeader';

export interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Ignoré : les badges viennent de useNavigation() / navigation-store */
  badgeCounts?: Record<string, number>;
  user?: SidebarHeaderUser;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  user,
}: SidebarProps) {
  return (
    <NavigationSidebar
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      user={user}
    />
  );
}

export default Sidebar;
