'use client';

/**
 * Composant pour l'onglet Alertes de la page Governance
 * PHASE 2 : Extraction du composant monolithique
 */

import React, { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  AlertDetailsPanel,
  AlertFilters,
  AlertPerformanceIndicators,
  EscalateToBMOModal,
  ResolveAlertModal,
} from '@/components/features/bmo/alerts';
import { VirtualizedAlertsList } from './VirtualizedAlertsList';

// Lazy load des composants lourds (PHASE 3)
const AlertPredictions = lazy(() => import('./AlertPredictions').then(m => ({ default: m.AlertPredictions })));
const AlertTimeline = lazy(() => import('./AlertTimeline').then(m => ({ default: m.AlertTimeline })));
import { paymentsN1, contractsToSign, blockedDossiers, systemAlerts } from '@/lib/data';
import type { useGovernanceAlerts } from '@/hooks/useGovernanceAlerts';
import type { useGovernanceFilters } from '@/hooks/useGovernanceFilters';
import type { Alert, Incident } from '@/lib/types/alerts.types';
import type { AlertResolveData, AlertDetailsPanelAlert } from '@/lib/types/governance.types';

interface AlertsTabProps {
  alertsHook: ReturnType<typeof useGovernanceAlerts>;
  filtersHook: ReturnType<typeof useGovernanceFilters>;
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  onAlertAction: (action: string, alertId: string) => void;
  onBulkAction: (action: string) => void;
  onEscalate: (message: string) => void;
  onResolve: (action: string, data: { note?: string } | null) => void;
  onSaveView: () => void;
}

