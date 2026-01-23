/**
 * Barre d'actions en masse pour les alertes
 * Apparaît en bas de l'écran quand des alertes sont sélectionnées
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus,
  Trash2,
  X,
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onAcknowledge?: () => void;
  onResolve?: () => void;
  onEscalate?: () => void;
  onAssign?: () => void;
  onDelete?: () => void;
  onClear: () => void;
  className?: string;
}

export function BatchActionsBar({
  selectedCount,
  onAcknowledge,
  onResolve,
  onEscalate,
  onAssign,
  onDelete,
  onClear,
  className,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl',
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Selection count */}
          <div className="flex items-center gap-3">
            <Badge
              variant="default"
              className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-sm px-3 py-1"
            >
              {selectedCount} alerte{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
            </Badge>
            
            <button
              onClick={onClear}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Désélectionner tout
            </button>
          </div>

          {/* Center: Actions */}
          <div className="flex items-center gap-2">
            {onAcknowledge && (
              <Button
                variant="default"
                size="sm"
                onClick={onAcknowledge}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Acquitter
              </Button>
            )}

            {onResolve && (
              <Button
                variant="default"
                size="sm"
                onClick={onResolve}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Résoudre
              </Button>
            )}

            {onEscalate && (
              <Button
                variant="default"
                size="sm"
                onClick={onEscalate}
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Escalader
              </Button>
            )}

            {onAssign && (
              <Button
                variant="default"
                size="sm"
                onClick={onAssign}
                className="border-slate-500/30 text-slate-400 hover:bg-slate-500/10"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assigner
              </Button>
            )}

            {onDelete && (
              <Button
                variant="default"
                size="sm"
                onClick={onDelete}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>

          {/* Right: Close button */}
          <button
            onClick={onClear}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-800/50 transition-colors text-slate-500 hover:text-slate-300"
            title="Fermer"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

