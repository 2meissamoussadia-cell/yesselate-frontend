/**
 * ====================================================================
 * TAB: Gestion des Délégations
 * Vue complète des délégations avec règles et permissions
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Clock, Plus, Settings, Loader2, AlertCircle, Eye } from 'lucide-react';
import { delegationsApiService } from '@/lib/services/delegationsApiService';
import { DelegationDetailModal } from '@/components/features/bmo/substitution/modals';
import type { Delegation, DelegationStats, DelegationRule, DelegationFilter } from '@/lib/types/substitution.types';

export function DelegationsTab() {
  const [loading, setLoading] = useState(true);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [rules, setRules] = useState<DelegationRule[]>([]);
  const [stats, setStats] = useState<DelegationStats | null>(null);
  const [activeView, setActiveView] = useState<'delegations' | 'rules'>('delegations');
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDelegationId, setSelectedDelegationId] = useState<string | null>(null);

  const apiFilter: DelegationFilter | undefined = (() => {
    if (!filter.type && !filter.status) return undefined;
    const f: DelegationFilter = {};
    if (filter.type) f.type = filter.type as Delegation['type'];
    if (filter.status) f.status = filter.status as Delegation['status'];
    return Object.keys(f).length > 0 ? f : undefined;
  })();

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await delegationsApiService.getAll(apiFilter, 'createdAt', 1, 50);
      const rulesData = await delegationsApiService.getRules();
      const statsData = await delegationsApiService.getStats(apiFilter);
      
      setDelegations(data);
      setRules(rulesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading delegations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: 'Active', color: 'bg-green-500/20 text-green-400' },
      inactive: { label: 'Inactive', color: 'bg-slate-500/20 text-slate-400' },
      revoked: { label: 'Révoquée', color: 'bg-red-500/20 text-red-400' },
    };
    const c = config[status as keyof typeof config] || config.active;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  const getTypeColor = (type: string) => {
    return type === 'permanent'
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const handleOpenDetail = (delegation: Delegation) => {
    setSelectedDelegationId(delegation.id);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedDelegationId(null);
    // Reload delegations after modal closes
    loadData();
  };

  return (
    <>
      {/* Detail Modal Overlay */}
      {selectedDelegationId && (
        <DelegationDetailModal
          open={detailModalOpen}
          onClose={handleCloseDetail}
          delegationId={selectedDelegationId}
        />
      )}

      <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Gestion des Délégations</h2>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle délégation
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">Total</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">Actives</div>
              <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">Temporaires</div>
              <div className="text-2xl font-bold text-blue-400">{stats.temporary}</div>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400">Permanentes</div>
              <div className="text-2xl font-bold text-purple-400">{stats.permanent}</div>
            </div>
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex-shrink-0 border-b border-slate-700 bg-slate-900">
        <div className="flex gap-2 p-2">
          <button
            onClick={() => setActiveView('delegations')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeView === 'delegations'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Délégations ({delegations.length})
          </button>
          <button
            onClick={() => setActiveView('rules')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeView === 'rules'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            Règles ({rules.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : activeView === 'delegations' ? (
          <div className="space-y-3">
            {delegations.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Aucune délégation trouvée
              </div>
            ) : (
              delegations.map((delegation) => (
                <div
                  key={delegation.id}
                  className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group"
                  onClick={() => handleOpenDetail(delegation)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {delegation.fromUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{delegation.fromUser.name}</div>
                        <div className="text-sm text-slate-400">{delegation.fromUser.role}</div>
                      </div>
                      <div className="text-slate-500">→</div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                        {delegation.toUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{delegation.toUser.name}</div>
                        <div className="text-sm text-slate-400">{delegation.toUser.role}</div>
                      </div>
                    </div>
                    {getStatusBadge(delegation.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className={`px-2 py-1 rounded border ${getTypeColor(delegation.type)}`}>
                      {delegationsApiService.getTypeLabel(delegation.type)}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(delegation.startDate).toLocaleDateString('fr-FR')} →{' '}
                      {delegation.endDate ? new Date(delegation.endDate).toLocaleDateString('fr-FR') : 'Indéfini'}
                    </span>
                  </div>

                  <div className="text-sm text-slate-300 mb-2">{delegation.reason}</div>

                  <div className="flex flex-wrap gap-1">
                    {delegation.permissions.slice(0, 5).map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                      >
                        <Shield className="w-3 h-3 inline mr-1" />
                        {perm}
                      </span>
                    ))}
                    {delegation.permissions.length > 5 && (
                      <span className="px-2 py-1 text-xs text-slate-500">
                        +{delegation.permissions.length - 5} autres
                      </span>
                    )}
                  </div>

                  {/* Eye Icon - appears on hover */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Aucune règle définie
              </div>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-white">{rule.name}</div>
                      <div className="text-sm text-slate-400 mt-1">{rule.description}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">De</div>
                      <div className="text-white">{rule.fromRole || 'Tous'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Vers</div>
                      <div className="text-white">{rule.toRole || 'Tous'}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {rule.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>

                  {rule.conditions?.maxDuration && (
                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Durée maximale: {rule.conditions.maxDuration} jours
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}

