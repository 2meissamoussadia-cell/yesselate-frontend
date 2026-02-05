/**
 * App Layout Component
 * Next.js-compatible layout with sidebar alerts
 * Replaces React Router's Outlet pattern with children
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { SidebarAlerts } from './SidebarAlerts';

interface AppProps {
  children: React.ReactNode;
  className?: string;
}

export default function App({ children, className }: AppProps) {
  return (
    <div className={cn('layout flex h-screen overflow-hidden', className)}>
      <aside className="sidebar w-80 border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl flex flex-col">
        <div className="sidebar-title p-4 border-b border-slate-700/50 flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <span className="font-semibold text-slate-200">Alertes BTP</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarAlerts />
        </div>
      </aside>
      <main className="content flex-1 overflow-y-auto bg-slate-950">
        {children}
      </main>
    </div>
  );
}

