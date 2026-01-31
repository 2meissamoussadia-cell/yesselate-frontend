// src/modules/dashboard/components/modals/AlertListModal.tsx
// Phase 4: Modal pour afficher la liste d'alertes filtrées par gravité

'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, Info, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zIndexClass } from '../../utils/zIndex';
import { useAlerts, type AlertEvent } from '../../hooks/useAlerts';
import { AlertDetailModal } from '../AlertDetailModal';

interface AlertListModalProps {
  isOpen: boolean;
  onClose: () => void;
  severity: 'critical' | 'warning' | 'info';
}

/**
 * Modal pour afficher la liste d'alertes filtrées par gravité
 * Phase 4: Modals et Navigation
 */
export function AlertListModal({ isOpen, onClose, severity }: AlertListModalProps) {
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(null);
  const { data, isLoading } = useAlerts();

  if (!isOpen) return null;

  const alerts = data?.events?.filter((alert) => alert.severity === severity) || [];

  const severityConfig = {
    critical: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      label: 'Critiques',
      icon: AlertTriangle,
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      label: 'Avertissements',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      label: 'Informations',
      icon: Info,
    },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity',
          zIndexClass.modalOverlay,
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
          'md:w-[90vw] md:max-w-4xl md:h-[85vh]',
          'bg-slate-900 border border-slate-700 rounded-xl shadow-2xl',
          'flex flex-col',
          zIndexClass.modal,
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between p-6 border-b border-slate-700', config.bg)}>
          <div className="flex items-center gap-3">
            <Icon className={cn('w-6 h-6', config.text)} />
            <h2 className={cn('text-xl font-semibold', config.text)}>
              Alertes {config.label}
            </h2>
            <span className={cn('px-2 py-1 rounded text-sm font-medium', config.bg, config.text)}>
              {alerts.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Icon className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg">Aucune alerte {config.label.toLowerCase()}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all',
                    'hover:bg-slate-800/50 hover:border-slate-600',
                    config.border,
                    config.bg
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white truncate">{alert.ruleName}</h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            alert.status === 'open'
                              ? 'bg-red-500/20 text-red-400'
                              : alert.status === 'ack'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          )}
                        >
                          {alert.status === 'open' ? 'Ouverte' : alert.status === 'ack' ? 'Acquittée' : 'Fermée'}
                        </span>
                      </div>
                      {alert.labels && Object.keys(alert.labels).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {Object.entries(alert.labels).slice(0, 3).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(alert.firstSeen).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {alert.count > 1 && (
                          <span className="text-slate-400">×{alert.count}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={cn('p-2 rounded-lg', config.bg)}>
                        <Icon className={cn('w-5 h-5', config.text)} />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </>
  );
}
