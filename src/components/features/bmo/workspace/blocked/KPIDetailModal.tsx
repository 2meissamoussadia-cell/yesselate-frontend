/**
 * KPIDetailModal Enrichi
 * Modal détaillé pour afficher et analyser un KPI des dossiers bloqués
 * - Graphique historique avec tendances
 * - Métadonnées complètes
 * - Performance par bureau
 * - Recommandations et actions
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  Info,
  Download,
  Bell,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building2,
  Calendar,
} from 'lucide-react';
import { useBlockedStats, useBlockedBureaux } from '@/lib/api/hooks/useBlocked';

interface KPIDetailModalProps {
  open: boolean;
  onClose: () => void;
  kpiId: string;
  kpiData?: {
    label: string;
    value: number | string;
    trend?: number;
    target?: number;
    sparkline?: number[];
  };
}

export function KPIDetailModal({ open, onClose, kpiId, kpiData }: KPIDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'trends' | 'actions'>('overview');
  const { data: stats } = useBlockedStats();
  const { data: bureauxData } = useBlockedBureaux();

  // Générer les données du graphique historique (30 derniers jours)
  const historicalData = useMemo(() => {
    if (!kpiData?.sparkline) return [];
    
    return kpiData.sparkline.map((value, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - index));
      return {
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        value,
      };
    });
  }, [kpiData?.sparkline]);

  // Breakdown par bureau
  type BureauRow = { bureauCode: string; totalCount: number; critical?: number; avgDelay?: number };
  const bureauBreakdown = useMemo(() => {
    if (!bureauxData?.bureaux || !stats) return [];

    const bureaux = bureauxData.bureaux as BureauRow[];
    switch (kpiId) {
      case 'total':
        return bureaux.map((b: BureauRow) => ({
          label: b.bureauCode,
          value: b.totalCount,
          percentage: stats.total > 0 ? Math.round((b.totalCount / stats.total) * 100) : 0,
        }));
      case 'critical':
        return bureaux
          .filter((b: BureauRow) => (b.critical ?? 0) > 0)
          .map((b: BureauRow) => ({
            label: b.bureauCode,
            value: b.critical ?? 0,
            percentage: stats.critical > 0 ? Math.round(((b.critical ?? 0) / stats.critical) * 100) : 0,
          }));
      case 'avgDelay':
        return bureaux.map((b: BureauRow) => ({
          label: b.bureauCode,
          value: b.avgDelay ?? 0,
          percentage: null,
        }));
      default:
        return [];
    }
  }, [kpiId, bureauxData, stats]);

  // Recommandations selon le KPI
  const recommendations = useMemo(() => {
    const recs: string[] = [];
    
    if (kpiId === 'critical' && (kpiData?.value as number) > 5) {
      recs.push('Nombre de blocages critiques élevé - Escalade recommandée');
      recs.push('Vérifier les ressources disponibles dans les bureaux concernés');
    }
    
    if (kpiId === 'avgDelay' && (kpiData?.value as number) > 10) {
      recs.push('Délai moyen trop élevé - Réviser les processus');
      recs.push('Identifier les goulots d\'étranglement récurrents');
    }
    
    if (kpiId === 'sla' && (kpiData?.value as number) > 3) {
      recs.push('Taux de dépassement SLA critique');
      recs.push('Revoir les SLA cibles ou augmenter les ressources');
    }
    
    return recs;
  }, [kpiId, kpiData]);

  if (!open) return null;

  const trendIcon = (kpiData?.trend || 0) >= 0 ? TrendingUp : TrendingDown;
  const trendColor = (kpiData?.trend || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
  const TrendIcon = trendIcon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{kpiData?.label || 'Détail KPI'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-200">{kpiData?.value}</span>
                {kpiData?.trend !== undefined && (
                  <div className={cn("flex items-center gap-1", trendColor)}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{Math.abs(kpiData.trend)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
            { id: 'breakdown', label: 'Par bureau', icon: Building2 },
            { id: 'trends', label: 'Tendances', icon: Activity },
            { id: 'actions', label: 'Actions', icon: Target },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 border-b-2 transition-all',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Value */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">Valeur actuelle</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-200">{kpiData?.value}</p>
                </div>

                {kpiData?.target && (
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Target className="w-4 h-4" />
                      <span className="text-xs">Objectif</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-200">{kpiData.target}</p>
                  </div>
                )}

                {kpiData?.trend !== undefined && (
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs">Tendance</span>
                    </div>
                    <div className={cn("flex items-center gap-2 text-2xl font-bold", trendColor)}>
                      <TrendIcon className="w-6 h-6" />
                      {Math.abs(kpiData.trend)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Sparkline Chart */}
              {historicalData.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Évolution sur 30 jours
                  </h3>
                  <div className="h-48 flex items-end gap-1">
                    {historicalData.map((point, i) => {
                      const maxValue = Math.max(...historicalData.map(p => p.value));
                      const heightPercent = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-blue-500/60 hover:bg-blue-500 transition-colors rounded-t cursor-pointer"
                            style={{ height: `${heightPercent}%` }}
                            title={`${point.date}: ${point.value}`}
                          />
                          {i % 5 === 0 && (
                            <span className="text-[8px] text-slate-500 mt-1 rotate-45">{point.date}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Recommandations
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Breakdown Tab */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Répartition par bureau
              </h3>
              {bureauBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {bureauBreakdown.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-200">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-slate-100">{item.value}</span>
                          {item.percentage !== null && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                              {item.percentage}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      {item.percentage !== null && (
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">Aucune donnée disponible</p>
              )}
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Analyse des tendances
              </h3>

              {/* Trend Direction */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Direction</span>
                  <div className={cn("flex items-center gap-2 font-semibold", trendColor)}>
                    <TrendIcon className="w-5 h-5" />
                    <span>
                      {(kpiData?.trend || 0) >= 0 ? 'Hausse' : 'Baisse'} de {Math.abs(kpiData?.trend || 0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Forecast */}
              {kpiData?.trend !== undefined && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">Prévision J+7</h4>
                  <p className="text-slate-300">
                    Si la tendance se maintient : environ{' '}
                    <span className="font-bold">
                      {Math.round((kpiData.value as number) * (1 + (kpiData.trend / 100)))}
                    </span>
                  </p>
                </div>
              )}

              {/* Historical Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <span className="text-xs text-slate-500">Min (30j)</span>
                  <p className="text-lg font-bold text-slate-200">
                    {historicalData.length > 0 ? Math.min(...historicalData.map(d => d.value)) : '-'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <span className="text-xs text-slate-500">Moyenne</span>
                  <p className="text-lg font-bold text-slate-200">
                    {historicalData.length > 0
                      ? Math.round(historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length)
                      : '-'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <span className="text-xs text-slate-500">Max (30j)</span>
                  <p className="text-lg font-bold text-slate-200">
                    {historicalData.length > 0 ? Math.max(...historicalData.map(d => d.value)) : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Actions disponibles
              </h3>

              <Button
                className="w-full justify-start gap-3 h-auto py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
              >
                <Download className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="font-medium text-slate-200">Exporter les données</p>
                  <p className="text-xs text-slate-400">Télécharger en Excel ou PDF</p>
                </div>
              </Button>

              <Button
                className="w-full justify-start gap-3 h-auto py-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30"
              >
                <Bell className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <p className="font-medium text-slate-200">Configurer une alerte</p>
                  <p className="text-xs text-slate-400">Être notifié si le seuil est dépassé</p>
                </div>
              </Button>

              <Button
                className="w-full justify-start gap-3 h-auto py-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
              >
                <Users className="w-5 h-5 text-slate-400" />
                <div className="text-left">
                  <p className="font-medium text-slate-200">Partager avec l'équipe</p>
                  <p className="text-xs text-slate-400">Envoyer par email ou Slack</p>
                </div>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 w-3" />
              <span>Mise à jour : il y a 5 min</span>
            </div>
            {kpiData?.target && (
              <div>
                Objectif : {kpiData.target}
              </div>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

