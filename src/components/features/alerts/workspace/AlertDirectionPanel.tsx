'use client';

import { useMemo } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Activity,
  BarChart3,
  Bell,
  X
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { calculateAlertStats } from '@/lib/data/alerts';

interface AlertDirectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AlertDirectionPanel
 * ===================
 * 
 * Panneau latéral pour les informations de direction/pilotage.
 * Affiche des métriques, tendances et recommandations stratégiques.
 */
export function AlertDirectionPanel({ isOpen, onClose }: AlertDirectionPanelProps) {
  const stats = useMemo(() => calculateAlertStats(), []);

  if (!isOpen) return null;

  const criticalRate = stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0;
  const resolvedRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const escalationRate = stats.total > 0 ? Math.round((stats.escalated / stats.total) * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-[#1f1f1f] border-l border-slate-200 dark:border-slate-800 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Pilotage & Analytics</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Vue d'ensemble */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Vue d'ensemble</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <p className="text-xs text-slate-400">Critiques</p>
                </div>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.critical}</p>
                <p className="text-xs text-rose-500 mt-1">{criticalRate}% du total</p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs text-slate-400">Résolues</p>
                </div>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.resolved}</p>
                <p className="text-xs text-emerald-500 mt-1">{resolvedRate}% du total</p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-slate-400">Temps réponse</p>
                </div>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.avgResponseTime}min</p>
                <p className="text-xs text-slate-400 mt-1">Moyenne</p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <p className="text-xs text-slate-400">Temps résolution</p>
                </div>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.avgResolutionTime}min</p>
                <p className="text-xs text-slate-400 mt-1">Moyenne</p>
              </div>
            </div>
          </div>
          
          {/* Par bureau */}
          {Object.keys(stats.byBureau).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Répartition par bureau</h3>
              
              <div className="space-y-2">
                {Object.entries(stats.byBureau)
                  .sort((a, b) => b[1] - a[1])
                  .map(([bureau, count]) => {
                    const percentage = Math.round((count / stats.total) * 100);
                    
                    return (
                      <div key={bureau} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{bureau}</span>
                          <span className="text-slate-400">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          
          {/* Par type */}
          {Object.keys(stats.byType).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Répartition par type</h3>
              
              <div className="space-y-2">
                {Object.entries(stats.byType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([type, count]) => {
                    const percentage = Math.round((count / stats.total) * 100);
                    
                    return (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400 capitalize">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-200 w-10 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          
          {/* Indicateurs clés */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Indicateurs clés</h3>
            
            <div className="space-y-3">
              <div className={cn(
                "p-4 rounded-xl border",
                criticalRate > 30 
                  ? "bg-rose-500/10 border-rose-500/30" 
                  : "bg-emerald-500/10 border-emerald-500/30"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Taux d'alertes critiques</span>
                  <span className={cn(
                    "text-lg font-bold",
                    criticalRate > 30 ? "text-rose-500" : "text-emerald-500"
                  )}>
                    {criticalRate}%
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {criticalRate > 30 ? "⚠️ Taux élevé - action recommandée" : "✅ Taux normal"}
                </p>
              </div>
              
              <div className={cn(
                "p-4 rounded-xl border",
                escalationRate > 20 
                  ? "bg-amber-500/10 border-amber-500/30" 
                  : "bg-emerald-500/10 border-emerald-500/30"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Taux d'escalade</span>
                  <span className={cn(
                    "text-lg font-bold",
                    escalationRate > 20 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {escalationRate}%
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {escalationRate > 20 ? "⚠️ Taux élevé - formation recommandée" : "✅ Taux normal"}
                </p>
              </div>
              
              <div className={cn(
                "p-4 rounded-xl border",
                resolvedRate < 50 
                  ? "bg-amber-500/10 border-amber-500/30" 
                  : "bg-emerald-500/10 border-emerald-500/30"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Taux de résolution</span>
                  <span className={cn(
                    "text-lg font-bold",
                    resolvedRate < 50 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {resolvedRate}%
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {resolvedRate < 50 ? "⚠️ Taux faible - ressources insuffisantes?" : "✅ Bon taux de résolution"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Actions rapides</h3>
            
            <div className="space-y-2">
              <FluentButton
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {/* Export */}}
              >
                <BarChart3 className="w-4 h-4" />
                Exporter rapport PDF
              </FluentButton>
              
              <FluentButton
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {/* Analyse */}}
              >
                <TrendingUp className="w-4 h-4" />
                Analyse approfondie
              </FluentButton>
              
              <FluentButton
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {/* Config */}}
              >
                <Bell className="w-4 h-4" />
                Configurer notifications
              </FluentButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

