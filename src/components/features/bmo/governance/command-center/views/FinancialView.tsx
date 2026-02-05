/**
 * Vue Engagements & Budget
 * Commitments, facturation, prévisions, écarts, trésorerie
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Receipt,
  CreditCard,
  LineChart,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { SurveillanceTable } from '../SurveillanceTable';
import type { SurveillanceItem } from '../types';

// Données de démonstration
const commitmentsData: SurveillanceItem[] = [
  {
    id: '1',
    reference: 'BC-2024-0847',
    designation: 'Fourniture acier lot 3',
    project: 'Tours Horizon',
    responsable: 'Achats',
    dateEcheance: '15/01/2026',
    status: 'at-risk',
    priority: 'critical',
    metadata: { amount: 125000, type: 'Fourniture' },
  },
  {
    id: '2',
    reference: 'BC-2024-0848',
    designation: 'Prestation électricité phase 2',
    project: 'Centre Commercial',
    responsable: 'Achats',
    dateEcheance: '22/01/2026',
    status: 'on-track',
    priority: 'high',
    metadata: { amount: 85000, type: 'Prestation' },
  },
  {
    id: '3',
    reference: 'BC-2024-0849',
    designation: 'Location grue mobile',
    project: 'Résidence Jardins',
    responsable: 'Moyens',
    dateEcheance: '10/01/2026',
    status: 'late',
    priority: 'medium',
    metadata: { amount: 45000, type: 'Location' },
  },
];

const budgetSummary = {
  total: 45200000,
  engaged: 28500000,
  consumed: 22800000,
  remaining: 16700000,
  forecast: 44100000,
  variance: -1100000,
};

const invoices = [
  { id: '1', ref: 'FAC-2024-1234', supplier: 'Béton Express', amount: 125000, status: 'pending', dueDate: '20/01/2026', daysOverdue: 0 },
  { id: '2', ref: 'FAC-2024-1235', supplier: 'Électricité Martin', amount: 45000, status: 'overdue', dueDate: '05/01/2026', daysOverdue: 5 },
  { id: '3', ref: 'FAC-2024-1236', supplier: 'Plomberie Durand', amount: 32000, status: 'paid', dueDate: '01/01/2026', daysOverdue: 0 },
  { id: '4', ref: 'FAC-2024-1237', supplier: 'Location Plus', amount: 18500, status: 'pending', dueDate: '25/01/2026', daysOverdue: 0 },
];

const cashflowData = [
  { month: 'Jan', income: 1200000, expenses: 980000 },
  { month: 'Fév', income: 1500000, expenses: 1100000 },
  { month: 'Mar', income: 1350000, expenses: 1250000 },
  { month: 'Avr', income: 1800000, expenses: 1400000 },
  { month: 'Mai', income: 1600000, expenses: 1350000 },
  { month: 'Jun', income: 2100000, expenses: 1800000 },
];

export function FinancialView() {
  const { navigation } = useGovernanceCommandCenterStore();

  switch (navigation.subCategory) {
    case 'contract-sla':
      return <InvoicingView data={invoices} />;
    case 'commitments':
      return <ForecastsView />;
    case 'resource-utilization':
      return <VariancesView />;
    default:
      return <CommitmentsView data={commitmentsData} summary={budgetSummary} />;
  }
}

function CommitmentsView({ 
  data, 
  summary 
}: { 
  data: SurveillanceItem[]; 
  summary: typeof budgetSummary;
}) {
  const { openDetailPanel, openModal } = useGovernanceCommandCenterStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const consumptionRate = Math.round((summary.consumed / summary.total) * 100);
  const engagementRate = Math.round((summary.engaged / summary.total) * 100);

  return (
    <div className="flex flex-col h-full">
      {/* Budget Overview */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="grid grid-cols-6 gap-4">
          <BudgetCard
            label="Budget total"
            value={formatCurrency(summary.total)}
            icon={Wallet}
            iconColor="text-blue-400"
          />
          <BudgetCard
            label="Engagé"
            value={formatCurrency(summary.engaged)}
            subValue={`${engagementRate}%`}
            icon={Receipt}
            iconColor="text-purple-400"
          />
          <BudgetCard
            label="Consommé"
            value={formatCurrency(summary.consumed)}
            subValue={`${consumptionRate}%`}
            icon={CreditCard}
            iconColor="text-amber-400"
          />
          <BudgetCard
            label="Disponible"
            value={formatCurrency(summary.remaining)}
            icon={PiggyBank}
            iconColor="text-emerald-400"
          />
          <BudgetCard
            label="Prévision"
            value={formatCurrency(summary.forecast)}
            icon={LineChart}
            iconColor="text-slate-400"
          />
          <BudgetCard
            label="Écart"
            value={formatCurrency(summary.variance)}
            icon={summary.variance >= 0 ? TrendingUp : TrendingDown}
            iconColor={summary.variance >= 0 ? 'text-emerald-400' : 'text-red-400'}
            highlight={summary.variance < 0}
          />
        </div>

        {/* Progress bars */}
        <div className="mt-4 space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Taux d'engagement</span>
              <span className="text-xs text-slate-400">{engagementRate}%</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${engagementRate}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Taux de consommation</span>
              <span className="text-xs text-slate-400">{consumptionRate}%</span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${consumptionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <h3 className="text-sm font-medium text-slate-300">Engagements en attente</h3>
        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-1" />
          Nouvel engagement
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <SurveillanceTable
          tableId="financial-commitments"
          items={data}
          onItemClick={(item) => openDetailPanel('commitment', item.id, item)}
          onAction={(action, item) => {
            if (action === 'view') openModal('commitment-detail', item);
          }}
        />
      </div>
    </div>
  );
}

