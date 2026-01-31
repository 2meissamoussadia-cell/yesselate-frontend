/**
 * Page Urgentes - Demandes urgentes nécessitant une attention immédiate
 */

'use client';

import React, { useMemo, useState } from 'react';
import { useDemandesByStatus } from '../../hooks/useDemandesData';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { Pagination } from '../../components/Pagination';
import { TableSortHeader, type SortOrder } from '../../components/TableSortHeader';
import { EmptyError } from '@/components/features/bmo/EmptyStates';
import { SkeletonCard } from '@/components/features/bmo/LoadingStates';
import { EmptyState } from '@/components/features/bmo/EmptyStates';
import { AlertCircle } from 'lucide-react';
import type { Demande } from '../../types/demandesTypes';

interface UrgentesPageProps {
  filterService?: string;
}

export function UrgentesPage({ filterService }: UrgentesPageProps = {}) {
  const { data: demandes, isLoading, error, refetch } = useDemandesByStatus('urgent');
  const { openModal, tableConfig, setTableConfig } = useDemandesCommandCenterStore();
  const [sortKey, setSortKey] = useState<string | null>(tableConfig.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>(tableConfig.sortOrder || 'desc');

  // Filtrer par service si fourni (niveau 3)
  const filteredDemandes = useMemo(() => {
    if (!demandes) return [];
    let result = demandes;
    
    if (filterService) {
      result = result.filter((d) => d.service === filterService);
    }

    // Trier
    if (sortKey && sortOrder) {
      result = [...result].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortKey) {
          case 'createdAt':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          case 'reference':
            aValue = a.reference.toLowerCase();
            bValue = b.reference.toLowerCase();
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Demandes urgentes</h1>
          <p className="text-slate-400">{filteredDemandes.length} demande{filteredDemandes.length > 1 ? 's' : ''} nécessitant une attention immédiate</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10">
          <span className="text-red-400 font-medium text-xl">{filteredDemandes.length}</span>
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
              label="Priorité"
              sortKey="priority"
              currentSortKey={sortKey || undefined}
              currentSortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
        </div>
      )}

      {filteredDemandes.length === 0 ? (
        <EmptyState
          type="no-data"
          title="Aucune demande urgente"
          message="Toutes les demandes ont été traitées"
          icon={<AlertCircle className="w-12 h-12 text-slate-400" />}
        />
      ) : (
        <>
          <div className="space-y-3">
            {demandesData.map((demande) => (
              <UrgenteCard key={demande.id} demande={demande} onClick={() => handleCardClick(demande)} />
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
  );
}

function UrgenteCard({ demande, onClick }: { demande: Demande; onClick?: () => void }) {
  return (
    <div
      className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0 mt-1.5" />
            <div>
              <h3 className="text-base font-medium text-slate-200">{demande.title}</h3>
              <div className="text-sm text-slate-400 mt-1">{demande.reference}</div>
            </div>
          </div>
          {demande.description && (
            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{demande.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{demande.createdBy}</span>
            <span>{new Date(demande.createdAt).toLocaleDateString('fr-FR')}</span>
            <span className="capitalize">{demande.service}</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          URGENTE
        </div>
      </div>
    </div>
  );
}

