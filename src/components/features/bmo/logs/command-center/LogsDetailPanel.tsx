/**
 * Panel de détail latéral pour Logs
 * Affiche les détails d'un log sans quitter la vue principale
 * Pattern: Vue rapide → Bouton "Voir plus" → Modal complète
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  Terminal,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Server,
  Globe,
  Shield,
  Clock,
  User,
  Hash,
  FileText,
} from 'lucide-react';
import { useLogsCommandCenterStore } from '@/lib/stores/logsCommandCenterStore';
import { logsApiService } from '@/lib/services/logsApiService';

export function LogsDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useLogsCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const entityId = detailPanel.entityId;

  const handleOpenFullModal = () => {
    openModal('log-detail', { logId: entityId });
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
            <Terminal className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-200">Détail Log</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFullModal}
              className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Voir plus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDetailPanel}
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <LogDetailContent data={data} />
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
// Log Detail Content
// ================================
function LogDetailContent({ data }: { data: Record<string, unknown> }) {
  const level = (data.level as string) || 'info';
  const source = (data.source as string) || 'system';
  const levelColors = {
    error: 'text-red-400 bg-red-500/20 border-red-500/30',
    warn: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    info: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    debug: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
  };

  const sourceIcons = {
    system: Server,
    api: Globe,
    database: FileText,
    auth: Shield,
    business: Terminal,
  };

  const SourceIcon = sourceIcons[source as keyof typeof sourceIcons] || Terminal;

  const hasValue = data.value !== undefined && data.value !== null;

  return (
    <div className="space-y-4">
      {/* Title / Message */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-2">
          {data.message as string || 'Message du log'}
        </h4>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="default"
            className={cn('text-xs font-medium border', levelColors[level as keyof typeof levelColors] || levelColors.info)}
          >
            {logsApiService.getLevelLabel(level)}
          </Badge>
          <Badge
            variant="default"
            className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50"
          >
            <SourceIcon className="h-3 w-3 mr-1" />
            {logsApiService.getSourceLabel(source)}
          </Badge>
        </div>
      </div>

      {hasValue ? (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{String(data.value)}</span>
            {data.label ? (
              <span className="text-sm text-slate-500">{String(data.label)}</span>
            ) : null}
          </div>
          {data.trendValue ? (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400">
                {String(data.trendValue)}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Module */}
      {data.module && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Module
            </span>
            <span className="text-slate-300 font-medium">{data.module as string}</span>
          </div>
        </div>
      )}

      {/* Timestamp */}
      {data.timestamp && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Timestamp
            </span>
            <span className="text-slate-300">{new Date(data.timestamp as string).toLocaleString('fr-FR')}</span>
          </div>
        </div>
      )}

      {/* ID */}
      {data.id && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-2">
              <Hash className="h-3 w-3" />
              ID
            </span>
            <span className="text-slate-300 font-mono text-xs">{data.id as string}</span>
          </div>
        </div>
      )}

      {/* Details */}
      {data.details && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <p className="text-sm text-slate-400 mb-2">Détails</p>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">
            {data.details as string}
          </p>
        </div>
      )}

      {/* Metadata */}
      {data.metadata && typeof data.metadata === 'object' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase">Métadonnées</p>
          <div className="space-y-1.5 text-sm">
            {Object.entries(data.metadata as Record<string, unknown>).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-slate-500">{key}</span>
                <span className="text-slate-300 font-mono text-xs">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

