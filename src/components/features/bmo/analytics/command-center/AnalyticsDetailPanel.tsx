/**
 * Panel de détail latéral pour Analytics
 * Affiche les détails d'un KPI, Alerte ou Rapport sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  FileText,
  Clock,
  Target,
  Activity,
  ChevronRight,
  Bell,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  Minus,
  Info,
  Users,
  Zap,
  Link2,
  Building2,
  DollarSign,
} from 'lucide-react';
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';
import { formatFCFA } from '@/lib/utils/format-currency';

export function AnalyticsDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useAnalyticsCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;

  const handleOpenFullModal = () => {
    // Vérifier si c'est un bureau (a un code et performance)
    const isBureau = data.code && data.performance;
    
    if (isBureau) {
      // Ouvrir le modal de comparaison avec ce bureau
      openModal('comparison', { selectedBureaux: [data.code as string] });
      closeDetailPanel();
    } else if (type === 'kpi') {
      // Vérifier que l'ID est un vrai ID de KPI (commence par 'kpi-' ou contient un tiret)
      const entityId = detailPanel.entityId;
      // Passer aussi les données du detailPanel pour le fallback
      if (entityId) {
        // Passer les données avant de fermer le panel
        const fallbackDataCopy = { ...data };
        openModal('kpi-detail', { 
          kpiId: entityId,
          fallbackData: fallbackDataCopy // Passer une copie des données en fallback
        });
        // Fermer le panel après avoir ouvert le modal
        setTimeout(() => closeDetailPanel(), 100);
      } else {
        // Si pas d'ID, ne rien faire
        if (process.env.NODE_ENV === 'development') {
          console.warn('Cannot open KPI modal: no KPI ID provided');
        }
      }
    } else if (type === 'alert') {
      openModal('alert-detail', { alertId: detailPanel.entityId });
      closeDetailPanel();
    } else if (type === 'report') {
      openModal('report', { reportId: detailPanel.entityId });
      closeDetailPanel();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={closeDetailPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            {type === 'kpi' && (detailPanel.data?.code ? <Building2 className="h-4 w-4 text-blue-400" /> : <Target className="h-4 w-4 text-blue-400" />)}
            {type === 'alert' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {type === 'report' && <FileText className="h-4 w-4 text-purple-400" />}
            <h3 className="text-sm font-medium text-slate-200">
              {type === 'kpi' && (detailPanel.data?.code ? 'Détail Bureau' : 'Détail KPI')}
              {type === 'alert' && 'Détail Alerte'}
              {type === 'report' && 'Détail Rapport'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {type === 'kpi' && data.code && data.performance ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  openModal('comparison', { selectedBureaux: [data.code as string] });
                  closeDetailPanel();
                }}
                className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Comparer
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenFullModal}
                className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Voir plus
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDetailPanel}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {type === 'kpi' && (data.code && data.performance ? <BureauDetailContent data={data} /> : <KPIDetailContent data={data} />)}
          {type === 'alert' && <AlertDetailContent data={data as Record<string, unknown>} />}
          {type === 'report' && <ReportDetailContent data={data as Record<string, unknown>} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {type === 'kpi' && data.code && data.performance ? 'Comparer ce bureau' : 'Ouvrir en modal complète'}
          </Button>
          <Button
            variant="default"
            onClick={closeDetailPanel}
            className="w-full border-slate-700 text-slate-400 hover:text-slate-200"
            size="sm"
          >
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Bureau Detail Content
// ================================
function BureauDetailContent({ data }: { data: Record<string, unknown> }) {
  const perf = data.performance as any;
  const financial = data.financial as any;
  const icon = data.icon as string;
  const code = data.code as string;
  const name = data.name as string;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-2xl">
          {icon || '🏢'}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-200">{code}</h4>
          <p className="text-sm text-slate-400">{name}</p>
        </div>
      </div>

      {/* Score */}
      {perf?.score !== undefined && (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Score de performance</span>
            <Badge 
              className={cn(
                'text-sm font-semibold',
                perf.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                perf.score >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              )}
            >
              {perf.score}
            </Badge>
          </div>
        </div>
      )}

      {/* Métriques de performance */}
      {perf && (
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" />
            Performance
          </h5>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/30 rounded-lg p-2">
              <div className="text-xs text-slate-400 mb-1">Total demandes</div>
              <div className="text-sm font-semibold text-slate-200">{perf.totalDemands || 0}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2">
              <div className="text-xs text-slate-400 mb-1">Validées</div>
              <div className="text-sm font-semibold text-emerald-400">{perf.validated || 0}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2">
              <div className="text-xs text-slate-400 mb-1">En attente</div>
              <div className="text-sm font-semibold text-amber-400">{perf.pending || 0}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2">
              <div className="text-xs text-slate-400 mb-1">Retard</div>
              <div className="text-sm font-semibold text-red-400">{perf.overdue || 0}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Taux de validation</span>
                <span className="text-slate-300 font-medium">{perf.validationRate || 0}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className={cn(
                    'h-2 rounded-full transition-all',
                    (perf.validationRate || 0) >= 80 ? 'bg-emerald-500' :
                    (perf.validationRate || 0) >= 60 ? 'bg-amber-500' :
                    'bg-red-500'
                  )}
                  style={{ width: `${perf.validationRate || 0}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Conformité SLA</span>
                <span className="text-slate-300 font-medium">{perf.slaCompliance || 0}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className={cn(
                    'h-2 rounded-full transition-all',
                    (perf.slaCompliance || 0) >= 90 ? 'bg-emerald-500' :
                    (perf.slaCompliance || 0) >= 75 ? 'bg-amber-500' :
                    'bg-red-500'
                  )}
                  style={{ width: `${perf.slaCompliance || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métriques financières */}
      {financial && (
        <div className="space-y-3 pt-3 border-t border-slate-700/50">
          <h5 className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" />
            Financier
          </h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Budget utilisé</span>
              <span className="text-slate-300 font-medium">{financial.budgetUtilization || 0}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5">
              <div 
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  (financial.budgetUtilization || 0) >= 90 ? 'bg-red-500' :
                  (financial.budgetUtilization || 0) >= 75 ? 'bg-amber-500' :
                  'bg-emerald-500'
                )}
                style={{ width: `${financial.budgetUtilization || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Résultat net</span>
              <span className={cn(
                'font-medium',
                (financial.netResult || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {financial.netResult >= 0 ? '+' : ''}{formatFCFA(financial.netResult || 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================
// KPI Detail Content
// ================================
function KPIDetailContent({ data }: { data: Record<string, unknown> }) {
  const statusIcon = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    critical: <XCircle className="h-4 w-4 text-red-400" />,
    ok: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  }[data.status as string] || <Minus className="h-4 w-4 text-slate-400" />;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-1">{data.name as string}</h4>
        <p className="text-sm text-slate-400">{data.category as string}</p>
      </div>

      {/* Résumé - Valeur, Delta, Statut */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-slate-100">{data.value as string}</span>
          {typeof data.unit === 'string' && data.unit && (
            <span className="text-sm text-slate-400">{data.unit}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mb-3">
          {data.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          ) : data.trend === 'down' ? (
            <TrendingDown className="h-4 w-4 text-red-400" />
          ) : null}
          {typeof data.trendValue === 'string' || typeof data.trendValue === 'number' ? (
            <span
              className={cn(
                'text-sm font-medium',
                data.trend === 'up'
                  ? 'text-emerald-400'
                  : data.trend === 'down'
                  ? 'text-red-400'
                  : 'text-slate-400'
              )}
            >
              {String(data.trendValue)}
            </span>
          ) : null}
          {typeof data.status === 'string' && data.status ? (
            <div className="flex items-center gap-1.5 ml-auto">
              {statusIcon}
              <Badge
                variant={
                  data.status === 'success' || data.status === 'ok'
                    ? 'default'
                    : data.status === 'warning'
                    ? 'warning'
                    : 'destructive'
                }
                className="text-xs"
              >
                {data.status === 'success' || data.status === 'ok'
                  ? 'OK'
                  : data.status === 'warning'
                  ? 'Attention'
                  : 'Critique'}
              </Badge>
            </div>
          ) : null}
        </div>
        {typeof data.lastUpdate === 'string' && data.lastUpdate ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <Clock className="h-3 w-3" />
            <span>MàJ: {data.lastUpdate}</span>
          </div>
        ) : null}
      </div>

      {/* Seuils / Règles */}
      {(data.thresholds || (data.metadata as any)?.threshold) && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Seuils</h5>
          </div>
          <div className="space-y-1.5 text-xs">
            {((data.metadata as any))?.threshold?.success && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Succès</span>
                <Badge variant="default" className="text-xs">
                  ≥ {((data.metadata as any).threshold as any).success}%
                </Badge>
              </div>
            )}
            {((data.metadata as any))?.threshold?.warning && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Attention</span>
                <Badge variant="warning" className="text-xs">
                  ≥ {((data.metadata as any).threshold as any).warning}%
                </Badge>
              </div>
            )}
            {((data.metadata as any))?.threshold?.critical && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Critique</span>
                <Badge variant="destructive" className="text-xs">
                  &lt; {((data.metadata as any).threshold as any).critical}%
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contexte Métier */}
      {(((data.metadata as any))?.owner ||
        ((data.metadata as any))?.dataSource ||
        ((data.metadata as any))?.updateFrequency ||
        ((data.metadata as any))?.formula) && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Contexte</h5>
          </div>
          <div className="space-y-1.5 text-xs">
            {(data.metadata as any)?.owner && (
              <div className="flex justify-between">
                <span className="text-slate-400">Propriétaire</span>
                <span className="text-slate-300 font-medium">{(data.metadata as any).owner}</span>
              </div>
            )}
            {(data.metadata as any)?.dataSource && (
              <div className="flex justify-between">
                <span className="text-slate-400">Source</span>
                <span className="text-slate-300 font-medium">{(data.metadata as any).dataSource}</span>
              </div>
            )}
            {(data.metadata as any)?.updateFrequency && (
              <div className="flex justify-between">
                <span className="text-slate-400">Fréquence</span>
                <span className="text-slate-300 font-medium">{(data.metadata as any).updateFrequency}</span>
              </div>
            )}
            {(data.metadata as any)?.formula && (
              <div className="pt-1.5 border-t border-slate-700/50">
                <span className="text-slate-400 block mb-1">Formule</span>
                <code className="text-xs font-mono text-blue-400 bg-slate-900/50 px-2 py-1 rounded">
                  {(data.metadata as any).formula}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Description</h5>
          </div>
          <p className="text-sm text-slate-400">{data.description as string}</p>
        </div>
      )}

      {/* Historique Mini (placeholder) */}
      {data.hasHistory && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              <h5 className="text-xs font-semibold text-slate-400 uppercase">Historique 7j</h5>
            </div>
            <span className="text-xs text-slate-400">Voir plus →</span>
          </div>
          <div className="h-16 bg-slate-900/50 rounded flex items-center justify-center">
            <span className="text-xs text-slate-600">Sparkline graphique</span>
          </div>
        </div>
      )}

      {/* Liens - KPIs liés, Alertes liées */}
      {Boolean((data.relatedKpiIds && Array.isArray(data.relatedKpiIds) && (data.relatedKpiIds as any[]).length > 0) ||
        (data.relatedAlertIds && Array.isArray(data.relatedAlertIds) && (data.relatedAlertIds as any[]).length > 0) ||
        (data.relatedReportIds && Array.isArray(data.relatedReportIds) && (data.relatedReportIds as any[]).length > 0)) && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Liens</h5>
          </div>
          <div className="space-y-1.5 text-xs">
            {(data.relatedKpiIds && Array.isArray(data.relatedKpiIds) && (data.relatedKpiIds as any[]).length > 0) ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">KPIs liés</span>
                <span className="text-slate-300 font-medium">{(data.relatedKpiIds as any[]).length}</span>
              </div>
            ) : null}
            {(data.relatedAlertIds && Array.isArray(data.relatedAlertIds) && (data.relatedAlertIds as any[]).length > 0) ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Alertes liées</span>
                <Badge variant="warning" className="text-xs">
                  {(data.relatedAlertIds as any[]).length}
                </Badge>
              </div>
            ) : null}
            {(data.relatedReportIds && Array.isArray(data.relatedReportIds) && (data.relatedReportIds as any[]).length > 0) ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rapports liés</span>
                <span className="text-slate-300 font-medium">{(data.relatedReportIds as any[]).length}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Actions Rapides */}
      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-3.5 w-3.5 text-blue-400" />
          <h5 className="text-xs font-semibold text-slate-400 uppercase">Actions rapides</h5>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Download className="h-3 w-3 mr-1" />
            Exporter
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Bell className="h-3 w-3 mr-1" />
            Alerte
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Partager
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Users className="h-3 w-3 mr-1" />
            Assigner
          </Button>
        </div>
      </div>
    </div>
  );
}

// ================================
// Alert Detail Content
// ================================
function AlertDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-1">{data.title as string}</h4>
        <Badge
          variant={
            data.severity === 'critical'
              ? 'destructive'
              : data.severity === 'high'
              ? 'warning'
              : 'default'
          }
        >
          {data.severity as string}
        </Badge>
      </div>

      {/* Message */}
      {Boolean(data.message) && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-300">{data.message as string}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-sm">
        {Boolean(data.category) && (
          <div className="flex justify-between">
            <span className="text-slate-400">Catégorie</span>
            <span className="text-slate-300 font-medium">{data.category as string}</span>
          </div>
        )}
        {Boolean(data.createdAt) && (
          <div className="flex justify-between">
            <span className="text-slate-400">Créé le</span>
            <span className="text-slate-300">{data.createdAt as string}</span>
          </div>
        )}
        {typeof data.status === 'string' && data.status ? (
          <div className="flex justify-between">
            <span className="text-slate-400">Statut</span>
            <Badge variant={data.status === 'active' ? 'destructive' : 'default'}>
              {data.status === 'active' ? 'Actif' : 'Résolu'}
            </Badge>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ================================
// Report Detail Content
// ================================
function ReportDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-1">{data.title as string}</h4>
        <p className="text-sm text-slate-400">{data.type as string}</p>
      </div>

      {/* Status */}
      {Boolean(data.status) ? (
        <Badge
          variant={
            (data.status as string) === 'completed'
              ? 'default'
              : (data.status as string) === 'generating'
              ? 'warning'
              : 'default'
          }
        >
          {data.status as string}
        </Badge>
      ) : null}

      {/* Metadata */}
      <div className="space-y-2 text-sm">
        {Boolean(data.createdAt) ? (
          <div className="flex justify-between">
            <span className="text-slate-400">Créé le</span>
            <span className="text-slate-300">{data.createdAt as string}</span>
          </div>
        ) : null}
        {Boolean(data.period) ? (
          <div className="flex justify-between">
            <span className="text-slate-400">Période</span>
            <span className="text-slate-300">{data.period as string}</span>
          </div>
        ) : null}
      </div>

      {/* Description */}
      {Boolean(data.description) ? (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <p className="text-sm text-slate-400">{data.description as string}</p>
        </div>
      ) : null}
    </div>
  );
}

