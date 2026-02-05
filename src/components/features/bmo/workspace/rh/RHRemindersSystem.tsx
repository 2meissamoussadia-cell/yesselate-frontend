'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Clock,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  type: 'deadline' | 'follow_up' | 'review' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    until?: string;
  };
  linkedTo?: {
    type: 'demande' | 'agent' | 'bureau';
    id: string;
    label: string;
  };
  status: 'pending' | 'completed' | 'snoozed';
  createdAt: string;
  completedAt?: string;
}

interface RHRemindersSystemProps {
  open: boolean;
  onClose: () => void;
}

export function RHRemindersSystem({ open, onClose }: RHRemindersSystemProps) {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 'rem-1',
      title: 'Relancer validation demande RH-2026-001',
      description: 'Demande en attente depuis 3 jours - priorité urgente',
      type: 'follow_up',
      priority: 'urgent',
      dueDate: '2026-01-10T14:00:00',
      linkedTo: {
        type: 'demande',
        id: 'RH-2026-001',
        label: 'Demande de congés - Ahmed Kaci',
      },
      status: 'pending',
      createdAt: '2026-01-07T10:00:00',
    },
    {
      id: 'rem-2',
      title: 'Rappel validation budget mensuel',
      description: 'Date limite de validation du budget déplacements',
      type: 'deadline',
      priority: 'high',
      dueDate: '2026-01-15T17:00:00',
      recurring: {
        frequency: 'monthly',
        until: '2026-12-31',
      },
      status: 'pending',
      createdAt: '2026-01-01T09:00:00',
    },
    {
      id: 'rem-3',
      title: 'Révision des soldes de congés',
      description: 'Vérifier et mettre à jour les soldes de congés trimestriels',
      type: 'review',
      priority: 'medium',
      dueDate: '2026-01-20T12:00:00',
      recurring: {
        frequency: 'monthly',
      },
      status: 'pending',
      createdAt: '2026-01-05T08:00:00',
    },
    {
      id: 'rem-4',
      title: 'Alerte dépassement budget - Bureau Oran',
      description: 'Le budget du bureau d\'Oran atteint 95% de sa limite',
      type: 'alert',
      priority: 'urgent',
      dueDate: '2026-01-10T10:00:00',
      linkedTo: {
        type: 'bureau',
        id: 'ORAN',
        label: 'Bureau Oran',
      },
      status: 'pending',
      createdAt: '2026-01-09T16:30:00',
    },
    {
      id: 'rem-5',
      title: 'Traiter les demandes urgentes',
      description: 'Vérification quotidienne des demandes prioritaires',
      type: 'follow_up',
      priority: 'high',
      dueDate: '2026-01-11T09:00:00',
      recurring: {
        frequency: 'daily',
      },
      status: 'pending',
      createdAt: '2026-01-10T08:00:00',
    },
    {
      id: 'rem-6',
      title: 'Documents manquants - RH-2025-456',
      description: 'Agent n\'a toujours pas fourni les justificatifs demandés',
      type: 'follow_up',
      priority: 'medium',
      dueDate: '2026-01-08T15:00:00',
      linkedTo: {
        type: 'demande',
        id: 'RH-2025-456',
        label: 'Demande de remboursement - Farid Benali',
      },
      status: 'completed',
      createdAt: '2026-01-05T11:00:00',
      completedAt: '2026-01-08T14:30:00',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'snoozed'>('pending');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');

  const completeReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((rem) =>
        rem.id === id
          ? { ...rem, status: 'completed' as const, completedAt: new Date().toISOString() }
          : rem
      )
    );
  };

  const snoozeReminder = (id: string, hours: number) => {
    setReminders((prev) =>
      prev.map((rem) => {
        if (rem.id === id) {
          const newDate = new Date(rem.dueDate);
          newDate.setHours(newDate.getHours() + hours);
          return {
            ...rem,
            dueDate: newDate.toISOString(),
            status: 'snoozed' as const,
          };
        }
        return rem;
      })
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((rem) => rem.id !== id));
  };

  const filteredReminders = reminders
    .filter((rem) => {
      if (filterStatus !== 'all' && rem.status !== filterStatus) return false;
      if (filterPriority !== 'all' && rem.priority !== filterPriority) return false;
      return true;
    })
    .sort((a, b) => {
      // Trier par priorité puis par date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const pendingCount = reminders.filter((r) => r.status === 'pending').length;
  const urgentCount = reminders.filter((r) => r.priority === 'urgent' && r.status === 'pending').length;
  const overdueCount = reminders.filter(
    (r) => r.status === 'pending' && new Date(r.dueDate) < new Date()
  ).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4" />;
      case 'follow_up':
        return <Bell className="w-4 h-4" />;
      case 'review':
        return <Calendar className="w-4 h-4" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      const absDays = Math.abs(diffDays);
      if (absDays === 0) return 'En retard (aujourd\'hui)';
      if (absDays === 1) return 'En retard (1 jour)';
      return `En retard (${absDays} jours)`;
    }

    if (diffDays === 0) {
      if (diffHours === 0) return 'Dans moins d\'1h';
      if (diffHours === 1) return 'Dans 1h';
      return `Dans ${diffHours}h`;
    }
    if (diffDays === 1) return 'Demain';
    if (diffDays < 7) return `Dans ${diffDays} jours`;
    return target.toLocaleDateString('fr-FR');
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Système de rappels et échéances"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Rappels en attente</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-red-500/5 to-red-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Urgents</p>
                <p className="text-2xl font-bold">{urgentCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">En retard</p>
                <p className="text-2xl font-bold">{overdueCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {(['all', 'pending', 'completed', 'snoozed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filterStatus === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'completed' ? 'Complétés' : 'Reportés'}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex gap-1">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filterPriority === priority
                    ? priority === 'urgent' ? 'bg-red-500 text-white' :
                      priority === 'high' ? 'bg-orange-500 text-white' :
                      priority === 'medium' ? 'bg-amber-500 text-white' :
                      'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {priority === 'all' ? 'Toutes priorités' : priority}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des rappels */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={cn(
                'rounded-xl border p-4 transition-all',
                reminder.status === 'completed'
                  ? 'border-slate-200 bg-slate-50/50 opacity-60 dark:border-slate-700 dark:bg-slate-800/50'
                  : isOverdue(reminder.dueDate)
                  ? 'border-red-200 bg-red-500/5 dark:border-red-800'
                  : reminder.priority === 'urgent'
                  ? 'border-orange-200 bg-orange-500/5 dark:border-orange-800'
                  : 'border-slate-200 bg-white dark:border-slate-700'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', getPriorityColor(reminder.priority))}>
                  {getTypeIcon(reminder.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold">{reminder.title}</h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {reminder.recurring && (
                        <span title="Rappel récurrent"><Repeat className="w-4 h-4 text-purple-500" /></span>
                      )}
                      <Badge
                        variant={
                          reminder.priority === 'urgent'
                            ? 'urgent'
                            : reminder.priority === 'high'
                            ? 'warning'
                            : 'default'
                        }
                        className="text-xs"
                      >
                        {reminder.priority}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {reminder.description}
                  </p>

                  {reminder.linkedTo && (
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <span className="font-medium">Lié à:</span>
                      <span className="text-blue-600 dark:text-blue-400">{reminder.linkedTo.label}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs">
                    <div
                      className={cn(
                        'flex items-center gap-1 font-medium',
                        isOverdue(reminder.dueDate) && reminder.status === 'pending'
                          ? 'text-red-600'
                          : 'text-slate-400'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(reminder.dueDate)}
                    </div>
                    {reminder.status === 'completed' && reminder.completedAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-3 h-3" />
                        Complété le {new Date(reminder.completedAt).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {reminder.recurring && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Repeat className="w-3 h-3" />
                        {reminder.recurring.frequency === 'daily' ? 'Quotidien' :
                         reminder.recurring.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {reminder.status === 'pending' && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => completeReminder(reminder.id)}
                      className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                      title="Marquer comme complété"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => snoozeReminder(reminder.id, 2)}
                      className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-600 transition-colors"
                      title="Reporter de 2h"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredReminders.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun rappel trouvé</p>
          </div>
        )}

        <div className="flex justify-between items-center w-full pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau rappel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </FluentModal>
  );
}


