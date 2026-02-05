// src/modules/dashboard/components/modals/BudgetDetailModal.tsx
// Phase 4: Modal pour afficher le détail d'un KPI budget

'use client';

import React from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { zIndexClass } from '../../utils/zIndex';

interface BudgetKPI {
  id: string;
  label: string;
  value: string | number;
  trend?: string;
  description?: string;
}

interface BudgetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: BudgetKPI | null;
}

/**
 * Modal pour afficher le détail d'un KPI budget
 * Phase 4: Modals et Navigation
 */
export function BudgetDetailModal({ isOpen, onClose, kpi }: BudgetDetailModalProps) {
  if (!isOpen || !kpi) return null;

  const TrendIcon = kpi.trend?.includes('+') ? TrendingUp : kpi.trend?.includes('-') ? TrendingDown : null;
  const trendColor = kpi.trend?.includes('+') ? 'text-red-400' : kpi.trend?.includes('-') ? 'text-green-400' : 'text-slate-400';

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity',
          zIndexClass('modalOverlay'),
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
          'md:w-[90vw] md:max-w-2xl',
          'bg-slate-900 border border-slate-700 rounded-xl shadow-2xl',
          'flex flex-col',
          zIndexClass('modal'),
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-blue-500/10">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-blue-400">
              Détail du KPI Budget
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{kpi.label}</h3>
            {kpi.description && (
              <p className="text-slate-400 text-sm">{kpi.description}</p>
            )}
          </div>

          <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
            <div className="text-sm text-slate-400 mb-1">Valeur actuelle</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
          </div>

          {kpi.trend && (
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Tendance</div>
                  <div className="flex items-center gap-2">
                    {TrendIcon && <TrendIcon className={cn('w-5 h-5', trendColor)} />}
                    <span className={cn('text-lg font-semibold', trendColor)}>
                      {kpi.trend}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Ce KPI budget reflète l'état actuel de la consommation budgétaire.
              Surveillez régulièrement son évolution pour maintenir un contrôle optimal des finances.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
