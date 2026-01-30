/**
 * ErpDataTable — Tableau d'entreprise ERP-BTP.
 * En-têtes fixes au scroll, alignement gauche (libellés) / droite (chiffres),
 * sélection multiple + barre d'actions, lignes expansibles, actions contextuelles.
 */

'use client';

import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ErpColumnDef } from './types';

export interface ErpDataTableProps<T extends { id: string }> {
  data: T[];
  columns: ErpColumnDef<T>[];
  /** Clé d'accès à l'id (défaut: "id") */
  getRowId?: (row: T) => string;
  /** Sélection multiple + toolbar */
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Actions de la toolbar (export, valider, supprimer) */
  toolbarActions?: React.ReactNode;
  /** Contenu de la ligne expansible (détails, réserves, historique) */
  renderExpandedRow?: (row: T) => React.ReactNode;
  /** Actions contextuelles par ligne (dernière colonne) */
  renderRowActions?: (row: T) => React.ReactNode;
  /** Édition en ligne (optionnel, à brancher sur cell) */
  onCellEdit?: (row: T, columnId: string, value: unknown) => void;
  /** Clic sur une ligne (ouvrir détail, modal) */
  onRowClick?: (row: T) => void;
  className?: string;
  /** Hauteur max pour scroll vertical avec header sticky */
  maxHeight?: string | number;
}

export function ErpDataTable<T extends { id: string }>({
  data,
  columns,
  getRowId = (row) => row.id,
  selectable = false,
  onSelectionChange,
  toolbarActions,
  renderExpandedRow,
  renderRowActions,
  onRowClick,
  className,
  maxHeight = 'min(70vh, 600px)',
}: ErpDataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback(
    (id: string) => {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectedIds(next);
      onSelectionChange?.(Array.from(next));
    },
    [selectedIds, onSelectionChange]
  );

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const ids = data.map((row) => getRowId(row));
      setSelectedIds(new Set(ids));
      onSelectionChange?.(ids);
    }
  }, [data, selectedIds.size, getRowId, onSelectionChange]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className={cn('flex flex-col rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden', className)}>
      {selectable && someSelected && toolbarActions && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800/60 bg-slate-900/60 shrink-0">
          <span className="text-xs text-slate-400">
            {selectedIds.size} élément{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">{toolbarActions}</div>
        </div>
      )}

      <div className="overflow-auto shrink-0" style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}>
        <table className="min-w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800/60">
            <tr>
              {renderExpandedRow && (
                <th className="w-8 px-2 py-2.5 text-left" aria-label="Développer" />
              )}
              {selectable && (
                <th className="w-10 px-2 py-2.5 text-left" aria-label="Sélection">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    aria-label="Tout sélectionner"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'px-3 py-2.5 font-medium text-slate-400 text-left whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.width && typeof col.width === 'string' && col.width,
                    col.minWidth && { minWidth: col.minWidth }
                  )}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                >
                  {col.header}
                </th>
              ))}
              {renderRowActions && (
                <th className="w-16 px-2 py-2.5 text-right font-medium text-slate-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((row) => {
              const id = getRowId(row);
              const isSelected = selectedIds.has(id);
              const isExpanded = expandedIds.has(id);

              return (
                <React.Fragment key={id}>
                  <tr
                    className={cn(
                      'border-b border-slate-800/50 transition-colors',
                      'hover:bg-slate-900/50 data-[selected]:bg-slate-800/50',
                      isSelected && 'bg-slate-800/40',
                      onRowClick && 'cursor-pointer'
                    )}
                    data-selected={isSelected || undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    role={onRowClick ? 'button' : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                  >
                    {renderExpandedRow && (
                      <td className="w-8 px-2 py-2 align-middle">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(id)}
                          className="p-1 rounded hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? 'Replier' : 'Développer'}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {selectable && (
                      <td className="w-10 px-2 py-2 align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(id)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                          aria-label={`Sélectionner ${id}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const align = col.align ?? 'left';
                      const content = col.cell ? col.cell(row) : (col.accessorKey ? (row as Record<string, unknown>)[col.accessorKey as string] : null);
                      return (
                        <td
                          key={col.id}
                          className={cn(
                            'px-3 py-2 align-middle text-slate-200',
                            align === 'right' && 'text-right tabular-nums',
                            align === 'center' && 'text-center'
                          )}
                        >
                          {content ?? '—'}
                        </td>
                      );
                    })}
                    {renderRowActions && (
                      <td className="w-16 px-2 py-2 align-middle text-right">
                        {renderRowActions(row)}
                      </td>
                    )}
                  </tr>
                  {renderExpandedRow && isExpanded && (
                    <tr className="bg-slate-900/40 border-b border-slate-800/50">
                      <td
                        colSpan={
                          (renderExpandedRow ? 1 : 0) + (selectable ? 1 : 0) + columns.length + (renderRowActions ? 1 : 0)
                        }
                        className="p-0"
                      >
                        <div className="px-4 py-3 text-slate-300">
                          {renderExpandedRow(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
