'use client';

/**
 * Liste d'alertes virtualisée
 * PHASE 3 : Optimisation performance avec @tanstack/react-virtual
 */

import { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScreenReaderOnly } from '@/components/ui/screen-reader-only';
import type { Alert } from '@/lib/types/alerts.types';
import { AlertCard } from './AlertCard';

interface VirtualizedAlertsListProps {
  alerts: Alert[];
  selectedAlertIds: Set<string>;
  focusMode: boolean;
  onToggleSelect: (alertId: string) => void;
  onSelect: (alertId: string) => void;
  onAlertAction: (action: string, alertId: string) => void;
  onSelectAll: () => void;
}

export function VirtualizedAlertsList({
  alerts,
  selectedAlertIds,
  focusMode,
  onToggleSelect,
  onSelect,
  onAlertAction,
  onSelectAll,
}: VirtualizedAlertsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Filtrer les alertes selon le mode focus
  const displayAlerts = focusMode
    ? alerts.filter(a => a.severity === 'critical' || (a.severity === 'warning' && a.type === 'blocked'))
    : alerts;

  const virtualizer = useVirtualizer({
    count: displayAlerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      const alert = displayAlerts[index];
      // Calculer hauteur basée sur contenu
      let height = 140; // Base
      
      // Ajuster selon la longueur de la description
      if (alert.description && alert.description.length > 100) height += 20;
      if (alert.description && alert.description.length > 200) height += 20;
      
      // Ajuster si plusieurs badges (impact, SLA, etc.)
      const impactMoney = typeof alert.impact === 'object' && alert.impact !== null && 'money' in alert.impact ? (alert.impact as { money: number }).money : undefined;
      const badgeCount = [
        impactMoney,
        alert.slaDueAt,
        alert.bureau,
      ].filter(Boolean).length;
      if (badgeCount > 2) height += 10;
      
      return height;
    }, [displayAlerts]),
    overscan: 3, // Nombre de cartes à rendre en dehors de la vue
    // Mesurer la hauteur réelle après rendu
    measureElement: (element) => element?.getBoundingClientRect().height ?? 140,
  });

  if (displayAlerts.length === 0) {
    return (
      <Card role="status" aria-live="polite">
        <CardContent className="p-6 sm:p-8 text-center text-slate-400">
          <span className="text-2xl block mb-2" aria-hidden="true">✅</span>
          <p>Aucune alerte ne correspond aux filtres</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-2" aria-label="Liste des alertes">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-slate-300">
          Alertes ({displayAlerts.length})
          <ScreenReaderOnly>
            {displayAlerts.length === 1 ? '1 alerte affichée' : `${displayAlerts.length} alertes affichées`}
          </ScreenReaderOnly>
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={onSelectAll}
          className="text-xs"
          aria-label={selectedAlertIds.size === displayAlerts.length ? 'Désélectionner toutes les alertes' : 'Sélectionner toutes les alertes'}
        >
          {selectedAlertIds.size === displayAlerts.length ? 'Désélectionner' : 'Tout sélectionner'}
        </Button>
      </div>

      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: '600px' }} // Hauteur fixe pour le conteneur de scroll
        role="list"
        aria-label={`Liste de ${displayAlerts.length} alertes`}
        tabIndex={0}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const alert = displayAlerts[virtualItem.index];
            const isSelected = selectedAlertIds.has(alert.id);
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="mb-2"
              >
                <AlertCard
                  alert={alert}
                  isSelected={isSelected}
                  onToggleSelect={onToggleSelect}
                  onSelect={onSelect}
                  onAlertAction={onAlertAction}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

