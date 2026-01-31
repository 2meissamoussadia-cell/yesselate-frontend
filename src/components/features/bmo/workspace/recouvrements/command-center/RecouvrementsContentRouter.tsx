/**
 * ContentRouter pour Recouvrements
 * Route le contenu en fonction de la catégorie et sous-catégorie active
 * Architecture identique à Analytics/Gouvernance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  CalendarClock,
  XCircle,
  Bell,
  Scale,
  BarChart3,
  Loader2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from 'lucide-react';
import { useRecouvrementsWorkspaceStore } from '@/lib/stores/recouvrementsWorkspaceStore';
import { recouvrementsApiService, type RecouvrementsStats, type Creance } from '@/lib/services/recouvrementsApiService';
import { RecouvrementsInboxView } from '../views/RecouvrementsInboxView';
import { RecouvrementsDetailView } from '../views/RecouvrementsDetailView';

interface RecouvrementsContentRouterProps {
  category: string;
  subCategory: string;
  stats?: RecouvrementsStats | null;
}

export function RecouvrementsContentRouter({
  category,
  subCategory,
  stats,
}: RecouvrementsContentRouterProps) {
  const { openTab } = useRecouvrementsWorkspaceStore();

  // Overview Dashboard
  if (category === 'overview') {
    return <OverviewDashboard stats={stats} onOpenQueue={(queue, title, icon) => {
      const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`;
      openTab({ type: 'inbox', id: tabId, title, icon, data: { queue } });
    }} />;
  }

  // Pending view
  if (category === 'pending') {
    return <PendingView subCategory={subCategory} />;
  }

  // In Progress view
  if (category === 'in_progress') {
    return <InProgressView subCategory={subCategory} />;
  }

  // Paid view
  if (category === 'paid') {
    return <PaidView subCategory={subCategory} />;
  }

  // Litige view
  if (category === 'litige') {
    return <LitigeView subCategory={subCategory} />;
  }

  // Overdue view
  if (category === 'overdue') {
    return <OverdueView subCategory={subCategory} />;
  }

  // Irrecoverable view
  if (category === 'irrecoverable') {
    return <IrrecoverableView subCategory={subCategory} />;
  }

  // Relances view
  if (category === 'relances') {
    return <RelancesView subCategory={subCategory} />;
  }

  // Contentieux view
  if (category === 'contentieux') {
    return <ContentieuxView subCategory={subCategory} />;
  }

  // Statistiques view
  if (category === 'statistiques') {
    return <StatistiquesView subCategory={subCategory} stats={stats} />;
  }

  // Default placeholder
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} {subCategory && `- ${subCategory}`}
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
}

// ================================
// Overview Dashboard
// ================================
function OverviewDashboard({ 
  stats,
  onOpenQueue,
}: { 
  stats?: RecouvrementsStats | null;
  onOpenQueue: (queue: string, title: string, icon: string) => void;
}) {
  const formatMontant = (montant: number) => recouvrementsApiService.formatMontant(montant);

  const metrics = [
    {
      id: 'total',
      label: 'Total créances',
      value: stats ? formatMontant(stats.montantTotal) : '0',
      change: '+5.2%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'blue',
    },
    {
      id: 'pending',
      label: 'En attente',
      value: stats?.pending.toString() || '0',
      change: stats && stats.pending > 0 ? `+${stats.pending}` : '0',
      trend: stats && stats.pending > 10 ? 'up' as const : 'down' as const,
      icon: Clock,
      color: 'amber',
    },
    {
      id: 'paid',
      label: 'Payées',
      value: stats?.paid.toString() || '0',
      change: '+12',
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'emerald',
    },
    {
      id: 'overdue',
      label: 'En retard',
      value: stats ? formatMontant(stats.montantEnRetard) : '0',
      change: stats && stats.montantEnRetard > 0 ? 'Critique' : 'OK',
      trend: stats && stats.montantEnRetard > 0 ? 'up' as const : 'down' as const,
      icon: CalendarClock,
      color: 'red',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <button
              key={metric.id}
              onClick={() => {
                if (metric.id === 'total') onOpenQueue('all', 'Toutes', '💰');
                else if (metric.id === 'pending') onOpenQueue('pending', 'En attente', '⏳');
                else if (metric.id === 'paid') onOpenQueue('paid', 'Payées', '✅');
                else if (metric.id === 'overdue') onOpenQueue('overdue', 'En retard', '⏰');
              }}
              className={cn(
                'p-4 rounded-xl border transition-all hover:scale-[1.02] text-left',
                `bg-${metric.color}-500/10 border-${metric.color}-500/30 hover:border-${metric.color}-500/50`
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn('w-5 h-5', `text-${metric.color}-400`)} />
                <TrendIcon className={cn(
                  'w-4 h-4',
                  metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                )} />
              </div>
              <div className="text-2xl font-bold text-slate-200 mb-1">{metric.value}</div>
              <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
              <div className={cn(
                'text-xs font-medium',
                metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              )}>
                {metric.change}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          icon={Clock}
          title="En attente"
          count={stats?.pending || 0}
          color="amber"
          onClick={() => onOpenQueue('pending', 'En attente', '⏳')}
        />
        <QuickActionCard
          icon={AlertTriangle}
          title="En litige"
          count={stats?.litige || 0}
          color="red"
          onClick={() => onOpenQueue('litige', 'En litige', '⚠️')}
        />
        <QuickActionCard
          icon={CalendarClock}
          title="En retard"
          count={stats ? Math.ceil(stats.montantEnRetard / 1000000) : 0}
          suffix="M FCFA"
          color="rose"
          onClick={() => onOpenQueue('overdue', 'En retard', '⏰')}
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Vue d'ensemble</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Taux recouvrement" value={`${stats?.tauxRecouvrement || 0}%`} />
          <StatCard label="Total créances" value={stats?.total.toString() || '0'} />
          <StatCard label="En cours" value={stats?.in_progress.toString() || '0'} />
          <StatCard label="Irrécouvrables" value={stats?.irrecoverable.toString() || '0'} />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  count,
  suffix = '',
  color,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  suffix?: string;
  color: string;
  onClick: () => void;
}) {
  const colorClasses = {
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      borderHover: 'hover:border-amber-500/50',
      text: 'text-amber-400',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      borderHover: 'hover:border-red-500/50',
      text: 'text-red-400',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      borderHover: 'hover:border-rose-500/50',
      text: 'text-rose-400',
    },
  };
  
  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.amber;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border transition-all hover:scale-[1.02] text-left',
        colors.bg,
        colors.border,
        colors.borderHover
      )}
    >
      <Icon className={cn('w-5 h-5 mb-2', colors.text)} />
      <div className="text-lg font-bold text-slate-200">
        {count} {suffix}
      </div>
      <div className="text-sm text-slate-400">{title}</div>
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-200">{value}</div>
    </div>
  );
}

// ================================
// Pending View
// ================================
function PendingView({ subCategory }: { subCategory: string }) {
  const { openTab } = useRecouvrementsWorkspaceStore();
  
  // Utiliser la vue inbox existante avec le filtre pending
  return (
    <div className="h-full">
      <RecouvrementsInboxView 
        tabId="inbox:pending" 
        data={{ queue: 'pending' }} 
      />
    </div>
  );
}

// ================================
// In Progress View
// ================================
function InProgressView({ subCategory }: { subCategory: string }) {
  return (
    <div className="h-full">
      <RecouvrementsInboxView 
        tabId="inbox:in_progress" 
        data={{ queue: 'in_progress' }} 
      />
    </div>
  );
}

// ================================
// Paid View
// ================================
function PaidView({ subCategory }: { subCategory: string }) {
  return (
    <div className="h-full">
      <RecouvrementsInboxView 
        tabId="inbox:paid" 
        data={{ queue: 'paid' }} 
      />
    </div>
  );
}

// ================================
// Litige View
// ================================
function LitigeView({ subCategory }: { subCategory: string }) {
  return (
    <div className="h-full">
      <RecouvrementsInboxView 
        tabId="inbox:litige" 
        data={{ queue: 'litige' }} 
      />
    </div>
  );
}

// ================================
// Overdue View
// ================================
function OverdueView({ subCategory }: { subCategory: string }) {
  return (
    <div className="h-full">
      <RecouvrementsInboxView 
        tabId="inbox:overdue" 
        data={{ queue: 'overdue' }} 
      />
    </div>
  );
}

// ================================
// Irrecoverable View
// ================================
function IrrecoverableView({ subCategory }: { subCategory: string }) {
  return (
    <div className="h-full">
      <RecouvrementsInboxView 
        tabId="inbox:irrecoverable" 
        data={{ queue: 'irrecoverable' }} 
      />
    </div>
  );
}

// ================================
// Relances View
// ================================
function RelancesView({ subCategory }: { subCategory: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Suivi des relances
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
}

// ================================
// Contentieux View
// ================================
function ContentieuxView({ subCategory }: { subCategory: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Scale className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Dossiers contentieux
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
}

// ================================
// Statistiques View
// ================================
function StatistiquesView({ 
  subCategory,
  stats,
}: { 
  subCategory: string;
  stats?: RecouvrementsStats | null;
}) {
  const formatMontant = (montant: number) => recouvrementsApiService.formatMontant(montant);

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-3xl font-bold text-amber-400">
            {stats ? formatMontant(stats.montantTotal) : '0'}
          </p>
          <p className="text-sm text-slate-400 mt-2">Total créances</p>
        </div>
        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-3xl font-bold text-emerald-400">
            {stats ? `${stats.tauxRecouvrement}%` : '0%'}
          </p>
          <p className="text-sm text-slate-400 mt-2">Taux recouvrement</p>
        </div>
        <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
          <p className="text-3xl font-bold text-rose-400">
            {stats ? formatMontant(stats.montantEnRetard) : '0'}
          </p>
          <p className="text-sm text-slate-400 mt-2">En retard</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="En attente" value={stats?.pending.toString() || '0'} />
        <StatCard label="En cours" value={stats?.in_progress.toString() || '0'} />
        <StatCard label="Payées" value={stats?.paid.toString() || '0'} />
        <StatCard label="En litige" value={stats?.litige.toString() || '0'} />
      </div>
    </div>
  );
}

