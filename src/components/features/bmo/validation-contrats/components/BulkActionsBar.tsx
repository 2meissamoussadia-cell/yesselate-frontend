/**
 * Barre d'actions groupées flottante
 * S'affiche quand des contrats sont sélectionnés
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  X,
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onValidateAll: () => void;
  onRejectAll: () => void;
  onEscalateAll: () => void;
  onExport: () => void;
  onClear: () => void;
  loading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onValidateAll,
  onRejectAll,
  onEscalateAll,
  onExport,
  onClear,
  loading = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4">
        {/* Compteur */}
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm px-3 py-1">
            {selectedCount}
          </Badge>
          <span className="text-sm text-slate-300">
            contrat{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </span>
        </div>

        <div className="w-px h-6 bg-slate-700/50" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onValidateAll}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Valider tous
          </Button>

          <Button
            size="sm"
            onClick={onRejectAll}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeter
          </Button>

          <Button
            size="sm"
            onClick={onEscalateAll}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Escalader
          </Button>

          <Button
            size="sm"
            onClick={onExport}
            disabled={loading}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-slate-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        <div className="w-px h-6 bg-slate-700/50" />

        {/* Fermer */}
        <Button
          size="sm"
          onClick={onClear}
          disabled={loading}
          variant="ghost"
          className="text-slate-400 hover:text-slate-300 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

