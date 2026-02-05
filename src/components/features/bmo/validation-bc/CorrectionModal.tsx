'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import type { DocumentAnomaly } from '@/lib/types/document-validation.types';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentLabel: string;
  anomalies: DocumentAnomaly[];
  onValidateCorrection: (anomalyId: string) => void;
  onMarkResolved: (anomalyId: string) => void;
}

export function CorrectionModal({
  isOpen,
  onClose,
  documentId,
  documentLabel,
  anomalies,
  onValidateCorrection,
  onMarkResolved,
}: CorrectionModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  if (!isOpen) return null;

  const unresolvedAnomalies = anomalies.filter(a => !a.resolved);
  const resolvedAnomalies = anomalies.filter(a => a.resolved);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
        'w-full max-w-3xl max-h-[90vh] overflow-y-auto',
        darkMode ? 'bg-slate-900' : 'bg-white',
        'rounded-lg shadow-2xl border border-orange-500/30'
      )}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-orange-400" />
                Correction d'anomalies
              </h2>
              <p className="text-sm text-slate-400">
                Document: <span className="font-mono font-semibold">{documentId}</span> - {documentLabel}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className={cn('p-2 rounded-lg transition-colors', darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Anomalies non résolues */}
          {unresolvedAnomalies.length > 0 && (
            <Card className="mb-4 border-orange-500/30 bg-orange-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Anomalies en attente de correction ({unresolvedAnomalies.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unresolvedAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      anomaly.severity === 'critical' ? 'border-red-500/30 bg-red-500/10' :
                      anomaly.severity === 'error' ? 'border-red-500/30 bg-red-500/10' :
                      anomaly.severity === 'warning' ? 'border-orange-500/30 bg-orange-500/10' :
                      'border-blue-500/30 bg-blue-500/10'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              anomaly.severity === 'critical' || anomaly.severity === 'error' ? 'urgent' :
                              anomaly.severity === 'warning' ? 'warning' :
                              'info'
                            }
                            className="text-xs"
                          >
                            {anomaly.severity}
                          </Badge>
                          <span className="text-xs text-slate-400 font-mono">{anomaly.field}</span>
                          <Badge variant="default" className="text-[10px]">
                            {anomaly.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold mb-1">{anomaly.message}</p>
                        <p className="text-xs text-slate-400">
                          Détecté le {new Date(anomaly.detectedAt).toLocaleDateString('fr-FR')} à {new Date(anomaly.detectedAt).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          onValidateCorrection(anomaly.id);
                          addToast('Correction validée', 'success');
                        }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Valider la correction
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onMarkResolved(anomaly.id);
                          addToast('Anomalie marquée comme résolue', 'success');
                        }}
                      >
                        Marquer comme résolu
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Anomalies résolues */}
          {resolvedAnomalies.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Anomalies corrigées ({resolvedAnomalies.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resolvedAnomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-400 font-mono">{anomaly.field}</span>
                          <Badge variant="default" className="text-[10px]">
                            {anomaly.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm">{anomaly.message}</p>
                        {anomaly.resolvedAt && anomaly.resolvedBy && (
                          <p className="text-xs text-slate-400 mt-1">
                            Résolu le {new Date(anomaly.resolvedAt).toLocaleDateString('fr-FR')} par {anomaly.resolvedBy}
                          </p>
                        )}
                      </div>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {anomalies.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                <p className="text-sm text-slate-400">Aucune anomalie pour ce document</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700/30">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

