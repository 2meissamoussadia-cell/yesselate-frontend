/**
 * Phase 7 — Mobile-First Cockpit DG (swipe quadrants, header compact, executive controls).
 * Quadrants: Spheres | Workflow | Ecosystème. Swipe gauche/droite via useTouchGestures.
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { cn } from '@/lib/utils';

const HealthSphereGrid = dynamic(
  () => import('./HealthSphereGrid').then((mod) => ({ default: mod.HealthSphereGrid })),
  { ssr: false, loading: () => <div className="min-h-[320px] rounded-2xl bg-slate-900/40 flex items-center justify-center text-slate-400 text-sm">Chargement…</div> }
);

const QUADRANTS = ['Spheres', 'Workflow', 'Ecosystème'] as const;

export interface MobileCockpitProps {
  onDrilldown?: (chantierId: string) => void;
  onNewChantier?: () => void;
}

export function MobileCockpit({ onDrilldown, onNewChantier }: MobileCockpitProps) {
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const [activeQuadrant, setActiveQuadrant] = useState(0);

  const onSwipeLeft = useCallback(() => {
    setActiveQuadrant((prev) => (prev + 1) % 3);
  }, []);
  const onSwipeRight = useCallback(() => {
    setActiveQuadrant((prev) => (prev + 2) % 3);
  }, []);

  const swipeRef = useTouchGestures(
    { onSwipeLeft, onSwipeRight },
    { enabled: true, preventDefault: false }
  );

  return (
    <div
      ref={swipeRef as React.RefObject<HTMLDivElement>}
      className="h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden"
    >
      {/* Mobile Header Compact (h-16) */}
      <header className="h-16 shrink-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 px-4 flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-xl font-black text-white">Y</span>
        </div>
        <div className="text-lg font-bold text-blue-400">
          {QUADRANTS[activeQuadrant]}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center animate-pulse text-lg" title="Alertes">🚨</div>
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-lg" title="Voice">🎙️</div>
        </div>
      </header>

      {/* Swipe Quadrants */}
      <div className="flex-1 flex overflow-hidden relative">
        <div
          className={cn(
            'absolute inset-0 flex transition-transform duration-300 ease-out',
            activeQuadrant === 0 && 'translate-x-0',
            activeQuadrant === 1 && '-translate-x-full',
            activeQuadrant === 2 && '-translate-x-[200%]'
          )}
        >
          <div className="w-full shrink-0 min-h-0 flex flex-col p-2">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden flex-1 min-h-0">
              <HealthSphereGrid
                maxSpheres={20}
                onDrilldown={onDrilldown}
                onNewChantier={onNewChantier}
                className="min-h-[320px] h-full"
              />
            </div>
          </div>
          <div className="w-full shrink-0 min-h-0 overflow-auto p-4">
            <h3 className="text-slate-100 font-semibold mb-3">Workflow</h3>
            <div className="flex gap-2 flex-wrap">
              {['Phase1', 'Phase2', 'Phase3', 'Phase4', 'Phase5', 'Phase6'].map((phase, i) => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => navigate('performance', 'delays', 'critiques')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium',
                    i === 3 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-slate-700 bg-slate-800/50 text-slate-300'
                  )}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full shrink-0 min-h-0 overflow-auto p-4">
            <h3 className="text-slate-100 font-semibold mb-3">Écosystème</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Ouvriers KYC : 27 · 12/27 sur chantier</li>
              <li>Quincailleries : 34 h retard · 3 ruptures</li>
              <li>Huissiers : 2 dossiers en attente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Executive Controls (4 gros boutons) */}
      <footer className="h-20 shrink-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-3 flex items-center justify-center gap-3">
        {[
          { icon: '🚨', label: 'Alertes' },
          { icon: '💰', label: 'Budget' },
          { icon: '📞', label: 'Contact' },
          { icon: '📄', label: 'Documents' },
        ].map(({ icon, label }, i) => (
          <button
            key={i}
            type="button"
            className="w-14 h-14 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-110 text-xl"
            title={label}
          >
            {icon}
          </button>
        ))}
      </footer>
    </div>
  );
}
