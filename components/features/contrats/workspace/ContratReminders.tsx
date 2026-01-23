'use client';

import React, { useCallback, useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Clock, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Reminder {
  id: string;
  contractId: string;
  message: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  contractSubject?: string;
  createdAt: string;
  createdBy: string;
}

interface ContratRemindersProps {
  reminders: Reminder[];
  onDismiss: (id: string) => void;
  onViewContract?: (contractId: string) => void;
}

// Composant principal
export function ContratReminders({ reminders, onDismiss, onViewContract }: ContratRemindersProps) {
  const [open, setOpen] = useState(false);

  const groupedByPriority = reminders.reduce((acc, reminder) => {
    if (!acc[reminder.priority]) {
      acc[reminder.priority] = [];
    }
    acc[reminder.priority].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>);

  const sortedPriorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];

  return (
    <>
      {/* Bouton cloche avec badge */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={`${reminders.length} rappel(s)`}
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
            {reminders.length}
          </span>
        )}
      </button>

      {/* Modal */}
      <FluentModal
        open={open}
        onClose={() => setOpen(false)}
        title="Rappels et notifications"
        maxWidth="lg"
      >
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Aucun rappel actif</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Les rappels importants s'afficheront ici
              </p>
            </div>
          ) : (
            <>
              {/* Statistiques */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold">{reminders.length}</span> rappel(s) actif(s)
                </div>
              </div>

              {/* Liste des rappels groupés par priorité */}
              {sortedPriorities.map((priority) => {
                const items = groupedByPriority[priority];
                if (!items || items.length === 0) return null;

                const priorityConfig = {
                  high: {
                    label: 'Urgent',
                    icon: AlertCircle,
                    color: 'text-rose-600 dark:text-rose-400',
                    bg: 'bg-rose-50 dark:bg-rose-900/20',
                    border: 'border-rose-200 dark:border-rose-700',
                    badge: 'bg-rose-500',
                  },
                  medium: {
                    label: 'Important',
                    icon: Clock,
                    color: 'text-amber-600 dark:text-amber-400',
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    border: 'border-amber-200 dark:border-amber-700',
                    badge: 'bg-amber-500',
                  },
                  low: {
                    label: 'Normal',
                    icon: CheckCircle2,
                    color: 'text-slate-600 dark:text-slate-400',
                    bg: 'bg-slate-50 dark:bg-slate-900',
                    border: 'border-slate-200 dark:border-slate-700',
                    badge: 'bg-slate-500',
                  },
                };

                const config = priorityConfig[priority];
                const Icon = config.icon;

                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', config.color)} />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {config.label}
                      </h3>
                      <Badge variant="default" className={cn('text-white', config.badge)}>
                        {items.length}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {items.map((reminder) => (
                        <ReminderCard
                          key={reminder.id}
                          reminder={reminder}
                          config={config}
                          onDismiss={onDismiss}
                          onViewContract={onViewContract}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <FluentButton variant="secondary" onClick={() => setOpen(false)}>
            Fermer
          </FluentButton>
        </div>
      </FluentModal>
    </>
  );
}

// Carte de rappel individuelle
interface ReminderCardProps {
  reminder: Reminder;
  config: {
    color: string;
    bg: string;
    border: string;
  };
  onDismiss: (id: string) => void;
  onViewContract?: (contractId: string) => void;
}

function ReminderCard({ reminder, config, onDismiss, onViewContract }: ReminderCardProps) {
  const [dismissing, setDismissing] = useState(false);

  const handleDismiss = useCallback(async () => {
    setDismissing(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Animation
    onDismiss(reminder.id);
  }, [reminder.id, onDismiss]);

  const dueDate = new Date(reminder.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now;
  const timeUntilDue = formatTimeUntilDue(dueDate);

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all',
        config.bg,
        config.border,
        dismissing && 'opacity-0 scale-95'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          {/* Message */}
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {reminder.message}
          </p>

          {/* Contrat */}
          {reminder.contractSubject && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Contrat : {reminder.contractSubject}
            </p>
          )}

          {/* Date d'échéance */}
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className={cn(
              'font-medium',
              isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
            )}>
              {isOverdue ? '⚠️ En retard' : timeUntilDue}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {dueDate.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {/* Créé par */}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Créé par {reminder.createdBy}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          {onViewContract && (
            <button
              onClick={() => {
                onViewContract(reminder.contractId);
                handleDismiss();
              }}
              className="p-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Voir le contrat"
            >
              Voir
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            title="Ignorer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper
function formatTimeUntilDue(dueDate: Date): string {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  
  if (diffMs < 0) return 'En retard';
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) return `Dans ${diffMinutes} min`;
  if (diffHours < 24) return `Dans ${diffHours}h`;
  if (diffDays === 1) return 'Demain';
  if (diffDays < 7) return `Dans ${diffDays} jours`;
  
  return dueDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

