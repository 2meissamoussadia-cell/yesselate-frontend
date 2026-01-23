/**
 * KPIDetailModal.tsx
 * ===================
 * 
 * Modal détaillé pour afficher et gérer un KPI spécifique
 * - Graphique historique 30 jours
 * - Métadonnées complètes (formule, seuils, propriétaire)
 * - Performance par bureau
 * - KPIs corrélés
 * - Actions disponibles
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Target, Star, Share2, Download,
  Edit, Bell, Info, Users, Calendar, Activity, AlertTriangle,
  CheckCircle2, XCircle, Minus, Loader2, ExternalLink,
  Zap, PlayCircle, Clock, MessageSquare, FileText, Settings,
  ArrowRight, CheckCircle, X, Plus, Send, UserPlus, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InteractiveChart } from '../charts/InteractiveChart';
import { useKpi } from '@/lib/api/hooks/useAnalytics';
import { ErpModalLayout } from '@/lib/bmo/erp/modalLayout';
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';

interface KPIDetailModalProps {
  open: boolean;
  onClose: () => void;
  kpiId: string | null;
  fallbackData?: Record<string, unknown>;
}

export function KPIDetailModal({ open, onClose, kpiId, fallbackData }: KPIDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'bureaux' | 'related' | 'actions'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlertConfig, setShowAlertConfig] = useState(false);
  const { openModal } = useAnalyticsCommandCenterStore();
  const [actionItems, setActionItems] = useState<Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in-progress' | 'completed';
    assignedTo?: string;
    dueDate?: string;
    createdAt: string;
  }>>([]);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDescription, setNewActionDescription] = useState('');

  // Fetch KPI details
  const { data: kpiResponse, isLoading, error } = useKpi(kpiId || '');
  const kpiData = kpiResponse?.kpi;
  
  // Get store data for fallback (si pas passé en prop)
  const detailPanel = useAnalyticsCommandCenterStore((state) => state.detailPanel);
  const storeFallbackData = fallbackData || (detailPanel.isOpen && detailPanel.type === 'kpi' ? detailPanel.data : undefined);

  // Reset tab on open
  useEffect(() => {
    if (open) {
      setActiveTab('overview');
    }
  }, [open]);

  if (!open || !kpiId) return null;

  if (isLoading) {
    return (
      <FluentModal open={open} onClose={onClose} title="Chargement..." maxWidth="6xl" dark>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </FluentModal>
    );
  }

  if (error || !kpiData) {
    // Si on a une erreur mais qu'on a des données de fallback, les utiliser
    if (storeFallbackData && !kpiData) {
      // Utiliser les données de fallback
      const fallbackData = storeFallbackData as any;
      return (
        <FluentModal open={open} onClose={onClose} title={fallbackData.name || "Détail KPI"} maxWidth="6xl" dark>
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-slate-100">{fallbackData.value}</span>
                {fallbackData.unit && (
                  <span className="text-sm text-slate-500">{fallbackData.unit}</span>
                )}
              </div>
              {fallbackData.target && (
                <div className="text-sm text-slate-400">
                  Objectif: {fallbackData.target} {fallbackData.unit || ''}
                </div>
              )}
            </div>
            {fallbackData.description && (
              <p className="text-sm text-slate-400">{fallbackData.description}</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-700">
              <FluentButton variant="secondary" onClick={onClose}>
                Fermer
              </FluentButton>
            </div>
          </div>
        </FluentModal>
      );
    }
    
    return (
      <FluentModal open={open} onClose={onClose} title="Erreur" maxWidth="6xl" dark>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-slate-400">
            Impossible de charger les détails du KPI
          </p>
          {kpiId && (
            <p className="text-xs text-slate-500 mt-2">ID: {kpiId}</p>
          )}
        </div>
      </FluentModal>
    );
  }

  const statusIcon = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    critical: <XCircle className="w-5 h-5 text-red-400" />,
    neutral: <Minus className="w-5 h-5 text-slate-400" />,
  }[kpiData.status || 'neutral'];

  const trendIcon = kpiData.trend === 'up' 
    ? <TrendingUp className="w-4 h-4 text-emerald-400" />
    : kpiData.trend === 'down'
    ? <TrendingDown className="w-4 h-4 text-red-400" />
    : <Minus className="w-4 h-4 text-slate-400" />;
  
  // Helper pour accéder aux valeurs avec fallbacks
  const currentValue = typeof kpiData.value === 'number' ? kpiData.value : parseFloat(String(kpiData.value)) || 0;
  const targetValue = kpiData.target ? (typeof kpiData.target === 'number' ? kpiData.target : parseFloat(String(kpiData.target)) || 0) : 0;
  const changePercent = kpiData.trendValue || kpiData.change || 0;
  
  // Extensions pour compatibilité avec données enrichies (metadata, history, etc.)
  const kpiExtended = kpiData as any;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      dark
      title={
        <div className="flex items-center gap-3">
          {statusIcon}
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{kpiData.name}</h2>
            <p className="text-xs text-slate-400">{kpiData.category || 'N/A'} • ID: {kpiData.id}</p>
          </div>
        </div>
      }
      maxWidth="6xl"
      noPadding
    >
      <ErpModalLayout
        className="h-[85vh] min-h-[600px]"
        header={
          <>
            {/* Actions Header */}
            <div className="flex items-center justify-between p-6 bg-slate-800/30 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                {/* Valeur actuelle */}
                <div>
                  <p className="text-xs text-slate-400">Valeur actuelle</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-100">
                      {currentValue}
                    </span>
                    {kpiData.unit && (
                      <span className="text-sm text-slate-400">{kpiData.unit}</span>
                    )}
                  </div>
                </div>

                {/* Objectif */}
                <div className="pl-4 border-l border-slate-700/50">
                  <p className="text-xs text-slate-400">Objectif</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-slate-300">
                      {targetValue}
                    </span>
                    {kpiData.unit && (
                      <span className="text-sm text-slate-400">{kpiData.unit}</span>
                    )}
                  </div>
                </div>

                {/* Tendance */}
                <div className="pl-4 border-l border-slate-700/50">
                  <p className="text-xs text-slate-400">Tendance</p>
                  <div className="flex items-center gap-2">
                    {trendIcon}
                    <span className={cn(
                      'text-lg font-semibold',
                      changePercent > 0 ? 'text-emerald-400' : changePercent < 0 ? 'text-red-400' : 'text-slate-400'
                    )}>
                      {changePercent > 0 ? '+' : ''}{changePercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <FluentButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Star className={cn('w-4 h-4', isFavorite && 'fill-amber-400 text-amber-400')} />
                </FluentButton>
                <FluentButton variant="secondary" size="sm">
                  <Bell className="w-4 h-4" />
                </FluentButton>
                <FluentButton variant="secondary" size="sm">
                  <Share2 className="w-4 h-4" />
                </FluentButton>
                <FluentButton variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                </FluentButton>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 bg-slate-900/60 overflow-x-auto">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
                { id: 'history', label: 'Historique', icon: Calendar },
                { id: 'bureaux', label: 'Par Bureau', icon: Users },
                { id: 'related', label: 'KPIs Liés', icon: Activity },
                { id: 'actions', label: 'Actions', icon: Zap, badge: actionItems.filter(a => a.status === 'pending').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 relative',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        }
        footer={
          <div className="flex items-center justify-between p-6 bg-slate-900/60">
            <FluentButton 
              variant="secondary" 
              onClick={() => setShowAlertConfig(true)}
              className="bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50"
            >
              <Bell className="w-4 h-4" />
              Configurer alerte
            </FluentButton>

            <div className="flex items-center gap-3">
              <FluentButton 
                variant="secondary"
                className="bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/70"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </FluentButton>
              <FluentButton variant="primary" onClick={onClose}>
                Fermer
              </FluentButton>
            </div>
          </div>
        }
      >
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Description */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-slate-200">
                  <Info className="w-4 h-4 text-blue-400" />
                  Description
                </h3>
                <p className="text-sm text-slate-400">
                  {kpiExtended.metadata?.description || kpiData.description || 'Aucune description disponible'}
                </p>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h4 className="text-xs font-semibold text-slate-300 mb-3">INFORMATIONS</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Catégorie</span>
                      <Badge variant="default">{kpiData.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Propriétaire</span>
                      <span className="font-medium text-slate-200">{kpiExtended.metadata?.owner || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fréquence</span>
                      <span className="font-medium text-slate-200">{kpiExtended.metadata?.updateFrequency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source</span>
                      <span className="font-medium text-slate-200">{kpiExtended.metadata?.dataSource || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h4 className="text-xs font-semibold text-slate-300 mb-3">SEUILS</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Succès</span>
                      <Badge variant="success">≥ {kpiExtended.metadata?.threshold?.success || 90}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Attention</span>
                      <Badge variant="warning">≥ {kpiExtended.metadata?.threshold?.warning || 80}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Critique</span>
                      <Badge variant="urgent">≤ {kpiExtended.metadata?.threshold?.critical || 70}%</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formule */}
              {kpiExtended.metadata?.formula && (
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">FORMULE DE CALCUL</h4>
                  <code className="text-sm font-mono text-blue-400">
                    {kpiExtended.metadata.formula}
                  </code>
                </div>
              )}

              {/* Dernière mise à jour */}
              <div className="text-xs text-slate-400 text-center">
                Dernière mise à jour: {new Date(kpiExtended.metadata?.lastCalculated || kpiData.lastUpdate || Date.now()).toLocaleString('fr-FR')}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <InteractiveChart
                title="Évolution sur 30 jours"
                data={kpiExtended.history?.map((h: any) => ({
                  name: new Date(h.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                  value: h.value,
                  target: targetValue,
                })) || kpiData.sparkline?.map((val, idx) => ({
                  name: new Date(Date.now() - (30 - idx) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                  value: val,
                  target: targetValue,
                })) || []}
                type="area"
                dataKeys={['value', 'target']}
                colors={['#3b82f6', '#f59e0b']}
                showTrend={true}
                enableExport={true}
                height={350}
              />

              {/* Stats période */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Minimum', value: kpiExtended.history?.length ? Math.min(...(kpiExtended.history.map((h: any) => h.value))) : (kpiData.sparkline?.length ? Math.min(...kpiData.sparkline) : currentValue) },
                  { label: 'Maximum', value: kpiExtended.history?.length ? Math.max(...(kpiExtended.history.map((h: any) => h.value))) : (kpiData.sparkline?.length ? Math.max(...kpiData.sparkline) : currentValue) },
                  { label: 'Moyenne', value: kpiExtended.history?.length ? (kpiExtended.history.reduce((sum: number, h: any) => sum + h.value, 0) / kpiExtended.history.length).toFixed(1) : (kpiData.sparkline?.length ? (kpiData.sparkline.reduce((a, b) => a + b, 0) / kpiData.sparkline.length).toFixed(1) : currentValue.toFixed(1)) },
                  { label: 'Écart-type', value: '2.3' },
                ].map((stat, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-100">
                      {stat.value}{kpiData.unit || ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bureaux' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-200">Performance par Bureau</h3>
              {kpiExtended.affectedBureaux?.map((bureau: any) => (
                <div
                  key={bureau.id}
                  className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-200">{bureau.name}</h4>
                      <p className="text-xs text-slate-400">Code: {bureau.id.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-100">{bureau.value}{kpiData.unit || ''}</p>
                      <Badge variant={
                        bureau.value >= (kpiExtended.metadata?.threshold?.success || 90) ? 'success' :
                        bureau.value >= (kpiExtended.metadata?.threshold?.warning || 80) ? 'warning' : 'urgent'
                      }>
                        {targetValue > 0 ? ((bureau.value / targetValue) * 100).toFixed(0) : '0'}% de l'objectif
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-all',
                        bureau.value >= (kpiExtended.metadata?.threshold?.success || 90)
                          ? 'bg-green-500'
                          : bureau.value >= (kpiExtended.metadata?.threshold?.warning || 80)
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(targetValue > 0 ? (bureau.value / targetValue) * 100 : 0, 100)}%` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-center text-slate-400 py-8">Aucune donnée par bureau disponible</p>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-200">KPIs Corrélés</h3>
              {kpiExtended.relatedKPIs?.map((related: any) => (
                <div
                  key={related.id}
                  className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        related.correlation > 0.7 ? 'bg-green-900/20' :
                        related.correlation > 0.5 ? 'bg-amber-900/20' :
                        'bg-slate-800'
                      )}>
                        <Activity className={cn(
                          'w-6 h-6',
                          related.correlation > 0.7 ? 'text-green-400' :
                          related.correlation > 0.5 ? 'text-amber-400' :
                          'text-slate-400'
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200">{related.name}</h4>
                        <p className="text-xs text-slate-400">
                          Corrélation: {(related.correlation * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )) || (
                <p className="text-center text-slate-400 py-8">Aucun KPI corrélé trouvé</p>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <ActionsTab
              kpiData={kpiData}
              currentValue={currentValue}
              targetValue={targetValue}
              changePercent={changePercent}
              status={kpiData.status}
              actionItems={actionItems}
              setActionItems={setActionItems}
              newActionTitle={newActionTitle}
              setNewActionTitle={setNewActionTitle}
              newActionDescription={newActionDescription}
              setNewActionDescription={setNewActionDescription}
              setShowAlertConfig={setShowAlertConfig}
              kpiId={kpiId}
            />
          )}
        </div>
      </ErpModalLayout>
    </FluentModal>
  );
}

// ================================
// Actions Tab Component
// ================================
function ActionsTab({
  kpiData,
  currentValue,
  targetValue,
  changePercent,
  status,
  actionItems,
  setActionItems,
  newActionTitle,
  setNewActionTitle,
  newActionDescription,
  setNewActionDescription,
  setShowAlertConfig,
  kpiId,
}: {
  kpiData: any;
  currentValue: number;
  targetValue: number;
  changePercent: number;
  status?: string;
  actionItems: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in-progress' | 'completed';
    assignedTo?: string;
    dueDate?: string;
    createdAt: string;
  }>;
  setActionItems: React.Dispatch<React.SetStateAction<typeof actionItems>>;
  newActionTitle: string;
  setNewActionTitle: (value: string) => void;
  newActionDescription: string;
  setNewActionDescription: (value: string) => void;
  setShowAlertConfig: (value: boolean) => void;
  kpiId?: string | null;
}) {
  const { openModal } = useAnalyticsCommandCenterStore();
  const gap = targetValue - currentValue;
  const gapPercent = targetValue > 0 ? ((gap / targetValue) * 100) : 0;
  const isBelowTarget = currentValue < targetValue;
  const isCritical = status === 'critical' || (isBelowTarget && gapPercent > 20);

  // Générer des recommandations basées sur les performances
  const recommendations = useMemo(() => {
    const recs: Array<{
      id: string;
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      actionType: 'alert' | 'task' | 'meeting' | 'review' | 'escalate';
      icon: React.ElementType;
    }> = [];

    if (isCritical) {
      recs.push({
        id: 'rec-1',
        title: 'Action immédiate requise',
        description: `Le KPI est ${gapPercent.toFixed(1)}% en dessous de l'objectif. Une intervention urgente est nécessaire.`,
        priority: 'high',
        actionType: 'escalate',
        icon: AlertTriangle,
      });
      recs.push({
        id: 'rec-2',
        title: 'Planifier une réunion d\'urgence',
        description: 'Organiser une réunion avec les responsables pour identifier les causes et définir un plan de correction.',
        priority: 'high',
        actionType: 'meeting',
        icon: Calendar,
      });
    } else if (isBelowTarget) {
      recs.push({
        id: 'rec-3',
        title: 'Analyser les causes de l\'écart',
        description: `Écart de ${gapPercent.toFixed(1)}% par rapport à l'objectif. Analyser les facteurs contributifs.`,
        priority: 'medium',
        actionType: 'review',
        icon: Activity,
      });
      recs.push({
        id: 'rec-4',
        title: 'Créer une alerte de suivi',
        description: 'Configurer une alerte pour être notifié si la situation se dégrade davantage.',
        priority: 'medium',
        actionType: 'alert',
        icon: Bell,
      });
    }

    if (changePercent < -5) {
      recs.push({
        id: 'rec-5',
        title: 'Investigation de la baisse',
        description: `Baisse de ${Math.abs(changePercent).toFixed(1)}% détectée. Investiguer les causes récentes.`,
        priority: 'high',
        actionType: 'review',
        icon: TrendingDown,
      });
    }

    if (changePercent > 5) {
      recs.push({
        id: 'rec-6',
        title: 'Capitaliser sur l\'amélioration',
        description: `Amélioration de ${changePercent.toFixed(1)}% observée. Identifier les bonnes pratiques à répliquer.`,
        priority: 'low',
        actionType: 'review',
        icon: TrendingUp,
      });
    }

    return recs;
  }, [isCritical, isBelowTarget, gapPercent, changePercent]);

  const handleCreateAction = (recommendation?: typeof recommendations[0]) => {
    if (recommendation) {
      // Ouvrir le modal approprié selon le type d'action
      if (recommendation.actionType === 'alert') {
        openModal('alert-config', { kpiId, kpiName: kpiData.name });
      } else if (recommendation.actionType === 'task') {
        openModal('create-task', { 
          kpiId, 
          kpiName: kpiData.name, 
          kpiData,
          initialTitle: recommendation.title,
          initialDescription: recommendation.description,
          initialPriority: recommendation.priority,
        });
      } else if (recommendation.actionType === 'meeting') {
        openModal('schedule-meeting', { 
          kpiId, 
          kpiName: kpiData.name, 
          kpiData,
          initialTitle: recommendation.title,
          initialDescription: recommendation.description,
          meetingType: recommendation.priority === 'high' ? 'urgent' : 'regular',
        });
      } else {
        // Pour les autres types, créer directement une action
        const newAction = {
          id: `action-${Date.now()}`,
          title: recommendation.title,
          description: recommendation.description,
          priority: recommendation.priority,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
        };
        setActionItems([...actionItems, newAction]);
      }
    } else if (newActionTitle.trim()) {
      const newAction = {
        id: `action-${Date.now()}`,
        title: newActionTitle,
        description: newActionDescription,
        priority: 'medium' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      setActionItems([...actionItems, newAction]);
      setNewActionTitle('');
      setNewActionDescription('');
    }
  };

  const handleUpdateActionStatus = (actionId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setActionItems(actionItems.map(action =>
      action.id === actionId ? { ...action, status: newStatus } : action
    ));
  };

  const handleDeleteAction = (actionId: string) => {
    setActionItems(actionItems.filter(action => action.id !== actionId));
  };

  return (
    <div className="space-y-8">
      {/* Actions Rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => openModal('alert-config', { kpiId, kpiName: kpiData.name })}
          className={cn(
            'flex flex-col items-center gap-2 h-auto py-4 rounded-xl border transition-all',
            'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50',
            'text-amber-400 hover:text-amber-300'
          )}
        >
          <Bell className="w-5 h-5" />
          <span className="text-xs font-medium">Créer Alerte</span>
        </button>
        <button
          onClick={() => openModal('create-task', { kpiId, kpiName: kpiData.name, kpiData })}
          className={cn(
            'flex flex-col items-center gap-2 h-auto py-4 rounded-xl border transition-all',
            'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50',
            'text-blue-400 hover:text-blue-300'
          )}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-medium">Nouvelle Tâche</span>
        </button>
        <button
          onClick={() => openModal('schedule-meeting', { kpiId, kpiName: kpiData.name, kpiData })}
          className={cn(
            'flex flex-col items-center gap-2 h-auto py-4 rounded-xl border transition-all',
            'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50',
            'text-purple-400 hover:text-purple-300'
          )}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-medium">Planifier Réunion</span>
        </button>
        <button
          onClick={() => openModal('assign-responsible', { kpiId, kpiName: kpiData.name, kpiData })}
          className={cn(
            'flex flex-col items-center gap-2 h-auto py-4 rounded-xl border transition-all',
            'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50',
            'text-emerald-400 hover:text-emerald-300'
          )}
        >
          <UserPlus className="w-5 h-5" />
          <span className="text-xs font-medium">Assigner Responsable</span>
        </button>
      </div>

      {/* Recommandations Intelligentes */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-200">Recommandations Automatiques</h3>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <div
                  key={rec.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    rec.priority === 'high'
                      ? 'bg-red-500/10 border-red-500/30'
                      : rec.priority === 'medium'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={cn(
                        'w-5 h-5 mt-0.5',
                        rec.priority === 'high' ? 'text-red-400' :
                        rec.priority === 'medium' ? 'text-amber-400' :
                        'text-blue-400'
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-200">{rec.title}</h4>
                          <Badge
                            variant={rec.priority === 'high' ? 'urgent' : rec.priority === 'medium' ? 'warning' : 'default'}
                            className="text-xs"
                          >
                            {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Suggestion'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{rec.description}</p>
                      </div>
                    </div>
                    <FluentButton
                      size="sm"
                      variant="primary"
                      onClick={() => handleCreateAction(rec)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Créer
                    </FluentButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan d'Action */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-slate-200">Plan d'Action</h3>
            <Badge variant="default" className="text-xs">
              {actionItems.filter(a => a.status === 'pending').length} en attente
            </Badge>
          </div>
          <FluentButton
            size="sm"
            variant="secondary"
            onClick={() => {
              const title = prompt('Titre de l\'action:');
              if (title) {
                const description = prompt('Description:');
                handleCreateAction({
                  id: '',
                  title,
                  description: description || '',
                  priority: 'medium',
                  actionType: 'task',
                  icon: CheckCircle,
                });
              }
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </FluentButton>
        </div>

        {/* Liste des Actions */}
        {actionItems.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-700/50 rounded-lg">
            <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Aucune action planifiée</p>
            <p className="text-slate-500 text-xs mt-1">Créez une action depuis les recommandations ou manuellement</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actionItems.map((action) => (
              <div
                key={action.id}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  action.status === 'completed'
                    ? 'bg-slate-800/30 border-slate-700/30 opacity-60'
                    : action.priority === 'high'
                    ? 'bg-red-500/10 border-red-500/30'
                    : action.priority === 'medium'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleUpdateActionStatus(
                        action.id,
                        action.status === 'completed' ? 'pending' : 'completed'
                      )}
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        action.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-600 hover:border-emerald-500'
                      )}
                    >
                      {action.status === 'completed' && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          'font-medium',
                          action.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'
                        )}>
                          {action.title}
                        </h4>
                        <Badge
                          variant={action.priority === 'high' ? 'urgent' : action.priority === 'medium' ? 'warning' : 'default'}
                          className="text-xs"
                        >
                          {action.priority}
                        </Badge>
                        <Badge
                          variant={action.status === 'completed' ? 'default' : action.status === 'in-progress' ? 'warning' : 'gray'}
                          className="text-xs"
                        >
                          {action.status === 'completed' ? 'Terminé' : action.status === 'in-progress' ? 'En cours' : 'En attente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{action.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {action.assignedTo && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {action.assignedTo}
                          </span>
                        )}
                        {action.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(action.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {action.status !== 'completed' && (
                      <>
                        {action.status === 'pending' && (
                          <FluentButton
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateActionStatus(action.id, 'in-progress')}
                          >
                            <PlayCircle className="w-4 h-4" />
                          </FluentButton>
                        )}
                        <FluentButton
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const assignee = prompt('Assigner à (nom ou email):');
                            if (assignee) {
                              setActionItems(actionItems.map(a =>
                                a.id === action.id ? { ...a, assignedTo: assignee } : a
                              ));
                            }
                          }}
                        >
                          <UserPlus className="w-4 h-4" />
                        </FluentButton>
                        <FluentButton
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const date = prompt('Date d\'échéance (YYYY-MM-DD):');
                            if (date) {
                              setActionItems(actionItems.map(a =>
                                a.id === action.id ? { ...a, dueDate: date } : a
                              ));
                            }
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                        </FluentButton>
                      </>
                    )}
                    <FluentButton
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAction(action.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </FluentButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration d'Alerte */}
      <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-200">Configuration d'Alerte</h3>
          </div>
          <FluentButton
            size="sm"
            variant="secondary"
            onClick={() => setShowAlertConfig(true)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Configurer
          </FluentButton>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Seuil d'alerte critique</span>
            <Badge variant="urgent">
              &lt; {kpiData.metadata?.threshold?.critical || 70}%
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Seuil d'alerte attention</span>
            <Badge variant="warning">
              &lt; {kpiData.metadata?.threshold?.warning || 80}%
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Notifications actives</span>
            <Badge variant="default">3 canaux</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}