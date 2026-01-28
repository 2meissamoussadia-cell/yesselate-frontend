// src/modules/dashboard/components/modals/RiskDetailModal.tsx
// Phase 4: Modal pour afficher le détail d'un risque

'use client';

import React from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zIndexClass } from '../../utils/zIndex';

interface Risk {
  id: string;
  label: string;
  severity: 'high' | 'medium' | 'low';
  count: number;
  trend: string;
}

interface RiskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: Risk | null;
}

/**
 * Modal pour afficher le détail d'un risque
 * Phase 4: Modals et Navigation
 */
export function RiskDetailModal({ isOpen, onClose, risk }: RiskDetailModalProps) {
  if (!isOpen || !risk) return null;

  const severityConfig = {
    high: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'Élevé',
    },
    medium: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      label: 'Moyen',
    },
    low: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      label: 'Faible',
    },
  };

  const config = severityConfig[risk.severity];
  const trendIcon = risk.trend.includes('+') ? TrendingUp : risk.trend.includes('-') ? TrendingDown : Minus;
  const trendColor = risk.trend.includes('+') ? 'text-red-400' : risk.trend.includes('-') ? 'text-green-400' : 'text-slate-400';

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity',
          zIndexClass.modalOverlay,
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
          zIndexClass.modal,
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between p-6 border-b border-slate-700', config.bg)}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={cn('w-6 h-6', config.text)} />
            <h2 className={cn('text-xl font-semibold', config.text)}>
              Détail du risque
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{risk.label}</h3>
            <p className="text-slate-400 text-sm">Identifiant: {risk.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={cn('p-4 rounded-lg border', config.bg, config.border)}>
              <div className="text-sm text-slate-400 mb-1">Sévérité</div>
              <div className={cn('text-lg font-semibold', config.text)}>
                {config.label}
              </div>
            </div>
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <div className="text-sm text-slate-400 mb-1">Nombre d'occurrences</div>
              <div className="text-lg font-semibold text-white">{risk.count}</div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Tendance</div>
                <div className="flex items-center gap-2">
                  <trendIcon className={cn('w-5 h-5', trendColor)} />
                  <span className={cn('text-lg font-semibold', trendColor)}>
                    {risk.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Ce risque nécessite une attention particulière en raison de sa sévérité {config.label.toLowerCase()}.
              Surveillez régulièrement son évolution et prenez les mesures correctives appropriées.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
