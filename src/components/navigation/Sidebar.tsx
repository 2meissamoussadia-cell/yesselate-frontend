'use client';

/**
 * Sidebar YESSALATE BMO v1 — Overlay fixe, masquée par défaut.
 * S'ouvre/ferme via le bouton hamburger (trois traits) dans le header.
 */

import { cn } from '@/lib/cn';
import type { PageCounts } from '@/lib/services/navigation.service';
import { NavigationSidebar } from './Sidebar/NavigationSidebar';
import type { SidebarHeaderUser } from './Sidebar/SidebarHeader';

export interface SidebarProps {
  /** Sidebar visible (overlay ouvert) */
  open?: boolean;
  onToggle?: () => void;
  /** Ignoré : les badges viennent de useNavigation() / navigation-store */
  badgeCounts?: PageCounts;
  user?: SidebarHeaderUser;
}

export function Sidebar({
  open = false,
  onToggle,
  user,
}: SidebarProps) {
  return (
    <>
      {/* Backdrop : ferme au clic (tous breakpoints) */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onToggle}
        aria-hidden
      />
      {/* Panel : overlay fixe, visible uniquement quand open */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavigationSidebar
          open={open}
          onToggle={onToggle}
          user={user}
        />
      </div>
    </>
  );
}

export default Sidebar;
