/**
 * Panel de détail latéral pour System Logs
 * Vue rapide sans perdre le contexte - comme AnalyticsDetailPanel
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
  AlertTriangle,
  FileText,
  Clock,
  Database,
  User,
  Globe,
  Download,
  FileCheck,
} from 'lucide-react';
import { useSystemLogsCommandCenterStore } from '@/lib/stores/systemLogsCommandCenterStore';

export function SystemLogsDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useSystemLogsCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;

  const handleOpenFullModal = () => {
    if (type === 'log') {
      openModal('log-detail', { logId: detailPanel.entityId });
    } else if (type === 'incident') {
      openModal('incident-detail', { incidentId: detailPanel.entityId });
    } else if (type === 'alert') {
      openModal('alert-detail', { alertId: detailPanel.entityId });
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
            {type === 'log' && <Terminal className="h-4 w-4 text-blue-400" />}
            {type === 'incident' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {type === 'alert' && <AlertTriangle className="h-4 w-4 text-red-400" />}
            <h3 className="text-sm font-medium text-slate-200">
              {type === 'log' && 'Détail Log'}
              {type === 'incident' && 'Détail Incident'}
              {type === 'alert' && 'Détail Alerte'}
            </h3>
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
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {type === 'log' && <LogDetailContent data={data} />}
          {type === 'incident' && <IncidentDetailContent data={data} />}
          {type === 'alert' && <AlertDetailContent data={data} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir en modal complète
          </Button>
        </div>
      </div>
    </>
  );
}

function LogDetailContent({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Message */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-2">Message</h4>
        <p className="text-sm text-slate-200 bg-slate-800/30 p-3 rounded-lg">
          {data.message || '—'}
        </p>
      </div>

      {/* Métadonnées */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-2">Métadonnées</h4>
        <div className="space-y-2 text-sm">
          {data.level && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Niveau</span>
              <Badge variant="outline" className="text-xs">
                {data.level}
              </Badge>
            </div>
          )}
          {data.category && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Catégorie</span>
              <Badge variant="outline" className="text-xs">
                {data.category}
              </Badge>
            </div>
          )}
          {data.severity && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sévérité</span>
              <span className="text-slate-200 font-mono">{data.severity}</span>
            </div>
          )}
          {data.source && (
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3 text-slate-400" />
              <span className="text-slate-400 flex-1">Source</span>
              <span className="text-slate-200 font-mono text-xs">{data.source}</span>
            </div>
          )}
          {data.timestamp && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-slate-400" />
              <span className="text-slate-400 flex-1">Timestamp</span>
              <span className="text-slate-200 font-mono text-xs">{data.timestamp}</span>
            </div>
          )}
          {data.userId && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-slate-400" />
              <span className="text-slate-400 flex-1">Utilisateur</span>
              <span className="text-slate-200 font-mono text-xs">{data.userId}</span>
            </div>
          )}
          {data.ip && (
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-slate-400" />
              <span className="text-slate-400 flex-1">IP</span>
              <span className="text-slate-200 font-mono text-xs">{data.ip}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="pt-4 border-t border-slate-800/50 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => {
            // TODO: Export
          }}
        >
          <Download className="h-3 w-3 mr-2" />
          Exporter evidence pack
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => {
            // TODO: Verify integrity
          }}
        >
          <FileCheck className="h-3 w-3 mr-2" />
          Vérifier intégrité
        </Button>
      </div>
    </div>
  );
}

function IncidentDetailContent({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-2">Titre</h4>
        <p className="text-sm text-slate-200">{data.title || '—'}</p>
      </div>
      {data.status && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-2">Statut</h4>
          <Badge variant="outline">{data.status}</Badge>
        </div>
      )}
    </div>
  );
}

function AlertDetailContent({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-2">Titre</h4>
        <p className="text-sm text-slate-200">{data.title || '—'}</p>
      </div>
      {data.severity && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-2">Sévérité</h4>
          <Badge variant="outline">{data.severity}</Badge>
        </div>
      )}
    </div>
  );
}

