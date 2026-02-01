/**
 * ContentRouter pour Délégations
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { Key, Loader2, AlertTriangle, History, BarChart3, Settings, TrendingUp, TrendingDown, Calendar, Clock, Shield, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DelegationWorkspaceContent } from '@/components/features/delegations/workspace/DelegationWorkspaceContent';
import { DelegationInboxView } from '@/components/features/delegations/workspace/views/DelegationInboxView';
import { useDelegationWorkspaceStore } from '@/lib/stores/delegationWorkspaceStore';
import { useDelegationsCommandCenterStore } from '@/lib/stores/delegationsCommandCenterStore';
import { useDelegationsStats } from '@/components/features/delegations/hooks/useDelegationsStats';

interface ContentRouterProps {
  category: string;
  subCategory: string;
}

export const DelegationsContentRouter = React.memo(function DelegationsContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  const { navigate } = useDelegationsCommandCenterStore();

  // Vue d'ensemble - Dashboard
  if (category === 'overview') {
    return <OverviewView onNavigate={navigate as (main: string, sub?: string | null, filter?: string | null) => void} />;
  }

  // Catégories avec vues inbox
  if (['active', 'expired', 'revoked', 'suspended', 'expiring_soon'].includes(category)) {
    const queueMap: Record<string, 'active' | 'expired' | 'revoked' | 'suspended' | 'expiring_soon'> = {
      active: 'active',
      expired: 'expired',
      revoked: 'revoked',
      suspended: 'suspended',
      expiring_soon: 'expiring_soon',
    };

    const queue = queueMap[category] || 'active';
    
    // Créer un onglet temporaire pour la vue
    const tabId = `inbox:${queue}`;
    const tab = {
      id: tabId,
      type: 'inbox' as const,
      title: category === 'active' ? 'Actives' : 
             category === 'expired' ? 'Expirées' :
             category === 'revoked' ? 'Révoquées' :
             category === 'suspended' ? 'Suspendues' :
             'Expirant bientôt',
      icon: category === 'active' ? '✅' : 
            category === 'expired' ? '📅' :
            category === 'revoked' ? '🚫' :
            category === 'suspended' ? '⏸️' :
            '⏰',
      data: { queue },
      createdAt: Date.now(),
    };

    return (
      <div className="h-full">
        <DelegationInboxView tab={tab} />
      </div>
    );
  }

  // Historique
  if (category === 'history') {
    return <HistoryView />;
  }

  // Analytiques
  if (category === 'analytics') {
    return <AnalyticsView />;
  }

  // Paramètres
  if (category === 'settings') {
    return <SettingsView />;
  }

  // Par défaut, utiliser le composant existant
  return (
    <div className="p-4">
      <DelegationWorkspaceContent />
    </div>
  );
});

// ================================
// Overview View
// ================================
const OverviewView = React.memo(function OverviewView({
  onNavigate,
}: {
  onNavigate: (main: string, sub?: string | null, filter?: string | null) => void;
}) {
  const { stats, loading } = useDelegationsStats(true, 30000);
  const { openModal } = useDelegationsCommandCenterStore();

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
            <Key className="h-7 w-7 text-purple-500" />
            Vue d'ensemble des Délégations
          </h2>
          <p className="text-slate-400 mt-1">
            Gérez les délégations de pouvoirs avec une traçabilité complète
          </p>
        </div>
        <button
          onClick={() => openModal('stats')}
          className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Statistiques détaillées
        </button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Actives"
              value={stats.active}
              icon={Shield}
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
              borderColor="border-emerald-500/30"
              onClick={() => onNavigate('active')}
            />
            <StatCard
              title="Expirant bientôt"
              value={stats.expiringSoon}
              icon={Clock}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
              borderColor="border-amber-500/30"
              onClick={() => onNavigate('expiring_soon')}
            />
            <StatCard
              title="Expirées"
              value={stats.expired}
              icon={Calendar}
              color="text-slate-400"
              bgColor="bg-slate-500/10"
              borderColor="border-slate-500/30"
              onClick={() => onNavigate('expired')}
            />
            <StatCard
              title="Révoquées"
              value={stats.revoked}
              icon={AlertTriangle}
              color="text-rose-400"
              bgColor="bg-rose-500/10"
              borderColor="border-rose-500/30"
              onClick={() => onNavigate('revoked')}
            />
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Suspendues"
              value={stats.suspended}
              icon={AlertTriangle}
              color="text-orange-400"
              bgColor="bg-orange-500/10"
              borderColor="border-orange-500/30"
              onClick={() => onNavigate('suspended')}
            />
            <StatCard
              title="Total"
              value={stats.total}
              icon={Users}
              color="text-slate-300"
              bgColor="bg-slate-800/40"
              borderColor="border-slate-700/50"
            />
            <StatCard
              title="Utilisations"
              value={stats.totalUsage}
              icon={TrendingUp}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
              borderColor="border-blue-500/30"
            />
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Par Bureau */}
            {stats.byBureau && stats.byBureau.length > 0 && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Répartition par Bureau
                </h3>
                <div className="space-y-3">
                  {stats.byBureau.slice(0, 8).map((item) => (
                    <div key={item.bureau} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{item.bureau}</span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min((item.count / stats.total) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-400 w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Par Type */}
            {stats.byType && stats.byType.length > 0 && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-400" />
                  Répartition par Type
                </h3>
                <div className="space-y-3">
                  {stats.byType.slice(0, 8).map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{item.type}</span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min((item.count / stats.total) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-400 w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {stats.recentActivity && stats.recentActivity.length > 0 && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" />
                Activité Récente
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.recentActivity.slice(0, 10).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">
                        <span className="font-medium">{activity.agentName}</span>
                        {' - '}
                        <span className="text-slate-400">{activity.action}</span>
                        {activity.details && (
                          <span className="text-slate-400 text-xs ml-1">({activity.details})</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(activity.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CategoryCard
              title="Actives"
              description="Délégations en cours"
              icon={Shield}
              onClick={() => onNavigate('active')}
            />
            <CategoryCard
              title="Expirant bientôt"
              description="À renouveler rapidement"
              icon={Clock}
              onClick={() => onNavigate('expiring_soon')}
            />
            <CategoryCard
              title="Expirées"
              description="Délégations expirées"
              icon={Calendar}
              onClick={() => onNavigate('expired')}
            />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">Impossible de charger les statistiques</p>
        </div>
      )}
    </div>
  );
});

// ================================
// History View
// ================================
const HistoryView = React.memo(function HistoryView() {
  const { openModal } = useDelegationsCommandCenterStore();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
            <History className="h-7 w-7 text-purple-500" />
            Historique des Délégations
          </h2>
          <p className="text-slate-400 mt-1">
            Consultation de l'historique complet des délégations
          </p>
        </div>
        <button
          onClick={() => openModal('export', { format: 'csv' })}
          className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-colors text-sm"
        >
          Exporter
        </button>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
        <div className="text-center py-12">
          <History className="h-16 w-16 text-slate-600 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Historique complet</h3>
          <p className="text-slate-400 mb-4">
            Visualisation de l'historique des délégations avec filtres avancés
          </p>
          <p className="text-sm text-slate-600">
            Fonctionnalité en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Analytics View
// ================================
const AnalyticsView = React.memo(function AnalyticsView() {
  const { stats, loading } = useDelegationsStats(true, 30000);
  const { openModal } = useDelegationsCommandCenterStore();

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-purple-500" />
            Analytiques des Délégations
          </h2>
          <p className="text-slate-400 mt-1">
            Analyses et statistiques détaillées des délégations
          </p>
        </div>
        <button
          onClick={() => openModal('stats')}
          className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors text-sm flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Statistiques complètes
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">Total</h3>
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-slate-200">{stats.total}</div>
              <div className="text-xs text-slate-400 mt-2">délégations</div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">Utilisations</h3>
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-slate-200">{stats.totalUsage}</div>
              <div className="text-xs text-slate-400 mt-2">utilisations totales</div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">Bureaux actifs</h3>
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-slate-200">{stats.byBureau?.length || 0}</div>
              <div className="text-xs text-slate-400 mt-2">bureaux</div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">Types</h3>
                <Key className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-slate-200">{stats.byType?.length || 0}</div>
              <div className="text-xs text-slate-400 mt-2">types différents</div>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Par Bureau - Bar Chart */}
            {stats.byBureau && stats.byBureau.length > 0 && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Répartition par Bureau
                </h3>
                <div className="space-y-3">
                  {stats.byBureau
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((item, idx) => (
                      <div key={item.bureau} className="flex items-center gap-3">
                        <div className="w-8 text-xs text-slate-400 text-right">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-300">{item.bureau}</span>
                            <span className="text-sm text-slate-400">{item.count}</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                              style={{
                                width: `${Math.min((item.count / (stats.byBureau?.[0]?.count || 1)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Par Type - Bar Chart */}
            {stats.byType && stats.byType.length > 0 && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-400" />
                  Répartition par Type
                </h3>
                <div className="space-y-3">
                  {stats.byType
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((item, idx) => (
                      <div key={item.type} className="flex items-center gap-3">
                        <div className="w-8 text-xs text-slate-400 text-right">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-300">{item.type}</span>
                            <span className="text-sm text-slate-400">{item.count}</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                              style={{
                                width: `${Math.min((item.count / (stats.byType?.[0]?.count || 1)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Distribution */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Répartition par Statut
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-2xl font-bold text-emerald-400 mb-1">{stats.active}</div>
                <div className="text-xs text-slate-400">Actives</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400 mb-1">{stats.expiringSoon}</div>
                <div className="text-xs text-slate-400">Expirant</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-500/10 border border-slate-500/30">
                <div className="text-2xl font-bold text-slate-400 mb-1">{stats.expired}</div>
                <div className="text-xs text-slate-400">Expirées</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <div className="text-2xl font-bold text-rose-400 mb-1">{stats.revoked}</div>
                <div className="text-xs text-slate-400">Révoquées</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="text-2xl font-bold text-orange-400 mb-1">{stats.suspended}</div>
                <div className="text-xs text-slate-400">Suspendues</div>
              </div>
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Analyse d'Utilisation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-2">Utilisations totales</div>
                <div className="text-3xl font-bold text-slate-200 mb-1">{stats.totalUsage}</div>
                <div className="text-xs text-slate-400">Toutes délégations confondues</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-2">Moyenne par délégation</div>
                <div className="text-3xl font-bold text-slate-200 mb-1">
                  {stats.total > 0 ? Math.round(stats.totalUsage / stats.total) : 0}
                </div>
                <div className="text-xs text-slate-400">Utilisations moyennes</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-2">Taux d'utilisation</div>
                <div className="text-3xl font-bold text-slate-200 mb-1">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                </div>
                <div className="text-xs text-slate-400">Délégations actives</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">Impossible de charger les statistiques</p>
        </div>
      )}
    </div>
  );
});

// ================================
// Settings View
// ================================
const SettingsView = React.memo(function SettingsView() {
  const { kpiConfig, setKPIConfig, fullscreen, toggleFullscreen } = useDelegationsCommandCenterStore();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
          <Settings className="h-7 w-7 text-purple-500" />
          Paramètres des Délégations
        </h2>
        <p className="text-slate-400 mt-1">
          Configuration et préférences de l'interface
        </p>
      </div>

      <div className="space-y-4">
        {/* KPI Config */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Configuration des KPIs
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-300">Afficher la barre KPIs</label>
                <p className="text-xs text-slate-400">Afficher/masquer la barre de KPIs en haut</p>
              </div>
              <button
                onClick={() => setKPIConfig({ visible: !kpiConfig.visible })}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors',
                  kpiConfig.visible ? 'bg-purple-500' : 'bg-slate-700'
                )}
              >
                <div className={cn(
                  'w-5 h-5 bg-white rounded-full transition-transform',
                  kpiConfig.visible ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-300">Rafraîchissement automatique</label>
                <p className="text-xs text-slate-400">Actualiser les données automatiquement</p>
              </div>
              <button
                onClick={() => setKPIConfig({ autoRefresh: !kpiConfig.autoRefresh })}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors',
                  kpiConfig.autoRefresh ? 'bg-purple-500' : 'bg-slate-700'
                )}
              >
                <div className={cn(
                  'w-5 h-5 bg-white rounded-full transition-transform',
                  kpiConfig.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-300">Intervalle de rafraîchissement</label>
                <p className="text-xs text-slate-400">Temps entre chaque actualisation (secondes)</p>
              </div>
              <input
                type="number"
                min="10"
                max="300"
                step="10"
                value={kpiConfig.refreshInterval}
                onChange={(e) => setKPIConfig({ refreshInterval: parseInt(e.target.value) || 30 })}
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* UI Preferences */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-400" />
            Préférences d'affichage
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-300">Mode plein écran</label>
                <p className="text-xs text-slate-400">Activer/désactiver le mode plein écran</p>
              </div>
              <button
                onClick={toggleFullscreen}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors',
                  fullscreen ? 'bg-purple-500' : 'bg-slate-700'
                )}
              >
                <div className={cn(
                  'w-5 h-5 bg-white rounded-full transition-transform',
                  fullscreen ? 'translate-x-6' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ================================
// Helper Components
// ================================
const StatCard = React.memo(function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-xl border p-6 text-left transition-all hover:scale-105',
        bgColor,
        borderColor,
        onClick && 'cursor-pointer hover:brightness-110'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <div className={cn('text-3xl font-bold', color)}>{value}</div>
    </button>
  );
});

const CategoryCard = React.memo(function CategoryCard({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border border-slate-700/50 bg-slate-800/40',
        'hover:bg-slate-800/60 hover:border-purple-500/30',
        'transition-all duration-200 text-left'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      </div>
      <p className="text-sm text-slate-400">{description}</p>
    </button>
  );
});
