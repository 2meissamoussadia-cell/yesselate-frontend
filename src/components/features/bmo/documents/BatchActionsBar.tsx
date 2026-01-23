/**
 * Barre d'actions groupées pour Documents
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Share2,
  Trash2,
  Archive,
  FolderPlus,
  CheckCircle,
  XCircle,
  Lock,
  Tags,
  X,
} from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onDownload?: () => void;
  onShare?: () => void;
  onMove?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onChangePermissions?: () => void;
  onAddTags?: () => void;
  onClear: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onDownload,
  onShare,
  onMove,
  onApprove,
  onReject,
  onArchive,
  onDelete,
  onChangePermissions,
  onAddTags,
  onClear,
}: BatchActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <div className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
          <Badge variant="default" className="bg-pink-500/20 text-pink-400 border-pink-500/30">
            {selectedCount} document{selectedCount > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onDownload && (
            <FluentButton variant="ghost" size="sm" onClick={onDownload} className="hover:bg-blue-500/10 hover:text-blue-400">
              <Download className="w-4 h-4 mr-1.5" />
              Télécharger
            </FluentButton>
          )}

          {onShare && (
            <FluentButton variant="ghost" size="sm" onClick={onShare} className="hover:bg-emerald-500/10 hover:text-emerald-400">
              <Share2 className="w-4 h-4 mr-1.5" />
              Partager
            </FluentButton>
          )}

          {onMove && (
            <FluentButton variant="ghost" size="sm" onClick={onMove} className="hover:bg-purple-500/10 hover:text-purple-400">
              <FolderPlus className="w-4 h-4 mr-1.5" />
              Déplacer
            </FluentButton>
          )}

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

          {onChangePermissions && (
            <FluentButton variant="ghost" size="sm" onClick={onChangePermissions} className="hover:bg-amber-500/10 hover:text-amber-400">
              <Lock className="w-4 h-4 mr-1.5" />
              Permissions
            </FluentButton>
          )}

          {onAddTags && (
            <FluentButton variant="ghost" size="sm" onClick={onAddTags} className="hover:bg-indigo-500/10 hover:text-indigo-400">
              <Tags className="w-4 h-4 mr-1.5" />
              Tags
            </FluentButton>
          )}

          {onArchive && (
            <FluentButton variant="ghost" size="sm" onClick={onArchive} className="hover:bg-cyan-500/10 hover:text-cyan-400">
              <Archive className="w-4 h-4 mr-1.5" />
              Archiver
            </FluentButton>
          )}

          {onDelete && (
            <FluentButton variant="ghost" size="sm" onClick={onDelete} className="hover:bg-rose-500/10 hover:text-rose-400">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Supprimer
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

