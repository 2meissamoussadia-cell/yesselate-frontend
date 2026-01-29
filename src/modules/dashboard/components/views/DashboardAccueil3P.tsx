/**
 * Vue d'accueil type 3P — Solutions métier
 * Grille de modules (Demandes, Budget, Validations, Projets, Alertes, Risques, Décisions)
 * Affichée par défaut quand on ouvre le dashboard (overview/summary/dashboard)
 */

'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  FileText,
  Wallet,
  FileCheck,
  FolderKanban,
  AlertCircle,
  AlertTriangle,
  Scale,
  ChevronRight,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  main: string;
  sub: string;
  leaf: string | null;
  color: string;
}

const SOLUTIONS_METIER: ModuleCard[] = [
  {
    id: 'demandes',
    title: 'Demandes',
    description: 'Suivi des demandes, validation et flux internes.',
    icon: FileText,
    main: 'overview',
    sub: 'kpis',
    leaf: 'demandes',
    color: 'blue',
  },
  {
    id: 'budget',
    title: 'Budget',
    description: 'Indicateurs budgétaires et financiers.',
    icon: Wallet,
    main: 'overview',
    sub: 'kpis',
    leaf: 'budget',
    color: 'emerald',
  },
  {
    id: 'validations',
    title: 'Validations',
    description: 'Circuit de validation BC, factures, avenants.',
    icon: FileCheck,
    main: 'performance',
    sub: 'validation',
    leaf: 'en-attente',
    color: 'violet',
  },
  {
    id: 'projets',
    title: 'Projets',
    description: 'KPIs projets et maîtrise d\'ouvrage.',
    icon: FolderKanban,
    main: 'overview',
    sub: 'kpis',
    leaf: 'projets',
    color: 'amber',
  },
  {
    id: 'alertes',
    title: 'Alertes',
    description: 'Alertes actives et urgentes.',
    icon: AlertCircle,
    main: 'overview',
    sub: 'alerts',
    leaf: 'actives',
    color: 'rose',
  },
  {
    id: 'risques',
    title: 'Risques',
    description: 'Risques critiques et analyse.',
    icon: AlertTriangle,
    main: 'risks',
    sub: 'critical',
    leaf: 'risques',
    color: 'amber',
  },
  {
    id: 'decisions',
    title: 'Décisions',
    description: 'Décisions en attente et exécutées.',
    icon: Scale,
    main: 'decisions',
    sub: 'pending',
    leaf: 'urgentes',
    color: 'cyan',
  },
];

const CARD_COLORS: Record<string, string> = {
  blue: 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20',
  violet: 'border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20',
  amber: 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20',
  rose: 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20',
};

export function DashboardAccueil3P() {
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const goTo = useCallback(
    (main: string, sub: string, leaf: string | null) => {
      navigate(main as any, sub, leaf);
    },
    [navigate]
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
          Solutions métier
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">
          Choisissez un module pour accéder aux indicateurs et à la logique métier (type 3P / Odoo).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {SOLUTIONS_METIER.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => goTo(card.main, card.sub, card.leaf)}
              className={cn(
                'rounded-2xl border p-6 text-left transition-all duration-200',
                'hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                CARD_COLORS[card.color] ?? 'border-slate-700/50 bg-slate-900/30'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800/60">
                  <Icon className="h-6 w-6 text-slate-200" />
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 shrink-0 mt-1" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-100">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {card.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 text-center">
        <p className="text-xs text-slate-500">
          Logique métier : App → Modèle → Workflow (états et transitions). Chaque module utilise le domaine (demandes, gouvernance) pour les règles et indicateurs.
        </p>
      </div>
    </div>
  );
}
