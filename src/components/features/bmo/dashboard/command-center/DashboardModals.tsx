/**
 * Modales du Dashboard Command Center
 * Toutes les modales complètes avec graphiques et détails
 */

'use client';

import React, { useState, useMemo, Suspense, lazy, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  X,
  Download,
  Settings,
  Keyboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Check,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Activity,
  Info,
  HelpCircle,
  Calendar,
  Users,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  ArrowRight,
  Eye,
  Link2,
  Copy,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useDashboardExport } from '@/modules/dashboard/hooks/useDashboardExport';
import { KPIHistoryChart } from './charts/KPIHistoryChart';
import { DistributionChart } from './charts/DistributionChart';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';

// Lazy loading des modals lourds (avec graphiques et données complexes)
const KPIAdvancedModal = lazy(() => 
  import('./KPIAdvancedModal').then(m => ({ default: m.KPIAdvancedModal }))
);
const KPIComparisonModal = lazy(() => 
  import('./KPIComparisonModal').then(m => ({ default: m.KPIComparisonModal }))
);
// KPIDrillDownModal est défini localement ci-dessous comme fallback

export function DashboardModals() {
  const { modal, closeModal } = useDashboardCommandCenterStore();

  // Verrouiller le scroll du body à l'ouverture, restaurer à la fermeture (évite flou résiduel)
  useEffect(() => {
    if (!modal.isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, [modal.isOpen]);

  if (!modal.isOpen || !modal.type) return null;

  let content: React.ReactNode;

  // Pour le modal KPI, utiliser le modal avancé si on a un kpiId, sinon l'ancien
  if (modal.type === 'kpi-drilldown') {
    const kpiData = modal.data?.kpi;
    if (kpiData?.label) {
      const mapping = getKPIMappingByLabel(kpiData.label);
      if (mapping) {
        content = (
          <TooltipProvider>
            <KPIAdvancedModal kpiId={mapping.metadata.id} onClose={closeModal} />
          </TooltipProvider>
        );
      } else if (modal.data?.kpiId) {
        content = (
          <TooltipProvider>
            <KPIAdvancedModal kpiId={modal.data.kpiId} onClose={closeModal} />
          </TooltipProvider>
        );
      } else {
        content = (
          <TooltipProvider>
            <KPIDrillDownModalLocal />
          </TooltipProvider>
        );
      }
    } else if (modal.data?.kpiId) {
      content = (
        <TooltipProvider>
          <KPIAdvancedModal kpiId={modal.data.kpiId} onClose={closeModal} />
        </TooltipProvider>
      );
    } else {
      content = (
        <TooltipProvider>
          <KPIDrillDownModalLocal />
        </TooltipProvider>
      );
    }
  } else {
    content = (
      <TooltipProvider>
        {/* Overlay : clic ferme le modal, backdrop supprimé avec le portail */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={closeModal}
          aria-hidden="true"
        />

        {/* Modal content based on type */}
        {modal.type === 'kpi-comparison' && (
          <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">
                <div className="animate-pulse text-slate-400">Chargement de la comparaison...</div>
              </div>
            </div>
          }>
            <KPIComparisonModal
              kpiIds={modal.data?.kpiIds || []}
              onClose={closeModal}
            />
          </Suspense>
        )}
        {(modal.type === 'risk-detail' || modal.type === 'risk-details') && <RiskDetailModal />}
        {(modal.type === 'action-detail' || modal.type === 'action-details') && <ActionDetailModal />}
        {(modal.type === 'decision-detail' || modal.type === 'decision-details') && <DecisionDetailModal />}
        {modal.type === 'calendar' && <CalendarModal />}
        {modal.type === 'agenda-details' && <AgendaDetailsModal />}
        {modal.type === 'bureau-detail' && <BureauDetailModal />}
        {modal.type === 'stats' && <StatsModal />}
        {modal.type === 'help' && <HelpModal />}
        {modal.type === 'export' && <ExportModal />}
        {modal.type === 'share' && <ShareLinkModal />}
        {modal.type === 'settings' && <SettingsModal />}
        {modal.type === 'shortcuts' && <ShortcutsModal />}
      </TooltipProvider>
    );
  }

  return createPortal(content, document.body);
}

// Base modal wrapper
function ModalWrapper({
  title,
  children,
  maxWidth = 'max-w-lg',
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  onClose?: () => void;
}) {
  const { closeModal } = useDashboardCommandCenterStore();
  const handleClose = onClose || closeModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          'w-full bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col',
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ============================================
// KPI Drill Down Modal - Complet avec graphiques (Local fallback)
// ============================================

function KPIDrillDownModalLocal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const kpiData = modal.data?.kpi as {
    label: string;
    value: string | number;
    delta: string;
    tone: 'ok' | 'warn' | 'crit' | 'info';
    trend: 'up' | 'down' | 'neutral';
    icon?: React.ComponentType<{ className?: string }>;
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'details'>('overview');

  // Générer des données historiques mock (30 derniers jours)
  const historicalData = useMemo(() => {
    const days = 30;
    const baseValue = typeof kpiData?.value === 'number' 
      ? kpiData.value 
      : parseFloat(String(kpiData?.value || 0).replace('%', '').replace('j', ''));
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const value = Math.max(0, baseValue * (1 + variation));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
      };
    });
  }, [kpiData?.value]);

  const maxValue = Math.max(...historicalData.map(d => d.value), 1);
  const minValue = Math.min(...historicalData.map(d => d.value), 0);

  const getKPIInfo = () => {
    const label = kpiData?.label || 'KPI';
    const info: Record<string, { description: string; target?: string; formula?: string }> = {
      'Demandes': {
        description: 'Nombre total de demandes reçues',
        target: '260',
        formula: 'COUNT(demandes)',
      },
      'Validations': {
        description: 'Taux de validation des demandes',
        target: '92%',
        formula: '(validées / total) * 100',
      },
      'Blocages': {
        description: 'Nombre de dossiers actuellement bloqués',
        target: '< 5',
      },
      'Risques critiques': {
        description: 'Nombre de risques nécessitant une attention immédiate',
        target: '0',
      },
      'Budget consommé': {
        description: 'Pourcentage du budget total consommé',
        target: '75%',
        formula: '(dépenses / budget_total) * 100',
      },
      'Décisions en attente': {
        description: 'Nombre de décisions nécessitant une action',
        target: '< 5',
      },
      'Temps réponse': {
        description: 'Délai moyen de traitement des demandes',
        target: '2.0j',
        formula: 'AVG(date_validation - date_reception)',
      },
      'Conformité SLA': {
        description: 'Pourcentage de demandes respectant les SLA',
        target: '95%',
        formula: '(respectées / total) * 100',
      },
    };
    return info[label] || { description: 'Indicateur de performance clé' };
  };

  const kpiInfo = getKPIInfo();
  const Icon = kpiData?.icon || BarChart3;

  return (
    <ModalWrapper title={`Détail KPI: ${kpiData?.label || 'KPI'}`} maxWidth="max-w-4xl" onClose={closeModal}>
      <div className="space-y-6">
        {/* Header avec valeur principale */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className={cn(
            'p-3 rounded-xl',
            kpiData?.tone === 'ok' && 'bg-emerald-500/10 border border-emerald-500/20',
            kpiData?.tone === 'warn' && 'bg-amber-500/10 border border-amber-500/20',
            kpiData?.tone === 'crit' && 'bg-red-500/10 border border-red-500/20',
            kpiData?.tone === 'info' && 'bg-blue-500/10 border border-blue-500/20',
          )}>
            <Icon className={cn(
              'w-6 h-6',
              kpiData?.tone === 'ok' && 'text-emerald-400',
              kpiData?.tone === 'warn' && 'text-amber-400',
              kpiData?.tone === 'crit' && 'text-red-400',
              kpiData?.tone === 'info' && 'text-blue-400',
            )} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-200">{kpiData?.value || 'N/A'}</h3>
            <p className="text-sm text-slate-400">{kpiInfo.description}</p>
          </div>
          <div className="text-right">
            <div className={cn(
              'flex items-center gap-1 text-sm font-semibold',
              kpiData?.trend === 'up' && kpiData?.tone === 'ok' && 'text-emerald-400',
              kpiData?.trend === 'down' && (kpiData?.tone === 'warn' || kpiData?.tone === 'crit') && 'text-red-400',
              (!kpiData?.trend || kpiData?.trend === 'neutral') && 'text-slate-400',
            )}>
              {kpiData?.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
              {kpiData?.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
              {kpiData?.trend === 'neutral' && <Minus className="w-4 h-4" />}
              {kpiData?.delta || '—'}
            </div>
            <Badge variant={kpiData?.tone === 'ok' ? 'default' : kpiData?.tone === 'warn' ? 'warning' : 'destructive'} className="mt-1">
              {kpiData?.tone === 'ok' ? 'Normal' : kpiData?.tone === 'warn' ? 'Attention' : kpiData?.tone === 'crit' ? 'Critique' : 'Info'}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800/50">
          {(['overview', 'history', 'details'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              )}
            >
              {tab === 'overview' && 'Vue d\'ensemble'}
              {tab === 'history' && 'Historique'}
              {tab === 'details' && 'Détails'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Valeur actuelle</p>
                <p className="text-xl font-bold text-slate-200">{kpiData?.value || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Objectif</p>
                <p className="text-xl font-bold text-slate-200">{kpiInfo.target || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Variation</p>
                <p className={cn(
                  'text-xl font-bold flex items-center gap-1',
                  kpiData?.trend === 'up' && kpiData?.tone === 'ok' && 'text-emerald-400',
                  kpiData?.trend === 'down' && (kpiData?.tone === 'warn' || kpiData?.tone === 'crit') && 'text-red-400',
                  'text-slate-400'
                )}>
                  {kpiData?.trend === 'up' && <TrendingUp className="w-5 h-5" />}
                  {kpiData?.trend === 'down' && <TrendingDown className="w-5 h-5" />}
                  {kpiData?.trend === 'neutral' && <Minus className="w-5 h-5" />}
                  {kpiData?.delta || '—'}
                </p>
              </div>
            </div>

            {/* Mini graphique historique amélioré */}
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-3">Évolution sur 30 jours</p>
              <KPIHistoryChart
                data={historicalData}
                type="area"
                tone={kpiData?.tone}
                trend={kpiData?.trend}
                height={150}
                showTarget={false}
                showTrend={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-4">Historique détaillé (30 derniers jours)</p>
              <KPIHistoryChart
                data={historicalData}
                type="area"
                target={kpiInfo.target ? parseFloat(String(kpiInfo.target).replace(/[^0-9.]/g, '')) : undefined}
                tone={kpiData?.tone}
                trend={kpiData?.trend}
                height={300}
                showTarget={!!kpiInfo.target}
                showTrend={true}
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {historicalData.slice(-10).reverse().map((point, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-800/30">
                  <span className="text-xs text-slate-400">{point.date}</span>
                  <span className="text-sm font-medium text-slate-200">{point.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-300">{kpiInfo.description}</p>
              </div>
              {kpiInfo.formula && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Formule de calcul</p>
                  <code className="text-xs text-blue-400 bg-slate-900/50 px-2 py-1 rounded">{kpiInfo.formula}</code>
                </div>
              )}
              {kpiInfo.target && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Objectif cible</p>
                  <p className="text-sm font-medium text-slate-200">{kpiInfo.target}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Statut</p>
                <Badge variant={kpiData?.tone === 'ok' ? 'default' : kpiData?.tone === 'warn' ? 'warning' : 'destructive'}>
                  {kpiData?.tone === 'ok' ? 'Normal' : kpiData?.tone === 'warn' ? 'Attention' : kpiData?.tone === 'crit' ? 'Critique' : 'Info'}
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Tendance</p>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  kpiData?.trend === 'up' && kpiData?.tone === 'ok' && 'text-emerald-400',
                  kpiData?.trend === 'down' && (kpiData?.tone === 'warn' || kpiData?.tone === 'crit') && 'text-red-400',
                  'text-slate-400'
                )}>
                  {kpiData?.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                  {kpiData?.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                  {kpiData?.trend === 'neutral' && <Minus className="w-4 h-4" />}
                  {kpiData?.trend === 'up' ? 'Augmentation' : kpiData?.trend === 'down' ? 'Diminution' : 'Stable'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
          <Button size="sm" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Stats Modal - Complet
// ============================================

function StatsModal() {
  const { closeModal } = useDashboardCommandCenterStore();

  const stats = {
    totalDemandes: 247,
    validations: 89,
    rejets: 11,
    budgetConsomme: 67,
    delaiMoyen: 2.4,
    conformiteSLA: 94,
    blocages: 5,
    risquesCritiques: 3,
    decisionsEnAttente: 8,
  };

  return (
    <ModalWrapper title="Statistiques du Dashboard" maxWidth="max-w-3xl" onClose={closeModal}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-500">Total Demandes</p>
            </div>
            <p className="text-2xl font-bold text-slate-200">{stats.totalDemandes}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500">Taux Validation</p>
            </div>
            <p className="text-2xl font-bold text-slate-200">{stats.validations}%</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-500">Blocages</p>
            </div>
            <p className="text-2xl font-bold text-slate-200">{stats.blocages}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-slate-500">Budget Consommé</p>
            </div>
            <p className="text-2xl font-bold text-slate-200">{stats.budgetConsomme}%</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-500">Délai Moyen</p>
            </div>
            <p className="text-2xl font-bold text-slate-200">{stats.delaiMoyen}j</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500">Conformité SLA</p>
            </div>
            <p className="text-2xl font-bold text-slate-200">{stats.conformiteSLA}%</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-200 mb-4">Répartition par catégorie</h3>
          <DistributionChart
            data={[
              { name: 'Validées', value: 220, color: '#10b981' },
              { name: 'Rejetées', value: 27, color: '#ef4444' },
              { name: 'En attente', value: stats.totalDemandes - 220 - 27, color: '#f59e0b' },
            ]}
            type="bar"
            height={200}
            showLegend={false}
            showTooltip={true}
          />
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
          <Button size="sm" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Help Modal
// ============================================

function HelpModal() {
  const { closeModal } = useDashboardCommandCenterStore();

  const sections = [
    {
      title: 'KPIs du Dashboard',
      items: [
        'Cliquez sur un KPI pour voir ses détails et son historique',
        'Les KPIs sont mis à jour automatiquement toutes les 5 minutes',
        'Utilisez le filtre de recherche pour trouver un KPI spécifique',
      ],
    },
    {
      title: 'Navigation',
      items: [
        'Utilisez la sidebar pour naviguer entre les différentes vues',
        'Les sous-onglets permettent d\'accéder aux détails',
        'Le breadcrumb montre votre position actuelle',
      ],
    },
    {
      title: 'Actions rapides',
      items: [
        'Ctrl+K : Ouvrir la palette de commandes',
        'Ctrl+R : Actualiser les données',
        'Ctrl+E : Exporter les données',
        'Esc : Fermer les modals',
      ],
    },
    {
      title: 'Modals',
      items: [
        'Cliquez sur un KPI pour voir son détail',
        'Les risques critiques peuvent être consultés en détail',
        'Les actions en attente peuvent être validées directement',
      ],
    },
  ];

  return (
    <ModalWrapper title="Aide et Documentation" maxWidth="max-w-2xl" onClose={closeModal}>
      <div className="space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              {section.title}
            </h3>
            <ul className="space-y-1 ml-6">
              {section.items.map((item, j) => (
                <li key={j} className="text-sm text-slate-400 list-disc">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-200 mb-1">Besoin d'aide supplémentaire ?</p>
              <p className="text-xs text-slate-400">
                Contactez le support technique ou consultez la documentation complète dans la section Aide.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Risk Detail Modal - Amélioré
// ============================================

function RiskDetailModal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const riskId = modal.data?.riskId as string | undefined;
  const riskFromData = modal.data?.risk as any;

  // Fetch risk data if only ID is provided
  const { data: riskData } = useApiQuery(
    async (signal: AbortSignal) => {
      if (riskId && !riskFromData) {
        const risks = await dashboardAPI.getRisks({ limit: 100 });
        return (risks as any)?.risks?.find((r: any) => r.id === riskId || String(r.id) === riskId);
      }
      return null;
    },
    [riskId, riskFromData]
  );

  const risk = riskFromData || riskData || (riskId ? { id: riskId } : null);

  return (
    <ModalWrapper title="Détail du risque" maxWidth="max-w-2xl" onClose={closeModal}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="destructive">Critique</Badge>
          <span className="text-xs text-slate-500">{risk?.id || 'RISK-001'}</span>
          <span className="text-xs text-slate-500 ml-auto">
            {risk?.date || new Date().toLocaleDateString('fr-FR')}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-200">
            {risk?.title || 'Risque détecté nécessitant une attention immédiate'}
          </h3>
          <p className="text-sm text-slate-400 mt-2">{risk?.detail || 'Description détaillée du risque...'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Niveau de criticité</p>
            <Badge variant="destructive">Critique</Badge>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Impact potentiel</p>
            <p className="text-sm font-medium text-slate-200">Élevé</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <p className="text-sm font-medium text-slate-200 mb-2">Recommandations</p>
          <p className="text-sm text-slate-300">{risk?.explain || 'Action immédiate requise pour atténuer ce risque.'}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-slate-500">Actions suggérées</p>
          <ul className="space-y-1 ml-4">
            {[
              'Analyser la cause racine',
              'Mettre en place des mesures correctives',
              'Surveiller l\'évolution du risque',
            ].map((action, i) => (
              <li key={i} className="text-sm text-slate-400 list-disc">{action}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" className="flex-1 bg-rose-600 hover:bg-rose-700">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Intervenir
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={closeModal}
            className="flex-1 border-slate-700"
          >
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Action Detail Modal - Amélioré
// ============================================

function ActionDetailModal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const actionId = modal.data?.actionId as string | undefined;
  const actionFromData = modal.data?.action as any;

  // Fetch action data if only ID is provided
  const { data: actionData } = useApiQuery(
    async (signal: AbortSignal) => {
      if (actionId && !actionFromData) {
        const actions = await dashboardAPI.getActions({ limit: 100 });
        return (actions as any)?.actions?.find((a: any) => a.id === actionId || String(a.id) === actionId);
      }
      return null;
    },
    [actionId, actionFromData]
  );

  const action = actionFromData || actionData || (actionId ? { id: actionId } : null);

  return (
    <ModalWrapper title="Détail de l'action" maxWidth="max-w-2xl" onClose={closeModal}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="default">En attente</Badge>
          <span className="text-xs text-slate-500">{action?.id || 'ACTION-001'}</span>
          <span className="text-xs text-slate-500 ml-auto">
            {action?.date || new Date().toLocaleDateString('fr-FR')}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-200">
            {action?.title || 'Action à traiter'}
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            {action?.description || 'Description détaillée de l\'action à effectuer...'}
          </p>
        </div>

        {action?.amount && (
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Montant concerné</p>
            <p className="text-2xl font-bold text-slate-200">{action.amount}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Priorité</p>
            <Badge variant="warning">Haute</Badge>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Échéance</p>
            <p className="text-sm font-medium text-slate-200">
              {action?.dueDate || 'Sous 48h'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            <Check className="w-4 h-4 mr-2" />
            Valider
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={closeModal}
            className="flex-1 border-slate-700"
          >
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Decision Detail Modal - Amélioré
// ============================================

function DecisionDetailModal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const decisionId = modal.data?.decisionId as string | undefined;
  const decisionFromData = modal.data?.decision as any;

  // Fetch decision data if only ID is provided
  const { data: decisionData } = useApiQuery(
    async (signal: AbortSignal) => {
      if (decisionId && !decisionFromData) {
        const decisions = await dashboardAPI.getDecisions({ limit: 100 });
        return (decisions as any)?.decisions?.find((d: any) => d.id === decisionId || String(d.id) === decisionId);
      }
      return null;
    },
    [decisionId, decisionFromData]
  );

  const decision = decisionFromData || decisionData || (decisionId ? { id: decisionId } : null);

  return (
    <ModalWrapper title="Détail de la décision" maxWidth="max-w-2xl" onClose={closeModal}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={decision?.status === 'executed' ? 'default' : 'warning'}>
            {decision?.status === 'executed' ? 'Exécutée' : 'En attente'}
          </Badge>
          <span className="text-xs text-slate-500">{decision?.id || 'DEC-001'}</span>
          <span className="text-xs text-slate-500 ml-auto">
            {decision?.date || new Date().toLocaleDateString('fr-FR')}
          </span>
        </div>

        <div>
          <p className="text-sm text-slate-500">{decision?.type || 'Type de décision'}</p>
          <h3 className="text-lg font-medium text-slate-200 mt-1">
            {decision?.subject || 'Sujet de la décision'}
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            {decision?.description || 'Description détaillée de la décision...'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Auteur</p>
            <p className="text-sm text-slate-200">{decision?.author || 'N/A'}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Date de création</p>
            <p className="text-sm text-slate-200">{decision?.date || 'N/A'}</p>
          </div>
        </div>

        {decision?.status !== 'executed' && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-slate-300">
              Cette décision est en attente d'exécution. Veuillez prendre les mesures nécessaires.
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Export Modal - Amélioré
// ============================================

function ExportModal() {
  const { closeModal } = useDashboardCommandCenterStore();
  const { exportData } = useDashboardExport();
  const [format, setFormat] = React.useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [includeGraphs, setIncludeGraphs] = React.useState(true);
  const [includeDetails, setIncludeDetails] = React.useState(true);
  const [selectedKPIs, setSelectedKPIs] = React.useState<string[]>([]);
  const [period, setPeriod] = React.useState<'month' | 'quarter' | 'year'>('year');
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportData(format);
      closeModal();
    } catch (error) {
      const { useLogger } = await import('@/lib/utils/logger');
      const log = useLogger('DashboardModals');
      const err = error instanceof Error ? error : new Error(String(error));
      log.error('Erreur lors de l\'export', err, { format, period });
    } finally {
      setExporting(false);
    }
  };

  return (
    <ModalWrapper title="Exporter les données" onClose={closeModal}>
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Choisissez le format d'export pour les données du dashboard.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {([
            { id: 'pdf', label: 'PDF', icon: FileText },
            { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
            { id: 'csv', label: 'CSV', icon: FileCode },
            { id: 'json', label: 'JSON', icon: FileCode },
          ] as const).map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  format === f.id
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800/70'
                )}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs uppercase font-medium">{f.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-2">Options d'export</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={includeGraphs}
                  onChange={(e) => setIncludeGraphs(e.target.checked)}
                  className="rounded border-slate-700"
                />
                Inclure les graphiques
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="rounded border-slate-700"
                />
                Inclure les détails
              </label>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-2">Période</p>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-sm text-slate-300"
            >
              <option value="month">Mois</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Année</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Export en cours…' : 'Exporter'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={closeModal}
            className="flex-1 border-slate-700"
          >
            Annuler
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Share Link Modal - Partage sécurisé (lien 7 jours)
// Client : voit uniquement son/ses chantier(s). Associé : voit tout.
// ============================================

function ShareLinkModal() {
  const { closeModal } = useDashboardCommandCenterStore();
  const [role, setRole] = useState<'client' | 'associe'>('client');
  const [chantierIdsRaw, setChantierIdsRaw] = useState('');
  const [created, setCreated] = useState<{ url: string; expiresAt: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);
    try {
      const chantierIds = role === 'client' && chantierIdsRaw.trim()
        ? chantierIdsRaw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
        : [];
      const res = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          chantierIds: role === 'client' ? chantierIds : undefined,
          expiryDays: 7,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Erreur lors de la création du lien');
      }
      const data = await res.json();
      setCreated({ url: data.url, expiresAt: data.expiresAt });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!created?.url) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copie impossible');
    }
  };

  return (
    <ModalWrapper title="Partager (lien 7 jours)" maxWidth="max-w-md" onClose={closeModal}>
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Créez un lien sécurisé. <strong className="text-slate-300">Client</strong> : le destinataire ne voit que le(s) chantier(s) choisi(s). <strong className="text-slate-300">Associé</strong> : il voit tout.
        </p>

        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Rôle du destinataire</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="share-role"
                checked={role === 'client'}
                onChange={() => setRole('client')}
                className="rounded border-slate-600"
              />
              Client (chantiers limités)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="share-role"
                checked={role === 'associe'}
                onChange={() => setRole('associe')}
                className="rounded border-slate-600"
              />
              Associé (voit tout)
            </label>
          </div>
        </div>

        {role === 'client' && (
          <div className="space-y-1">
            <label className="text-xs text-slate-500">IDs chantiers (optionnel, séparés par des virgules)</label>
            <input
              type="text"
              value={chantierIdsRaw}
              onChange={(e) => setChantierIdsRaw(e.target.value)}
              placeholder="CH-001, CH-002"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {created ? (
          <div className="space-y-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500">Lien valide jusqu&apos;au {new Date(created.expiresAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={created.url}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono truncate"
              />
              <Button size="sm" variant="outline" onClick={handleCopy} className="border-slate-700 shrink-0">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 gap-2" onClick={handleCreate} disabled={loading}>
              <Link2 className="h-4 w-4" />
              {loading ? 'Création…' : 'Créer le lien'}
            </Button>
            <Button size="sm" variant="outline" onClick={closeModal} className="border-slate-700">
              Annuler
            </Button>
          </div>
        )}

        {created && (
          <Button size="sm" variant="outline" onClick={closeModal} className="w-full border-slate-700">
            Fermer
          </Button>
        )}
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Settings Modal - Existant (amélioré)
// ============================================

function SettingsModal() {
  const { closeModal, kpiConfig, setKPIConfig, displayConfig, setDisplayConfig } =
    useDashboardCommandCenterStore();

  return (
    <ModalWrapper title="Paramètres du Dashboard" maxWidth="max-w-md" onClose={closeModal}>
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200">KPI Bar</h3>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Afficher la barre KPI</span>
            <input
              type="checkbox"
              checked={kpiConfig.visible}
              onChange={(e) => setKPIConfig({ visible: e.target.checked })}
              className="rounded border-slate-700"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Auto-refresh</span>
            <input
              type="checkbox"
              checked={kpiConfig.autoRefresh}
              onChange={(e) => setKPIConfig({ autoRefresh: e.target.checked })}
              className="rounded border-slate-700"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Intervalle de rafraîchissement</span>
            <select
              value={kpiConfig.refreshInterval}
              onChange={(e) => setKPIConfig({ refreshInterval: parseInt(e.target.value) })}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-slate-300"
            >
              <option value={10}>10 secondes</option>
              <option value={30}>30 secondes</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200">Affichage</h3>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Mode vue</span>
            <select
              value={displayConfig.viewMode}
              onChange={(e) => setDisplayConfig({ viewMode: e.target.value as any })}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-slate-300"
            >
              <option value="compact">Compact</option>
              <option value="extended">Étendu</option>
            </select>
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Shortcuts Modal - Existant (amélioré)
// ============================================

function ShortcutsModal() {
  const { closeModal } = useDashboardCommandCenterStore();

  const shortcuts = [
    { key: '⌘K', description: 'Ouvrir la palette de commandes' },
    { key: '⌘R', description: 'Actualiser les données' },
    { key: '⌘E', description: 'Exporter les données' },
    { key: 'F11', description: 'Mode plein écran' },
    { key: 'Alt+←', description: 'Retour arrière' },
    { key: '/', description: 'Focus recherche' },
    { key: '?', description: 'Afficher l\'aide' },
    { key: 'Esc', description: 'Fermer le dialogue' },
  ];

  return (
    <ModalWrapper title="Raccourcis clavier" maxWidth="max-w-md" onClose={closeModal}>
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0"
          >
            <span className="text-sm text-slate-400">{shortcut.description}</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 font-mono">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-4">
        <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
          Fermer
        </Button>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Calendar Modal - Calendrier complet
// ============================================

function CalendarModal() {
  const { closeModal } = useDashboardCommandCenterStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Mock events data
  const events = useMemo(() => [
    { id: '1', title: 'Réunion comité de pilotage', date: new Date(), type: 'meeting' },
    { id: '2', title: 'Échéance BC-2024-0847', date: new Date(Date.now() + 86400000), type: 'deadline' },
    { id: '3', title: 'Validation budget Phase 3', date: new Date(Date.now() + 2 * 86400000), type: 'validation' },
  ], []);

  return (
    <ModalWrapper title="Calendrier exécutif" maxWidth="max-w-6xl" onClose={closeModal}>
      <div className="space-y-6">
        {/* View mode selector */}
        <div className="flex items-center gap-2">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={viewMode === mode ? 'default' : 'outline'}
              onClick={() => setViewMode(mode)}
              className="border-slate-700"
            >
              {mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
            </Button>
          ))}
        </div>

        {/* Calendar view */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-slate-200">
              {selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
          </div>

          {/* Events list */}
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {event.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <Badge variant="default" className="text-xs">
                  {event.type === 'meeting' ? 'Réunion' : event.type === 'deadline' ? 'Échéance' : 'Validation'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Agenda Details Modal - Détail d'un événement
// ============================================

function AgendaDetailsModal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const eventId = modal.data?.eventId as string | undefined;

  // Mock event data
  const event = useMemo(() => ({
    id: eventId || '1',
    title: 'Réunion comité de pilotage',
    description: 'Réunion mensuelle du comité de pilotage pour revue des projets en cours et validation des décisions stratégiques.',
    date: new Date(),
    time: '14:00',
    location: 'Salle de réunion principale',
    participants: ['M. Diallo', 'Mme Martin', 'M. Koné'],
    type: 'meeting',
    priority: 'high',
  }), [eventId]);

  return (
    <ModalWrapper title="Détail de l'événement" maxWidth="max-w-2xl" onClose={closeModal}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={event.priority === 'high' ? 'destructive' : 'default'}>
            {event.priority === 'high' ? 'Priorité haute' : 'Normal'}
          </Badge>
          <Badge variant="default" className="text-xs">
            {event.type === 'meeting' ? 'Réunion' : event.type === 'deadline' ? 'Échéance' : 'Validation'}
          </Badge>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">{event.title}</h3>
          <p className="text-sm text-slate-400">{event.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-500">Date</p>
            </div>
            <p className="text-sm font-medium text-slate-200">
              {event.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-500">Heure</p>
            </div>
            <p className="text-sm font-medium text-slate-200">{event.time}</p>
          </div>
        </div>

        {event.location && (
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500">Lieu</p>
            </div>
            <p className="text-sm font-medium text-slate-200">{event.location}</p>
          </div>
        )}

        {event.participants && event.participants.length > 0 && (
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-slate-500">Participants</p>
            </div>
            <div className="space-y-1">
              {event.participants.map((participant, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <User className="w-3 h-3 text-slate-500" />
                  {participant}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
          <Button size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Voir plus
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ============================================
// Bureau Detail Modal - Détail d'un bureau
// ============================================

function BureauDetailModal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const bureau = modal.data?.bureau as any;

  const bureauData = useMemo(() => ({
    code: bureau?.code || 'BF',
    name: bureau?.name || 'Bureau Finances',
    score: bureau?.score || 94,
    trend: bureau?.trend || 'up',
    validations: bureau?.validations || 45,
    blocages: bureau?.blocages || 1,
    responsable: 'M. Diallo',
    email: 'diallo@example.com',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Sénégal',
  }), [bureau]);

  return (
    <ModalWrapper title={`Bureau ${bureauData.code}`} maxWidth="max-w-3xl" onClose={closeModal}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="w-16 h-16 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-200">{bureauData.name}</h3>
            <p className="text-sm text-slate-400">Code: {bureauData.code}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-400">{bureauData.score}</p>
            <p className="text-xs text-slate-500">Score de performance</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-slate-500">Validations</p>
            </div>
            <p className="text-2xl font-bold text-slate-200">{bureauData.validations}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-500">Blocages</p>
            </div>
            <p className="text-2xl font-bold text-slate-200">{bureauData.blocages}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              {bureauData.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : bureauData.trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : (
                <Minus className="w-4 h-4 text-slate-500" />
              )}
              <p className="text-xs text-slate-500">Tendance</p>
            </div>
            <p className="text-sm font-medium text-slate-200">
              {bureauData.trend === 'up' ? 'En hausse' : bureauData.trend === 'down' ? 'En baisse' : 'Stable'}
            </p>
          </div>
        </div>

        {/* Contact info */}
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-200 mb-3">Informations de contact</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <User className="w-4 h-4 text-slate-500" />
              <span>{bureauData.responsable}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{bureauData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>{bureauData.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{bureauData.address}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-slate-800/50">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
          <Button size="sm" className="flex-1">
            <ArrowRight className="w-4 h-4 mr-2" />
            Voir les détails complets
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
