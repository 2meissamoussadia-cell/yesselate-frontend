'use client';

/**
 * BMOSidebarNav — Icônes + dropdown menu pour sidebar BMO.
 * Items avec sous-vues (Cockpit DG, Documents, Alertes, etc.).
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface BMOSidebarNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  /** Sous-vues (dropdown) */
  subItems?: { id: string; label: string; href: string }[];
}

const defaultItems: BMOSidebarNavItem[] = [
  {
    id: 'cockpit',
    label: 'Cockpit DG',
    icon: LayoutDashboard,
    href: '/maitre-ouvrage/cockpit',
    subItems: [
      { id: 'accueil', label: 'Vue d\'accueil', href: '/maitre-ouvrage/dashboard' },
      { id: 'kpis', label: 'KPIs', href: '/maitre-ouvrage/dashboard?sub=kpis' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    href: '/maitre-ouvrage/documents',
    subItems: [
      { id: 'contrats', label: 'Contrats', href: '/maitre-ouvrage/documents' },
      { id: 'avenants', label: 'Avenants', href: '/maitre-ouvrage/documents/avenants' },
    ],
  },
  {
    id: 'alerts',
    label: 'Alertes',
    icon: AlertTriangle,
    href: '/maitre-ouvrage/alerts',
    subItems: [
      { id: 'actives', label: 'Alertes actives', href: '/maitre-ouvrage/alerts' },
      { id: 'critiques', label: 'Critiques', href: '/maitre-ouvrage/alerts/critiques' },
    ],
  },
];

export interface BMOSidebarNavProps {
  items?: BMOSidebarNavItem[];
  className?: string;
}

export function BMOSidebarNav({ items = defaultItems, className }: BMOSidebarNavProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <nav
      className={cn('flex flex-col gap-1 p-2 text-xs text-slate-200', className)}
      aria-label="Navigation BMO"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isOpen = openMenu === item.id;
        const hasSub = item.subItems && item.subItems.length > 0;

        return (
          <div key={item.id} className="relative">
            {item.href && !hasSub ? (
              <Link
                href={item.href}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                  'hover:bg-slate-800/80 transition-colors'
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setOpenMenu(isOpen ? null : item.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left',
                  'hover:bg-slate-800/80 transition-colors',
                  isOpen && 'bg-slate-800/80'
                )}
                aria-expanded={isOpen}
                aria-haspopup={hasSub ? 'true' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span>{item.label}</span>
              </button>
            )}

            {/* Dropdown sous-vues */}
            {hasSub && isOpen && (
              <div
                className="mt-1 ml-8 rounded-lg border border-slate-800 bg-slate-950/95 shadow-lg py-1"
                role="menu"
              >
                {item.subItems!.map((sub) => (
                  <Link
                    key={sub.id}
                    href={sub.href}
                    role="menuitem"
                    className="block w-full text-left px-3 py-1.5 hover:bg-slate-800/80 transition-colors"
                    onClick={() => setOpenMenu(null)}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Section paramètres */}
      <div className="mt-4 border-t border-slate-800 pt-2">
        <Link
          href="/maitre-ouvrage/parametres"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/80 transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span>Paramètres</span>
        </Link>
      </div>
    </nav>
  );
}
