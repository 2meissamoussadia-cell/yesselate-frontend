/**
 * TransactionsDataTable
 * Tableau avancé avec tri, filtrage et pagination
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import type { Transaction } from '@/lib/data/finances/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionsDataTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onView?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

type SortField = keyof Transaction;
type SortDirection = 'asc' | 'desc' | null;

export function TransactionsDataTable({
  transactions,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: TransactionsDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sorting
  const sortedTransactions = useMemo(() => {
    if (!sortField || !sortDirection) return transactions;

    return [...transactions].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || bValue === undefined) return 0;

      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [transactions, sortField, sortDirection]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') setSortField(field);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTransactions.map((t) => t.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const config = {
      completed: { label: 'Terminé', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      pending: { label: 'En attente', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      approved: { label: 'Approuvé', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      rejected: { label: 'Refusé', className: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
      overdue: { label: 'En retard', className: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    };

    const { label, className } = config[status] || config.pending;

    return (
      <Badge variant="default" className={cn('text-xs', className)}>
        {label}
      </Badge>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field || !sortDirection) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
          <p className="text-sm text-cyan-400">
            {selectedIds.size} élément{selectedIds.size > 1 ? 's' : ''} sélectionné
            {selectedIds.size > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs border-slate-700 text-slate-400"
            >
              Exporter la sélection
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
            >
              Supprimer
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedTransactions.length > 0 &&
                      selectedIds.size === paginatedTransactions.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Type
                    <SortIcon field="type" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('description')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Description
                    <SortIcon field="description" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Montant
                    <SortIcon field="amount" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Date
                    <SortIcon field="date" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('bureau')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Bureau
                    <SortIcon field="bureau" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Statut
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="w-16 px-4 py-3 text-center">
                  <span className="text-xs font-medium text-slate-400">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(transaction.id)}
                        onChange={() => handleSelectOne(transaction.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'p-1.5 rounded-lg',
                            transaction.type === 'revenue'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : transaction.type === 'expense'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-blue-500/10 text-blue-400'
                          )}
                        >
                          {transaction.type === 'revenue' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : transaction.type === 'expense' ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {transaction.category}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          transaction.type === 'revenue'
                            ? 'text-emerald-400'
                            : transaction.type === 'expense'
                            ? 'text-rose-400'
                            : 'text-blue-400'
                        )}
                      >
                        {transaction.type === 'expense' && '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-slate-600">{transaction.currency}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-300">{formatDate(transaction.date)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="default"
                        className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50"
                      >
                        {transaction.bureau}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(transaction.status)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(transaction)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(transaction)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(transaction.id)}
                              className="text-rose-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4">
          <p className="text-sm text-slate-400">
            Page {currentPage} sur {totalPages} • {sortedTransactions.length} transaction
            {sortedTransactions.length > 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'h-8 w-8 p-0',
                    currentPage === page
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                      : 'border-slate-700 text-slate-400'
                  )}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

