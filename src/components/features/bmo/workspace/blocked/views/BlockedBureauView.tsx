'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, AlertCircle, Clock, TrendingUp, Phone, Mail,
  ChevronRight, RefreshCw, Filter, Eye, BarChart3, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { blockedApi } from '@/lib/services/blockedApiService';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  tabId: string;
  data: Record<string, unknown>;
};

interface BureauStats {
  bureau: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgDelay: number;
  totalAmount: number;
  responsible?: string;
  contact?: string;
  email?: string;
  dossiers: BlockedDossier[];
}

export function BlockedBureauView({ tabId, data }: Props) {
  const { openTab } = useBlockedWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState<BlockedDossier[]>([]);
  const [expandedBureau, setExpandedBureau] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'total' | 'critical' | 'delay'>('critical');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await blockedApi.getAll();
        setDossiers(result.data);
      } catch (error) {
        console.error('Failed to load dossiers:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Bureaux mock (en production, récupérer via API)
  const bureauInfo: Record<string, { name: string; responsible: string; contact: string; email: string }> = {
    'DT': {
      name: 'Direction Technique',
      responsible: 'M. SECK',
      contact: '+221 77 123 45 67',
      email: 'dt@company.sn',
    },
    'DF': {
      name: 'Direction Financière',
      responsible: 'Mme FALL',
      contact: '+221 77 234 56 78',
      email: 'df@company.sn',
    },
    'DAF': {
      name: 'Direction Administrative et Financière',
      responsible: 'M. NDIAYE',
      contact: '+221 77 345 67 89',
      email: 'daf@company.sn',
    },
    'DRH': {
      name: 'Direction des Ressources Humaines',
      responsible: 'Mme DIOP',
      contact: '+221 77 456 78 90',
      email: 'drh@company.sn',
    },
    'DC': {
      name: 'Direction Commerciale',
      responsible: 'M. BA',
      contact: '+221 77 567 89 01',
      email: 'dc@company.sn',
    },
  };

  // Statistiques par bureau
  const bureauStats = useMemo(() => {
    const stats: Record<string, BureauStats> = {};

    dossiers.forEach(d => {
      const bureau = d.bureau || 'Non assigné';
      
      if (!stats[bureau]) {
        const info = bureauInfo[bureau];
        stats[bureau] = {
          bureau,
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          avgDelay: 0,
          totalAmount: 0,
          responsible: info?.responsible,
          contact: info?.contact,
          email: info?.email,
          dossiers: [],
        };
      }

      stats[bureau].total++;
      stats[bureau][d.impact]++;
      stats[bureau].totalAmount += parseAmountFCFA(d.amount);
      stats[bureau].dossiers.push(d);
    });

    // Calculer le délai moyen
    Object.values(stats).forEach(s => {
      if (s.total > 0) {
        s.avgDelay = Math.round(s.dossiers.reduce((acc, d) => acc + (d.delay ?? 0), 0) / s.total);
      }
    });

    return stats;
  }, [dossiers]);

  // Trier
  const sortedBureaux = useMemo(() => {
    const entries = Object.entries(bureauStats);
    
    entries.sort(([, a], [, b]) => {
      switch (sortBy) {
        case 'critical':
          return b.critical - a.critical || b.high - a.high;
        case 'total':
          return b.total - a.total;
        case 'delay':
          return b.avgDelay - a.avgDelay;
        default:
          return 0;
      }
    });

    return entries.map(([bureau, stats]) => stats);
  }, [bureauStats, sortBy]);

  function parseAmountFCFA(amount: unknown): number {
    const s = String(amount ?? '').replace(/[^\d]/g, '');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  function formatAmount(amount: number): string {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} K`;
    return amount.toLocaleString('fr-FR');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const totalStats = {
    bureaux: sortedBureaux.length,
    total: dossiers.length,
    critical: dossiers.filter(d => d.impact === 'critical').length,
    avgDelay: dossiers.length ? Math.round(dossiers.reduce((acc, d) => acc + (d.delay ?? 0), 0) / dossiers.length) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            Vue par Bureau
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Répartition des blocages par bureau responsable
          </p>
        </div>

        <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-slate-500/20 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Trier par critiques</SelectItem>
            <SelectItem value="total">Trier par total</SelectItem>
            <SelectItem value="delay">Trier par délai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Bureaux</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStats.bureaux}</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-slate-400">Critiques</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStats.critical}</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-slate-400">Délai moyen</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStats.avgDelay}<span className="text-base font-normal text-slate-400">j</span></p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStats.total}</p>
        </div>
      </div>

      {/* Liste des bureaux */}
      <div className="space-y-3">
        {sortedBureaux.map((stats) => {
          const isExpanded = expandedBureau === stats.bureau;
          const info = bureauInfo[stats.bureau];

          return (
            <div
              key={stats.bureau}
              className={cn(
                "rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 overflow-hidden transition-all",
                stats.critical > 0 && "border-l-4 border-l-red-500"
              )}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedBureau(isExpanded ? null : stats.bureau)}
                className="w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{info?.name || stats.bureau}</h3>
                      {stats.critical > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          {stats.critical} critique(s)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{stats.responsible || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{stats.contact || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Stats inline */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                      </div>
                      {stats.critical > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-slate-400">Critiques</p>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Délai moy.</p>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.avgDelay}j</p>
                      </div>
                    </div>

                    <ChevronRight className={cn(
                      "w-5 h-5 text-slate-400 transition-transform",
                      isExpanded && "rotate-90"
                    )} />
                  </div>
                </div>
              </button>

              {/* Détails expandus */}
              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/30">
                  {/* Stats détaillées */}
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 mb-1">Total</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 mb-1">Critiques</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.critical}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 mb-1">Élevé</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.high}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 mb-1">Moyen</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.medium}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400 mb-1">Montant</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatAmount(stats.totalAmount)} FCFA
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  {stats.email && (
                    <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${stats.email}`} className="text-sm text-orange-600 hover:underline">
                        {stats.email}
                      </a>
                    </div>
                  )}

                  {/* Liste des dossiers */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Dossiers ({stats.dossiers.length})
                    </p>
                    {stats.dossiers.slice(0, 5).map(dossier => (
                      <button
                        key={dossier.id}
                        onClick={() => openTab({
                          type: 'dossier',
                          id: `dossier:${dossier.id}`,
                          title: dossier.id,
                          icon: dossier.impact === 'critical' ? '🚨' : '📄',
                          data: { dossierId: dossier.id },
                        })}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {dossier.id}
                            </span>
                            {dossier.impact === 'critical' && (
                              <AlertCircle className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {dossier.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          J+{dossier.delay}
                        </div>
                      </button>
                    ))}
                    {stats.dossiers.length > 5 && (
                      <button
                        onClick={() => openTab({
                          type: 'inbox',
                          id: `inbox:bureau-${stats.bureau}`,
                          title: stats.bureau,
                          icon: '🏢',
                          data: { queue: `bureau:${stats.bureau}` },
                        })}
                        className="w-full py-2 text-sm text-orange-600 hover:underline"
                      >
                        Voir tous les {stats.dossiers.length} dossiers →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedBureaux.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun blocage par bureau</p>
        </div>
      )}
    </div>
  );
}

