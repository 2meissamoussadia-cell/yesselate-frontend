'use client';

/**
 * CommandCenterShell - Shell component for Command Centers
 * 
 * Provides a consistent structure for all command centers:
 * - Sidebar (module-specific)
 * - Header + actions (module-specific)
 * - SubNav (module-specific)
 * - KPI Bar (module-specific)
 * - Content Router (module-specific)
 * - Overlays (common): CommandPalette / Notifications / Panels / Modals
 * - StatusBar (common): lastUpdated, sync state, errors
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface CommandCenterShellProps {
  // Module-specific components
  sidebar: React.ReactNode;
  header: React.ReactNode;
  subNav?: React.ReactNode;
  kpiBar?: React.ReactNode;
  contentRouter: React.ReactNode;

  // Common overlays (optional, can be passed as children or separate props)
  commandPalette?: React.ReactNode;
  notificationsPanel?: React.ReactNode;
  panels?: React.ReactNode;
  modals?: React.ReactNode;

  // Status bar props
  statusBar?: React.ReactNode;

  // Layout options
  fullscreen?: boolean;
  className?: string;
}

export function CommandCenterShell({
  sidebar,
  header,
  subNav,
  kpiBar,
  contentRouter,
  commandPalette,
  notificationsPanel,
  panels,
  modals,
  statusBar,
  fullscreen = false,
  className,
}: CommandCenterShellProps) {
  return (
    <div
      className={cn(
        'flex h-screen min-w-0 max-w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden overflow-hidden',
        fullscreen && 'fixed inset-0 z-50',
        className
      )}
    >
      {/* Sidebar (module) */}
      {sidebar}

      {/* Main Content Area — viewport-contained (pas de scroll horizontal) */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden overflow-hidden">
        {/* Header + actions (module) */}
        {header}

        {/* SubNav (module) */}
        {subNav}

        {/* KPI Bar (module) */}
        {kpiBar}

        {/* Content Router (module) */}
        <main className="flex-1 min-w-0 max-w-full overflow-hidden">
          <div className="h-full min-w-0 max-w-full overflow-x-hidden overflow-y-auto">{contentRouter}</div>
        </main>

        {/* StatusBar (common) */}
        {statusBar}
      </div>

      {/* Overlays (common): CommandPalette / Notifications / Panels / Modals */}
      {commandPalette}
      {notificationsPanel}
      {panels}
      {modals}
    </div>
  );
}
