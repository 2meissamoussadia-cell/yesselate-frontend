'use client';

import { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle,
  Plus, Edit2, Trash2, BarChart3, PieChart, Download,
  Calendar, Building2, Filter, RefreshCw
} from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

type BudgetCategory = 'congés' | 'dépenses' | 'déplacements' | 'formation' | 'autres';

type Budget = {
  id: string;
  bureau: string;
  year: number;
  total: number;
  consumed: number;
  categories: Record<BudgetCategory, { allocated: number; consumed: number }>;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
};

type Expense = {
  id: string;
  budgetId: string;
  category: BudgetCategory;
  amount: number;
  description: string;
  demandeId?: string;
  date: string;
};

// Données simulées
const MOCK_BUDGETS: Budget[] = [
  {
    id: 'BUD-2026-BA',
    bureau: 'Bureau A',
    year: 2026,
    total: 50000000,
    consumed: 18500000,
    categories: {
      congés: { allocated: 5000000, consumed: 2100000 },
      dépenses: { allocated: 20000000, consumed: 8500000 },
      déplacements: { allocated: 15000000, consumed: 5200000 },
      formation: { allocated: 8000000, consumed: 2200000 },
      autres: { allocated: 2000000, consumed: 500000 },
    },
    status: 'healthy',
    lastUpdated: '2026-01-10T10:00:00Z',
  },
  {
    id: 'BUD-2026-BM',
    bureau: 'Bureau M',
    year: 2026,
    total: 35000000,
    consumed: 28000000,
    categories: {
      congés: { allocated: 3000000, consumed: 2800000 },
      dépenses: { allocated: 15000000, consumed: 12500000 },
      déplacements: { allocated: 12000000, consumed: 9500000 },
      formation: { allocated: 4000000, consumed: 2700000 },
      autres: { allocated: 1000000, consumed: 500000 },
    },
    status: 'critical',
    lastUpdated: '2026-01-10T09:00:00Z',
  },
  {
    id: 'BUD-2026-BCT',
    bureau: 'Bureau CT',
    year: 2026,
    total: 42000000,
    consumed: 29400000,
    categories: {
      congés: { allocated: 4000000, consumed: 3200000 },
      dépenses: { allocated: 18000000, consumed: 13500000 },
      déplacements: { allocated: 14000000, consumed: 10200000 },
      formation: { allocated: 5000000, consumed: 2200000 },
      autres: { allocated: 1000000, consumed: 300000 },
    },
    status: 'warning',
    lastUpdated: '2026-01-09T16:00:00Z',
  },
];

const CATEGORY_CONFIG: Record<BudgetCategory, { label: string; icon: string; color: string }> = {
  congés: { label: 'Congés', icon: '🏖️', color: 'bg-blue-500' },
  dépenses: { label: 'Dépenses', icon: '💸', color: 'bg-emerald-500' },
  déplacements: { label: 'Déplacements', icon: '✈️', color: 'bg-purple-500' },
  formation: { label: 'Formation', icon: '📚', color: 'bg-amber-500' },
  autres: { label: 'Autres', icon: '📦', color: 'bg-slate-500' },
};

