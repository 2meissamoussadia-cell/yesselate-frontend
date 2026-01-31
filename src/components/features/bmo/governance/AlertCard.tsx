'use client';

/**
 * Composant de carte d'alerte mémorisé
 * PHASE 3 : Optimisation performance avec React.memo
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScreenReaderOnly } from '@/components/ui/screen-reader-only';
import { cn } from '@/lib/utils';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import type { Alert } from '@/lib/types/alerts.types';

interface AlertCardProps {
  alert: Alert;
  isSelected: boolean;
  onToggleSelect: (alertId: string) => void;
  onSelect: (alertId: string) => void;
  onAlertAction: (action: string, alertId: string) => void;
}

export const AlertCard = memo(function AlertCard({
  alert,
  isSelected,
  onToggleSelect,
  onSelect,
  onAlertAction,
}: AlertCardProps) {
  const alertId = `alert-${alert.id}`;
  const severityLabel = alert.severity === 'critical' ? 'critique' : alert.severity === 'warning' ? 'avertissement' : 'information';
  
  return (
    <Card
      id={alertId}
      role="article"
      aria-labelledby={`${alertId}-title`}
      aria-describedby={`${alertId}-description`}
      aria-selected={isSelected}
      tabIndex={0}
      className={cn(
        'border-l-4 transition-colors cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
        alert.severity === 'critical'
          ? 'border-l-red-400/60 bg-red-400/5 hover:bg-red-400/10'
          : alert.severity === 'warning'
          ? 'border-l-amber-400/60 bg-amber-400/5 hover:bg-amber-400/10'
          : 'border-l-blue-400/60 bg-blue-400/5 hover:bg-blue-400/10',
        isSelected && 'ring-2 ring-blue-400/60'
      )}
      onClick={() => onToggleSelect(alert.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleSelect(alert.id);
        }
      }}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(alert.id);
            }}
            aria-label={`Sélectionner l'alerte ${alert.title}`}
            className="mt-0.5 sm:mt-1"
          />
          <span 
            className="text-base sm:text-lg flex-shrink-0" 
            aria-label={`Alerte ${severityLabel}`}
            role="img"
          >
            {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
            <ScreenReaderOnly>: {severityLabel}</ScreenReaderOnly>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
              <Badge
                variant={alert.severity === 'critical' ? 'urgent' : alert.severity === 'warning' ? 'warning' : 'info'}
                className="text-[9px] sm:text-[10px]"
              >
                {alert.type}
              </Badge>
              <Badge
                variant={alert.severity === 'critical' ? 'urgent' : alert.severity === 'warning' ? 'warning' : 'info'}
                className="text-[9px] sm:text-[10px]"
              >
                {alert.severity}
              </Badge>
              {alert.bureau && <BureauTag bureau={alert.bureau} />}
              {alert.impact?.money && (
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">
                  {alert.impact.money.toLocaleString('fr-FR')} FCFA
                </span>
              )}
              {alert.slaDueAt && (
                <span className="text-[9px] sm:text-[10px] text-slate-400">
                  Échéance: {new Date(alert.slaDueAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
            <h3 id={`${alertId}-title`} className="text-xs sm:text-sm font-semibold mb-1">{alert.title}</h3>
            <p id={`${alertId}-description`} className="text-[10px] sm:text-xs text-slate-400">{alert.description}</p>
            {alert.createdAt && (
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1">
                {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button
              size="xs"
              variant="link"
              className="text-[9px] sm:text-[10px] p-0 h-auto text-blue-300/80"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(alert.id);
              }}
              aria-label={`Voir les détails de l'alerte ${alert.title}`}
            >
              📄 Détails
              <ScreenReaderOnly> de l'alerte {alert.title}</ScreenReaderOnly>
            </Button>
            {alert.type === 'blocked' && (
              <Button
                size="xs"
                variant="link"
                className="text-[9px] sm:text-[10px] p-0 h-auto text-amber-300/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onAlertAction('substitute', alert.id);
                }}
                aria-label={`Substituer l'alerte ${alert.title}`}
              >
                🔄 Substituer
                <ScreenReaderOnly> l'alerte {alert.title}</ScreenReaderOnly>
              </Button>
            )}
            {alert.severity === 'critical' && (
              <Button
                size="xs"
                variant="link"
                className="text-[9px] sm:text-[10px] p-0 h-auto text-orange-300/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onAlertAction('escalate', alert.id);
                }}
                aria-label={`Escalader l'alerte ${alert.title} au BMO`}
              >
                ⬆️ Escalader
                <ScreenReaderOnly> l'alerte {alert.title} au BMO</ScreenReaderOnly>
              </Button>
            )}
            <Button
              size="xs"
              variant="link"
              className="text-[9px] sm:text-[10px] p-0 h-auto text-emerald-300/80"
              onClick={(e) => {
                e.stopPropagation();
                onAlertAction('resolve', alert.id);
              }}
              aria-label={`Résoudre l'alerte ${alert.title}`}
            >
              ✅ Résoudre
              <ScreenReaderOnly> l'alerte {alert.title}</ScreenReaderOnly>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}, (prev, next) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  return (
    prev.alert.id === next.alert.id &&
    prev.isSelected === next.isSelected &&
    prev.alert.severity === next.alert.severity &&
    prev.alert.status === next.alert.status
  );
});

