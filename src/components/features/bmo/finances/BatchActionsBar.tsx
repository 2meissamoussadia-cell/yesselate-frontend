/**
 * Barre d'actions groupées pour Finances
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  CheckCircle,
  XCircle,
  Download,
  Mail,
  FileText,
  DollarSign,
  Calendar,
  X,
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onValidate?: () => void;
  onReject?: () => void;
  onExport?: () => void;
  onSendReminder?: () => void;
  onGenerateReport?: () => void;
  onMarkPaid?: () => void;
  onReschedule?: () => void;
  onEdit?: () => void;
  onClear: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onValidate,
  onReject,
  onExport,
  onSendReminder,
  onGenerateReport,
  onMarkPaid,
  onReschedule,
  onEdit,
  onClear,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <Badge variant="default" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            {selectedCount} transaction{selectedCount > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onValidate && (
            <FluentButton variant="ghost" size="sm" onClick={onValidate} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Valider
            </FluentButton>
          )}

          {onReject && (
            <FluentButton variant="ghost" size="sm" onClick={onReject} className="hover:bg-rose-500/10 hover:text-rose-400">
              <XCircle className="w-4 h-4 mr-1.5" />
              Rejeter
            </FluentButton>
          )}

          {onMarkPaid && (
            <FluentButton variant="ghost" size="sm" onClick={onMarkPaid} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <DollarSign className="w-4 h-4 mr-1.5" />
              Marquer payé
            </FluentButton>
          )}

          {onSendReminder && (
            <FluentButton variant="ghost" size="sm" onClick={onSendReminder} className="hover:bg-blue-500/10 hover:text-blue-400">
              <Mail className="w-4 h-4 mr-1.5" />
              Relance
            </FluentButton>
          )}

          {onReschedule && (
            <FluentButton variant="ghost" size="sm" onClick={onReschedule} className="hover:bg-purple-500/10 hover:text-purple-400">
              <Calendar className="w-4 h-4 mr-1.5" />
              Replanifier
            </FluentButton>
          )}

          {onGenerateReport && (
            <FluentButton variant="ghost" size="sm" onClick={onGenerateReport} className="hover:bg-indigo-500/10 hover:text-indigo-400">
              <FileText className="w-4 h-4 mr-1.5" />
              Rapport
            </FluentButton>
          )}

          {onExport && (
            <FluentButton variant="ghost" size="sm" onClick={onExport} className="hover:bg-cyan-500/10 hover:text-cyan-400">
              <Download className="w-4 h-4 mr-1.5" />
              Exporter
            </FluentButton>
          )}

          {onEdit && (
            <FluentButton variant="ghost" size="sm" onClick={onEdit} className="hover:bg-blue-500/10 hover:text-blue-400">
              <Edit className="w-4 h-4 mr-1.5" />
              Modifier
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

