'use client';

import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { X, Clock, User, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import type { BlockedDossier, SystemAlert } from '@/lib/types/bmo.types';

interface AlertDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alert: {
    id: string;
    type: 'system' | 'blocked' | 'payment' | 'contract';
    severity: 'critical' | 'warning' | 'success' | 'info';
    title: string;
    description: string;
    bureau?: string;
    data?: BlockedDossier | SystemAlert | unknown;
  };
  onAction?: (action: string, alertId: string) => void;
}

export function AlertDetailsPanel({
  isOpen,
  onClose,
  alert,
  onAction,
}: AlertDetailsPanelProps) {
  const { darkMode } = useAppStore();

  if (!isOpen) return null;

  const dossier = alert.type === 'blocked' ? (alert.data as BlockedDossier) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-lg z-50',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          darkMode ? 'bg-slate-900' : 'bg-white',
          'shadow-2xl border-l'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={cn(
              'p-4 border-b flex items-center justify-between',
              alert.severity === 'critical'
                ? 'bg-red-500/10 border-red-500/30'
                : alert.severity === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30'
                : alert.severity === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">
                  {alert.severity === 'critical'
                    ? '🚨'
                    : alert.severity === 'warning'
                    ? '⚠️'
                    : alert.severity === 'success'
                    ? '✅'
                    : 'ℹ️'}
                </span>
                <Badge
                  variant={
                    alert.severity === 'critical'
                      ? 'urgent'
                      : alert.severity === 'warning'
                      ? 'warning'
                      : alert.severity === 'success'
                      ? 'success'
                      : 'info'
                  }
                >
                  {alert.severity}
                </Badge>
                {alert.bureau && <BureauTag bureau={alert.bureau} />}
              </div>
              <h2 className="font-bold text-base">{alert.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Informations générales */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Informations
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">ID</span>
                  <span className="font-mono text-orange-400">{alert.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Type</span>
                  <Badge variant="default" className="text-[9px]">
                    {alert.type}
                  </Badge>
                </div>
                {alert.bureau && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Bureau</span>
                    <BureauTag bureau={alert.bureau} />
                  </div>
                )}
              </div>
            </div>

            {/* Détails du dossier bloqué */}
            {dossier && (
              <>
                <div
                  className={cn(
                    'p-3 rounded-lg border',
                    alert.severity === 'critical'
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-amber-500/5 border-amber-500/20'
                  )}
                >
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Contexte du blocage
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Sujet</span>
                      <span className="font-medium">{dossier.subject}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Responsable</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {dossier.responsible}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Délai</span>
                      <span className="font-mono text-red-400">J+{dossier.delay}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Impact</span>
                      <Badge
                        variant={
                          dossier.impact === 'critical'
                            ? 'urgent'
                            : dossier.impact === 'high'
                            ? 'warning'
                            : 'default'
                        }
                        className="text-[9px]"
                      >
                        {dossier.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Montant</span>
                      <span className="font-mono">{dossier.amount} FCFA</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700/30">
                      <span className="text-slate-400 text-[10px]">Raison</span>
                      <p className="text-xs mt-1">{dossier.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Historique et actions précédentes */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                      <div className="flex-1">
                        <p className="font-medium">Blocage initial</p>
                        <p className="text-[10px] text-slate-400">
                          {dossier.blockedSince} • {dossier.responsible}
                        </p>
                      </div>
                    </div>
                    {dossier.delay >= 5 && (
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                        <div className="flex-1">
                          <p className="font-medium">Seuil critique atteint</p>
                          <p className="text-[10px] text-slate-400">
                            Après {dossier.delay} jours • Action requise
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Impact et conséquences */}
            {alert.severity === 'critical' && (
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-400">
                  <TrendingUp className="w-4 h-4" />
                  Impact métier
                </h3>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li>• Blocage de la chaîne de validation</li>
                  <li>• Retard potentiel sur le projet {dossier?.project}</li>
                  <li>• Risque financier estimé</li>
                  {dossier && (
                    <li>• Impact sur {dossier.bureau} : opérations en attente</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-700/30 space-y-2">
            <div className="flex gap-2">
              {alert.type === 'blocked' && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    onAction?.('substitute', alert.id);
                    onClose();
                  }}
                >
                  🔄 Substituer
                </Button>
              )}
              {alert.severity === 'critical' && (
                <Button
                  size="sm"
                  variant="warning"
                  className="flex-1"
                  onClick={() => {
                    onAction?.('escalate', alert.id);
                    onClose();
                  }}
                >
                  ⬆️ Escalader
                </Button>
              )}
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={() => {
                onAction?.('acknowledge', alert.id);
                onClose();
              }}
            >
              ✓ Acquitter
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