function InvoicingView({ data }: { data: typeof invoices }) {
  const { openModal } = useGovernanceCommandCenterStore();

  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    overdue: { label: 'En retard', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
    paid: { label: 'Payée', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  };

  const pendingTotal = data.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const overdueTotal = data.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-slate-400">En attente</span>
          </div>
          <p className="text-xl font-bold text-slate-200">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pendingTotal)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{data.filter(i => i.status === 'pending').length} factures</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-900/60 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-xs text-slate-400">En retard</span>
          </div>
          <p className="text-xl font-bold text-red-400">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(overdueTotal)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{data.filter(i => i.status === 'overdue').length} factures</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Payées ce mois</span>
          </div>
          <p className="text-xl font-bold text-slate-200">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(32000)}
          </p>
          <p className="text-xs text-slate-400 mt-1">1 facture</p>
        </div>
      </div>

      {/* Invoices list */}
      <div className="space-y-2">
        {data.map((invoice) => {
          const status = statusConfig[invoice.status as keyof typeof statusConfig];
          return (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 cursor-pointer transition-colors"
              onClick={() => openModal('commitment-detail', invoice)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{invoice.ref}</p>
                  <p className="text-xs text-slate-400">{invoice.supplier}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-300">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.amount)}
                  </p>
                  <p className="text-xs text-slate-400">Éch. {invoice.dueDate}</p>
                </div>
                <Badge variant="default" className={cn('text-xs', status.color)}>
                  {status.label}
                  {invoice.daysOverdue > 0 && ` +${invoice.daysOverdue}j`}
                </Badge>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ForecastsView() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <LineChart className="h-12 w-12 mx-auto mb-4 text-slate-600" />
        <p className="text-sm text-slate-400">Prévisions budgétaires</p>
        <p className="text-xs text-slate-600 mt-1">Courbes prévisionnelles</p>
      </div>
    </div>
  );
}

function VariancesView() {
  const variances = [
    { project: 'Tours Horizon', budget: 12500000, actual: 13200000, variance: -700000, percent: -5.6 },
    { project: 'Centre Commercial', budget: 8200000, actual: 7900000, variance: 300000, percent: 3.7 },
    { project: 'Résidence Jardins', budget: 5800000, actual: 6100000, variance: -300000, percent: -5.2 },
    { project: 'Gare Est', budget: 4500000, actual: 4400000, variance: 100000, percent: 2.2 },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Analyse des écarts</h3>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
          2 projets en dépassement
        </Badge>
      </div>

      <div className="space-y-3">
        {variances.map((v) => (
          <div
            key={v.project}
            className={cn(
              'p-4 rounded-lg border',
              v.variance < 0
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-slate-900/60 border-slate-800/50'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">{v.project}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                  <span>Budget: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v.budget)}</span>
                  <span>Réel: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v.actual)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {v.variance < 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-red-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                  )}
                  <span className={cn(
                    'text-lg font-bold',
                    v.variance < 0 ? 'text-red-400' : 'text-emerald-400'
                  )}>
                    {v.percent > 0 ? '+' : ''}{v.percent}%
                  </span>
                </div>
                <p className={cn(
                  'text-sm',
                  v.variance < 0 ? 'text-red-400' : 'text-emerald-400'
                )}>
                  {v.variance > 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v.variance)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CashflowView({ data }: { data: typeof cashflowData }) {
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]));

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Trésorerie</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-slate-400">Entrées</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-slate-400">Sorties</span>
          </div>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="h-64 flex items-end justify-between gap-4 px-4">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex gap-1 items-end h-48">
              <div
                className="flex-1 bg-emerald-500/80 rounded-t"
                style={{ height: `${(d.income / maxValue) * 100}%` }}
              />
              <div
                className="flex-1 bg-red-500/80 rounded-t"
                style={{ height: `${(d.expenses / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{d.month}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/50">
        <div className="text-center">
          <p className="text-xs text-slate-400">Total entrées</p>
          <p className="text-lg font-bold text-emerald-400">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
              data.reduce((sum, d) => sum + d.income, 0)
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Total sorties</p>
          <p className="text-lg font-bold text-red-400">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
              data.reduce((sum, d) => sum + d.expenses, 0)
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Solde</p>
          <p className="text-lg font-bold text-blue-400">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
              data.reduce((sum, d) => sum + d.income - d.expenses, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function BudgetCard({
  label,
  value,
  subValue,
  icon: Icon,
  iconColor,
  highlight = false,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      'p-3 rounded-lg border',
      highlight ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900/60 border-slate-800/50'
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-4 w-4', iconColor)} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-200">{value}</p>
      {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
    </div>
  );
}

