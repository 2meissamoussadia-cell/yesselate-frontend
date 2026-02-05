'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { AlertTriangle, Clock, X, ChevronRight, Zap, Users, Calendar, Wallet } from 'lucide-react';

// ================================
// Types
// ================================
interface BannerAlert {
  id: string;
  type: 'urgent' | 'warning' | 'sla' | 'budget' | 'absence';
  title: string;
  description: string;
  count?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Props {
  onOpenQueue?: (queue: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

// ================================
// Mock data
// ================================
const MOCK_ALERTS: BannerAlert[] = [
  {
    id: 'alert-urgent',
    type: 'urgent',
    title: '5 demandes urgentes',
    description: 'Nécessitent une action immédiate',
    count: 5,
  },
  {
    id: 'alert-sla',
    type: 'sla',
    title: '3 demandes hors délai SLA',
    description: 'Dépassent le délai de traitement de 5 jours',
    count: 3,
  },
  {
    id: 'alert-budget',
    type: 'budget',
    title: 'Budget déplacements : 89%',
    description: 'Proche de la limite trimestrielle',
  },
];

// ================================
// Component
// ================================
export function RHAlertsBanner({ onOpenQueue, onDismiss, className }: Props) {
  const [alerts, setAlerts] = useState<BannerAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Charger les alertes (simulé)
    setAlerts(MOCK_ALERTS);
  }, []);

  // Rotation automatique si plusieurs alertes
  useEffect(() => {
    const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));
    if (visibleAlerts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleAlerts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [alerts, dismissed]);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    onDismiss?.(id);
  };

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  const currentAlert = visibleAlerts[currentIndex % visibleAlerts.length];
  if (!currentAlert) return null;

  const typeConfig: Record<string, { icon: typeof AlertTriangle; bg: string; border: string; text: string }> = {
    urgent: {
      icon: Zap,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-700 dark:text-rose-300',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-700 dark:text-amber-300',
    },
    sla: {
      icon: Clock,
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-700 dark:text-orange-300',
    },
    budget: {
      icon: Wallet,
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-700 dark:text-purple-300',
    },
    absence: {
      icon: Calendar,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-700 dark:text-blue-300',
    },
  };

  const config = typeConfig[currentAlert.type] || typeConfig.warning;
  const Icon = config.icon;

  const handleAction = () => {
    if (currentAlert.action) {
      currentAlert.action.onClick();
    } else {
      // Default action based on type
      const queueMap: Record<string, string> = {
        urgent: 'urgent',
        sla: 'pending',
        budget: 'Dépense',
        absence: 'Congé',
      };
      onOpenQueue?.(queueMap[currentAlert.type] || 'pending');
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className={cn(
          'rounded-2xl border p-4 transition-all',
          config.bg,
          config.border
        )}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn('p-2.5 rounded-xl', config.bg)}>
            <Icon className={cn('w-5 h-5', config.text)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={cn('font-semibold', config.text)}>
                {currentAlert.title}
              </h4>
              {currentAlert.count && (
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.bg, config.text)}>
                  {currentAlert.count}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {currentAlert.description}
            </p>
          </div>

          {/* Navigation dots */}
          {visibleAlerts.length > 1 && (
            <div className="flex items-center gap-1.5">
              {visibleAlerts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    idx === currentIndex % visibleAlerts.length
                      ? 'bg-current w-4'
                      : 'bg-current/30 hover:bg-current/50',
                    config.text
                  )}
                  type="button"
                  aria-label={`Alerte ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAction}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2',
                config.bg,
                config.text,
                'hover:opacity-80'
              )}
              type="button"
            >
              {currentAlert.action?.label || 'Traiter'}
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDismiss(currentAlert.id)}
              className={cn(
                'p-2 rounded-xl transition-colors',
                'hover:bg-black/10 dark:hover:bg-white/10',
                config.text
              )}
              type="button"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