export function RHBudgetManagerModal({ open, onClose }: Props) {
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [filterBureau, setFilterBureau] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const filtered = filterBureau === 'all' 
      ? budgets 
      : budgets.filter(b => b.bureau === filterBureau);
    
    const totalBudget = filtered.reduce((sum, b) => sum + b.total, 0);
    const totalConsumed = filtered.reduce((sum, b) => sum + b.consumed, 0);
    const criticalCount = filtered.filter(b => b.status === 'critical').length;
    const warningCount = filtered.filter(b => b.status === 'warning').length;
    
    return {
      totalBudget,
      totalConsumed,
      remaining: totalBudget - totalConsumed,
      consumedPercent: totalBudget > 0 ? (totalConsumed / totalBudget) * 100 : 0,
      criticalCount,
      warningCount,
    };
  }, [budgets, filterBureau]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getStatusConfig = (status: Budget['status']) => {
    switch (status) {
      case 'healthy':
        return { label: 'Sain', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
      case 'warning':
        return { label: 'Attention', color: 'bg-amber-500', textColor: 'text-amber-500' };
      case 'critical':
        return { label: 'Critique', color: 'bg-red-500', textColor: 'text-red-500' };
    }
  };

  return (
    <FluentModal
      open={open}
      title="Gestion des Budgets RH"
      onClose={onClose}
      className="max-w-5xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-slate-400">Budget total</span>
            </div>
            <p className="text-xl font-bold">{formatAmount(globalStats.totalBudget)}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-slate-400">Consommé</span>
            </div>
            <p className="text-xl font-bold">{formatAmount(globalStats.totalConsumed)}</p>
            <p className="text-xs text-slate-400">{globalStats.consumedPercent.toFixed(1)}% du budget</p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-slate-400">Restant</span>
            </div>
            <p className="text-xl font-bold">{formatAmount(globalStats.remaining)}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-slate-400">Alertes</span>
            </div>
            <p className="text-xl font-bold">{globalStats.criticalCount + globalStats.warningCount}</p>
            <p className="text-xs text-slate-400">
              {globalStats.criticalCount} critique, {globalStats.warningCount} attention
            </p>
          </div>
        </div>

        {/* Filtres et actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {['all', 'Bureau A', 'Bureau M', 'Bureau CT'].map(bureau => (
                <button
                  key={bureau}
                  onClick={() => setFilterBureau(bureau)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    filterBureau === bureau
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-700"
                  )}
                >
                  {bureau === 'all' ? 'Tous' : bureau}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau budget
            </Button>
          </div>
        </div>

        {/* Liste des budgets */}
        <div className="space-y-4">
          {budgets
            .filter(b => filterBureau === 'all' || b.bureau === filterBureau)
            .map(budget => {
              const statusConfig = getStatusConfig(budget.status);
              const percentUsed = (budget.consumed / budget.total) * 100;
              
              return (
                <div
                  key={budget.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer",
                    "border-slate-200 dark:border-slate-700",
                    "hover:border-orange-500/50 hover:shadow-md",
                    selectedBudget?.id === budget.id && "ring-2 ring-orange-500"
                  )}
                  onClick={() => setSelectedBudget(budget)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <span className="font-semibold">{budget.bureau}</span>
                        <Badge className={cn("text-white", statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        Année {budget.year} • Mis à jour {new Date(budget.lastUpdated).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setSelectedBudget(budget); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Barre de progression globale */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400">Consommation globale</span>
                      <span className={cn("font-semibold", statusConfig.textColor)}>
                        {percentUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all", statusConfig.color)}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1 text-slate-400">
                      <span>{formatAmount(budget.consumed)}</span>
                      <span>{formatAmount(budget.total)}</span>
                    </div>
                  </div>

                  {/* Catégories */}
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.entries(budget.categories) as [BudgetCategory, { allocated: number; consumed: number }][]).map(
                      ([category, { allocated, consumed }]) => {
                        const config = CATEGORY_CONFIG[category];
                        const catPercent = allocated > 0 ? (consumed / allocated) * 100 : 0;
                        
                        return (
                          <div key={category} className="text-center">
                            <span className="text-lg">{config.icon}</span>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                              <div
                                className={cn("h-full", config.color)}
                                style={{ width: `${Math.min(catPercent, 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{catPercent.toFixed(0)}%</p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Détails du budget sélectionné */}
        {selectedBudget && !isEditing && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-orange-500" />
              Détails: {selectedBudget.bureau} - {selectedBudget.year}
            </h4>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(Object.entries(selectedBudget.categories) as [BudgetCategory, { allocated: number; consumed: number }][]).map(
                ([category, { allocated, consumed }]) => {
                  const config = CATEGORY_CONFIG[category];
                  const remaining = allocated - consumed;
                  const percent = allocated > 0 ? (consumed / allocated) * 100 : 0;
                  
                  return (
                    <div
                      key={category}
                      className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span>{config.icon}</span>
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div
                          className={cn("h-full", config.color)}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Alloué</span>
                          <span>{formatAmount(allocated)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Consommé</span>
                          <span>{formatAmount(consumed)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-400">Restant</span>
                          <span className={remaining < 0 ? 'text-red-500' : 'text-emerald-500'}>
                            {formatAmount(remaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddExpense(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter dépense
              </Button>
            </div>
          </div>
        )}
      </div>
    </FluentModal>
  );
}

