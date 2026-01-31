'use client';

/**
 * Modal de détail d'anomalie - Pattern Modal Overlay
 * Affiche les détails complets d'une anomalie avec navigation prev/next
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DetailModal, useDetailNavigation } from '@/components/ui/detail-modal';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileWarning,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { DocumentAnomaly, DocumentAnnotation } from '@/lib/types/document-validation.types';

interface AnomalyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly: DocumentAnomaly | null;
  anomalies: DocumentAnomaly[];
  annotations?: DocumentAnnotation[];
  onResolve?: (anomalyId: string) => void;
  isResolving?: boolean;
  onNavigatePrev?: (prevAnomaly: DocumentAnomaly) => void;
  onNavigateNext?: (nextAnomaly: DocumentAnomaly) => void;
}

const severityConfig = {
  critical: {
    icon: XCircle,
    color: 'red',
    label: 'Critique',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
  },
  error: {
    icon: XCircle,
    color: 'red',
    label: 'Erreur',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    color: 'amber',
    label: 'Avertissement',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
  },
  info: {
    icon: Info,
    color: 'blue',
    label: 'Information',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
  },
};

export function AnomalyDetailModal({
  isOpen,
  onClose,
  anomaly,
  anomalies,
  annotations = [],
  onResolve,
  isResolving = false,
  onNavigatePrev,
  onNavigateNext,
}: AnomalyDetailModalProps) {
  if (!anomaly) return null;

  const { 
    canNavigatePrev, 
    canNavigateNext, 
    navigatePrev, 
    navigateNext,
    currentIndex,
    totalItems,
  } = useDetailNavigation(anomalies, anomaly);

  const severity = severityConfig[anomaly.severity] || severityConfig.info;
  const SeverityIcon = severity.icon;

  // Annotations liées à cette anomalie
  const relatedAnnotations = annotations.filter(
    (ann) => ann.anomalyId === anomaly.id
  );

  const handleResolve = () => {
    if (onResolve) {
      onResolve(anomaly.id);
    }
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Anomalie #${currentIndex + 1} sur ${totalItems}`}
      subtitle={anomaly.field ? `Champ: ${anomaly.field.replace(/_/g, ' ')}` : undefined}
      icon={<SeverityIcon className="w-5 h-5" />}
      accentColor={severity.color}
      size="xl"
      position="right"
      canNavigatePrev={canNavigatePrev}
      canNavigateNext={canNavigateNext}
      onNavigatePrev={() => {
        const prev = navigatePrev();
        if (prev && onNavigatePrev) {
          onNavigatePrev(prev);
        }
      }}
      onNavigateNext={() => {
        const next = navigateNext();
        if (next && onNavigateNext) {
          onNavigateNext(next);
        }
      }}
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Navigation: ← → | Fermer: ESC
          </div>
          {!anomaly.resolved && onResolve && (
            <Button
              onClick={handleResolve}
              disabled={isResolving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isResolving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Résolution...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer comme résolu
                </>
              )}
            </Button>
          )}
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header avec sévérité */}
        <div className={cn(
          'p-4 rounded-lg border',
          severity.bgColor,
          severity.borderColor
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('p-2 rounded-lg', severity.bgColor)}>
                <SeverityIcon className={cn('w-6 h-6', severity.textColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={cn(
                    'text-xs font-medium border',
                    severity.bgColor,
                    severity.textColor,
                    severity.borderColor
                  )}>
                    {severity.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50">
                    {anomaly.type.replace(/_/g, ' ')}
                  </Badge>
                  {anomaly.field && (
                    <Badge variant="outline" className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50 font-mono">
                      {anomaly.field}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {anomaly.message}
                </h3>
              </div>
            </div>
            {anomaly.resolved && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Résolu
              </Badge>
            )}
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date de détection */}
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Détecté le
              </span>
            </div>
            <p className="text-sm text-slate-200 font-medium">
              {new Date(anomaly.detectedAt).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              à {new Date(anomaly.detectedAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {anomaly.detectedBy && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/30">
                <User className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-400">
                  Détecté par: {anomaly.detectedBy}
                </span>
              </div>
            )}
          </div>

          {/* Date de résolution (si résolu) */}
          {anomaly.resolved && anomaly.resolvedAt && (
            <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
                  Résolu le
                </span>
              </div>
              <p className="text-sm text-emerald-200 font-medium">
                {new Date(anomaly.resolvedAt).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-emerald-400 mt-1">
                à {new Date(anomaly.resolvedAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {anomaly.resolvedBy && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-500/20">
                  <User className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-emerald-400">
                    Résolu par: {anomaly.resolvedBy}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Champ concerné (détails) */}
        {anomaly.field && (
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <FileWarning className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Champ concerné
              </span>
            </div>
            <p className="text-sm text-slate-200 font-mono">
              {anomaly.field}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {anomaly.field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>
        )}

        {/* Annotations liées */}
        {relatedAnnotations.length > 0 && (
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Annotations liées ({relatedAnnotations.length})
              </span>
            </div>
            <div className="space-y-2">
              {relatedAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        annotation.type === 'correction'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : annotation.type === 'approval'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : annotation.type === 'rejection'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      )}
                    >
                      {annotation.type || 'comment'}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(annotation.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{annotation.comment}</p>
                  {annotation.createdBy && (
                    <p className="text-xs text-slate-400 mt-2">
                      Par: {annotation.createdBy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DetailModal>
  );
}

