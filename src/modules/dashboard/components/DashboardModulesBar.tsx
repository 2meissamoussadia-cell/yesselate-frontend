/**
 * Barre "Modules métier" type 3P
 * Toujours visible sous le header : 6 modules (Accueil, Performance, Actions, Risques, Décisions, Temps réel)
 * Chaque module est cliquable et navigue vers la section correspondante.
 */

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Home,
  TrendingUp,
  Zap,
  AlertTriangle,
  Scale,
  Activity,
  ExternalLink,
  Bell,
  Building2,
  FileCheck,
  FileText,
  CreditCard,
  ClipboardList,
  Gavel,
  Wallet,
  Settings,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardApps, type DashboardMainCategory } from '../config/dashboardApps';

const MODULE_ICONS: Record<DashboardMainCategory, React.ComponentType<{ className?: string }>> = {
  overview: Home,
  performance: TrendingUp,
  actions: Zap,
  risks: AlertTriangle,
  decisions: Scale,
  realtime: Activity,
};

/** Liens directs vers les modules maître-ouvrage (redistribution dashboard → modules) */
const MODULE_LINKS: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { href: '/maitre-ouvrage/alerts', label: 'Alertes', icon: Bell },
  { href: '/maitre-ouvrage/governance', label: 'Gouvernance', icon: Building2 },
  { href: '/maitre-ouvrage/validation-bc', label: 'Validation BC', icon: FileCheck },
  { href: '/maitre-ouvrage/validation-contrats', label: 'Validation contrats', icon: FileText },
  { href: '/maitre-ouvrage/validation-paiements', label: 'Validation paiements', icon: CreditCard },
  { href: '/maitre-ouvrage/demandes', label: 'Demandes', icon: ClipboardList },
  { href: '/maitre-ouvrage/decisions', label: 'Décisions', icon: Gavel },
  { href: '/maitre-ouvrage/arbitrages-vivants', label: 'Arbitrages', icon: Scale },
  { href: '/maitre-ouvrage/finances', label: 'Finances', icon: Wallet },
  { href: '/maitre-ouvrage/parametres', label: 'Paramètres', icon: Settings },
];

export function DashboardModulesBar() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const modules = useMemo(() => Object.values(dashboardApps), []);

  return (
    <div
      className="min-w-0 overflow-x-hidden border-b border-slate-800/60 bg-slate-900/30 px-4 sm:px-6 py-2"
      role="navigation"
      aria-label="Modules métier"
    >
      <div className="flex items-center gap-1 mb-1.5 min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Solutions métier (3P)
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {modules.map((app) => {
          const isActive = nav.mainCategory === app.id;
          const Icon = MODULE_ICONS[app.id];
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => navigate(app.id, null, null)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-blue-500/60 bg-blue-500/15 text-blue-200'
                  : 'border-slate-800/70 bg-slate-950/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700/60 hover:text-slate-100'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span>{app.name}</span>
            </button>
          );
        })}
      </div>
      {/* Accès rapide vers les modules maître-ouvrage (redistribution) */}
      <div className="flex items-center gap-1 min-w-0">
        <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0" aria-hidden />
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Accès modules
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {MODULE_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-slate-800/70 bg-slate-950/40 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all duration-200',
              'hover:bg-slate-800/50 hover:border-slate-700/60 hover:text-slate-100'
            )}
            aria-label={`Ouvrir ${label}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
