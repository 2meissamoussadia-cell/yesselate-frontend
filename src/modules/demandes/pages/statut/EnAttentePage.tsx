/**
 * Page En Attente - Demandes en attente de validation
 * Avec modal de détail et sélection multiple
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useDemandesByStatus } from '../../hooks/useDemandesData';
import { useBatchValidateDemandes, useBatchRejectDemandes } from '../../hooks/useDemandesMutations';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { BatchActionsBar } from '@/components/features/bmo/demandes/BatchActionsBar';
import { Pagination } from '../../components/Pagination';
import { TableSortHeader, type SortOrder } from '../../components/TableSortHeader';
import { EmptyError } from '@/components/features/bmo/EmptyStates';
import { SkeletonCard } from '@/components/features/bmo/LoadingStates';
import { cn } from '@/lib/utils';
import { Clock, FileCheck, User, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Demande } from '../../types/demandesTypes';

interface EnAttentePageProps {
  filterService?: string;
}

export function EnAttentePage({ filterService }: EnAttentePageProps = {}) {
  const { data: demandes, isLoading, error, refetch } = useDemandesByStatus('pending');
  const { selectedItems, toggleItemSelection, clearSelection, selectAllItems, openModal, tableConfig, setTableConfig } = useDemandesCommandCenterStore();
  const { mutate: batchValidate, isPending: isValidating } = useBatchValidateDemandes();
  const { mutate: batchReject, isPending: isRejecting } = useBatchRejectDemandes();
  const [sortKey, setSortKey] = useState<string | null>(tableConfig.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>(tableConfig.sortOrder || 'desc');

  // Filtrer par service si fourni (niveau 3)
  const filteredDemandes = useMemo(() => {
    if (!demandes) return [];
    let result = demandes;
    
    // Filtrer par service
    if (filterService) {
      result = result.filter((d) => d.service === filterService);
    }

    // Trier
    if (sortKey && sortOrder) {
      result = [...result].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortKey) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'reference':
            aValue = a.reference.toLowerCase();
            bValue = b.reference.toLowerCase();
            break;
          case 'createdAt':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          case 'montant':
            aValue = a.montant || 0;
            bValue = b.montant || 0;
            break;
          case 'priority':
            const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
            aValue = priorityOrder[a.priority] || 3;
            bValue = priorityOrder[b.priority] || 3;
            break;
          case 'service':
            aValue = a.service.toLowerCase();
            bValue = b.service.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [demandes, filterService, sortKey, sortOrder]);

  // Pagination
  const paginatedDemandes = useMemo(() => {
    const start = (tableConfig.currentPage - 1) * tableConfig.pageSize;
    const end = start + tableConfig.pageSize;
    return filteredDemandes.slice(start, end);
  }, [filteredDemandes, tableConfig.currentPage, tableConfig.pageSize]);

  const totalPages = Math.ceil(filteredDemandes.length / tableConfig.pageSize);

  const handleSort = (key: string, order: SortOrder) => {
    setSortKey(order ? key : null);
    setSortOrder(order);
    setTableConfig({ sortBy: key, sortOrder: order || 'desc' });
  };

  const handlePageChange = (page: number) => {
    setTableConfig({ currentPage: page });
  };

  const handlePageSizeChange = (size: number) => {
    setTableConfig({ pageSize: size, currentPage: 1 });
  };

  const handleCardClick = (demande: Demande) => {
    openModal('detail', { demandeId: demande.id });
  };

  // Batch actions
  const handleBatchValidate = () => {
    openModal('confirm', {
      title: 'Confirmer la validation en masse',
      message: `Êtes-vous sûr de vouloir valider ${selectedItems.length} demande(s) ?`,
      variant: 'default',
      onConfirm: () => {
        batchValidate({ ids: selectedItems }, {
          onSuccess: () => clearSelection(),
        });
      },
    });
  };

  const handleBatchReject = () => {
    openModal('confirm', {
      title: 'Confirmer le rejet en masse',
      message: `Êtes-vous sûr de vouloir rejeter ${selectedItems.length} demande(s) ?`,
      variant: 'destructive',
      onConfirm: () => {
        batchReject({ ids: selectedItems }, {
          onSuccess: () => clearSelection(),
        });
      },
    });
  };

  const handleBatchExport = () => {
    const selectedDemandesData = filteredDemandes?.filter((d) => selectedItems.includes(d.id)) || [];
    openModal('export', { data: selectedDemandesData });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyError
          onRetry={() => refetch()}
          error={error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des demandes'}
        />
      </div>
    );
  }

  const demandesData = paginatedDemandes || [];
  const allIds = filteredDemandes.map((d) => d.id);
  const allSelected = selectedItems.length > 0 && selectedItems.length === filteredDemandes.length;

  return (
    <>
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-200 mb-2">Demandes en attente</h1>
            <p className="text-slate-400">
              {filteredDemandes.length} demande{filteredDemandes.length > 1 ? 's' : ''} en attente de traitement
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Select all checkbox */}
            {demandesData.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectAllItems(allIds);
                    } else {
                      clearSelection();
                    }
                  }}
                />
                <span className="text-sm text-slate-400">Tout sélectionner</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
              <span className="text-amber-400 font-medium">{demandesData.length}</span>
            </div>
          </div>
        </div>

        {/* Tri et Filtres */}
        {filteredDemandes.length > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <div className="flex items-center gap-4">
              <TableSortHeader
                label="Date"
                sortKey="createdAt"
                currentSortKey={sortKey || undefined}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableSortHeader
                label="Référence"
                sortKey="reference"
                currentSortKey={sortKey || undefined}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableSortHeader
                label="Montant"
                sortKey="montant"
                currentSortKey={sortKey || undefined}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <TableSortHeader
                label="Priorité"
                sortKey="priority"
                currentSortKey={sortKey || undefined}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
          </div>
        )}

        {/* Liste des demandes */}
        {filteredDemandes.length === 0 ? (
          <div className="p-12 text-center rounded-lg border border-slate-700/50 bg-slate-800/30">
            <FileCheck className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune demande en attente</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {demandesData.map((demande) => (
                <DemandeCard
                  key={demande.id}
                  demande={demande}
                  isSelected={selectedItems.includes(demande.id)}
                  onSelect={(id) => toggleItemSelection(id)}
                  onClick={() => handleCardClick(demande)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={tableConfig.currentPage}
                totalPages={totalPages}
                pageSize={tableConfig.pageSize}
                totalItems={filteredDemandes.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}
      </div>

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedItems.length}
        onApprove={handleBatchValidate}
        onReject={handleBatchReject}
        onExport={handleBatchExport}
        onClear={clearSelection}
      />

    </>
  );
}

interface DemandeCardProps {
  demande: Demande;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onClick: () => void;
}

function DemandeCard({ demande, isSelected, onSelect, onClick }: DemandeCardProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(demande.id);
  };

  const handleCardClick = () => {
    onClick();
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border bg-slate-800/30 transition-colors cursor-pointer group',
        isSelected
          ? 'border-blue-500/50 bg-blue-500/10'
          : 'border-slate-700/50 hover:bg-slate-800/50'
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox pour sélection */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelect(demande.id);
            }
          }}
          onClick={handleCheckboxClick}
          className="mt-1"
        />

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
            <div className="flex-1">
              <h3 className="text-base font-medium text-slate-200 group-hover:text-orange-400 transition-colors">
                {demande.title}
              </h3>
              <div className="text-sm text-slate-400 mt-1 font-mono">{demande.reference}</div>
            </div>
          </div>
          {demande.description && (
            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{demande.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{demande.createdBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(demande.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="capitalize">{demande.service}</div>
            {demande.montant && (
              <div className="text-slate-400">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(demande.montant)}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              demande.priority === 'critical'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : demande.priority === 'high'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
            )}
          >
            {demande.priority === 'critical' ? 'Critique' : demande.priority === 'high' ? 'Haute' : 'Normale'}
          </span>
        </div>
      </div>
    </div>
  );
}
