/**
 * Barre d'actions groupées pour Anomalies & Annotations
 * Actions en lot : Résoudre, Exporter, Supprimer
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Download,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';

// ================================
// PROPS
// ================================

interface BatchActionsBarProps {
  selectedCount: number;
  selectedAnomalyIds?: Set<string>;
  selectedAnnotationIds?: Set<string>;
  onResolveSelected?: (anomalyIds: string[]) => void;
  onExportSelected?: (anomalyIds?: string[], annotationIds?: string[]) => void;
  onDeleteSelected?: (annotationIds: string[]) => void;
  onClear: () => void;
  isResolving?: boolean;
  isExporting?: boolean;
  isDeleting?: boolean;
}

// ================================
// COMPONENT
// ================================

export function BatchActionsBar({
  selectedCount,
  selectedAnomalyIds = new Set(),
  selectedAnnotationIds = new Set(),
  onResolveSelected,
  onExportSelected,
  onDeleteSelected,
  onClear,
  isResolving = false,
  isExporting = false,
  isDeleting = false,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  const hasAnomalies = selectedAnomalyIds.size > 0;
  const hasAnnotations = selectedAnnotationIds.size > 0;

  const handleResolve = () => {
    if (onResolveSelected && selectedAnomalyIds.size > 0) {
      onResolveSelected(Array.from(selectedAnomalyIds));
    }
  };

  const handleExport = () => {
    if (onExportSelected) {
      const anomalyIds = selectedAnomalyIds.size > 0 ? Array.from(selectedAnomalyIds) : undefined;
      const annotationIds = selectedAnnotationIds.size > 0 ? Array.from(selectedAnnotationIds) : undefined;
      onExportSelected(anomalyIds, annotationIds);
    }
  };

  const handleDelete = () => {
    if (onDeleteSelected && selectedAnnotationIds.size > 0) {
      onDeleteSelected(Array.from(selectedAnnotationIds));
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        {/* Compteur */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {selectedCount} élément{selectedCount > 1 ? 's' : ''}
          </Badge>
          {hasAnomalies && (
            <span className="text-xs text-slate-400">
              {selectedAnomalyIds.size} anomalie{selectedAnomalyIds.size > 1 ? 's' : ''}
            </span>
          )}
          {hasAnnotations && (
            <span className="text-xs text-slate-400">
              {selectedAnnotationIds.size} annotation{selectedAnnotationIds.size > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Résoudre anomalies */}
          {hasAnomalies && onResolveSelected && (
            <Button
              size="sm"
              onClick={handleResolve}
              disabled={isResolving || isExporting || isDeleting}
              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isResolving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              )}
              Résoudre
            </Button>
          )}

          {/* Exporter */}
          {onExportSelected && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExport}
              disabled={isResolving || isExporting || isDeleting}
              className="h-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              Exporter
            </Button>
          )}

          {/* Supprimer annotations */}
          {hasAnnotations && onDeleteSelected && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={isResolving || isExporting || isDeleting}
              className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              Supprimer
            </Button>
          )}

          {/* Séparateur */}
          <div className="h-6 w-px bg-slate-700" />

          {/* Fermer */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            disabled={isResolving || isExporting || isDeleting}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
            aria-label="Annuler la sélection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

