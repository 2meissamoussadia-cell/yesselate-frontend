'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/utils';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Truck,
  Receipt,
  Scale,
  Users,
  Ban,
  Copy,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Settings,
  ChevronRight,
  Info,
  Percent,
  DollarSign,
  UserX,
  FileWarning,
  History,
  Target,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// ================================
// Types
// ================================
interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: 'control' | 'approval' | 'tolerance' | 'fraud' | 'compliance';
  status: 'active' | 'warning' | 'critical' | 'disabled';
  passRate: number;
  violations: number;
  lastCheck: string;
  threshold?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ControlStats {
  threeWayMatch: { passed: number; failed: number; pending: number };
  approvalThresholds: { auto: number; manager: number; director: number };
  toleranceBreaches: { price: number; quantity: number; total: number };
  fraudAlerts: { duplicates: number; unknownSupplier: number; suspicious: number };
  slaCompliance: { onTime: number; late: number; atRisk: number };
  kpis: {
    avgProcessingTime: number; // heures
    discrepancyRate: number; // %
    autoApprovalRate: number; // %
    exceptionRate: number; // %
  };
}

interface ApprovalThreshold {
  level: string;
  minAmount: number;
  maxAmount: number;
  approver: string;
  autoApprove: boolean;
  currentQueue: number;
}

// ================================
// Mock data (en prod: API)
// ================================
const mockControlStats: ControlStats = {
  threeWayMatch: { passed: 847, failed: 23, pending: 45 },
  approvalThresholds: { auto: 234, manager: 89, director: 12 },
  toleranceBreaches: { price: 12, quantity: 8, total: 20 },
  fraudAlerts: { duplicates: 3, unknownSupplier: 2, suspicious: 5 },
  slaCompliance: { onTime: 892, late: 18, atRisk: 25 },
  kpis: {
    avgProcessingTime: 4.2,
    discrepancyRate: 2.5,
    autoApprovalRate: 68,
    exceptionRate: 5.2,
  },
};

const approvalThresholds: ApprovalThreshold[] = [
  { level: 'Auto', minAmount: 0, maxAmount: 500000, approver: 'Système', autoApprove: true, currentQueue: 0 },
  { level: 'Manager', minAmount: 500000, maxAmount: 5000000, approver: 'Responsable Achats', autoApprove: false, currentQueue: 12 },
  { level: 'Direction', minAmount: 5000000, maxAmount: 50000000, approver: 'Directeur Financier', autoApprove: false, currentQueue: 3 },
  { level: 'COMEX', minAmount: 50000000, maxAmount: Infinity, approver: 'Comité Exécutif', autoApprove: false, currentQueue: 1 },
];

