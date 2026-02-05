/**
 * Barre d'actions groupées pour Demandes
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Users,
  Flag,
  MessageSquare,
  Mail,
  Download,
  Calendar,
  X,
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onApprove?: () => void;
  onReject?: () => void;
  onAssign?: () => void;
  onChangePriority?: (priority: 'urgent' | 'high' | 'medium' | 'low') => void;
  onAddComment?: () => void;
  onSendNotification?: () => void;
  onExport?: () => void;
  onReschedule?: () => void;
  onClear: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onApprove,
  onReject,
  onAssign,
  onChangePriority,
  onAddComment,
  onSendNotification,
  onExport,
  onReschedule,
  onClear,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <Badge variant="default" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {selectedCount} demande{selectedCount > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onApprove && (
            <FluentButton variant="ghost" size="sm" onClick={onApprove} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Approuver
            </FluentButton>
          )}

          {onReject && (
            <FluentButton variant="ghost" size="sm" onClick={onReject} className="hover:bg-rose-500/10 hover:text-rose-400">
              <XCircle className="w-4 h-4 mr-1.5" />
              Rejeter
            </FluentButton>
          )}

          {onAssign && (
            <FluentButton variant="ghost" size="sm" onClick={onAssign} className="hover:bg-blue-500/10 hover:text-blue-400">
              <Users className="w-4 h-4 mr-1.5" />
              Assigner
            </FluentButton>
          )}

          {onChangePriority && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/30 border border-slate-700">
              <Flag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400 mr-1">Priorité:</span>
              <button
                onClick={() => onChangePriority('urgent')}
                className="px-2 py-0.5 text-xs rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                title="Urgente"
              >
                U
              </button>
              <button
                onClick={() => onChangePriority('high')}
                className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                title="Haute"
              >
                H
              </button>
              <button
                onClick={() => onChangePriority('medium')}
                className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
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

          {onAddComment && (
            <FluentButton variant="ghost" size="sm" onClick={onAddComment} className="hover:bg-indigo-500/10 hover:text-indigo-400">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Commenter
            </FluentButton>
          )}

          {onSendNotification && (
            <FluentButton variant="ghost" size="sm" onClick={onSendNotification} className="hover:bg-blue-500/10 hover:text-blue-400">
              <Mail className="w-4 h-4 mr-1.5" />
              Notifier
            </FluentButton>
          )}

          {onReschedule && (
            <FluentButton variant="ghost" size="sm" onClick={onReschedule} className="hover:bg-purple-500/10 hover:text-purple-400">
              <Calendar className="w-4 h-4 mr-1.5" />
              Replanifier
            </FluentButton>
          )}

          {onExport && (
            <FluentButton variant="ghost" size="sm" onClick={onExport} className="hover:bg-cyan-500/10 hover:text-cyan-400">
              <Download className="w-4 h-4 mr-1.5" />
              Exporter
            </FluentButton>
          )}
        </div>

        <div className="h-6 w-px bg-slate-700" />

        <FluentButton variant="ghost" size="sm" onClick={onClear} className="hover:bg-slate-700">
          <X className="w-4 h-4" />
        </FluentButton>
      </div>
    </div>
  );
}

