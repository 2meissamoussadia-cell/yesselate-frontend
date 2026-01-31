/**
 * Composant pour afficher les notifications de changements de KPIs
 * Affiche un maximum de 5 notifications avec animation
 */

'use client';

import React, { memo, useCallback } from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPINotification {
  id: string;
  label: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: Date;
}

interface KPINotificationsProps {
  notifications: KPINotification[];
  onDismiss: (id: string) => void;
}

export const KPINotifications = memo(function KPINotifications({ 
  notifications, 
  onDismiss 
}: KPINotificationsProps) {
  // Mémoriser le handler de dismiss pour éviter les re-renders
  const handleDismiss = useCallback((id: string) => {
    onDismiss(id);
  }, [onDismiss]);

  if (notifications.length === 0) return null;

  // Limiter le nombre de notifications affichées (max 5)
  const displayedNotifications = notifications.slice(-5);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm"
      role="region"
      aria-label="Notifications de changements de KPIs"
      aria-live="polite"
      aria-atomic="false"
    >
      {displayedNotifications.map((notification, idx) => {
        const isIncrease = typeof notification.oldValue === 'number' && typeof notification.newValue === 'number'
          ? notification.newValue > notification.oldValue
          : false;
        
        return (
          <button
            key={notification.id}
            type="button"
            className={cn(
              'rounded-lg border p-3 shadow-md backdrop-blur-xl animate-fadeIn',
              'bg-slate-900/95 border-slate-700/50',
              'flex items-start gap-3 w-full text-left',
              'hover:bg-slate-900/80 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
            )}
            style={{
              animationDelay: `${idx * 100}ms`,
            }}
            onClick={() => handleDismiss(notification.id)}
            aria-label={`Notification: ${notification.label} - ${notification.oldValue} → ${notification.newValue}. Cliquer pour fermer`}
          >
            <div className={cn(
              'p-1.5 rounded-md',
              isIncrease ? 'bg-emerald-500/20' : 'bg-amber-500/20'
            )}>
              {isIncrease ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 mb-0.5">
                {notification.label}
              </div>
              <div className="text-xs text-slate-400">
                <span className="line-through text-slate-400 mr-1.5" aria-label={`Ancienne valeur: ${notification.oldValue}`}>
                  {notification.oldValue}
                </span>
                <span 
                  className={cn(
                    'font-semibold',
                    isIncrease ? 'text-emerald-400' : 'text-amber-400'
                  )}
                  aria-label={`Nouvelle valeur: ${notification.newValue}`}
                >
                  → {notification.newValue}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(notification.id);
              }}
              className="text-slate-400 hover:text-slate-300 transition-colors duration-200 flex-shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </button>
        );
      })}
      {notifications.length > 5 && (
        <div className="text-xs text-slate-400 text-center pt-2">
          {notifications.length - 5} autre{notifications.length - 5 > 1 ? 's' : ''} notification{notifications.length - 5 > 1 ? 's' : ''} masquée{notifications.length - 5 > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
});