// Mémorisation du composant (PHASE 3)
export const AlertsTab = React.memo(function AlertsTab({
  alertsHook,
  filtersHook,
  focusMode,
  setFocusMode,
  onAlertAction,
  onBulkAction,
  onEscalate,
  onResolve,
  onSaveView,
}: AlertsTabProps) {
  const { darkMode } = useAppStore();
  const {
    selectedAlertIds,
    selectedAlert,
    escalateModalOpen,
    resolveModalOpen,
    alertToAction,
    showPredictions,
    filteredAlerts,
    incidents,
    alertPredictions,
    alertsStats,
    performanceStats,
    selectedAlertData,
    setSelectedAlertIds,
    setSelectedAlert,
    setEscalateModalOpen,
    setResolveModalOpen,
    setAlertToAction,
    setShowPredictions,
  } = alertsHook;

  const {
    search,
    filters,
    activeViewId,
    views,
    updateSearch,
    updateFilters,
    updateViewId,
  } = filtersHook;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Performance Indicators */}
      <AlertPerformanceIndicators stats={performanceStats} />

      {/* Prédictions d'alertes - Lazy loaded */}
      {showPredictions && (
        <Suspense fallback={<div className="h-48 bg-slate-800/50 rounded animate-pulse" />}>
          <AlertPredictions
            alerts={alertsHook.alerts}
            payments={paymentsN1}
            contracts={contractsToSign.filter(c => c.status === 'pending')}
          />
          <Suspense fallback={<div className="h-32 bg-slate-800/50 rounded animate-pulse mt-2" />}>
            <AlertTimeline alerts={alertsHook.alerts} monthsAhead={3} />
          </Suspense>
        </Suspense>
      )}

      {/* Stats rapides cliquables */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Card
          className={cn(
            "cursor-pointer transition-colors",
            filters.severity === 'critical' ? "bg-red-400/15 border-red-400/30" : "bg-slate-700/30"
          )}
          onClick={() => updateFilters(prev => ({ ...prev, severity: prev.severity === 'critical' ? undefined : 'critical' }))}
        >
          <CardContent className="p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] text-slate-400">Critiques</p>
            <p className="text-lg sm:text-xl font-bold text-red-300/80">{alertsStats.critical}</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-colors",
            filters.severity === 'warning' ? "bg-amber-400/15 border-amber-400/30" : "bg-slate-700/30"
          )}
          onClick={() => updateFilters(prev => ({ ...prev, severity: prev.severity === 'warning' ? undefined : 'warning' }))}
        >
          <CardContent className="p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] text-slate-400">Warnings</p>
            <p className="text-lg sm:text-xl font-bold text-amber-300/80">{alertsStats.warning}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-400/8 border-blue-400/20">
          <CardContent className="p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] text-slate-400">Ouverts</p>
            <p className="text-lg sm:text-xl font-bold text-blue-300/80">{alertsStats.open}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-400/8 border-emerald-400/20">
          <CardContent className="p-2 sm:p-3">
            <p className="text-[9px] sm:text-[10px] text-slate-400">Résolues</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-300/80">{alertsStats.resolved}</p>
          </CardContent>
        </Card>
      </div>

      {/* Barre recherche + vues sauvegardées + Mode Focus */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
        <Input
          placeholder="Rechercher (ID, titre, bureau)..."
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="flex-1 min-w-0 text-xs sm:text-sm"
        />
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Button
            size="sm"
            variant={focusMode ? 'default' : 'secondary'}
            onClick={() => setFocusMode(!focusMode)}
            className={cn(
              "text-xs flex items-center gap-1.5",
              focusMode && "bg-amber-400/20 border-amber-400/40 text-amber-300/80"
            )}
          >
            {focusMode ? '🎯' : '👁️'} {focusMode ? 'Focus' : 'Vue normale'}
          </Button>
          <Select value={activeViewId} onValueChange={updateViewId}>
            <SelectTrigger className={cn(
              'flex-1 sm:flex-none rounded px-2 py-2 text-xs sm:text-sm border h-9 min-w-[120px]',
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            )}>
              <SelectValue placeholder="Vue" />
            </SelectTrigger>
            <SelectContent>
              {views.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="secondary" onClick={onSaveView} className="text-xs">
            💾 Sauver
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      <AlertFilters
        filters={{
          severity: filters.severity,
          type: filters.type,
          bureau: filters.bureau,
          period: undefined,
        }}
        onFilterChange={(key, value) => {
          updateFilters(prev => ({ ...prev, [key]: value }));
        }}
        onReset={() => updateFilters({ status: 'all' })}
        alertCounts={{
          critical: alertsStats.critical,
          warning: alertsStats.warning,
          success: alertsStats.success,
          total: alertsStats.total,
        }}
      />

      {/* Prédictions IA */}
      {(alertPredictions.upcoming.length > 0 || alertPredictions.riskFactors.length > 0) && (
        <Card className="bg-purple-400/8 border-purple-400/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              🔮 Prédictions IA
              <Badge variant="info" className="text-[9px]">
                {alertPredictions.upcoming.length + alertPredictions.riskFactors.length} insights
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertPredictions.upcoming.slice(0, 2).map((p, i) => (
              <div key={i} className="text-xs p-2 rounded bg-purple-400/10 border border-purple-400/20">
                <span className="font-semibold text-purple-300">📅 Prévu:</span> {p.type} — {p.reason}
                <span className="ml-2 text-slate-400">({p.estimatedDate}, {p.confidence}% confiance)</span>
              </div>
            ))}
            {alertPredictions.riskFactors.slice(0, 2).map((r, i) => (
              <div key={i} className={`text-xs p-2 rounded border ${
                r.impact === 'high' ? 'bg-red-400/10 border-red-400/20' :
                r.impact === 'medium' ? 'bg-amber-400/10 border-amber-400/20' :
                'bg-blue-400/10 border-blue-400/20'
              }`}>
                <span className={`font-semibold ${
                  r.impact === 'high' ? 'text-red-300' :
                  r.impact === 'medium' ? 'text-amber-300' :
                  'text-blue-300'
                }`}>⚠️ Risque:</span> {r.factor} — {r.description}
              </div>
            ))}
            {alertPredictions.trends.increasing.length > 0 && (
              <div className="text-xs p-2 rounded bg-blue-400/10 border border-blue-400/20">
                <span className="font-semibold text-blue-300">📈 Tendance:</span> Augmentation détectée pour {alertPredictions.trends.increasing.join(', ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk actions bar */}
      {selectedAlertIds.size > 0 && (
        <Card className="bg-blue-400/8 border-blue-400/20">
          <CardContent className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-slate-300">
                {selectedAlertIds.size} alerte(s) sélectionnée(s)
              </span>
              <div className="flex gap-2 flex-wrap flex-1 sm:flex-none">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onBulkAction('acknowledge')}
                  className="text-xs"
                >
                  ✓ Acquitter
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onBulkAction('resolve')}
                  className="text-xs"
                >
                  ✅ Résoudre
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedAlertIds(new Set())}
                  className="text-xs"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incidents corrélés */}
      {incidents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-300">🧵 Incidents corrélés ({incidents.length})</h3>
          <div className="space-y-2">
            {incidents.slice(0, 5).map((incident) => (
              <Card
                key={incident.id}
                className={cn(
                  'border-l-4 cursor-pointer transition-colors',
                  incident.severity === 'critical'
                    ? 'border-l-red-400/60 bg-red-400/5 hover:bg-red-400/10'
                    : 'border-l-amber-400/60 bg-amber-400/5 hover:bg-amber-400/10'
                )}
                onClick={() => {
                  setSelectedAlertIds(new Set(incident.alerts.map(a => a.id)));
                }}
              >
                <CardContent className="p-2 sm:p-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg">
                      {incident.severity === 'critical' ? '🚨' : '⚠️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                        <Badge
                          variant={incident.severity === 'critical' ? 'urgent' : 'warning'}
                          className="text-[9px] sm:text-[10px]"
                        >
                          {incident.severity}
                        </Badge>
                        <Badge variant="default" className="text-[9px] sm:text-[10px]">
                          {incident.alerts.length} alerte(s)
                        </Badge>
                        {incident.bureau && <BureauTag bureau={incident.bureau} />}
                        {incident.impactMoney > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                            {incident.impactMoney.toLocaleString('fr-FR')} FCFA
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold">{incident.title}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mode Focus */}
      {focusMode && (
        <Card className="bg-purple-400/8 border-purple-400/20">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <p className="text-xs sm:text-sm text-purple-300/80">
                Mode Focus actif : Affichage uniquement des alertes critiques et warnings prioritaires
              </p>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setFocusMode(false)}
                className="text-xs ml-auto"
              >
                Désactiver
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste alertes virtualisée - PHASE 3 */}
      <VirtualizedAlertsList
        alerts={filteredAlerts}
        selectedAlertIds={selectedAlertIds}
        focusMode={focusMode}
        onToggleSelect={(alertId) => {
          if (selectedAlertIds.has(alertId)) {
            setSelectedAlertIds(prev => {
              const next = new Set(prev);
              next.delete(alertId);
              return next;
            });
          } else {
            setSelectedAlertIds(prev => new Set(prev).add(alertId));
          }
        }}
        onSelect={setSelectedAlert}
        onAlertAction={onAlertAction}
        onSelectAll={() => {
          if (selectedAlertIds.size === filteredAlerts.length) {
            setSelectedAlertIds(new Set());
          } else {
            setSelectedAlertIds(new Set(filteredAlerts.map(a => a.id)));
          }
        }}
      />

      {/* Modals */}
      {selectedAlertData && (
        <AlertDetailsPanel
          isOpen={selectedAlert !== null}
          onClose={() => setSelectedAlert(null)}
          alert={selectedAlertData as AlertDetailsPanelAlert}
          onAction={onAlertAction}
        />
      )}

      {alertToAction && (
        <>
          <EscalateToBMOModal
            isOpen={escalateModalOpen}
            onClose={() => {
              setEscalateModalOpen(false);
              setAlertToAction(null);
            }}
            onEscalate={onEscalate}
            alert={{
              id: alertToAction.id,
              title: alertToAction.title,
              description: alertToAction.description || '',
              bureau: alertToAction.bureau,
              type: alertToAction.type as 'system' | 'blocked' | 'payment' | 'contract',
            }}
          />

          <ResolveAlertModal
            isOpen={resolveModalOpen}
            onClose={() => {
              setResolveModalOpen(false);
              setAlertToAction(null);
            }}
            onResolve={onResolve}
            alert={{
              id: alertToAction.id,
              title: alertToAction.title,
              description: alertToAction.description || '',
              bureau: alertToAction.bureau,
              type: alertToAction.type as 'system' | 'blocked' | 'payment' | 'contract',
              data: alertToAction.type === 'blocked'
                ? blockedDossiers.find(d => d.id === alertToAction.id)
                : undefined,
            }}
          />
        </>
      )}
    </div>
  );
});

