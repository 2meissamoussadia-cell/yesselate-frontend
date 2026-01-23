/**
 * Barre d'actions groupées pour Missions
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  PlayCircle,
  XCircle,
  Users,
  Calendar,
  MessageSquare,
  MapPin,
  Download,
  FileText,
  Bell,
  X,
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onStart?: () => void;
  onCancel?: () => void;
  onAssignTeam?: () => void;
  onReschedule?: () => void;
  onAddNote?: () => void;
  onUpdateLocation?: () => void;
  onExport?: () => void;
  onGenerateReport?: () => void;
  onNotify?: () => void;
  onClear: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onStart,
  onCancel,
  onAssignTeam,
  onReschedule,
  onAddNote,
  onUpdateLocation,
  onExport,
  onGenerateReport,
  onNotify,
  onClear,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <Badge variant="default" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            {selectedCount} mission{selectedCount > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onStart && (
            <FluentButton variant="ghost" size="sm" onClick={onStart} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <PlayCircle className="w-4 h-4 mr-1.5" />
              Démarrer
            </FluentButton>
          )}

          {onCancel && (
            <FluentButton variant="ghost" size="sm" onClick={onCancel} className="hover:bg-rose-500/10 hover:text-rose-400">
              <XCircle className="w-4 h-4 mr-1.5" />
              Annuler
            </FluentButton>
          )}

          {onAssignTeam && (
            <FluentButton variant="ghost" size="sm" onClick={onAssignTeam} className="hover:bg-blue-500/10 hover:text-blue-400">
              <Users className="w-4 h-4 mr-1.5" />
              Assigner
            </FluentButton>
          )}

          {onReschedule && (
            <FluentButton variant="ghost" size="sm" onClick={onReschedule} className="hover:bg-purple-500/10 hover:text-purple-400">
              <Calendar className="w-4 h-4 mr-1.5" />
              Replanifier
            </FluentButton>
          )}

          {onUpdateLocation && (
            <FluentButton variant="ghost" size="sm" onClick={onUpdateLocation} className="hover:bg-cyan-500/10 hover:text-cyan-400">
              <MapPin className="w-4 h-4 mr-1.5" />
              Localisation
            </FluentButton>
          )}

          {onAddNote && (
            <FluentButton variant="ghost" size="sm" onClick={onAddNote} className="hover:bg-indigo-500/10 hover:text-indigo-400">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Note
            </FluentButton>
          )}

          {onGenerateReport && (
            <FluentButton variant="ghost" size="sm" onClick={onGenerateReport} className="hover:bg-amber-500/10 hover:text-amber-400">
              <FileText className="w-4 h-4 mr-1.5" />
              Rapport
            </FluentButton>
          )}

          {onNotify && (
            <FluentButton variant="ghost" size="sm" onClick={onNotify} className="hover:bg-orange-500/10 hover:text-orange-400">
              <Bell className="w-4 h-4 mr-1.5" />
              Notifier
            </FluentButton>
          )}

          {onExport && (
            <FluentButton variant="ghost" size="sm" onClick={onExport} className="hover:bg-slate-500/10 hover:text-slate-400">
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

