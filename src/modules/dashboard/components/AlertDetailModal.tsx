// src/modules/dashboard/components/AlertDetailModal.tsx
// Phase P15/P17: Moteur d'alertes - Modal de détail d'alerte avec ACK/Close/Snooze

'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Clock, Calendar, BellOff, Database } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { zIndexClass } from '../utils/zIndex';
import { useAckAlert, useCloseAlert, useSnoozeAlert, type AlertEvent } from '../hooks/useAlerts';
import { createLogger } from '../utils/logger';

interface AlertDetailModalProps {
  alert: AlertEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal de détail d'alerte avec actions ACK/Close
 * Phase P15: Moteur d'alertes
 */
const log = createLogger('AlertDetailModal');

export function AlertDetailModal({ alert, isOpen, onClose }: AlertDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [snoozeDuration, setSnoozeDuration] = useState<number>(60); // minutes
  const ackMutation = useAckAlert();
  const closeMutation = useCloseAlert();
  const snoozeMutation = useSnoozeAlert();

  if (!isOpen || !alert) return null;

  const severityConfig = {
    critical: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      label: 'Critique',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      label: 'Avertissement',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      label: 'Information',
    },
  };

  const config = severityConfig[alert.severity];

  const handleAck = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await ackMutation.mutateAsync(alert.id);
      onClose();
    } catch (error) {
      log.error('Failed to acknowledge alert', { action: 'ack' }, error instanceof Error ? error : undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await closeMutation.mutateAsync(alert.id);
      onClose();
    } catch (error) {
      log.error('Failed to close alert', { action: 'close' }, error instanceof Error ? error : undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSnooze = async () => {
    if (isProcessing || !alert) return;
    setIsProcessing(true);
    try {
      await snoozeMutation.mutateAsync({ eventId: alert.id, durationMinutes: snoozeDuration });
      onClose();
    } catch (error) {
      log.error('Failed to snooze alert', { action: 'snooze' }, error instanceof Error ? error : undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn("fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn", zIndexClass('modal'))}>
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
        {/* Header */}
        <div className={cn("flex items-center justify-between p-6 border-b", config.border)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bg)}>
              <AlertTriangle className={cn("h-5 w-5", config.text)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{alert.ruleName}</h2>
              <p className={cn("text-sm mt-1", config.text)}>
                {config.label} • {alert.status === 'open' ? 'Ouverte' : alert.status === 'ack' ? 'Acquittée' : 'Fermée'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-6"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Première détection</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-200">
                  {formatDate(alert.firstSeen)}
                </p>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Dernière détection</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-200">
                  {formatDate(alert.lastSeen)}
                </p>
              </div>
            </div>
          </div>

          {/* Compteur d'occurrences */}
          {alert.count > 1 && (
            <div className={cn("rounded-lg p-4 border", config.bg, config.border)}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn("h-5 w-5", config.text)} />
                <div>
                  <p className="text-sm text-slate-400">Occurrences</p>
                  <p className={cn("text-lg font-semibold", config.text)}>
                    {alert.count} détection{alert.count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payload / Détails */}
          {alert.payload && Object.keys(alert.payload).length > 0 && (
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Détails</h3>
              <div className="space-y-2">
                {Object.entries(alert.payload).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-slate-700/30 last:border-0">
                    <span className="text-sm text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium text-slate-200 text-right">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence (P17) - Données sources de la décision */}
          {(alert as any).evidence && typeof (alert as any).evidence === 'object' && (
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-200">Evidence (données sources)</h3>
              </div>
              <div className="space-y-3">
                {Object.entries((alert as any).evidence).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-slate-700/30 last:border-0">
                    <span className="text-sm text-slate-400 capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-semibold text-slate-200 text-right">
                      {typeof value === 'object' ? (
                        <pre className="text-xs bg-slate-900/50 p-2 rounded border border-slate-700/50 max-w-md overflow-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        String(value)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Labels */}
          {alert.labels && Object.keys(alert.labels).length > 0 && (
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(alert.labels).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 rounded-md bg-slate-700/50 text-xs text-slate-300"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ACK/Close timestamps (P17) */}
          {((alert as any).ackedAt || (alert as any).closedAt) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(alert as any).ackedAt && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Acquittée le</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-sm font-semibold text-slate-200">
                      {formatDate((alert as any).ackedAt)}
                    </p>
                  </div>
                  {(alert as any).ackedBy && (
                    <p className="text-xs text-slate-400 mt-1">par {(alert as any).ackedBy}</p>
                  )}
                </div>
              )}
              {(alert as any).closedAt && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Fermée le</p>
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-200">
                      {formatDate((alert as any).closedAt)}
                    </p>
                  </div>
                  {(alert as any).closedBy && (
                    <p className="text-xs text-slate-400 mt-1">par {(alert as any).closedBy}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        {alert.status === 'open' && (
          <div className="p-6 border-t border-slate-700/50 space-y-4">
            {/* Snooze selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-400 whitespace-nowrap">Reporter de :</label>
              <Select value={String(snoozeDuration)} onValueChange={(v) => setSnoozeDuration(Number(v))} disabled={isProcessing}>
                <SelectTrigger className="min-w-[140px] px-3 py-2 rounded-xl bg-slate-800/50 border-slate-700/50 text-slate-200 text-sm focus:ring-sky-500/50 disabled:opacity-50" aria-label="Durée du report">
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                  <SelectItem value="240">4 heures</SelectItem>
                  <SelectItem value="480">8 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleSnooze}
                disabled={isProcessing}
                className={cn(
                  "px-4 py-2 rounded-lg border transition-colors",
                  "bg-blue-500/10 border-blue-500/30 text-blue-400",
                  "hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center gap-2"
                )}
              >
                <BellOff className="h-4 w-4" />
                Reporter
              </button>
              <button
                onClick={handleAck}
                disabled={isProcessing}
                className={cn(
                  "px-4 py-2 rounded-lg border transition-colors",
                  "bg-amber-500/10 border-amber-500/30 text-amber-400",
                  "hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center gap-2"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                Acquitter
              </button>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className={cn(
                  "px-4 py-2 rounded-lg border transition-colors",
                  "bg-slate-800/50 border-slate-700/50 text-slate-200",
                  "hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center gap-2"
                )}
              >
                <X className="h-4 w-4" />
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
