/**
 * Barre d'actions groupées pour Projets
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Copy,
  Archive,
  Trash2,
  Download,
  Flag,
  Users,
  Calendar,
  X,
} from 'lucide-react';

// ================================
// PROPS
// ================================

interface BatchActionsBarProps {
  selectedCount: number;
  onEdit?: () => void;
  onClone?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onChangePriority?: (priority: 'high' | 'medium' | 'low') => void;
  onAssignTeam?: () => void;
  onReschedule?: () => void;
  onClear: () => void;
}

// ================================
// COMPONENT
// ================================

export function BatchActionsBar({
  selectedCount,
  onEdit,
  onClone,
  onArchive,
  onDelete,
  onExport,
  onChangePriority,
  onAssignTeam,
  onReschedule,
  onClear,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        {/* Compteur */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {selectedCount} projet{selectedCount > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Modifier */}
          {onEdit && (
            <FluentButton
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="hover:bg-blue-500/10 hover:text-blue-400"
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Modifier
            </FluentButton>
          )}

          {/* Cloner */}
          {onClone && (
            <FluentButton
              variant="ghost"
              size="sm"
              onClick={onClone}
              className="hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <Copy className="w-4 h-4 mr-1.5" />
              Cloner
            </FluentButton>
          )}

          {/* Assigner équipe */}
          {onAssignTeam && (
            <FluentButton
              variant="ghost"
              size="sm"
              onClick={onAssignTeam}
              className="hover:bg-purple-500/10 hover:text-purple-400"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Équipe
            </FluentButton>
          )}

          {/* Replanifier */}
          {onReschedule && (
            <FluentButton
              variant="ghost"
              size="sm"
              onClick={onReschedule}
              className="hover:bg-blue-500/10 hover:text-blue-400"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Replanifier
            </FluentButton>
          )}

          {/* Changer priorité */}
          {onChangePriority && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/30 border border-slate-700">
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400 mr-1">Priorité:</span>
              <button
                onClick={() => onChangePriority('high')}
                className="px-2 py-0.5 text-xs rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                title="Haute"
              >
                H
              </button>
              <button
                onClick={() => onChangePriority('medium')}
                className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                title="Moyenne"
              >
                M
              </button>
              <button
                onClick={() => onChangePriority('low')}
                className="px-2 py-0.5 text-xs rounded bg-slate-600/20 text-slate-400 hover:bg-slate-600/30 transition-colors"
                title="Basse"
              >
                L
              </button>
            </div>
          )}

          {/* Exporter */}
          {onExport && (
            <FluentButton
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Exporter
            </FluentButton>
          )}

          {/* Archiver */}
          {onArchive && (
            <FluentButton
              variant="ghost"
              size="sm"
              onClick={onArchive}
              className="hover:bg-amber-500/10 hover:text-amber-400"
            >
              <Archive className="w-4 h-4 mr-1.5" />
              Archiver
            </FluentButton>
          )}

          {/* Supprimer */}
          {onDelete && (
            <FluentButton
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="hover:bg-rose-500/10 hover:text-rose-400"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Supprimer
            </FluentButton>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-700" />

        {/* Annuler */}
        <FluentButton
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="hover:bg-slate-700"
        >
          <X className="w-4 h-4" />
        </FluentButton>
      </div>
    </div>
  );
}

