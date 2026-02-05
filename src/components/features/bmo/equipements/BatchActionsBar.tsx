/**
 * Barre d'actions groupées pour Equipements
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  Wrench,
  Calendar,
  UserCheck,
  MapPin,
  FileText,
  Download,
  Archive,
  Trash2,
  QrCode,
  X,
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onScheduleMaintenance?: () => void;
  onAssign?: () => void;
  onChangeLocation?: () => void;
  onMarkAsAvailable?: () => void;
  onMarkAsOutOfService?: () => void;
  onGenerateReport?: () => void;
  onExport?: () => void;
  onGenerateQR?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onClear: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onScheduleMaintenance,
  onAssign,
  onChangeLocation,
  onMarkAsAvailable,
  onMarkAsOutOfService,
  onGenerateReport,
  onExport,
  onGenerateQR,
  onArchive,
  onDelete,
  onClear,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
          <Badge variant="default" className="bg-lime-500/20 text-lime-400 border-lime-500/30">
            {selectedCount} équipement{selectedCount > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onScheduleMaintenance && (
            <FluentButton variant="ghost" size="sm" onClick={onScheduleMaintenance} className="hover:bg-amber-500/10 hover:text-amber-400">
              <Wrench className="w-4 h-4 mr-1.5" />
              Maintenance
            </FluentButton>
          )}

          {onAssign && (
            <FluentButton variant="ghost" size="sm" onClick={onAssign} className="hover:bg-blue-500/10 hover:text-blue-400">
              <UserCheck className="w-4 h-4 mr-1.5" />
              Assigner
            </FluentButton>
          )}

          {onChangeLocation && (
            <FluentButton variant="ghost" size="sm" onClick={onChangeLocation} className="hover:bg-purple-500/10 hover:text-purple-400">
              <MapPin className="w-4 h-4 mr-1.5" />
              Localisation
            </FluentButton>
          )}

          {onMarkAsAvailable && (
            <FluentButton variant="ghost" size="sm" onClick={onMarkAsAvailable} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <Calendar className="w-4 h-4 mr-1.5" />
              Disponible
            </FluentButton>
          )}

          {onGenerateQR && (
            <FluentButton variant="ghost" size="sm" onClick={onGenerateQR} className="hover:bg-indigo-500/10 hover:text-indigo-400">
              <QrCode className="w-4 h-4 mr-1.5" />
              QR Code
            </FluentButton>
          )}

          {onGenerateReport && (
            <FluentButton variant="ghost" size="sm" onClick={onGenerateReport} className="hover:bg-cyan-500/10 hover:text-cyan-400">
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

          {onArchive && (
            <FluentButton variant="ghost" size="sm" onClick={onArchive} className="hover:bg-amber-500/10 hover:text-amber-400">
              <Archive className="w-4 h-4 mr-1.5" />
              Archiver
            </FluentButton>
          )}

          {onMarkAsOutOfService && (
            <FluentButton variant="ghost" size="sm" onClick={onMarkAsOutOfService} className="hover:bg-rose-500/10 hover:text-rose-400">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Hors service
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
