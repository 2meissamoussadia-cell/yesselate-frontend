/**
 * Panel de détail latéral
 * Affiche les détails d'un élément sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  Edit,
  Trash2,
  Clock,
  User,
  FolderKanban,
  AlertTriangle,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  History,
  MessageSquare,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

export function DetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useGovernanceCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;

  const handleOpenFullModal = () => {
    openModal(`${type}-detail` as any, data);
    closeDetailPanel();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        onClick={closeDetailPanel}
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 bottom-0 z-40 w-96 bg-slate-900 border-l border-slate-700/50',
          'flex flex-col overflow-hidden',
          'transition-transform duration-200',
          detailPanel.isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 bg-slate-900/95">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="default" className="text-xs bg-slate-800 text-slate-400 border-slate-700">
              {data.reference || 'Détails'}
            </Badge>
            <span className="text-xs text-slate-400 truncate">{type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFullModal}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
              title="Ouvrir en modal"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDetailPanel}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-base font-medium text-slate-200 leading-tight">
              {data.designation || data.title || data.name || 'Sans titre'}
            </h3>
            {data.subtitle && (
              <p className="text-sm text-slate-400 mt-1">{data.subtitle}</p>
            )}
          </div>

          {/* Status */}
          {data.status && (
            <div className="flex items-center gap-2">
              <StatusBadge status={data.status} />
              {data.priority && <PriorityBadge priority={data.priority} />}
            </div>
          )}

          {/* Info Grid */}
          <div className="space-y-3">
            {data.project && (
              <InfoRow icon={FolderKanban} label="Projet" value={data.project} />
            )}
            {data.responsable && (
              <InfoRow icon={User} label="Responsable" value={data.responsable} />
            )}
            {data.dateEcheance && (
              <InfoRow icon={Clock} label="Échéance" value={data.dateEcheance} />
            )}
          </div>

          {/* Progress */}
          {data.progress !== undefined && (
            <div className="p-3 rounded-lg bg-slate-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Avancement</span>
                <span className="text-sm font-medium text-slate-300">{data.progress}%</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    data.progress >= 80 ? 'bg-emerald-500' :
                    data.progress >= 50 ? 'bg-blue-500' :
                    data.progress >= 25 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Alerts */}
          {data.alerts && data.alerts > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-slate-300">
                  {data.alerts} alerte{data.alerts > 1 ? 's' : ''} active{data.alerts > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {data.description && (
            <div>
              <p className="text-xs text-slate-400 uppercase mb-1">Description</p>
              <p className="text-sm text-slate-400 leading-relaxed">{data.description}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 space-y-2">
            <p className="text-xs text-slate-400 uppercase">Actions rapides</p>
            <div className="grid grid-cols-2 gap-2">
              <QuickActionButton icon={History} label="Historique" />
              <QuickActionButton icon={MessageSquare} label="Commenter" />
              <QuickActionButton icon={Edit} label="Modifier" />
              <QuickActionButton icon={ArrowUpRight} label="Escalader" warning />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/50 bg-slate-900/95">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
            onClick={handleOpenFullModal}
          >
            Voir tous les détails
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </aside>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-300 truncate">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'on-track': { label: 'En bonne voie', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'at-risk': { label: 'À risque', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'late': { label: 'En retard', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
    'blocked': { label: 'Bloqué', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
    'completed': { label: 'Terminé', className: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  };

  const cfg = config[status] || { label: status, className: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };

  return (
    <Badge variant="default" className={cn('text-xs', cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; color: string }> = {
    'critical': { label: 'Critique', color: 'bg-red-500' },
    'high': { label: 'Haute', color: 'bg-orange-500' },
    'medium': { label: 'Moyenne', color: 'bg-amber-500' },
    'low': { label: 'Basse', color: 'bg-slate-500' },
  };

  const cfg = config[priority] || { label: priority, color: 'bg-slate-500' };

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-2 h-2 rounded-full', cfg.color)} />
      <span className="text-xs text-slate-400">{cfg.label}</span>
    </div>
  );
}

function QuickActionButton({
  icon: Icon,
  label,
  warning = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  warning?: boolean;
}) {
  return (
    <Button
      variant="default"
      size="sm"
      className={cn(
        'justify-start border-slate-700/50',
        warning
          ? 'text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30'
          : 'text-slate-400 hover:text-slate-300'
      )}
    >
      <Icon className="h-3.5 w-3.5 mr-1.5" />
      {label}
    </Button>
  );
}

