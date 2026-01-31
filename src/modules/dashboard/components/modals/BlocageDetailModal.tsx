// src/modules/dashboard/components/modals/BlocageDetailModal.tsx
// Phase 4: Modal pour afficher le détail d'un blocage

'use client';

import React from 'react';
import { X, AlertTriangle, Building2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { zIndexClass } from '../../utils/zIndex';

interface Blocage {
  id: string;
  type: string;
  count: number;
  priorite: 'critique' | 'haute' | 'moyenne';
  bureau: string;
}

interface BlocageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocage: Blocage | null;
}

/**
 * Modal pour afficher le détail d'un blocage
 * Phase 4: Modals et Navigation
 */
export function BlocageDetailModal({ isOpen, onClose, blocage }: BlocageDetailModalProps) {
  if (!isOpen || !blocage) return null;

  const prioriteConfig = {
    critique: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'Critique',
    },
    haute: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      label: 'Haute',
    },
    moyenne: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      label: 'Moyenne',
    },
  };

  const config = prioriteConfig[blocage.priorite];

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
              Détail du blocage
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
            <h3 className="text-lg font-semibold text-white mb-2">{blocage.type}</h3>
            <p className="text-slate-400 text-sm">Identifiant: {blocage.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={cn('p-4 rounded-lg border', config.bg, config.border)}>
              <div className="text-sm text-slate-400 mb-1">Priorité</div>
              <div className={cn('text-lg font-semibold', config.text)}>
                {config.label}
              </div>
            </div>
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
              <div className="text-sm text-slate-400 mb-1">Nombre d'occurrences</div>
              <div className="text-lg font-semibold text-white">{blocage.count}</div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-400 mb-1">Bureau concerné</div>
                <div className="text-lg font-semibold text-white">{blocage.bureau}</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Ce blocage de priorité {config.label.toLowerCase()} affecte {blocage.count} demande(s) au bureau {blocage.bureau}.
              Une action immédiate est recommandée pour débloquer le processus.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
