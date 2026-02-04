'use client';

/**
 * AlertItem — Composant standardisé pour les alertes (style Outlook)
 * 
 * Caractéristiques :
 * - Numéro de référence au lieu d'ID technique
 * - Titre complet avec tooltip si tronqué
 * - Priorité avec icône SVG
 * - Catégorie avec badge unifié
 * - Timestamp précis avec tooltip
 * - Hover effect avec bordure gauche
 * - Quick actions au hover
 * - Support clavier complet
 */

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  User, 
  Clock, 
  MoreHorizontal, 
  CheckCircle, 
  UserPlus, 
  Eye,
  Archive,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReferenceNumber } from './ReferenceNumber';
import { TimeAgo } from './TimeAgo';
import { PriorityIndicator, PriorityDot, type PriorityLevel, stringToPriority } from './PriorityIndicator';
import { StatusBadge } from './StatusBadge';

export interface AlertItemProps {
  /** ID unique de l'alerte */
  id: string;
  /** Numéro de référence (optionnel, sinon généré depuis id) */
  refNumber?: string | number;
  /** Titre de l'alerte */
  title: string;
  /** Description/extrait (optionnel) */
  description?: string;
  /** Priorité */
  priority?: PriorityLevel | string;
  /** Catégorie */
  category?: string;
  /** Timestamp de création */
  createdAt?: Date | string | number;
  /** Assigné à */
  assignee?: {
    name: string;
    avatar?: string;
  };
  /** Statut */
  status?: 'urgent' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  /** Non lu */
  unread?: boolean;
  /** Sélectionné */
  selected?: boolean;
  /** Callbacks */
  onSelect?: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onAssign?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Classes additionnelles */
  className?: string;
}

const statusConfig: Record<string, { 
  label: string; 
  variant: 'error' | 'warning' | 'info' | 'success' | 'neutral';
}> = {
  urgent: { label: 'Urgent', variant: 'error' },
  pending: { label: 'En attente', variant: 'warning' },
  in_progress: { label: 'En cours', variant: 'info' },
  resolved: { label: 'Résolu', variant: 'success' },
  closed: { label: 'Fermé', variant: 'neutral' },
};

const categoryColors: Record<string, string> = {
  technique: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  planning: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  qualite: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  securite: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  financier: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  juridique: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const AlertItem = React.memo(function AlertItem({
  id,
  refNumber,
  title,
  description,
  priority = 'none',
  category,
  createdAt,
  assignee,
  status,
  unread = false,
  selected = false,
  onSelect,
  onDoubleClick,
  onMarkAsRead,
  onAssign,
  onArchive,
  onDelete,
  className,
}: AlertItemProps) {
  const priorityLevel = useMemo(() => 
    typeof priority === 'string' ? stringToPriority(priority) : priority,
    [priority]
  );

  const handleClick = useCallback(() => {
    onSelect?.(id);
  }, [id, onSelect]);

  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(id);
  }, [id, onDoubleClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(id);
    }
  }, [id, onSelect]);

  const statusInfo = status ? statusConfig[status] : null;
  const categoryColor = category ? categoryColors[category.toLowerCase()] ?? categoryColors.technique : '';

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        aria-selected={selected}
        aria-label={`Alerte: ${title}`}
        className={cn(
          'group relative flex items-start gap-3 px-4 py-3',
          'border-b border-slate-100 dark:border-slate-800/40',
          'cursor-pointer transition-all duration-150',
          // Hover effect Outlook - bordure gauche
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]',
          'before:bg-transparent before:transition-colors before:duration-150',
          'hover:bg-slate-50 dark:hover:bg-slate-800/30',
          'hover:before:bg-sky-400',
          // Selected state
          selected && [
            'bg-sky-50 dark:bg-sky-900/20',
            'before:bg-sky-500',
          ],
          // Unread state
          unread && 'bg-sky-50/50 dark:bg-sky-900/10',
          // Focus visible
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset',
          className
        )}
      >
        {/* Priority indicator column */}
        <div className="flex flex-col items-center gap-2 pt-1 shrink-0 w-5">
          <PriorityDot priority={priorityLevel} size="sm" />
          {unread && (
            <div className="w-2 h-2 rounded-full bg-sky-500" aria-label="Non lu" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Row 1: Reference + Category + Time */}
          <div className="flex items-center gap-2 text-xs">
            <ReferenceNumber 
              value={refNumber ?? id} 
              prefix="ALT" 
              variant="muted"
            />
            {category && (
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
                categoryColor
              )}>
                {category}
              </span>
            )}
            <span className="flex-1" />
            {createdAt && (
              <TimeAgo date={createdAt} className="text-slate-400 dark:text-slate-500" />
            )}
          </div>

          {/* Row 2: Title + Status */}
          <div className="flex items-start gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className={cn(
                  'flex-1 text-sm leading-snug truncate',
                  unread ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'
                )}>
                  {title}
                </h3>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-md">
                <p className="font-medium">{title}</p>
              </TooltipContent>
            </Tooltip>
            {statusInfo && (
              <StatusBadge variant={statusInfo.variant} size="xs">
                {statusInfo.label}
              </StatusBadge>
            )}
          </div>

          {/* Row 3: Assignee + Priority badge */}
          <div className="flex items-center gap-2">
            {assignee ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                {assignee.avatar ? (
                  <img 
                    src={assignee.avatar} 
                    alt="" 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="truncate max-w-[120px]">{assignee.name}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Non assigné</span>
            )}
            <span className="flex-1" />
            <PriorityIndicator 
              priority={priorityLevel} 
              size="xs" 
              showLabel 
              variant="icon"
            />
          </div>

          {/* Row 4: Description (if any) */}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Quick actions (visible on hover) */}
        <div className={cn(
          'flex items-center gap-1 shrink-0',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
        )}>
          {onMarkAsRead && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(id);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Marquer comme lu</TooltipContent>
            </Tooltip>
          )}
          
          {onAssign && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(id);
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Assigner</TooltipContent>
            </Tooltip>
          )}

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Plus d'actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onMarkAsRead?.(id)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Marquer comme traité
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssign?.(id)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Assigner à...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive?.(id)}>
                <Archive className="w-4 h-4 mr-2" />
                Archiver
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
});

/**
 * AlertItemSkeleton — Skeleton de l'AlertItem
 */
export function AlertItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40">
      <div className="flex flex-col items-center gap-2 pt-1 shrink-0 w-5">
        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="flex-1" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
