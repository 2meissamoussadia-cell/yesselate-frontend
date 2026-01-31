/**
 * ContentRouter pour Finances
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  BarChart3,
  Archive,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Receipt,
  CreditCard,
  PiggyBank,
  Target,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransactionsDataTable } from '../components/TransactionsDataTable';
import { useTransactions, useInvoices, useBudgets } from '@/lib/hooks/useFinancesData';
import type { Transaction } from '@/lib/data/finances/mockData';

interface ContentRouterProps {
  category: string;
  subCategory: string;
  filter?: string | null;
  onViewTransaction?: (transaction: Transaction) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const FinancesContentRouter = React.memo(function FinancesContentRouter({
  category,
  subCategory,
  filter,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: ContentRouterProps) {
  // Overview Dashboard
  if (category === 'overview') {
    return <OverviewDashboard subCategory={subCategory} />;
  }

  // Revenue view
  if (category === 'revenue') {
    return (
      <RevenueView
        subCategory={subCategory}
        filter={filter}
        onView={onViewTransaction}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
      />
    );
  }

  // Expenses view
  if (category === 'expenses') {
    return (
      <ExpensesView
        subCategory={subCategory}
        filter={filter}
        onView={onViewTransaction}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
      />
    );
  }

  // Budget view
  if (category === 'budget') {
    return <BudgetView subCategory={subCategory} filter={filter} />;
  }

  // Pending view
  if (category === 'pending') {
    return <PendingView subCategory={subCategory} />;
  }

  // Overdue view
  if (category === 'overdue') {
    return <OverdueView subCategory={subCategory} filter={filter} />;
  }

  // Validated view
  if (category === 'validated') {
    return <ValidatedView subCategory={subCategory} />;
  }

  // Reports view
  if (category === 'reports') {
    return <ReportsView subCategory={subCategory} />;
  }

  // Analytics view
  if (category === 'analytics') {
    return <AnalyticsView subCategory={subCategory} />;
  }

  // Archive view
  if (category === 'archive') {
    return <ArchiveView subCategory={subCategory} />;
  }

  // Default placeholder
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory}
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Overview Dashboard
// ================================
const OverviewDashboard = React.memo(function OverviewDashboard({
  subCategory,
}: {
  subCategory: string;
}) {
  const metrics = [
    {
      id: 'revenue',
      label: 'Revenus Totaux',
      value: '4.55 Md',
      change: '+12%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      id: 'expenses',
      label: 'Dépenses Totales',
      value: '3.12 Md',
      change: '+8%',
      trend: 'up' as const,
      icon: TrendingDown,
      color: 'rose',
    },
    {
      id: 'profit',
      label: 'Bénéfice Net',
      value: '1.43 Md',
      change: '+18%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'blue',
    },
    {
      id: 'cash',
      label: 'Trésorerie',
      value: '892 M',
      change: '+5%',
      trend: 'up' as const,
      icon: Wallet,
      color: 'cyan',
    },
  ];

  const quickActions = [
    { id: 'invoice', label: 'Nouvelle Facture', icon: Receipt, color: 'emerald' },
    { id: 'expense', label: 'Nouvelle Dépense', icon: CreditCard, color: 'rose' },
    { id: 'transfer', label: 'Transfert', icon: Building2, color: 'blue' },
    { id: 'report', label: 'Générer Rapport', icon: FileText, color: 'purple' },
  ];

  const recentTransactions = [
    {
      id: '1',
      type: 'income',
      description: 'Paiement Client - Projet Alpha',
      amount: '+125,000,000',
      date: 'Il y a 2h',
      status: 'completed',
    },
    {
      id: '2',
      type: 'expense',
      description: 'Achat équipement - Bureau BTP',
      amount: '-45,000,000',
      date: 'Il y a 5h',
      status: 'completed',
    },
    {
      id: '3',
      type: 'income',
      description: 'Acompte - Projet Beta',
      amount: '+80,000,000',
      date: 'Hier',
      status: 'pending',
    },
    {
      id: '4',
      type: 'expense',
      description: 'Salaires - Décembre',
      amount: '-320,000,000',
      date: 'Hier',
      status: 'completed',
    },
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Budget projet dépassé à 85%',
      project: 'Projet Gamma',
    },
    {
      id: '2',
      type: 'critical',
      title: 'Facture impayée depuis 60 jours',
      project: 'Client XYZ',
    },
    {
      id: '3',
      type: 'info',
      title: '5 factures en attente de validation',
      project: 'Comptabilité',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          const colorClasses = {
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          };

          return (
            <div
              key={metric.id}
              className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'p-2 rounded-lg border',
                    colorClasses[metric.color as keyof typeof colorClasses]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  )}
                  <span
                    className={cn(
                      'text-xs',
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-200">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Transactions Récentes
            </h3>
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
              Voir tout
            </Button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-lg border border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      )}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      )}
                    >
                      {tx.amount} XOF
                    </p>
                    <Badge
                      variant={tx.status === 'completed' ? 'default' : 'gray'}
                      className="text-xs mt-1"
                    >
                      {tx.status === 'completed' ? 'Terminé' : 'En cours'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200">Alertes</h3>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    alert.type === 'critical'
                      ? 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10'
                      : alert.type === 'warning'
                      ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                      : 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10'
                  )}
                >
                  <p className="text-sm font-medium text-slate-200">{alert.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{alert.project}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 mb-2',
                        action.color === 'emerald' && 'text-emerald-400',
                        action.color === 'rose' && 'text-rose-400',
                        action.color === 'blue' && 'text-blue-400',
                        action.color === 'purple' && 'text-purple-400'
                      )}
                    />
                    <p className="text-xs font-medium text-slate-300">{action.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">
            Exécution Budgétaire
          </h3>
          <Badge variant="default" className="text-xs">
            Q4 2024
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Budget Alloué', value: '15 Md', progress: 100, color: 'slate' },
            { label: 'Budget Consommé', value: '8.55 Md', progress: 57, color: 'cyan' },
            { label: 'Budget Restant', value: '6.45 Md', progress: 43, color: 'emerald' },
          ].map((budget, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{budget.label}</p>
                <p className="text-sm font-semibold text-slate-200">{budget.value}</p>
              </div>
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full transition-all',
                    budget.color === 'cyan' && 'bg-gradient-to-r from-cyan-500 to-blue-500',
                    budget.color === 'emerald' && 'bg-gradient-to-r from-emerald-500 to-green-500',
                    budget.color === 'slate' && 'bg-slate-700'
                  )}
                  style={{ width: `${budget.progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{budget.progress}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ================================
// Revenue View - AVEC DATATABLE
// ================================
const RevenueView = React.memo(function RevenueView({
  subCategory,
  filter,
  onView,
  onEdit,
  onDelete,
}: {
  subCategory: string;
  filter?: string | null;
  onView?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}) {
  const { data: transactions, isLoading } = useTransactions({ type: 'revenue' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Revenus</h2>
          <p className="text-sm text-slate-400 mt-1">
            {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <TrendingUp className="w-4 h-4 mr-2" />
          Nouvelle Facture
        </Button>
      </div>

      {/* Utilisation du DataTable avancé */}
      <TransactionsDataTable
        transactions={transactions}
        isLoading={isLoading}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
});

