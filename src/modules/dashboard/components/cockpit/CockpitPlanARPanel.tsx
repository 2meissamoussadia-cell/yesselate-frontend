/**
 * Phase 6 — Plan AR vs Réalité
 * Comparaison côte à côte Plan / Photo réelle avec indicateur de décalage (mock).
 */

'use client';

import React, { useState } from 'react';
import { Layers, Camera, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { colors } from '../../utils/dashboardDesignTokens';
import { plansAR } from '../../data/photoGpsMock';

export function CockpitPlanARPanel() {
  const [index, setIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // 0 = plan, 100 = réel
  const plan = plansAR[index];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Chantier</span>
        <div className="flex gap-1">
          {plansAR.map((p, i) => (
            <button
              key={p.chantierId}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                colors.border.default,
                colors.bg.tertiary,
                i === index ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-800/50'
              )}
            >
              {p.chantierId}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
        <p className="px-4 py-2 text-sm font-medium text-slate-200 border-b border-slate-800/60">
          {plan.label}
          {plan.ecartCm != null && (
            <span className="ml-2 inline-flex items-center gap-1 text-amber-400 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              Écart estimé : {plan.ecartCm} cm
            </span>
          )}
        </p>

        <div className="relative aspect-video bg-slate-950">
          {/* Plan (gauche) */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={plan.planUrl}
              alt="Plan"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-lg bg-slate-900/90 px-2 py-1 text-xs font-medium text-slate-300">
              <Layers className="h-3.5 w-3.5" />
              Plan
            </div>
          </div>
          {/* Photo réelle (droite) */}
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <img
              src={plan.photoReelleUrl}
              alt="Réalité"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-lg bg-slate-900/90 px-2 py-1 text-xs font-medium text-slate-300">
              <Camera className="h-3.5 w-3.5" />
              Réalité
            </div>
          </div>
          <input
            type="range"
            min={5}
            max={95}
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full z-10 opacity-0 cursor-ew-resize"
            aria-label="Comparer plan et réalité"
          />
          <div
            className="absolute top-0 bottom-0 w-1 bg-blue-500/90 z-[8] pointer-events-none"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-10 rounded bg-blue-500 border-2 border-white/50 shadow-lg flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">||</span>
            </div>
          </div>
        </div>

        <p className="px-4 py-2 text-[10px] text-slate-400 border-t border-slate-800/60">
          Glissez la poignée pour comparer Plan (gauche) et Photo réelle (droite). Données mock — Phase 6.
        </p>
      </div>
    </div>
  );
}
