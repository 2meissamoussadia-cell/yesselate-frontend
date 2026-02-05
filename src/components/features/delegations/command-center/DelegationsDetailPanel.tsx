/**
 * Panel de détail latéral pour Délégations
 * Affiche les détails d'une délégation, stat ou alerte sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  Key,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { useDelegationsCommandCenterStore } from '@/lib/stores/delegationsCommandCenterStore';

export function DelegationsDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useDelegationsCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;

  const handleOpenFullModal = () => {
    if (type === 'delegation') {
      openModal('delegation-detail', { delegationId: detailPanel.entityId });
    } else if (type === 'stat') {
      openModal('stats');
    } else if (type === 'alert') {
      // openModal('alert-detail', { alertId: detailPanel.entityId });
    }
    closeDetailPanel();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={closeDetailPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            {type === 'delegation' && <Key className="h-4 w-4 text-purple-500" />}
            {type === 'stat' && <BarChart3 className="h-4 w-4 text-blue-500" />}
            {type === 'alert' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            <h3 className="text-sm font-medium text-slate-200">
              {type === 'delegation' ? 'Détails Délégation' :
               type === 'stat' ? 'Détails Statistique' :
               'Détails Alerte'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeDetailPanel}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {type === 'delegation' && <DelegationDetailContent data={data} />}
          {type === 'stat' && <StatDetailContent data={data} />}
          {type === 'alert' && <AlertDetailContent data={data} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir en modal complète
          </Button>
          <Button
            variant="outline"
            onClick={closeDetailPanel}
            className="w-full border-slate-700 text-slate-400 hover:text-slate-200"
            size="sm"
          >
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Stat Detail Content
// ================================
function StatDetailContent({ data }: { data: Record<string, unknown> }) {
  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Activity;
  
  const statusColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    neutral: 'text-slate-300',
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">{data.name as string}</h4>
        <div className="flex items-baseline gap-2">
          <span className={cn('text-3xl font-bold', statusColors[data.status as keyof typeof statusColors] || 'text-slate-300')}>
            {data.value as string | number}
          </span>
          {data.trendValue != null && (
            <span className={cn('text-sm font-medium', data.trend === 'up' ? 'text-emerald-400' : data.trend === 'down' ? 'text-amber-400' : 'text-slate-400')}>
              {String(data.trendValue)}
            </span>
          )}
        </div>
      </div>

      {data.trend ? (
        <div className="flex items-center gap-2">
          <TrendIcon className={cn(
            'h-4 w-4',
            data.trend === 'up' ? 'text-emerald-400' : data.trend === 'down' ? 'text-amber-400' : 'text-slate-400'
          )} />
          <span className="text-sm text-slate-400">
            {data.trend === 'up' ? 'En hausse' : data.trend === 'down' ? 'En baisse' : 'Stable'}
          </span>
        </div>
      ) : null}

      {data.sparkline ? (
        <div className="mt-4">
          <h5 className="text-xs font-medium text-slate-400 mb-2">Évolution</h5>
          <div className="flex items-end gap-1 h-20">
            {(data.sparkline as number[]).map((val, i) => {
              const maxVal = Math.max(...(data.sparkline as number[]));
              const height = (val / maxVal) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-purple-500/60"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ================================
// Delegation Detail Content
// ================================
function DelegationDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-200 mb-2">Informations</h4>
        <p className="text-sm text-slate-400">
          {data.id as string || 'Aucune information disponible'}
        </p>
      </div>
    </div>
  );
}

// ================================
// Alert Detail Content
// ================================
function AlertDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-200 mb-2">Alerte</h4>
        <p className="text-sm text-slate-400">
          {data.message as string || 'Aucune information disponible'}
        </p>
      </div>
    </div>
  );
}

