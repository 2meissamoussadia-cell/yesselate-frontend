'use client';

/**
 * Composant pour l'onglet RACI de la page Governance
 * PHASE 2 : Extraction du composant monolithique
 */

import React, { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import {
  RACIComparator,
  RACITrendChart,
} from '@/components/features/bmo/governance';
import { VirtualizedRACITable } from './VirtualizedRACITable';

// Lazy load des composants lourds (PHASE 3)
const AISuggestions = lazy(() => import('./AISuggestions').then(m => ({ default: m.AISuggestions })));
const RACIHeatmap = lazy(() => import('./RACIHeatmap').then(m => ({ default: m.RACIHeatmap })));
const RACIPatternDetector = lazy(() => import('./RACIPatternDetector').then(m => ({ default: m.RACIPatternDetector })));
import type { useGovernanceRACI } from '@/hooks/useGovernanceRACI';
import type { Alert } from '@/lib/types/alerts.types';

const RACI_COLORS: Record<string, string> = {
  'R': 'bg-emerald-400/80 text-white',
  'A': 'bg-blue-400/80 text-white',
  'C': 'bg-amber-400/80 text-white',
  'I': 'bg-slate-400/80 text-white',
  '-': 'bg-slate-700/30 text-slate-400',
};

const RACI_LABELS: Record<string, string> = {
  'R': 'Responsible',
  'A': 'Accountable',
  'C': 'Consulted',
  'I': 'Informed',
  '-': 'Non impliqué',
};

interface RACITabProps {
  raciHook: ReturnType<typeof useGovernanceRACI>;
  alerts: Alert[];
  onApplySuggestion?: (id: string) => void;
}

// Mémorisation du composant (PHASE 3)
export const RACITab = React.memo(function RACITab({ raciHook, alerts, onApplySuggestion }: RACITabProps) {
  const { darkMode } = useAppStore();
  const {
    stats,
    selectedR,
    raciData,
    bureaux,
    selectedActivity,
    showComparator,
    showAISuggestions,
    showHeatmap,
    setSelectedActivity,
    setShowComparator,
  } = raciHook;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header Stats */}
      <Card className="bg-blue-400/8 border-blue-400/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">🧠</span>
            <div className="flex-1">
              <h3 className="font-bold text-blue-300/80 text-sm sm:text-base">Cerveau organisationnel</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                <span className="text-emerald-300/80 font-bold">{stats.bmoGoverned}</span> activités pilotées par BMO •{' '}
                <span className="text-red-300/80 font-bold">{stats.critical}</span> critiques •{' '}
                <span className="text-amber-300/80 font-bold">{stats.locked}</span> verrouillées
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparateur RACI */}
      {showComparator && (
        <RACIComparator
          activities={raciData}
          bureaux={bureaux}
          onClose={() => setShowComparator(false)}
        />
      )}

      {/* Suggestions IA - Lazy loaded */}
      {showAISuggestions && (
        <Suspense fallback={<div className="h-32 bg-slate-800/50 rounded animate-pulse" />}>
          <AISuggestions
            raciData={raciData}
            alerts={alerts}
            onApplySuggestion={onApplySuggestion}
          />
          <Suspense fallback={<div className="h-24 bg-slate-800/50 rounded animate-pulse mt-2" />}>
            <RACIPatternDetector raciData={raciData} bureaux={bureaux} />
          </Suspense>
        </Suspense>
      )}

      {/* Heatmap RACI - Lazy loaded */}
      {showHeatmap && (
        <Suspense fallback={<div className="h-64 bg-slate-800/50 rounded animate-pulse" />}>
          <RACIHeatmap raciData={raciData} bureaux={bureaux} />
        </Suspense>
      )}

      {/* Graphique de tendances */}
      <RACITrendChart raciData={raciData} bureaux={bureaux} />

      {/* Légende */}
      <div className="flex flex-wrap gap-2 sm:gap-3 p-2 sm:p-3 rounded bg-slate-800/50">
        {Object.entries(RACI_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 sm:gap-2">
            <span className={cn("w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded flex items-center justify-center font-bold text-[10px] sm:text-xs lg:text-sm", RACI_COLORS[key])}>
              {key}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Tableau RACI virtualisé - PHASE 3 */}
      <VirtualizedRACITable
        raciData={raciData}
        bureaux={bureaux}
        selectedActivity={selectedActivity}
        darkMode={darkMode}
        onSelectActivity={setSelectedActivity}
      />

      {/* Panel détail RACI */}
      {selectedR && (
        <Card className="border-blue-400/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-wrap justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                  <Badge
                    variant={selectedR.criticality === 'critical' ? 'urgent' : selectedR.criticality === 'high' ? 'warning' : 'default'}
                    className="text-[9px] sm:text-[10px]"
                  >
                    {selectedR.criticality}
                  </Badge>
                  <Badge variant="info" className="text-[9px] sm:text-[10px]">{selectedR.category}</Badge>
                  {selectedR.decisionBMO && (
                    <Badge variant="success" className="text-[9px] sm:text-[10px]">
                      📜 {selectedR.decisionBMO}
                    </Badge>
                  )}
                  {selectedR.locked && (
                    <Badge variant="warning" className="text-[9px] sm:text-[10px]">🔒 Verrouillée</Badge>
                  )}
                </div>
                <h3 className="font-bold text-sm sm:text-base lg:text-lg">{selectedR.activity}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">{selectedR.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className={cn("p-2 sm:p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                <h4 className="font-bold text-[10px] sm:text-xs mb-2">Rôles attribués</h4>
                <div className="space-y-2">
                  {bureaux.map(bureau => (
                    <div key={bureau} className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs">{bureau}</span>
                      <span className={cn("w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center font-bold text-[10px] sm:text-xs", RACI_COLORS[selectedR.roles[bureau] || '-'])}>
                        {selectedR.roles[bureau] || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {selectedR.linkedProcedure && (
                  <div className={cn("p-2 sm:p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Procédure liée</p>
                    <Badge variant="info" className="text-[9px] sm:text-[10px]">{selectedR.linkedProcedure}</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

