/**
 * Système d'alertes configurables pour les KPIs
 * Permet de définir des seuils et de recevoir des notifications automatiques
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Bell, BellOff, Settings, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type { KPIDisplayData } from '@/lib/mappings/dashboardKPIMapping';
import { useLogger, logger } from '@/lib/utils/logger';

// ============================================
// Types
// ============================================

export interface KPIAlertThreshold {
  kpiId: string;
  kpiLabel: string;
  condition: 'above' | 'below' | 'equals';
  value: number | string;
  severity: 'info' | 'warn' | 'crit';
  enabled: boolean;
}

export interface KPIAlert {
  id: string;
  kpiId: string;
  kpiLabel: string;
  message: string;
  severity: 'info' | 'warn' | 'crit';
  timestamp: Date;
  acknowledged: boolean;
  threshold: KPIAlertThreshold;
}

interface KPIAlertsSystemProps {
  kpis: KPIDisplayData[];
  onAlert?: (alert: KPIAlert) => void;
}

// ============================================
// Storage pour les seuils d'alertes
// ============================================

const ALERTS_STORAGE_KEY = 'dashboard-kpi-alerts-thresholds';

function loadAlertThresholds(): KPIAlertThreshold[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAlertThresholds(thresholds: KPIAlertThreshold[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(thresholds));
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Erreur lors de la sauvegarde des seuils', err, {
      component: 'KPIAlertsSystem',
      action: 'saveThresholds',
    });
  }
}

// ============================================
// Composant principal
// ============================================

export function KPIAlertsSystem({ kpis, onAlert }: KPIAlertsSystemProps) {
  const log = useLogger('KPIAlertsSystem');
  const [thresholds, setThresholds] = useState<KPIAlertThreshold[]>(loadAlertThresholds);
  const [activeAlerts, setActiveAlerts] = useState<KPIAlert[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Charger les seuils au montage
  useEffect(() => {
    const loaded = loadAlertThresholds();
    if (loaded.length > 0) {
      setThresholds(loaded);
    }
  }, []);

  // Sauvegarder les seuils quand ils changent
  useEffect(() => {
    saveAlertThresholds(thresholds);
  }, [thresholds]);

  // Vérifier les KPIs contre les seuils
  const checkKPIs = useMemo(() => {
    const newAlerts: KPIAlert[] = [];

    thresholds.forEach(threshold => {
      if (!threshold.enabled) return;

      const kpi = kpis.find(k => k.label === threshold.kpiLabel);
      if (!kpi) return;

      const kpiValue = typeof kpi.value === 'string' 
        ? parseFloat(kpi.value.replace(/[^0-9.]/g, '')) 
        : kpi.value;

      const thresholdValue = typeof threshold.value === 'string'
        ? parseFloat(threshold.value.replace(/[^0-9.]/g, ''))
        : threshold.value;

      if (typeof kpiValue !== 'number' || typeof thresholdValue !== 'number') return;

      let shouldAlert = false;
      let message = '';

      switch (threshold.condition) {
        case 'above':
          shouldAlert = kpiValue > thresholdValue;
          message = `${kpi.label} dépasse le seuil (${kpiValue} > ${thresholdValue})`;
          break;
        case 'below':
          shouldAlert = kpiValue < thresholdValue;
          message = `${kpi.label} est en dessous du seuil (${kpiValue} < ${thresholdValue})`;
          break;
        case 'equals':
          shouldAlert = Math.abs(kpiValue - thresholdValue) < 0.01;
          message = `${kpi.label} atteint le seuil (${kpiValue} = ${thresholdValue})`;
          break;
      }

      if (shouldAlert) {
        // Vérifier si l'alerte existe déjà
        const existingAlert = activeAlerts.find(
          a => a.kpiId === threshold.kpiId && !a.acknowledged
        );

        if (!existingAlert) {
          const alert: KPIAlert = {
            id: `alert-${Date.now()}-${Math.random()}`,
            kpiId: threshold.kpiId,
            kpiLabel: threshold.kpiLabel,
            message,
            severity: threshold.severity,
            timestamp: new Date(),
            acknowledged: false,
            threshold,
          };
          newAlerts.push(alert);
          onAlert?.(alert);
        }
      }
    });

    return newAlerts;
  }, [kpis, thresholds, activeAlerts, onAlert]);

  // Ajouter les nouvelles alertes
  useEffect(() => {
    if (checkKPIs.length > 0) {
      setActiveAlerts(prev => [...prev, ...checkKPIs]);
    }
  }, [checkKPIs]);

  // Fonction pour ajouter un seuil
  const addThreshold = (threshold: Omit<KPIAlertThreshold, 'enabled'>) => {
    setThresholds(prev => [...prev, { ...threshold, enabled: true }]);
  };

  // Fonction pour supprimer un seuil
  const removeThreshold = (kpiId: string) => {
    setThresholds(prev => prev.filter(t => t.kpiId !== kpiId));
  };

  // Fonction pour activer/désactiver un seuil
  const toggleThreshold = (kpiId: string) => {
    setThresholds(prev =>
      prev.map(t =>
        t.kpiId === kpiId ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

  // Fonction pour reconnaître une alerte
  const acknowledgeAlert = (alertId: string) => {
    setActiveAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const unacknowledgedAlerts = activeAlerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'crit');
  const warningAlerts = unacknowledgedAlerts.filter(a => a.severity === 'warn');

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Bouton d'alerte */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'relative p-2 rounded-md transition-all duration-200',
                'hover:bg-slate-800/50 active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                showSettings && 'bg-blue-500/10'
              )}
              aria-label="Gérer les alertes KPI"
            >
              {criticalAlerts.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
              ) : warningAlerts.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-amber-400" />
              ) : (
                <Bell className="h-4 w-4 text-slate-400" />
              )}
              {unacknowledgedAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                  {unacknowledgedAlerts.length > 9 ? '9+' : unacknowledgedAlerts.length}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              <p className="font-semibold">Alertes KPI</p>
              {unacknowledgedAlerts.length === 0 ? (
                <p className="text-slate-400">Aucune alerte active</p>
              ) : (
                <>
                  {criticalAlerts.length > 0 && (
                    <p className="text-red-400">{criticalAlerts.length} alerte(s) critique(s)</p>
                  )}
                  {warningAlerts.length > 0 && (
                    <p className="text-amber-400">{warningAlerts.length} alerte(s) d'avertissement</p>
                  )}
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Panneau de configuration */}
        {showSettings && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-xl backdrop-blur-xl z-50 animate-fadeIn">
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {/* En-tête */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">Alertes KPI</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Alertes actives */}
              {unacknowledgedAlerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Alertes actives ({unacknowledgedAlerts.length})
                  </h4>
                  {unacknowledgedAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        alert.severity === 'crit' && 'bg-red-500/10 border-red-500/20',
                        alert.severity === 'warn' && 'bg-amber-500/10 border-amber-500/20',
                        alert.severity === 'info' && 'bg-blue-500/10 border-blue-500/20'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 mb-1">
                            {alert.kpiLabel}
                          </p>
                          <p className="text-xs text-slate-400">{alert.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {alert.timestamp.toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
                          aria-label="Reconnaître l'alerte"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Seuils configurés */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Seuils configurés ({thresholds.length})
                </h4>
                {thresholds.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Aucun seuil configuré. Cliquez sur "Ajouter un seuil" pour commencer.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {thresholds.map(threshold => (
                      <div
                        key={threshold.kpiId}
                        className="p-2 rounded-lg border border-slate-700/50 bg-slate-800/30"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-200">
                              {threshold.kpiLabel}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {threshold.condition === 'above' && '>'}
                              {threshold.condition === 'below' && '<'}
                              {threshold.condition === 'equals' && '='} {threshold.value}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleThreshold(threshold.kpiId)}
                              className={cn(
                                'p-1 rounded transition-colors',
                                threshold.enabled
                                  ? 'text-emerald-400 hover:text-emerald-300'
                                  : 'text-slate-400 hover:text-slate-400'
                              )}
                              aria-label={threshold.enabled ? 'Désactiver' : 'Activer'}
                            >
                              {threshold.enabled ? (
                                <Bell className="h-3 w-3" />
                              ) : (
                                <BellOff className="h-3 w-3" />
                              )}
                            </button>
                            <button
                              onClick={() => removeThreshold(threshold.kpiId)}
                              className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                              aria-label="Supprimer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton pour ajouter un seuil */}
              <Button
                onClick={() => {
                  // TODO: Ouvrir un modal pour ajouter un seuil
                  log.debug('Ajouter un seuil', { action: 'addThreshold' });
                }}
                className="w-full text-xs"
                variant="outline"
                size="sm"
              >
                <Settings className="h-3 w-3 mr-2" />
                Ajouter un seuil
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

