/**
 * ContentRouter pour Decisions
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Gavel, Clock, Zap, Target, Settings, CheckCircle, History, BarChart3, Tag, Loader2 } from 'lucide-react';
import { DecisionsWorkspaceContent } from '../DecisionsWorkspaceContent';
import { useDecisionsWorkspaceStore } from '@/lib/stores/decisionsWorkspaceStore';

interface ContentRouterProps {
  category: string;
  subCategory: string;
}

export const DecisionsContentRouter = React.memo(function DecisionsContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  const { openTab } = useDecisionsWorkspaceStore();

  // Vue d'ensemble
  if (category === 'overview') {
    return <OverviewView />;
  }

  // Mapper les catégories aux queues existantes
  useEffect(() => {
    if (category && category !== 'overview' && category !== 'analytics') {
      let queue = 'all';
      let title = 'Toutes les décisions';
      let icon = '⚖️';

      switch (category) {
        case 'pending':
          queue = subCategory === 'all' ? 'pending' : subCategory === 'blocked' ? 'critical' : 'pending';
          title = subCategory === 'blocked' ? 'Bloquées' : subCategory === 'old' ? 'Anciennes' : subCategory === 'recent' ? 'Récentes' : 'En attente';
          icon = subCategory === 'blocked' ? '🔒' : '⏳';
          break;
        case 'critical':
          queue = 'critical';
          title = subCategory === 'immediate' ? 'Immédiates' : subCategory === 'urgent' ? 'Urgentes' : 'Critiques';
          icon = '⚡';
          break;
        case 'strategique':
          queue = 'strategique';
          title = 'Stratégiques';
          icon = '🎯';
          break;
        case 'operationnel':
          queue = 'operationnel';
          title = 'Opérationnelles';
          icon = '⚙️';
          break;
        case 'approved':
          queue = 'approved';
          title = 'Approuvées';
          icon = '✅';
          break;
        case 'history':
          queue = 'all';
          title = 'Historique';
          icon = '📜';
          break;
        case 'types':
          queue = subCategory || 'all';
          title = subCategory === 'strategique' ? 'Stratégiques' : 
                  subCategory === 'operationnel' ? 'Opérationnelles' :
                  subCategory === 'financier' ? 'Financières' :
                  subCategory === 'rh' ? 'RH' :
                  subCategory === 'technique' ? 'Techniques' : 'Par type';
          icon = '🏷️';
          break;
      }

      const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`;
      openTab({
        type: 'inbox',
        id: tabId,
        title,
        icon,
        data: { queue },
      });
    }
  }, [category, subCategory, openTab]);

  // Pour les catégories qui utilisent DecisionsWorkspaceContent
  if (['pending', 'critical', 'strategique', 'operationnel', 'approved', 'history', 'types'].includes(category)) {
    return (
      <div className="p-6">
        <DecisionsWorkspaceContent />
      </div>
    );
  }

  // Analytics
  if (category === 'analytics') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Analytics</h3>
          <p className="text-slate-400">Contenu en cours de développement</p>
        </div>
      </div>
    );
  }

  // Placeholder par défaut
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Gavel className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory}
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// Vue d'ensemble
function OverviewView() {
  const { openTab } = useDecisionsWorkspaceStore();

  const handleOpenQueue = (queue: string, title: string, icon: string) => {
    const tabId = queue === 'all' ? 'inbox:all' : `inbox:${queue}`;
    openTab({
      type: 'inbox',
      id: tabId,
      title,
      icon,
      data: { queue },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Cards de navigation rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          icon={Clock}
          title="En attente"
          value="23"
          change="+3"
          trend="up"
          color="amber"
          onClick={() => handleOpenQueue('pending', 'En attente', '⏳')}
        />
        <OverviewCard
          icon={Zap}
          title="Critiques"
          value="7"
          change="-1"
          trend="down"
          color="red"
          onClick={() => handleOpenQueue('critical', 'Critiques', '⚡')}
        />
        <OverviewCard
          icon={CheckCircle}
          title="Approuvées"
          value="45"
          change="+5"
          trend="up"
          color="emerald"
          onClick={() => handleOpenQueue('approved', 'Approuvées', '✅')}
        />
        <OverviewCard
          icon={Target}
          title="Stratégiques"
          value="12"
          change="+2"
          trend="up"
          color="blue"
          onClick={() => handleOpenQueue('strategique', 'Stratégiques', '🎯')}
        />
      </div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Décisions récentes */}
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Décisions récentes</h3>
          <div className="space-y-3">
            {[
              { id: 1, ref: 'DEC-2025-001', title: 'Validation budget Q1', status: 'pending', time: 'Il y a 1h' },
              { id: 2, ref: 'DEC-2025-002', title: 'Approbation nouveau projet', status: 'approved', time: 'Il y a 2h' },
              { id: 3, ref: 'DEC-2025-003', title: 'Décision stratégique importante', status: 'pending', time: 'Il y a 3h' },
            ].map((decision) => (
              <div
                key={decision.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors cursor-pointer"
                onClick={() => handleOpenQueue('all', 'Toutes', '⚖️')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    decision.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{decision.ref}</p>
                    <p className="text-xs text-slate-400">{decision.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded',
                    decision.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {decision.status === 'pending' ? 'En attente' : 'Approuvée'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{decision.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Statistiques</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-sm text-slate-400">Taux d'approbation</span>
              <span className="text-lg font-bold text-emerald-400">87%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-sm text-slate-400">Temps moyen de traitement</span>
              <span className="text-lg font-bold text-slate-300">2.5 jours</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-sm text-slate-400">Décisions ce mois</span>
              <span className="text-lg font-bold text-slate-300">156</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-sm text-slate-400">Décisions critiques</span>
              <span className="text-lg font-bold text-red-400">7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer"
          onClick={() => handleOpenQueue('critical', 'Critiques', '⚡')}
        >
          <Zap className="w-8 h-8 text-rose-400 mb-3" />
          <h3 className="font-semibold text-slate-200 mb-2">Décisions Critiques</h3>
          <p className="text-sm text-slate-400">Décisions urgentes en attente de validation</p>
        </div>
        <div
          className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer"
          onClick={() => handleOpenQueue('strategique', 'Stratégiques', '🎯')}
        >
          <Target className="w-8 h-8 text-indigo-400 mb-3" />
          <h3 className="font-semibold text-slate-200 mb-2">Stratégiques</h3>
          <p className="text-sm text-slate-400">Décisions à impact stratégique long terme</p>
        </div>
        <div
          className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all cursor-pointer"
          onClick={() => handleOpenQueue('pending', 'En attente', '⏳')}
        >
          <Clock className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-semibold text-slate-200 mb-2">En Attente</h3>
          <p className="text-sm text-slate-400">Décisions en cours de validation</p>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  title,
  value,
  change,
  trend,
  color,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: 'amber' | 'red' | 'emerald' | 'blue';
  onClick?: () => void;
}) {
  const colorClasses = {
    amber: 'text-amber-400',
    red: 'text-red-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
  };

  return (
    <div
      className={cn(
        'rounded-xl bg-slate-800/30 border border-slate-700/50 p-4 transition-all',
        onClick && 'hover:bg-slate-800/50 cursor-pointer hover:scale-[1.02]'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn('w-5 h-5', colorClasses[color])} />
        <span className={cn(
          'text-xs font-medium',
          trend === 'up' ? 'text-emerald-400' : 'text-red-400'
        )}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-200 mb-1">{value}</p>
      <p className="text-sm text-slate-400">{title}</p>
    </div>
  );
}