// ================================
// Expenses View - AVEC DATATABLE
// ================================
const ExpensesView = React.memo(function ExpensesView({
  subCategory,
  filter,
  onView,
  onEdit,
  onDelete,
}: {
  subCategory: string;
  filter?: string | null;
  onView?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}) {
  const { data: transactions, isLoading } = useTransactions({ type: 'expense' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Dépenses</h2>
          <p className="text-sm text-slate-400 mt-1">
            {transactions.length} dépense{transactions.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white">
          <CreditCard className="w-4 h-4 mr-2" />
          Nouvelle Dépense
        </Button>
      </div>

      {/* Utilisation du DataTable avancé */}
      <TransactionsDataTable
        transactions={transactions}
        isLoading={isLoading}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
});

// ================================
// Budget View
// ================================
const BudgetView = React.memo(function BudgetView({
  subCategory,
  filter,
}: {
  subCategory: string;
  filter?: string | null;
}) {
  const budgets = [
    {
      id: '1',
      name: 'Budget Opérationnel',
      allocated: 5000000000,
      consumed: 3200000000,
      status: 'within',
    },
    {
      id: '2',
      name: 'Budget Projets',
      allocated: 8000000000,
      consumed: 7200000000,
      status: 'warning',
    },
    {
      id: '3',
      name: 'Budget RH',
      allocated: 2000000000,
      consumed: 2100000000,
      status: 'exceeded',
    },
    {
      id: '4',
      name: 'Budget Marketing',
      allocated: 500000000,
      consumed: 280000000,
      status: 'within',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Budgets</h2>
          <p className="text-sm text-slate-400 mt-1">
            {budgets.length} budget{budgets.length > 1 ? 's' : ''} suivis
          </p>
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
          <Target className="w-4 h-4 mr-2" />
          Nouveau Budget
        </Button>
      </div>

      <div className="grid gap-4">
        {budgets.map((budget) => {
          const percentage = Math.round((budget.consumed / budget.allocated) * 100);

          return (
            <div
              key={budget.id}
              className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      budget.status === 'within'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : budget.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    )}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{budget.name}</p>
                    <p className="text-xs text-slate-400">
                      {(budget.consumed / 1000000000).toFixed(2)} Md / {(budget.allocated / 1000000000).toFixed(2)} Md
                    </p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    'text-xs',
                    budget.status === 'within'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : budget.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  )}
                >
                  {percentage}%
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full transition-all',
                      budget.status === 'within'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                        : budget.status === 'warning'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-rose-500 to-red-500'
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Restant: {((budget.allocated - budget.consumed) / 1000000000).toFixed(2)} Md</span>
                  <span>
                    {budget.status === 'exceeded' ? 'Dépassé' : budget.status === 'warning' ? 'Attention' : 'OK'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ================================
// Pending View
// ================================
const PendingView = React.memo(function PendingView({
  subCategory,
}: {
  subCategory: string;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Transactions en Attente
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Overdue View
// ================================
const OverdueView = React.memo(function OverdueView({
  subCategory,
  filter,
}: {
  subCategory: string;
  filter?: string | null;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Impayés et Retards
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Validated View
// ================================
const ValidatedView = React.memo(function ValidatedView({
  subCategory,
}: {
  subCategory: string;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Transactions Validées
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Reports View
// ================================
const ReportsView = React.memo(function ReportsView({
  subCategory,
}: {
  subCategory: string;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Rapports Financiers
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Analytics View
// ================================
const AnalyticsView = React.memo(function AnalyticsView({
  subCategory,
}: {
  subCategory: string;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Analytics Financier
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Archive View
// ================================
const ArchiveView = React.memo(function ArchiveView({
  subCategory,
}: {
  subCategory: string;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Archive className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          Archives Financières
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

