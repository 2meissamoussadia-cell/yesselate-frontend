/**
 * Panneau latéral de détail pour Conférences
 * Vue rapide avec possibilité d'ouvrir en modal complète
 * Pattern overlay comme dans Analytics/Governance
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Video, Calendar, Users, FileText, CheckCircle2 } from 'lucide-react';
import { useConferencesCommandCenterStore } from '@/lib/stores/conferencesCommandCenterStore';
import { conferencesDecisionnelles } from '@/lib/data';
import type { ConferenceDecisionnelle } from '@/lib/types/bmo.types';

export function ConferencesDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useConferencesCommandCenterStore();

  if (!detailPanel.isOpen || !detailPanel.entityId) return null;

  const conference = conferencesDecisionnelles.find(
    (c) => c.id === detailPanel.entityId
  ) as ConferenceDecisionnelle | undefined;

  if (!conference) {
    closeDetailPanel();
    return null;
  }

  const handleOpenFullModal = () => {
    openModal('detail', { conferenceId: conference.id });
    closeDetailPanel();
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      crise: '🚨',
      arbitrage: '⚖️',
      revue_projet: '📊',
      comite_direction: '👔',
      resolution_blocage: '🔓',
    };
    return icons[type] || '📹';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'info' | 'warning' | 'urgent'> = {
      normale: 'default',
      haute: 'info',
      urgente: 'warning',
      critique: 'urgent',
    };
    return variants[priority] || 'default';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
      planifiee: 'warning',
      en_cours: 'info',
      terminee: 'success',
      annulee: 'default',
    };
    return variants[status] || 'default';
  };

  const formatDateFR = (d: Date) => d.toLocaleDateString('fr-FR');
  const formatTimeFR = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const scheduled = conference.scheduledAt ? new Date(conference.scheduledAt) : null;

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
            <Video className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-200">Détail Conférence</h3>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getTypeIcon(conference.type)}</span>
              <span className="font-mono text-xs text-purple-400">{conference.id}</span>
              <Badge variant={getStatusBadge(conference.status)}>{conference.status}</Badge>
              <Badge variant={getPriorityBadge(conference.priority)}>{conference.priority}</Badge>
            </div>
            <h3 className="font-bold text-slate-200 mb-2">{conference.title}</h3>
            {scheduled && (
              <p className="text-sm text-slate-400">
                {formatDateFR(scheduled)} à {formatTimeFR(scheduled)} • {conference.duration}min
              </p>
            )}
          </div>

          {/* Linked Context */}
          <div className="p-3 rounded bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-blue-400 mb-1">🔗 Contexte lié</p>
            <p className="text-sm font-medium text-slate-200">{conference.linkedContext.label}</p>
            <p className="text-xs text-slate-400 mt-1">{conference.linkedContext.type}</p>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Participants</span>
              <Badge variant="default" className="text-xs">
                {conference.participants.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {conference.participants.slice(0, 5).map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-slate-800/30"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.bureau} • {p.role}</p>
                  </div>
                  <Badge
                    variant={
                      p.presence === 'confirme' ? 'success' : p.presence === 'decline' ? 'urgent' : 'default'
                    }
                    className="text-xs"
                  >
                    {p.presence}
                  </Badge>
                </div>
              ))}
              {conference.participants.length > 5 && (
                <p className="text-xs text-slate-400 text-center">
                  +{conference.participants.length - 5} autre(s)
                </p>
              )}
            </div>
          </div>

          {/* Decisions Extracted */}
          {conference.decisionsExtracted.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-300">Décisions extraites</span>
                <Badge variant="success" className="text-xs">
                  {conference.decisionsExtracted.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {conference.decisionsExtracted.map((id, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <p className="text-xs font-mono text-emerald-400">{id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Preview */}
          {conference.summary && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Compte-rendu</span>
              </div>
              <div className="p-3 rounded bg-slate-800/30">
                <p className="text-xs text-slate-400 mb-2">
                  Généré par: {conference.summary.generatedBy}
                </p>
                {conference.summary.validatedBy && (
                  <p className="text-xs text-emerald-400 mb-2">
                    ✓ Validé par {conference.summary.validatedBy}
                  </p>
                )}
                <div className="space-y-1">
                  {conference.summary.keyPoints.slice(0, 3).map((kp, idx) => (
                    <p key={idx} className="text-xs text-slate-300">• {kp}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-4 border-t border-slate-800/50">
            <div className="space-y-2">
              {conference.status === 'planifiee' && conference.visioLink && (
                <Button
                  variant="success"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(conference.visioLink, '_blank')}
                >
                  🔗 Rejoindre la conférence
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleOpenFullModal}
              >
                Voir les détails complets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

