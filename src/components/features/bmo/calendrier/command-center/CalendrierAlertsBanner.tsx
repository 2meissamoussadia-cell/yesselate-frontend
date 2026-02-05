/**
 * Bannière d'alertes critiques pour Calendrier
 * Affiche uniquement les alertes spécifiques au Calendrier
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  X,
} from 'lucide-react';

export interface CalendrierAlert {
  id: string;
  type: 'sla-risk' | 'retard' | 'sur-allocation' | 'reunion-manquee';
  title: string;
  description: string;
  count?: number;
  actionLabel: string;
  actionUrl: string;
  severity: 'warning' | 'critical';
}

interface CalendrierAlertsBannerProps {
  alerts: CalendrierAlert[];
  onDismiss?: (alertId: string) => void;
  onAction?: (alert: CalendrierAlert) => void;
  className?: string;
}

export function CalendrierAlertsBanner({
  alerts,
  onDismiss,
  onAction,
  className,
}: CalendrierAlertsBannerProps) {
  if (alerts.length === 0) return null;

  const getAlertIcon = (type: CalendrierAlert['type']) => {
    switch (type) {
      case 'sla-risk':
        return Clock;
      case 'retard':
        return AlertTriangle;
      case 'sur-allocation':
        return Users;
      case 'reunion-manquee':
        return CalendarIcon;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColors = (severity: 'warning' | 'critical') => {
    if (severity === 'critical') {
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-400',
      };
    }
    return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: 'text-amber-400',
    };
  };

  return (
    <div className={cn('space-y-2', className)}>
      {alerts.map((alert) => {
        const Icon = getAlertIcon(alert.type);
        const colors = getAlertColors(alert.severity);

        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-lg border',
              colors.bg,
              colors.border
            )}
          >
            <div className={cn('mt-0.5', colors.icon)}>
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn('text-sm font-semibold', colors.text)}>
                  {alert.title}
                </h4>
                {alert.count !== undefined && alert.count > 0 && (
                  <Badge
                    variant={alert.severity === 'critical' ? 'destructive' : 'warning'}
                    className="h-4 px-1.5 text-xs"
                  >
                    {alert.count}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-2">{alert.description}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction?.(alert)}
                className={cn(
                  'h-7 px-3 text-xs',
                  colors.text,
                  'hover:bg-slate-800/50'
                )}
              >
                {alert.actionLabel}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

