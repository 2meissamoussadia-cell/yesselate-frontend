/**
 * Phase 6 — Détail chantier (clic sphère) : équipe GPS live + PAY NOW Orange Money.
 * Ouvert au drilldown depuis Health Spheres.
 */

'use client';

import React from 'react';
import { X, User, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChantierMock } from '../../data/chantiersMock';
import { OrangeMoneyButton } from '../cockpit/OrangeMoneyButton';
import { colors } from '../../utils/dashboardDesignTokens';

export interface ChantierDetailModalProps {
  chantier: ChantierMock;
  onClose: () => void;
}

export function ChantierDetailModal({ chantier, onClose }: ChantierDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chantier-detail-title"
    >
      <div
        className={cn(
          'w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden',
          colors.border.default,
          colors.bg.secondary
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <h2 id="chantier-detail-title" className="text-lg font-semibold text-slate-100">
            {chantier.id}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">CA</span>
              <p className="font-semibold text-slate-200">
                {(chantier.ca / 1000).toFixed(0)}k FCFA
              </p>
            </div>
            <div>
              <span className="text-slate-400">Santé</span>
              <p className="font-semibold text-emerald-400">
                {(chantier.sante * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <span className="text-slate-400">Marge</span>
              <p className="font-semibold text-slate-200">
                {(chantier.marge * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <span className="text-slate-400">Photos GPS</span>
              <p className="font-semibold text-slate-200">
                {chantier.photosGps}
                {chantier.photosManquantes != null && chantier.photosManquantes > 0
                  ? ` (${chantier.photosManquantes} manq.)`
                  : ''}
              </p>
            </div>
          </div>

          {(chantier.chefChantierName || chantier.bureauControle) && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <User className="h-4 w-4 text-slate-400" />
              <span>
                {chantier.chefChantierName ?? `Bureau ${chantier.bureauControle}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Image className="h-4 w-4 text-slate-400" />
            <span>6 dernières photos GPS en orbite 3D</span>
          </div>

          <div className="pt-4 border-t border-slate-800/60">
            <p className="text-xs text-slate-400 mb-2">Paiement instantané Orange Money</p>
            <OrangeMoneyButton
              chantierId={chantier.id}
              montant={chantier.ca}
              customerPhone={chantier.chefChantierPhone?.replace(/\D/g, '') || '221778123456'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
