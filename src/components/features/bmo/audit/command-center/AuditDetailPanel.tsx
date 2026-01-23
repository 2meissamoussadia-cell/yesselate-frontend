/**
 * Panel de détail latéral pour Audit
 * Affiche les détails d'un événement, alerte sécurité, vérification conformité ou trace sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  Shield,
  Lock,
  CheckCircle2,
  ScanSearch,
  Clock,
  User,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { useAuditCommandCenterStore } from '@/lib/stores/auditCommandCenterStore';

export function AuditDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useAuditCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;

  const handleOpenFullModal = () => {
    if (type === 'event') {
      openModal('event-detail', { eventId: detailPanel.entityId });
    } else if (type === 'security') {
      openModal('security-alert', { alertId: detailPanel.entityId });
    } else if (type === 'compliance') {
      openModal('compliance-check', { checkId: detailPanel.entityId });
    } else if (type === 'trace') {
      openModal('trace-detail', { traceId: detailPanel.entityId });
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
            {type === 'event' && <Activity className="h-4 w-4 text-cyan-400" />}
            {type === 'security' && <Lock className="h-4 w-4 text-red-400" />}
            {type === 'compliance' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            {type === 'trace' && <ScanSearch className="h-4 w-4 text-blue-400" />}
            <h3 className="text-sm font-medium text-slate-200">
              {type === 'event' && 'Détail Événement'}
              {type === 'security' && 'Détail Sécurité'}
              {type === 'compliance' && 'Détail Conformité'}
              {type === 'trace' && 'Détail Traçabilité'}
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
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {type === 'event' && <EventDetailContent data={data} />}
          {type === 'security' && <SecurityDetailContent data={data} />}
          {type === 'compliance' && <ComplianceDetailContent data={data} />}
          {type === 'trace' && <TraceDetailContent data={data} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
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
// Event Detail Content
// ================================
function EventDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-200">{String(data.name || 'Événement')}</h4>
          {Boolean(data.status) ? (
            <Badge
              variant="gray"
              className={cn(
                'text-xs',
                data.status === 'critical' && 'bg-red-500/20 text-red-400 border-red-500/30',
                data.status === 'warning' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                data.status === 'success' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              )}
            >
              {String(data.status)}
            </Badge>
          ) : null}
        </div>
        {Boolean(data.value) ? (
          <p className="text-2xl font-bold text-slate-100">{String(data.value)}</p>
        ) : null}
      </div>

      {Boolean(data.trend) ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Tendance:</span>
          <span
            className={cn(
              'font-medium',
              data.trend === 'up' && 'text-emerald-400',
              data.trend === 'down' && 'text-red-400',
              data.trend === 'stable' && 'text-slate-400'
            )}
          >
            {String(data.trendValue || data.trend || '')}
          </span>
         </div>
       ) : null}

      <div className="pt-4 border-t border-slate-800/50 space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="text-slate-400">Dernière mise à jour: il y a quelques minutes</span>
        </div>
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-slate-500" />
          <span className="text-slate-400">Utilisateur: Système</span>
        </div>
      </div>
    </div>
  );
}

// ================================
// Security Detail Content
// ================================
function SecurityDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-200">Alerte Sécurité</h4>
          <Badge variant="gray" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
            Critique
          </Badge>
        </div>
        <p className="text-slate-400 text-sm">{String(data.name || 'Détails de l\'alerte sécurité')}</p>
      </div>

      <div className="pt-4 border-t border-slate-800/50 space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-slate-400">Type: Tentative d'accès non autorisé</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="text-slate-400">Détecté: il y a 15 minutes</span>
        </div>
      </div>
    </div>
  );
}

// ================================
// Compliance Detail Content
// ================================
function ComplianceDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-200">Vérification Conformité</h4>
          <Badge variant="gray" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
            Conforme
          </Badge>
        </div>
        {Boolean(data.value) ? (
          <p className="text-2xl font-bold text-emerald-400">{String(data.value)}</p>
        ) : null}
      </div>

      <div className="pt-4 border-t border-slate-800/50 space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-400">Statut: Conforme aux normes</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="text-slate-400">Dernière vérification: aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}

// ================================
// Trace Detail Content
// ================================
function TraceDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-200">Traçabilité</h4>
          <Badge variant="gray" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
            OK
          </Badge>
        </div>
        {Boolean(data.value) ? (
          <p className="text-2xl font-bold text-blue-400">{String(data.value)}</p>
        ) : null}
      </div>

      <div className="pt-4 border-t border-slate-800/50 space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <ScanSearch className="h-4 w-4 text-blue-400" />
          <span className="text-slate-400">Traçabilité complète disponible</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="text-slate-400">Dernière trace: il y a 5 minutes</span>
        </div>
      </div>
    </div>
  );
}

