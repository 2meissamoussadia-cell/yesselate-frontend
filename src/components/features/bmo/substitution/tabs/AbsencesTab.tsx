/**
 * ====================================================================
 * TAB: Gestion des Absences
 * Vue complète des absences avec calendrier et statistiques
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Clock, Filter, Plus, TrendingUp, AlertCircle, Loader2, Eye } from 'lucide-react';
import { absencesApiService } from '@/lib/services/absencesApiService';
import { AbsenceDetailModal } from '@/components/features/bmo/substitution/modals';
import type { Absence, AbsenceStats, AbsenceFilter } from '@/lib/types/substitution.types';

export function AbsencesTab() {
  const [loading, setLoading] = useState(true);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [stats, setStats] = useState<AbsenceStats | null>(null);
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    bureau: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState<string | null>(null);

  const apiFilter: AbsenceFilter | undefined = (() => {
    if (!filter.type && !filter.status && !filter.bureau) return undefined;
    const f: AbsenceFilter = {};
    if (filter.type) f.type = filter.type as Absence['type'];
    if (filter.status) f.status = filter.status as Absence['status'];
    if (filter.bureau) f.bureau = filter.bureau;
    return Object.keys(f).length > 0 ? f : undefined;
  })();

  useEffect(() => {
    loadAbsences();
  }, [filter]);

  const loadAbsences = async () => {
    setLoading(true);
    try {
      const { data } = await absencesApiService.getAll(
        apiFilter,
        'startDate',
        1,
        50
      );
      const statsData = await absencesApiService.getStats(apiFilter);
      
      setAbsences(data);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading absences:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      maladie: 'bg-red-500/20 text-red-400 border-red-500/30',
      conge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      formation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      autre: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return colors[type as keyof typeof colors] || colors.autre;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
      approved: { label: 'Approuvée', color: 'bg-green-500/20 text-green-400' },
      rejected: { label: 'Rejetée', color: 'bg-red-500/20 text-red-400' },
    };
    const c = config[status as keyof typeof config] || config.pending;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  const handleOpenDetail = (absence: Absence) => {
    setSelectedAbsenceId(absence.id);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedAbsenceId(null);
    // Reload absences after modal closes
    loadAbsences();
  };

  return (
    <>
      {/* Detail Modal Overlay */}
      {selectedAbsenceId && (
        <AbsenceDetailModal
          open={detailModalOpen}
          onClose={handleCloseDetail}
          absenceId={selectedAbsenceId}
        />
      )}

      <div className="h-full flex flex-col">
      {/* Header with Stats */}
      <div className="flex-shrink-0 p-6 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Gestion des Absences</h2>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle absence
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-5 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">Total</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">En cours</div>
              <div className="text-2xl font-bold text-green-400">{stats.currentAbsences}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">À venir</div>
              <div className="text-2xl font-bold text-blue-400">{stats.upcomingAbsences}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">Durée moyenne</div>
              <div className="text-2xl font-bold text-purple-400">{stats.averageDuration}j</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">En attente</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.byStatus.pending || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and View Toggle */}
      <div className="flex-shrink-0 p-4 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="maladie">Maladie</option>
              <option value="conge">Congés</option>
              <option value="formation">Formation</option>
              <option value="autre">Autre</option>
            </select>

            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvée</option>
              <option value="rejected">Rejetée</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Calendrier
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : absences.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Aucune absence trouvée
          </div>
        ) : (
          <div className="space-y-3">
            {absences.map((absence) => {
              const duration = Math.ceil(
                (new Date(absence.endDate).getTime() - new Date(absence.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={absence.id}
                  className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group"
                  onClick={() => handleOpenDetail(absence)}
                >
                  <div className="flex items-start gap-4">
                    {/* Employee Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {absence.employee.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-white">{absence.employee.name}</div>
                          <div className="text-sm text-slate-400">
                            {absence.employee.role} • {absence.employee.bureau}
                          </div>
                        </div>
                        {getStatusBadge(absence.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                        <span className={`px-2 py-1 rounded border ${getTypeColor(absence.type)}`}>
                          {absencesApiService.getTypeLabel(absence.type)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(absence.startDate).toLocaleDateString('fr-FR')} → {new Date(absence.endDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {duration} jour{duration > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="text-sm text-slate-300">{absence.reason}</div>
                      {absence.description && (
                        <div className="text-sm text-slate-500 mt-1">{absence.description}</div>
                      )}
                    </div>

                    {/* Eye Icon - appears on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </>
  );
}

