/**
 * ====================================================================
 * MODAL: Statistiques Substitution
 * Vue détaillée des statistiques et KPIs
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  Building2,
  RefreshCw,
  Download,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { substitutionApiService } from '@/lib/services/substitutionApiService';
import type { SubstitutionStats } from '@/lib/services/substitutionApiService';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubstitutionStatsModal({ open, onClose }: StatsModalProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SubstitutionStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open) {
      loadStats();
    }
  }, [open]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await substitutionApiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Statistiques Globales
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadStats}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Actualiser
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : !stats ? (
          <div className="text-center py-12 text-slate-400">
            Erreur lors du chargement des statistiques
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="trends">Tendances</TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[calc(90vh-220px)] overflow-y-auto">
              {/* OVERVIEW */}
              <TabsContent value="overview" className="space-y-6 m-0">
                {/* KPIs principaux */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Total</span>
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.total}</div>
                    <div className="text-xs text-slate-400 mt-1">substitutions</div>
                  </div>

                  <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Actives</span>
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-green-400">{stats.active}</div>
                    <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      {getPercentage(stats.active, stats.total)}% du total
                    </div>
                  </div>

                  <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Retard moyen</span>
                      <Clock className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="text-3xl font-bold text-orange-400">{stats.avgDelay.toFixed(1)}j</div>
                    <div className="text-xs text-slate-400 mt-1">jours</div>
                  </div>

                  <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Critiques</span>
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="text-3xl font-bold text-red-400">{stats.criticalCount}</div>
                    <div className="text-xs text-red-400 mt-1">urgence haute</div>
                  </div>
                </div>

                {/* Par statut */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Répartition par statut</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-900 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                      <div className="text-sm text-slate-400 mt-1">Actives</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {getPercentage(stats.active, stats.total)}%
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-900 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                      <div className="text-sm text-slate-400 mt-1">En attente</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {getPercentage(stats.pending, stats.total)}%
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-900 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{stats.completed}</div>
                      <div className="text-sm text-slate-400 mt-1">Terminées</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {getPercentage(stats.completed, stats.total)}%
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-900 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">{stats.expired}</div>
                      <div className="text-sm text-slate-400 mt-1">Expirées</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {getPercentage(stats.expired, stats.total)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Par motif */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Par motif</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byReason).map(([reason, count]) => {
                      const percentage = getPercentage(count as number, stats.total);
                      return (
                        <div key={reason}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-300 capitalize">{reason}</span>
                            <span className="text-slate-400">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* DETAILS */}
              <TabsContent value="details" className="space-y-6 m-0">
                {/* Par bureau */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    Répartition par bureau
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(stats.byBureau)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([bureau, count]) => (
                        <div key={bureau} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white">{bureau}</div>
                              <div className="text-xs text-slate-400">Bureau</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-400">{count}</div>
                              <div className="text-xs text-slate-400">
                                {getPercentage(count as number, stats.total)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Absences et Délégations */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Absences</h3>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{stats.absencesCount}</div>
                    <div className="text-sm text-slate-400">absences en cours</div>
                  </div>

                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Délégations</h3>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">{stats.delegationsCount}</div>
                    <div className="text-sm text-slate-400">délégations actives</div>
                  </div>
                </div>
              </TabsContent>

              {/* TRENDS */}
              <TabsContent value="trends" className="space-y-6 m-0">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Performance Globale</h3>
                      <p className="text-slate-300 text-sm mb-4">
                        Le système traite actuellement {stats.active} substitutions actives avec un retard moyen de{' '}
                        {stats.avgDelay.toFixed(1)} jours.
                        {stats.criticalCount > 0 && ` ${stats.criticalCount} cas critiques nécessitent une attention immédiate.`}
                      </p>
                      <div className="flex gap-3">
                        <Badge className="bg-slate-800">
                          ✅ {stats.completed} Terminées
                        </Badge>
                        <Badge className="bg-slate-800">
                          ⏳ {stats.pending} En attente
                        </Badge>
                        {stats.expired > 0 && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            ⚠️ {stats.expired} Expirées
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8 text-slate-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Graphiques de tendances</p>
                  <p className="text-sm mt-2">Fonctionnalité en développement</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-sm text-slate-400">
            {stats && `Dernière mise à jour: ${new Date(stats.ts).toLocaleString('fr-FR')}`}
          </div>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
