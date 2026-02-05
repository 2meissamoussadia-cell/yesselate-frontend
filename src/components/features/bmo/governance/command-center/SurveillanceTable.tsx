/**
 * Tableau de surveillance avancé
 * Pour le pilotage et monitoring opérationnel
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Filter,
  Columns,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import type { SurveillanceItem } from './types';

interface SurveillanceTableProps {
  tableId: string;
  items: SurveillanceItem[];
  columns?: string[];
  title?: string;
  onItemClick?: (item: SurveillanceItem) => void;
  onAction?: (action: string, item: SurveillanceItem) => void;
}

const defaultColumns = [
  'selection',
  'reference',
  'designation',
  'project',
  'responsable',
  'dateEcheance',
  'status',
  'priority',
  'progress',
  'actions',
];

export function SurveillanceTable({
  tableId,
  items,
  columns = defaultColumns,
  title,
  onItemClick,
  onAction,
}: SurveillanceTableProps) {
  const { 
    selectedItems, 
    selectItem, 
    deselectItem, 
    selectAll, 
    clearSelection,
    openModal,
  } = useGovernanceCommandCenterStore();

  const [sortBy, setSortBy] = useState<string>('dateEcheance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const allSelected = items.length > 0 && items.every(item => selectedItems.includes(item.id));
  const someSelected = items.some(item => selectedItems.includes(item.id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(items.map(i => i.id));
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const aVal = (a as any)[sortBy] || '';
    const bVal = (b as any)[sortBy] || '';
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const statusConfig = {
    'on-track': { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'En cours' },
    'at-risk': { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'À risque' },
    'late': { icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10', label: 'En retard' },
    'blocked': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Bloqué' },
    'completed': { icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Terminé' },
  };

  const priorityConfig = {
    critical: { color: 'bg-red-500', label: 'Critique' },
    high: { color: 'bg-orange-500', label: 'Haute' },
    medium: { color: 'bg-amber-500', label: 'Moyenne' },
    low: { color: 'bg-slate-500', label: 'Basse' },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/40">
        <div className="flex items-center gap-3">
          {title && <h3 className="text-sm font-medium text-slate-300">{title}</h3>}
          <span className="text-xs text-slate-400">{items.length} éléments</span>
          {someSelected && (
            <span className="text-xs text-blue-400">{selectedItems.length} sélectionné(s)</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-slate-300"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Filtres</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-slate-300"
          >
            <Columns className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Colonnes</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-slate-300"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Export</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            <tr className="border-b border-slate-700/50">
              {columns.includes('selection') && (
                <th className="w-10 px-3 py-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-slate-600"
                  />
                </th>
              )}
              {columns.includes('reference') && (
                <ColumnHeader
                  label="Référence"
                  sortable
                  sorted={sortBy === 'reference' ? sortDir : undefined}
                  onClick={() => handleSort('reference')}
                />
              )}
              {columns.includes('designation') && (
                <ColumnHeader
                  label="Désignation"
                  sortable
                  sorted={sortBy === 'designation' ? sortDir : undefined}
                  onClick={() => handleSort('designation')}
                  className="min-w-[200px]"
                />
              )}
              {columns.includes('project') && (
                <ColumnHeader
                  label="Projet"
                  sortable
                  sorted={sortBy === 'project' ? sortDir : undefined}
                  onClick={() => handleSort('project')}
                />
              )}
              {columns.includes('responsable') && (
                <ColumnHeader
                  label="Responsable"
                  sortable
                  sorted={sortBy === 'responsable' ? sortDir : undefined}
                  onClick={() => handleSort('responsable')}
                />
              )}
              {columns.includes('dateEcheance') && (
                <ColumnHeader
                  label="Échéance"
                  sortable
                  sorted={sortBy === 'dateEcheance' ? sortDir : undefined}
                  onClick={() => handleSort('dateEcheance')}
                />
              )}
              {columns.includes('status') && (
                <ColumnHeader
                  label="Statut"
                  sortable
                  sorted={sortBy === 'status' ? sortDir : undefined}
                  onClick={() => handleSort('status')}
                />
              )}
              {columns.includes('priority') && (
                <ColumnHeader
                  label="Priorité"
                  sortable
                  sorted={sortBy === 'priority' ? sortDir : undefined}
                  onClick={() => handleSort('priority')}
                />
              )}
              {columns.includes('progress') && (
                <ColumnHeader label="Avancement" className="w-32" />
              )}
              {columns.includes('actions') && (
                <th className="w-16 px-3 py-2 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sortedItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              const isHovered = hoveredRow === item.id;
              const status = statusConfig[item.status];
              const priority = priorityConfig[item.priority];
              const StatusIcon = status.icon;

              return (
                <tr
                  key={item.id}
                  className={cn(
                    'transition-colors cursor-pointer',
                    isSelected ? 'bg-blue-500/10' : isHovered ? 'bg-slate-800/40' : 'bg-transparent'
                  )}
                  onMouseEnter={() => setHoveredRow(item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onItemClick?.(item)}
                >
                  {columns.includes('selection') && (
                    <td className="w-10 px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          checked ? selectItem(item.id) : deselectItem(item.id)
                        }
                        className="border-slate-600"
                      />
                    </td>
                  )}
                  {columns.includes('reference') && (
                    <td className="px-3 py-2">
                      <span className="text-sm font-mono text-slate-400">{item.reference}</span>
                    </td>
                  )}
                  {columns.includes('designation') && (
                    <td className="px-3 py-2 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300 line-clamp-1">{item.designation}</span>
                        {item.alerts && item.alerts > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            {item.alerts}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  {columns.includes('project') && (
                    <td className="px-3 py-2">
                      <span className="text-sm text-slate-400">{item.project || '-'}</span>
                    </td>
                  )}
                  {columns.includes('responsable') && (
                    <td className="px-3 py-2">
                      <span className="text-sm text-slate-400">{item.responsable || '-'}</span>
                    </td>
                  )}
                  {columns.includes('dateEcheance') && (
                    <td className="px-3 py-2">
                      <span className={cn(
                        'text-sm',
                        item.status === 'late' ? 'text-red-400' : 'text-slate-400'
                      )}>
                        {item.dateEcheance || '-'}
                      </span>
                    </td>
                  )}
                  {columns.includes('status') && (
                    <td className="px-3 py-2">
                      <div className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
                        status.bg,
                        status.color
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </div>
                    </td>
                  )}
                  {columns.includes('priority') && (
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('w-2 h-2 rounded-full', priority.color)} />
                        <span className="text-xs text-slate-400">{priority.label}</span>
                      </div>
                    </td>
                  )}
                  {columns.includes('progress') && (
                    <td className="px-3 py-2 w-32">
                      {item.progress !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                item.progress >= 80 ? 'bg-emerald-500' :
                                item.progress >= 50 ? 'bg-blue-500' :
                                item.progress >= 25 ? 'bg-amber-500' : 'bg-slate-500'
                              )}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">
                            {item.progress}%
                          </span>
                        </div>
                      )}
                    </td>
                  )}
                  {columns.includes('actions') && (
                    <td className="w-16 px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700">
                          <DropdownMenuItem
                            onClick={() => onAction?.('view', item)}
                            className="text-slate-300 focus:bg-slate-800"
                          >
                            <Eye className="h-4 w-4 mr-2 text-slate-400" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onAction?.('edit', item)}
                            className="text-slate-300 focus:bg-slate-800"
                          >
                            <Edit className="h-4 w-4 mr-2 text-slate-400" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem
                            onClick={() => onAction?.('escalate', item)}
                            className="text-amber-400 focus:bg-slate-800"
                          >
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Escalader
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onAction?.('pause', item)}
                            className="text-slate-300 focus:bg-slate-800"
                          >
                            <Pause className="h-4 w-4 mr-2 text-slate-400" />
                            Mettre en pause
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            Aucun élément à afficher
          </div>
        )}
      </div>
    </div>
  );
}

function ColumnHeader({
  label,
  sortable = false,
  sorted,
  onClick,
  className,
}: {
  label: string;
  sortable?: boolean;
  sorted?: 'asc' | 'desc';
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:text-slate-400 select-none',
        className
      )}
      onClick={sortable ? onClick : undefined}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortable && sorted && (
          sorted === 'asc' ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        )}
      </div>
    </th>
  );
}

