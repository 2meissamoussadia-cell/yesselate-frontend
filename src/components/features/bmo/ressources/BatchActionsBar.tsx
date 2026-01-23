/**
 * Barre d'actions groupées pour Ressources (RH)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  UserCheck,
  UserMinus,
  Calendar,
  GraduationCap,
  FileCheck,
  Mail,
  Download,
  FileText,
  X,
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onHire?: () => void;
  onActivate?: () => void;
  onTerminate?: () => void;
  onScheduleLeave?: () => void;
  onAssignTraining?: () => void;
  onScheduleEvaluation?: () => void;
  onSendMessage?: () => void;
  onExport?: () => void;
  onGenerateReport?: () => void;
  onClear: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onHire,
  onActivate,
  onTerminate,
  onScheduleLeave,
  onAssignTraining,
  onScheduleEvaluation,
  onSendMessage,
  onExport,
  onGenerateReport,
  onClear,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <Badge variant="default" className="bg-violet-500/20 text-violet-400 border-violet-500/30">
            {selectedCount} employé{selectedCount > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onHire && (
            <FluentButton variant="ghost" size="sm" onClick={onHire} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Embaucher
            </FluentButton>
          )}

          {onActivate && (
            <FluentButton variant="ghost" size="sm" onClick={onActivate} className="hover:bg-blue-500/10 hover:text-blue-400">
              <UserCheck className="w-4 h-4 mr-1.5" />
              Activer
            </FluentButton>
          )}

          {onScheduleLeave && (
            <FluentButton variant="ghost" size="sm" onClick={onScheduleLeave} className="hover:bg-purple-500/10 hover:text-purple-400">
              <Calendar className="w-4 h-4 mr-1.5" />
              Congé
            </FluentButton>
          )}

          {onAssignTraining && (
            <FluentButton variant="ghost" size="sm" onClick={onAssignTraining} className="hover:bg-indigo-500/10 hover:text-indigo-400">
              <GraduationCap className="w-4 h-4 mr-1.5" />
              Formation
            </FluentButton>
          )}

          {onScheduleEvaluation && (
            <FluentButton variant="ghost" size="sm" onClick={onScheduleEvaluation} className="hover:bg-cyan-500/10 hover:text-cyan-400">
              <FileCheck className="w-4 h-4 mr-1.5" />
              Évaluation
            </FluentButton>
          )}

          {onSendMessage && (
            <FluentButton variant="ghost" size="sm" onClick={onSendMessage} className="hover:bg-blue-500/10 hover:text-blue-400">
              <Mail className="w-4 h-4 mr-1.5" />
              Message
            </FluentButton>
          )}

          {onGenerateReport && (
            <FluentButton variant="ghost" size="sm" onClick={onGenerateReport} className="hover:bg-amber-500/10 hover:text-amber-400">
              <FileText className="w-4 h-4 mr-1.5" />
              Rapport
            </FluentButton>
          )}

          {onExport && (
            <FluentButton variant="ghost" size="sm" onClick={onExport} className="hover:bg-slate-500/10 hover:text-slate-400">
              <Download className="w-4 h-4 mr-1.5" />
              Exporter
            </FluentButton>
          )}

          {onTerminate && (
            <FluentButton variant="ghost" size="sm" onClick={onTerminate} className="hover:bg-rose-500/10 hover:text-rose-400">
              <UserMinus className="w-4 h-4 mr-1.5" />
              Désactiver
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