// ================================
// Sub-components
// ================================
function RuleCard({ rule, onClick }: { rule: BusinessRule; onClick: () => void }) {
  const Icon = rule.icon;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border text-left transition-all hover:shadow-md group',
        rule.status === 'active' && 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10',
        rule.status === 'warning' && 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10',
        rule.status === 'critical' && 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10',
        rule.status === 'disabled' && 'border-slate-300/30 bg-slate-100/50 opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-none',
          rule.status === 'active' && 'bg-emerald-500/20',
          rule.status === 'warning' && 'bg-amber-500/20',
          rule.status === 'critical' && 'bg-rose-500/20',
          rule.status === 'disabled' && 'bg-slate-300/20'
        )}>
          <Icon className={cn('w-5 h-5', rule.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{rule.name}</span>
            {rule.status === 'critical' && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-rose-500 text-white">
                CRITIQUE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{rule.description}</p>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    rule.passRate >= 95 && 'bg-emerald-500',
                    rule.passRate >= 80 && rule.passRate < 95 && 'bg-amber-500',
                    rule.passRate < 80 && 'bg-rose-500'
                  )}
                  style={{ width: `${rule.passRate}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400">{rule.passRate}%</span>
            </div>
            
            {rule.violations > 0 && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {rule.violations} violation{rule.violations > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </div>
    </button>
  );
}

function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  trend, 
  trendValue, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', color)} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={cn('text-2xl font-bold', color)}>
          {value}{unit && <span className="text-sm font-normal ml-0.5">{unit}</span>}
        </span>
        {trend && trendValue && (
          <span className={cn(
            'text-xs font-medium flex items-center gap-0.5 mb-1',
            trend === 'up' && 'text-emerald-600',
            trend === 'down' && 'text-rose-600',
            trend === 'stable' && 'text-slate-400'
          )}>
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

function ThreeWayMatchVisual({ stats }: { stats: ControlStats['threeWayMatch'] }) {
  const total = stats.passed + stats.failed + stats.pending;
  const passedPct = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
  
  return (
    <div className="p-4 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-500" />
          Contrôle 3-Way Match
        </h4>
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          passedPct >= 95 ? 'bg-emerald-100 text-emerald-700' : 
          passedPct >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
        )}>
          {passedPct}% conformes
        </span>
      </div>
      
      {/* Visual diagram */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center border-2 border-purple-500">
            <FileCheck className="w-8 h-8 text-purple-500" />
          </div>
          <span className="text-xs font-medium mt-2">BC</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-0.5 bg-emerald-500" />
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div className="w-8 h-0.5 bg-emerald-500" />
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center border-2 border-blue-500">
            <Truck className="w-8 h-8 text-blue-500" />
          </div>
          <span className="text-xs font-medium mt-2">BL</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-0.5 bg-emerald-500" />
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <div className="w-8 h-0.5 bg-emerald-500" />
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500">
            <Receipt className="w-8 h-8 text-emerald-500" />
          </div>
          <span className="text-xs font-medium mt-2">Facture</span>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center p-2 rounded-lg bg-emerald-500/10">
          <div className="text-lg font-bold text-emerald-600">{stats.passed}</div>
          <div className="text-xs text-slate-400">Conformes</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-rose-500/10">
          <div className="text-lg font-bold text-rose-600">{stats.failed}</div>
          <div className="text-xs text-slate-400">Écarts</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-amber-500/10">
          <div className="text-lg font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-slate-400">En attente</div>
        </div>
      </div>
    </div>
  );
}

function ApprovalThresholdsTable({ thresholds }: { thresholds: ApprovalThreshold[] }) {
  const formatAmount = (amount: number) => {
    if (amount === Infinity) return '∞';
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
  };
  
  return (
    <div className="p-4 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
      <h4 className="font-semibold flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-indigo-500" />
        Seuils d'approbation
      </h4>
      
      <div className="space-y-2">
        {thresholds.map((t, i) => (
          <div 
            key={i}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border transition-colors',
              t.currentQueue > 0 
                ? 'border-amber-500/30 bg-amber-500/5' 
                : 'border-slate-200/70 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                t.autoApprove ? 'bg-emerald-500/20 text-emerald-600' : 'bg-blue-500/20 text-blue-600'
              )}>
                {t.autoApprove ? '⚡' : t.level[0]}
              </div>
              <div>
                <div className="font-medium text-sm">{t.level}</div>
                <div className="text-xs text-slate-400">
                  {formatAmount(t.minAmount)} - {formatAmount(t.maxAmount)} FCFA
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-slate-400">{t.approver}</div>
              {t.currentQueue > 0 && (
                <div className="text-xs font-medium text-amber-600">
                  {t.currentQueue} en file
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FraudAlertsPanel({ alerts }: { alerts: ControlStats['fraudAlerts'] }) {
  const total = alerts.duplicates + alerts.unknownSupplier + alerts.suspicious;
  
  return (
    <div className={cn(
      'p-4 rounded-xl border',
      total > 0 
        ? 'border-rose-500/30 bg-rose-500/5' 
        : 'border-emerald-500/30 bg-emerald-500/5'
    )}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Shield className={cn('w-4 h-4', total > 0 ? 'text-rose-500' : 'text-emerald-500')} />
          Alertes Fraude
        </h4>
        {total > 0 ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
            {total} ALERTE{total > 1 ? 'S' : ''}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            ✓ RAS
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className={cn(
          'flex items-center justify-between p-2 rounded-lg',
          alerts.duplicates > 0 ? 'bg-rose-500/10' : 'bg-slate-100/50 dark:bg-slate-800/30'
        )}>
          <div className="flex items-center gap-2">
            <Copy className={cn('w-4 h-4', alerts.duplicates > 0 ? 'text-rose-500' : 'text-slate-400')} />
            <span className="text-sm">Doublons détectés</span>
          </div>
          <span className={cn(
            'font-bold',
            alerts.duplicates > 0 ? 'text-rose-600' : 'text-slate-400'
          )}>
            {alerts.duplicates}
          </span>
        </div>
        
        <div className={cn(
          'flex items-center justify-between p-2 rounded-lg',
          alerts.unknownSupplier > 0 ? 'bg-amber-500/10' : 'bg-slate-100/50 dark:bg-slate-800/30'
        )}>
          <div className="flex items-center gap-2">
            <UserX className={cn('w-4 h-4', alerts.unknownSupplier > 0 ? 'text-amber-500' : 'text-slate-400')} />
            <span className="text-sm">Fournisseur non référencé</span>
          </div>
          <span className={cn(
            'font-bold',
            alerts.unknownSupplier > 0 ? 'text-amber-600' : 'text-slate-400'
          )}>
            {alerts.unknownSupplier}
          </span>
        </div>
        
        <div className={cn(
          'flex items-center justify-between p-2 rounded-lg',
          alerts.suspicious > 0 ? 'bg-orange-500/10' : 'bg-slate-100/50 dark:bg-slate-800/30'
        )}>
          <div className="flex items-center gap-2">
            <AlertCircle className={cn('w-4 h-4', alerts.suspicious > 0 ? 'text-orange-500' : 'text-slate-400')} />
            <span className="text-sm">Transactions suspectes</span>
          </div>
          <span className={cn(
            'font-bold',
            alerts.suspicious > 0 ? 'text-orange-600' : 'text-slate-400'
          )}>
            {alerts.suspicious}
          </span>
        </div>
      </div>
    </div>
  );
}

// ================================
// Main Component
// ================================
export function ValidationBCBusinessRules() {
  const [stats, setStats] = useState<ControlStats>(mockControlStats);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const rules: BusinessRule[] = [
    {
      id: '3way',
      name: 'Contrôle 3-Way Match',
      description: 'BC = BL = Facture. Bloque le paiement en cas de discordance.',
      category: 'control',
      status: stats.threeWayMatch.failed > 10 ? 'warning' : 'active',
      passRate: Math.round((stats.threeWayMatch.passed / (stats.threeWayMatch.passed + stats.threeWayMatch.failed + stats.threeWayMatch.pending)) * 100),
      violations: stats.threeWayMatch.failed,
      lastCheck: new Date().toISOString(),
      icon: Scale,
      color: 'text-blue-500',
    },
    {
      id: 'approval',
      name: 'Seuils d\'approbation',
      description: '<500K auto • 500K-5M manager • 5M-50M direction • >50M COMEX',
      category: 'approval',
      status: 'active',
      passRate: 98,
      violations: 2,
      lastCheck: new Date().toISOString(),
      threshold: '500K / 5M / 50M FCFA',
      icon: Users,
      color: 'text-indigo-500',
    },
    {
      id: 'tolerance',
      name: 'Tolérance prix/quantité',
      description: 'Écart ≤5% auto-approuvé avec alerte. Au-delà: blocage.',
      category: 'tolerance',
      status: stats.toleranceBreaches.total > 15 ? 'warning' : 'active',
      passRate: 100 - stats.kpis.discrepancyRate,
      violations: stats.toleranceBreaches.total,
      lastCheck: new Date().toISOString(),
      threshold: '≤5%',
      icon: Percent,
      color: 'text-amber-500',
    },
    {
      id: 'supplier',
      name: 'Vérification fournisseur',
      description: 'Contrôle KYC, référencement et coordonnées bancaires.',
      category: 'fraud',
      status: stats.fraudAlerts.unknownSupplier > 0 ? 'critical' : 'active',
      passRate: stats.fraudAlerts.unknownSupplier > 0 ? 95 : 100,
      violations: stats.fraudAlerts.unknownSupplier,
      lastCheck: new Date().toISOString(),
      icon: UserX,
      color: 'text-purple-500',
    },
    {
      id: 'duplicate',
      name: 'Détection doublons',
      description: 'Facture identique déjà payée = rejet automatique.',
      category: 'fraud',
      status: stats.fraudAlerts.duplicates > 0 ? 'critical' : 'active',
      passRate: stats.fraudAlerts.duplicates > 0 ? 99 : 100,
      violations: stats.fraudAlerts.duplicates,
      lastCheck: new Date().toISOString(),
      icon: Copy,
      color: 'text-rose-500',
    },
    {
      id: 'audit',
      name: 'Archivage & Audit',
      description: 'Horodatage + motif approbation. Historique immuable.',
      category: 'compliance',
      status: 'active',
      passRate: 100,
      violations: 0,
      lastCheck: new Date().toISOString(),
      icon: History,
      color: 'text-emerald-500',
    },
  ];

  const refresh = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setStats(mockControlStats);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" />
            Règles Métier & Contrôles
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Système de validation Amazon-style : 3-way match, seuils, tolérances, anti-fraude
          </p>
        </div>
        <div className="flex gap-2">
          <FluentButton size="sm" variant="secondary" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Actualiser
          </FluentButton>
          <FluentButton size="sm" variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </FluentButton>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon={Clock}
          label="Temps moyen traitement"
          value={stats.kpis.avgProcessingTime}
          unit="h"
          trend="down"
          trendValue="-12%"
          color="text-blue-600"
        />
        <KPICard
          icon={AlertTriangle}
          label="Taux d'écarts"
          value={stats.kpis.discrepancyRate}
          unit="%"
          trend="down"
          trendValue="-0.3%"
          color="text-amber-600"
        />
        <KPICard
          icon={Gauge}
          label="Auto-approbation"
          value={stats.kpis.autoApprovalRate}
          unit="%"
          trend="up"
          trendValue="+5%"
          color="text-emerald-600"
        />
        <KPICard
          icon={Target}
          label="Taux d'exceptions"
          value={stats.kpis.exceptionRate}
          unit="%"
          trend="stable"
          trendValue="stable"
          color="text-purple-600"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: 3-Way Match + Approval Thresholds */}
        <div className="space-y-4">
          <ThreeWayMatchVisual stats={stats.threeWayMatch} />
          <ApprovalThresholdsTable thresholds={approvalThresholds} />
        </div>

        {/* Right Column: Rules + Fraud Alerts */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <FileCheck className="w-4 h-4 text-purple-500" />
              Règles actives
            </h4>
            <div className="space-y-3">
              {rules.map(rule => (
                <RuleCard 
                  key={rule.id} 
                  rule={rule} 
                  onClick={() => {
                    setSelectedRule(rule);
                    setDetailsOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
          
          <FraudAlertsPanel alerts={stats.fraudAlerts} />
        </div>
      </div>

      {/* SLA Compliance Bar */}
      <div className="p-4 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Conformité SLA
          </h4>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              Dans les temps ({stats.slaCompliance.onTime})
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              À risque ({stats.slaCompliance.atRisk})
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              En retard ({stats.slaCompliance.late})
            </span>
          </div>
        </div>
        
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 transition-all"
            style={{ width: `${(stats.slaCompliance.onTime / (stats.slaCompliance.onTime + stats.slaCompliance.atRisk + stats.slaCompliance.late)) * 100}%` }}
          />
          <div 
            className="bg-amber-500 transition-all"
            style={{ width: `${(stats.slaCompliance.atRisk / (stats.slaCompliance.onTime + stats.slaCompliance.atRisk + stats.slaCompliance.late)) * 100}%` }}
          />
          <div 
            className="bg-rose-500 transition-all"
            style={{ width: `${(stats.slaCompliance.late / (stats.slaCompliance.onTime + stats.slaCompliance.atRisk + stats.slaCompliance.late)) * 100}%` }}
          />
        </div>
      </div>

      {/* Rule Details Modal */}
      <FluentModal
        open={detailsOpen}
        title={selectedRule?.name ?? 'Détails règle'}
        onClose={() => setDetailsOpen(false)}
      >
        {selectedRule && (
          <div className="space-y-4">
            <div className={cn(
              'p-4 rounded-xl border',
              selectedRule.status === 'active' && 'border-emerald-500/30 bg-emerald-500/5',
              selectedRule.status === 'warning' && 'border-amber-500/30 bg-amber-500/5',
              selectedRule.status === 'critical' && 'border-rose-500/30 bg-rose-500/5'
            )}>
              <div className="flex items-center gap-3">
                <selectedRule.icon className={cn('w-8 h-8', selectedRule.color)} />
                <div>
                  <div className="font-semibold">{selectedRule.name}</div>
                  <div className="text-sm text-slate-400">{selectedRule.description}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <div className="text-xs text-slate-400">Taux de conformité</div>
                <div className={cn(
                  'text-2xl font-bold',
                  selectedRule.passRate >= 95 ? 'text-emerald-600' : 
                  selectedRule.passRate >= 80 ? 'text-amber-600' : 'text-rose-600'
                )}>
                  {selectedRule.passRate}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <div className="text-xs text-slate-400">Violations</div>
                <div className={cn(
                  'text-2xl font-bold',
                  selectedRule.violations === 0 ? 'text-emerald-600' : 'text-rose-600'
                )}>
                  {selectedRule.violations}
                </div>
              </div>
            </div>

            {selectedRule.threshold && (
              <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <div className="text-xs text-slate-400 mb-1">Seuil configuré</div>
                <div className="font-mono text-sm">{selectedRule.threshold}</div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <FluentButton size="sm" variant="secondary" onClick={() => setDetailsOpen(false)}>
                Fermer
              </FluentButton>
              <FluentButton size="sm" variant="primary">
                <Settings className="w-4 h-4 mr-2" />
                Configurer
              </FluentButton>
            </div>
          </div>
        )}
      </FluentModal>
    </div>
  );
}

export default ValidationBCBusinessRules;

