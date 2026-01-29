/**
 * Modal full-screen overlay pour alerte critique
 * Exemple : Chantier Villa Fann - Phase 4 BLOQUÉE, raison, impact, actions (Appeler fournisseur, Voir alternative, Email, SMS)
 */

'use client';

import React from 'react';
import { X, Phone, ExternalLink, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CriticalAlertPayload {
  id: string;
  title: string;
  /** ex. "Chantier Villa Fann - Phase 4 BLOQUÉE" */
  chantier?: string;
  /** ex. "Quincaillerie Thiès rupture fer" */
  reason?: string;
  /** ex. "Retard 3-5 jours = 2M FCFA" */
  impact?: string;
  /** Actions possibles */
  actions?: Array<{ label: string; onClick: () => void; primary?: boolean }>;
  /** Données brutes (API / WebSocket) */
  payload?: Record<string, unknown>;
}

export interface CriticalAlertModalProps {
  alert: CriticalAlertPayload | null;
  onClose: () => void;
  onNotifyEmail?: (alertId: string) => void;
  onNotifySms?: (alertId: string) => void;
  emailLoading?: boolean;
  smsLoading?: boolean;
}

export function CriticalAlertModal({
  alert,
  onClose,
  onNotifyEmail,
  onNotifySms,
  emailLoading = false,
  smsLoading = false,
}: CriticalAlertModalProps) {
  if (!alert) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-rose-950/95 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="critical-alert-title"
      aria-describedby="critical-alert-desc"
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-2xl border-2 border-rose-500/60 bg-slate-900 shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-500/20 border border-rose-500/50">
              <span className="text-2xl" aria-hidden>🚨</span>
            </div>
            <div className="min-w-0">
              <h2 id="critical-alert-title" className="text-lg font-bold text-rose-100 uppercase tracking-wide">
                Alerte critique
              </h2>
              <p id="critical-alert-desc" className="text-sm font-semibold text-slate-200 mt-0.5 truncate">
                {alert.chantier || alert.title}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {alert.reason && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-500">Raison</span>
              <p className="text-sm text-slate-200 mt-1">{alert.reason}</p>
            </div>
          )}
          {alert.impact && (
            <div>
              <span className="text-xs font-medium uppercase text-slate-500">Impact</span>
              <p className="text-sm text-amber-300 mt-1">{alert.impact}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {alert.actions?.map((action, i) => (
              <Button
                key={i}
                onClick={action.onClick ?? (() => {})}
                variant={action.primary ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'gap-2',
                  action.primary
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                    : 'border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50'
                )}
              >
                {i === 0 && <Phone className="h-4 w-4" />}
                {i === 1 && <ExternalLink className="h-4 w-4" />}
                {action.label}
              </Button>
            ))}
            {onNotifyEmail && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNotifyEmail(alert.id)}
                disabled={emailLoading}
                className="gap-2 border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50"
              >
                <Mail className="h-4 w-4" />
                Envoyer par email
              </Button>
            )}
            {onNotifySms && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNotifySms(alert.id)}
                disabled={smsLoading}
                className="gap-2 border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50"
              >
                <MessageCircle className="h-4 w-4" />
                Envoyer par SMS
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
