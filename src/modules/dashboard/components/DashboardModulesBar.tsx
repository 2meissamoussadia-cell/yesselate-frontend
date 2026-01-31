/**
 * Action bar compacte — raccourcis vers sous-vues et modules (sans dupliquer le rail des 6 blocs).
 * Utilise la navigation dashboard (main/sub/leaf) quand la cible existe dans la config, sinon lien externe.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Bell,
  Building2,
  FileCheck,
  FileText,
  CreditCard,
  ClipboardList,
  Gavel,
  Scale,
  Wallet,
  Settings,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { getDefaultLeafForSub } from '../utils/routeValidation';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';

type ShortcutItem =
  | {
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      main: DashboardMainCategory;
      sub: string;
    }
  | {
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      href: string;
    };

/** Raccourcis : dashboard (main/sub) quand la vue existe, sinon lien maître-ouvrage */
const SHORTCUTS: ShortcutItem[] = [
  { id: 'alertes', label: 'Alertes', icon: Bell, main: 'pilotage', sub: 'alertes' },
  { id: 'gouvernance', label: 'Gouvernance', icon: Building2, main: 'pilotage', sub: 'gouvernance' },
  { id: 'validation-bc', label: 'Validation BC', icon: FileCheck, href: '/maitre-ouvrage/validation-bc' },
  { id: 'validation-contrats', label: 'Contrats', icon: FileText, href: '/maitre-ouvrage/validation-contrats' },
  { id: 'validation-paiements', label: 'Paiements', icon: CreditCard, main: 'finance', sub: 'validation-paiements' },
  { id: 'demandes', label: 'Demandes', icon: ClipboardList, main: 'chantiers', sub: 'demandes' },
  { id: 'decisions', label: 'Décisions', icon: Gavel, main: 'pilotage', sub: 'gouvernance' },
  { id: 'arbitrages', label: 'Arbitrages', icon: Scale, main: 'chantiers', sub: 'litiges' },
  { id: 'finances', label: 'Finances', icon: Wallet, main: 'finance', sub: 'budget' },
  { id: 'parametres', label: 'Paramètres', icon: Settings, main: 'systeme', sub: 'parametres' },
];

function isDashboardShortcut(item: ShortcutItem): item is ShortcutItem & { main: DashboardMainCategory; sub: string } {
  return 'main' in item && 'sub' in item;
}

export function DashboardModulesBar() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  return (
    <div
      className="min-w-0 overflow-x-auto border-b border-slate-800/80 bg-slate-950/60 px-4 sm:px-6 py-2.5"
      role="navigation"
      aria-label="Raccourcis modules"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:justify-between">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium shrink-0 py-0.5">
          Accès rapide
        </span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 min-w-0">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            const baseClass =
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] transition-colors shrink-0 whitespace-nowrap border border-transparent';
            if (isDashboardShortcut(item)) {
              const { main, sub } = item;
              const leaf = getDefaultLeafForSub(main, sub);
              const isActive = nav.mainCategory === main && nav.subCategory === sub;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(main, sub, leaf)}
                  className={cn(
                    baseClass,
                    isActive
                      ? 'bg-slate-800 text-slate-100 border-slate-700'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 hover:border-slate-700/50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  title={item.label}
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                    <Icon className="h-3 w-3 min-h-0 min-w-0 max-h-full max-w-full" aria-hidden />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  baseClass,
                  'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 hover:border-slate-700/50'
                )}
                aria-label={`Ouvrir ${item.label}`}
                title={item.label}
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                  <Icon className="h-3 w-3 min-h-0 min-w-0 max-h-full max-w-full" aria-hidden />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
