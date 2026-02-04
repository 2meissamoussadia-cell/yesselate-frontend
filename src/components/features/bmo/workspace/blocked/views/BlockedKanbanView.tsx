/**
 * ====================================================================
 * VUE KANBAN : Dossiers Bloqués - Drag & Drop
 * 6 colonnes statut avec cartes riches interactives
 * ====================================================================
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  AlertTriangle,
  User,
  Building2,
  DollarSign,
  TrendingUp,
  Filter,
  Grid3x3,
  List,
  RefreshCw,
  Download,
  MoreVertical,
  Eye,
  Move,
} from 'lucide-react';
import { useBlockedCommandCenterStore } from '@/lib/stores/blockedCommandCenterStore';
import { blockedApi, type BlockedFilter } from '@/lib/services/blockedApiService';
import { blockedMockData } from '@/lib/mocks/blockedMockData';
import type { BlockedDossier } from '@/lib/types/bmo.types';

interface BlockedKanbanViewProps {
  className?: string;
}

type KanbanColumn = 'new' | 'analysed' | 'in-progress' | 'escalated' | 'resolved' | 'closed';

interface KanbanDossier extends BlockedDossier {
  status: KanbanColumn;
}

const COLUMN_CONFIG: Record<
  KanbanColumn,
  { label: string; color: string; icon: React.ReactNode; description: string }
> = {
  new: {
    label: 'Nouveau',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    icon: <Clock className="h-4 w-4" />,
    description: 'Dossiers nouvellement détectés',
  },
  analysed: {
    label: 'Analysé',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: <Eye className="h-4 w-4" />,
    description: 'Cause identifiée, solution en cours',
  },
  'in-progress': {
    label: 'En cours',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Résolution active',
  },
  escalated: {
    label: 'Escaladé',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: <AlertTriangle className="h-4 w-4" />,
    description: 'Remontée hiérarchique',
  },
  resolved: {
    label: 'Résolu',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: <Clock className="h-4 w-4" />,
    description: 'Déblocage effectué',
  },
  closed: {
    label: 'Fermé',
    color: 'bg-slate-700/20 text-slate-400 border-slate-700/30',
    icon: <Clock className="h-4 w-4" />,
    description: 'Dossier archivé',
  },
};

export function BlockedKanbanView({ className }: BlockedKanbanViewProps) {
  const { openModal, filters: storeFilters } = useBlockedCommandCenterStore();
  const [dossiers, setDossiers] = useState<KanbanDossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDossier, setDraggedDossier] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<KanbanColumn | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'extended'>('extended');
  const [filters, setFilters] = useState<{
    impact: ('critical' | 'high' | 'medium' | 'low')[];
    bureaux: string[];
  }>({ impact: [], bureaux: [] });

  // Charger dossiers depuis API
  useEffect(() => {
    const loadDossiers = async () => {
      setLoading(true);
      try {
        // TODO: Utiliser API réelle
        // const apiFilter: BlockedFilter = {
        //   ...convertFiltersToApi(storeFilters),
        // };
        // const result = await blockedApi.getAll(apiFilter);
        
        // Mock data pour l'instant
        const mockDossiers: KanbanDossier[] = blockedMockData.dossiers.map((d, idx) => ({
          ...d,
          status: (['new', 'analysed', 'in-progress', 'escalated', 'resolved', 'closed'][idx % 6] ||
            'new') as KanbanColumn,
        }));
        
        setDossiers(mockDossiers);
      } catch (error) {
        console.error('Failed to load dossiers:', error);
        // Fallback sur mock data
        const mockDossiers: KanbanDossier[] = blockedMockData.dossiers.map((d, idx) => ({
          ...d,
          status: (['new', 'analysed', 'in-progress', 'escalated', 'resolved', 'closed'][idx % 6] ||
            'new') as KanbanColumn,
        }));
        setDossiers(mockDossiers);
      } finally {
        setLoading(false);
      }
    };

    loadDossiers();
  }, [storeFilters]);

  // Filtrer dossiers
  const filteredDossiers = useMemo(() => {
    return dossiers.filter((d) => {
      if (filters.impact.length > 0 && !filters.impact.includes(d.impact as any)) return false;
      if (filters.bureaux.length > 0 && !filters.bureaux.includes(d.bureau)) return false;
      return true;
    });
  }, [dossiers, filters]);

  // Grouper par colonne
  const dossiersByColumn = useMemo(() => {
    const grouped: Record<KanbanColumn, KanbanDossier[]> = {
      new: [],
      analysed: [],
      'in-progress': [],
      escalated: [],
      resolved: [],
      closed: [],
    };

    filteredDossiers.forEach((d) => {
      grouped[d.status].push(d);
    });

    return grouped;
  }, [filteredDossiers]);

  // Stats par colonne
  const columnStats = useMemo(() => {
    return Object.entries(dossiersByColumn).reduce(
      (acc, [column, items]) => {
        acc[column as KanbanColumn] = {
          count: items.length,
          totalAmount: items.reduce(
            (sum, d) => sum + (Number(d.amount) || 0),
            0
          ),
        };
        return acc;
      },
      {} as Record<KanbanColumn, { count: number; totalAmount: number }>
    );
  }, [dossiersByColumn]);

  // Drag handlers
  const handleDragStart = useCallback((dossierId: string) => {
    setDraggedDossier(dossierId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, column: KanbanColumn) => {
    e.preventDefault();
    setDraggedOverColumn(column);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDraggedOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetColumn: KanbanColumn) => {
      e.preventDefault();
      if (!draggedDossier) return;

      const originalDossier = dossiers.find((d) => d.id === draggedDossier);
      if (!originalDossier) return;

      // Mise à jour locale immédiate (optimistic update)
      setDossiers((prev) =>
        prev.map((d) => (d.id === draggedDossier ? { ...d, status: targetColumn } : d))
      );

      setDraggedDossier(null);
      setDraggedOverColumn(null);

      try {
        // TODO: API PATCH /api/bmo/blocked/[id]/update avec nouveau status
        // const statusMap: Record<KanbanColumn, string> = {
        //   new: 'pending',
        //   analysed: 'pending',
        //   'in-progress': 'pending',
        //   escalated: 'escalated',
        //   resolved: 'resolved',
        //   closed: 'resolved',
        // };
        // await blockedApi.update(draggedDossier, { status: statusMap[targetColumn] });
        
        // Toast notification
        // showToast('success', `Dossier déplacé vers "${COLUMN_CONFIG[targetColumn].label}"`);
      } catch (error) {
        console.error('Failed to update dossier status:', error);
        // Rollback en cas d'erreur
        setDossiers((prev) =>
          prev.map((d) => (d.id === draggedDossier ? originalDossier : d))
        );
        // showToast('error', 'Échec de la mise à jour du statut');
      }
    },
    [draggedDossier, dossiers]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedDossier(null);
    setDraggedOverColumn(null);
  }, []);

  // Ouvrir modal détails enrichi
  const handleOpenDetails = useCallback(
    (dossier: KanbanDossier) => {
      openModal('dossier-detail', { dossierId: dossier.id });
    },
    [openModal]
  );

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Format montant
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return `${amount}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header avec stats et toolbar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Vue Kanban</h2>
            <p className="text-sm text-slate-400">
              {filteredDossiers.length} dossiers bloqués
            </p>
          </div>

          {/* Stats globales */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-400">Critiques:</span>
              <span className="text-white font-medium">
                {filteredDossiers.filter((d) => d.impact === 'critical').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-slate-400">Urgents:</span>
              <span className="text-white font-medium">
                {filteredDossiers.filter((d) => d.delay >= 7).length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
              className="h-7 px-3"
            >
              <Grid3x3 className="h-3.5 w-3.5 mr-1.5" />
              Compact
            </Button>
            <Button
              variant={viewMode === 'extended' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('extended')}
              className="h-7 px-3"
            >
              <List className="h-3.5 w-3.5 mr-1.5" />
              Étendu
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
        {Object.entries(COLUMN_CONFIG).map(([columnKey, config]) => {
          const column = columnKey as KanbanColumn;
          const columnDossiers = dossiersByColumn[column];
          const stats = columnStats[column];
          const isDraggedOver = draggedOverColumn === column;

          return (
            <div
              key={column}
              className={cn(
                'flex-shrink-0 w-full min-w-[280px] bg-slate-900/50 border rounded-lg p-3 transition-all',
                isDraggedOver
                  ? 'border-blue-500 border-2 bg-blue-500/10'
                  : 'border-slate-800'
              )}
              onDragOver={(e) => handleDragOver(e, column)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column)}
            >
              {/* Column Header */}
              <div className={cn('flex items-center justify-between mb-3 p-2 rounded-lg', config.color)}>
                <div className="flex items-center gap-2">
                  {config.icon}
                  <div>
                    <div className="font-semibold text-sm">{config.label}</div>
                    <div className="text-xs opacity-80">{config.description}</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-slate-900/50 border-slate-700 text-white">
                  {stats.count}
                </Badge>
              </div>

              {/* Column Stats */}
              {stats.totalAmount > 0 && (
                <div className="mb-3 text-xs text-slate-400 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{formatAmount(stats.totalAmount)} FCFA</span>
                </div>
              )}

              {/* Cards */}
              <div className="space-y-2 min-h-[200px]">
                {columnDossiers.map((dossier) => {
                  const isDragged = draggedDossier === dossier.id;

                  return (
                    <div
                      key={dossier.id}
                      draggable
                      onDragStart={() => handleDragStart(dossier.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleOpenDetails(dossier)}
                      className={cn(
                        'bg-slate-800/50 border rounded-lg p-3 cursor-pointer hover:bg-slate-800 hover:border-slate-700 transition-all group',
                        isDragged && 'opacity-50 scale-95',
                        viewMode === 'compact' ? 'p-2' : 'p-3'
                      )}
                    >
                      {/* Drag handle */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white text-sm truncate">
                              {dossier.id}
                            </span>
                            <Badge
                              className={cn('text-xs h-4', getImpactColor(dossier.impact || 'medium'))}
                            >
                              {dossier.impact || 'medium'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                            {dossier.reason}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Move className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>

                      {/* Metadata */}
                      {viewMode === 'extended' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Building2 className="h-3 w-3" />
                              <span>{dossier.bureau}</span>
                            </div>
                            <div className="flex items-center gap-1 text-orange-400">
                              <Clock className="h-3 w-3" />
                              <span>{dossier.delay}j</span>
                            </div>
                          </div>

                          {dossier.amount && (
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatAmount(Number(dossier.amount) || 0)} FCFA</span>
                            </div>
                          )}

                          {/* SLA indicator */}
                          {dossier.delay >= 7 && (
                            <div className="flex items-center gap-1 text-xs text-red-400">
                              <AlertTriangle className="h-3 w-3" />
                              <span>SLA dépassé</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick actions (hover) */}
                      {viewMode === 'extended' && (
                        <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Empty state */}
                {columnDossiers.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <p>Aucun dossier</p>
                  </div>
                )}

                {/* Drop zone indicator */}
                {isDraggedOver && columnDossiers.length === 0 && (
                  <div className="border-2 border-dashed border-blue-500 rounded-lg p-4 text-center text-blue-400 text-sm">
                    Déposer ici
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
