/**
 * TransactionDetailModal
 * Modale pour afficher les détails d'une transaction
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Edit,
  Trash2,
} from 'lucide-react';
import { useTransaction } from '@/lib/hooks/useFinancesData';
import type { Transaction } from '@/lib/data/finances/mockData';

interface TransactionDetailModalProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionDetailModal({
  transactionId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  const { data: transaction, isLoading, error } = useTransaction(transactionId);

  if (!isOpen) return null;

  const getStatusConfig = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Terminé',
          className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'En attente',
          className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Approuvé',
          className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Refusé',
          className: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        };
      case 'overdue':
        return {
          icon: AlertTriangle,
          label: 'En retard',
          className: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        };
      default:
        return {
          icon: Clock,
          label: status,
          className: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg',
                  transaction?.type === 'revenue'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : transaction?.type === 'expense'
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-blue-500/10 text-blue-400'
                )}
              >
                {transaction?.type === 'revenue' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : transaction?.type === 'expense' ? (
                  <TrendingDown className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-200">
                  Détails de la transaction
                </h2>
                {transaction && (
                  <p className="text-sm text-slate-400">{transaction.id}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                Erreur lors du chargement de la transaction
              </div>
            )}

            {transaction && (
              <div className="space-y-6">
                {/* Amount & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Montant</p>
                    <p
                      className={cn(
                        'text-3xl font-bold',
                        transaction.type === 'revenue'
                          ? 'text-emerald-400'
                          : transaction.type === 'expense'
                          ? 'text-rose-400'
                          : 'text-blue-400'
                      )}
                    >
                      {transaction.type === 'expense' && '-'}
                      {formatCurrency(transaction.amount)} {transaction.currency}
                    </p>
                  </div>
                  <Badge
                    variant="default"
                    className={cn('text-sm', getStatusConfig(transaction.status).className)}
                  >
                    {React.createElement(getStatusConfig(transaction.status).icon, {
                      className: 'w-4 h-4 mr-1 inline',
                    })}
                    {getStatusConfig(transaction.status).label}
                  </Badge>
                </div>

                {/* Description */}
                <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <p className="text-slate-200">{transaction.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-400">Catégorie</p>
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      {transaction.category}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-400">Date</p>
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      {formatDate(transaction.date)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-400">Bureau</p>
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      {transaction.bureau}
                    </p>
                  </div>

                  {transaction.paymentMethod && (
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <p className="text-xs text-slate-400">Mode de paiement</p>
                      </div>
                      <p className="text-sm font-medium text-slate-200">
                        {transaction.paymentMethod}
                      </p>
                    </div>
                  )}
                </div>

                {/* Client & Project */}
                {(transaction.client || transaction.project) && (
                  <div className="grid grid-cols-2 gap-4">
                    {transaction.client && (
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <p className="text-xs text-slate-400">Client</p>
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                          {transaction.client}
                        </p>
                      </div>
                    )}

                    {transaction.project && (
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <p className="text-xs text-slate-400">Projet</p>
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                          {transaction.project}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reference */}
                {transaction.reference && (
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">Référence</p>
                    <p className="text-sm font-mono text-slate-200">
                      {transaction.reference}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {transaction.notes && (
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                    <p className="text-xs text-slate-400 mb-2">Notes</p>
                    <p className="text-sm text-slate-300">{transaction.notes}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-slate-800/50">
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                    <div>
                      <span className="block">Créé par:</span>
                      <span className="text-slate-400">{transaction.createdBy}</span>
                    </div>
                    <div>
                      <span className="block">Créé le:</span>
                      <span className="text-slate-400">
                        {new Date(transaction.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {transaction && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="border-slate-700 text-slate-400 hover:text-slate-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {onDelete && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onDelete(transaction.id);
                      onClose();
                    }}
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onEdit(transaction);
                      onClose();
                    }}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

