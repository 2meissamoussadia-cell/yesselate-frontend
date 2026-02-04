'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';
import {
  Bell,
  Clock,
  Calendar,
  AlertTriangle,
  Plus,
  RefreshCw,
  CheckCircle2,
  User,
  FileText,
  Trash2,
  Edit,
  BellOff,
  ChevronRight,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface Reminder {
  id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  documentId?: string;
  documentType?: string;
  dueAt: string;
  hoursRemaining: number;
  createdAt: string;
  status: 'active' | 'completed' | 'dismissed';
  notificationsSent: number;
  lastNotificationAt?: string;
  assignedTo: string[];
  notes?: string;
  amount?: number;
  supplier?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// ============================================
// Component
// ============================================
export function ValidationBCRemindersSystem({ open, onClose }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'today' | 'week'>('all');

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/validation-bc/reminders');
      if (!res.ok) throw new Error('Erreur chargement rappels');
      
      const data = await res.json();
      setReminders(data.data);
    } catch (e) {
      setError('Impossible de charger les rappels');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadReminders();
    }
  }, [open, loadReminders]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sla_warning':
        return <Clock className="w-4 h-4 text-rose-500" />;
      case 'follow_up':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'approval_pending':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'payment_due':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'recurring':
        return <RefreshCw className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/10';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10';
      default:
        return 'border-l-slate-300 bg-white dark:bg-slate-800/30';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 1) return 'Maintenant';
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.round(hours / 24);
    return `${days}j`;
  };

  const getTimeColor = (hours: number) => {
    if (hours < 4) return 'text-rose-600 font-bold';
    if (hours < 8) return 'text-rose-500';
    if (hours < 24) return 'text-amber-600';
    return 'text-slate-400';
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'urgent') return r.hoursRemaining < 8;
    if (filter === 'today') return r.hoursRemaining < 24;
    if (filter === 'week') return r.hoursRemaining < 168;
    return true;
  });

  const urgentCount = reminders.filter(r => r.hoursRemaining < 8).length;
  const todayCount = reminders.filter(r => r.hoursRemaining < 24).length;

  return (
    <FluentModal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <span>Rappels & Échéances</span>
          {urgentCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 animate-pulse">
              {urgentCount} urgent{urgentCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      }
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Filtres */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'all', label: `Tous (${reminders.length})` },
            { key: 'urgent', label: `Urgents (${urgentCount})`, color: 'rose' },
            { key: 'today', label: `Aujourd'hui (${todayCount})`, color: 'amber' },
            { key: 'week', label: 'Cette semaine' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f.key
                  ? f.color === 'rose'
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    : f.color === 'amber'
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {f.label}
            </button>
          ))}
          
          <FluentButton size="xs" variant="primary" className="ml-auto">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nouveau rappel
          </FluentButton>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-500">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
            <div>{error}</div>
            <FluentButton size="sm" variant="secondary" onClick={loadReminders} className="mt-4">
              Réessayer
            </FluentButton>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-300" />
            <div>Aucun rappel {filter !== 'all' ? 'pour ce filtre' : ''}</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {filteredReminders.map(reminder => (
              <div
                key={reminder.id}
                className={cn(
                  "p-3 rounded-xl border-l-4 border border-slate-200/70 dark:border-slate-700 transition-all hover:shadow-md",
                  getPriorityColor(reminder.priority)
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                      {getTypeIcon(reminder.type)}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{reminder.title}</div>
                      
                      {reminder.documentId && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                            {reminder.documentId}
                          </span>
                          {reminder.documentType && (
                            <span className="text-xs text-slate-400">{reminder.documentType}</span>
                          )}
                        </div>
                      )}
                      
                      {reminder.amount && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          💰 {formatAmount(reminder.amount)}
                          {reminder.supplier && ` — ${reminder.supplier}`}
                        </div>
                      )}
                      
                      {reminder.notes && (
                        <div className="text-xs text-slate-400 mt-1">{reminder.notes}</div>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(reminder.dueAt).toLocaleDateString('fr-FR')}
                        </span>
                        {reminder.notificationsSent > 0 && (
                          <span className="flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            {reminder.notificationsSent} envoyé{reminder.notificationsSent > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={cn(
                      "text-sm font-mono",
                      getTimeColor(reminder.hoursRemaining)
                    )}>
                      {formatTimeRemaining(reminder.hoursRemaining)}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-500"
                        title="Marquer comme fait"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                        title="Reporter"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-400"
                        title="Ignorer"
                      >
                        <BellOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400">
            {filteredReminders.length} rappel{filteredReminders.length > 1 ? 's' : ''} affiché{filteredReminders.length > 1 ? 's' : ''}
          </div>
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

export default ValidationBCRemindersSystem;

