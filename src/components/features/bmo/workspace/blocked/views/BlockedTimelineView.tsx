'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Clock, AlertCircle, AlertTriangle, CheckCircle2, ArrowUpRight, 
  Building2, ChevronLeft, ChevronRight, Calendar, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { blockedApi } from '@/lib/services/blockedApiService';
import { logger } from '@/lib/utils/logger';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  tabId: string;
  data: Record<string, unknown>;
};

type TimelineEvent = {
  id: string;
  date: string;
  type: 'blocked' | 'escalated' | 'resolved' | 'sla_warning' | 'sla_breach';
  dossier: BlockedDossier;
  description: string;
};

export function BlockedTimelineView({ tabId, data }: Props) {
  const { openTab } = useBlockedWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState<BlockedDossier[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await blockedApi.getAll(undefined, { field: 'delay', direction: 'desc' });
        setDossiers(result.data);
      } catch (error) {
        logger.error('Failed to load dossiers', error as Error, { context: 'BlockedTimelineView' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Generate timeline events
  const events = useMemo(() => {
    const now = new Date();
    const timelineEvents: TimelineEvent[] = [];

    dossiers.forEach(dossier => {
      const delay = dossier.delay ?? 0;
      const blockedDate = new Date(now.getTime() - delay * 24 * 60 * 60 * 1000);

      // Blocked event
      timelineEvents.push({
        id: `${dossier.id}-blocked`,
        date: blockedDate.toISOString(),
        type: 'blocked',
        dossier,
        description: 'Dossier bloqué',
      });

      // SLA warning at 7 days
      if (delay >= 7) {
        const warningDate = new Date(blockedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        timelineEvents.push({
          id: `${dossier.id}-warning`,
          date: warningDate.toISOString(),
          type: 'sla_warning',
          dossier,
          description: 'Alerte SLA - 7 jours',
        });
      }

      // SLA breach at 14 days
      if (delay >= 14) {
        const breachDate = new Date(blockedDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        timelineEvents.push({
          id: `${dossier.id}-breach`,
          date: breachDate.toISOString(),
          type: 'sla_breach',
          dossier,
          description: 'Dépassement SLA - 14 jours',
        });
      }
    });

    return timelineEvents.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [dossiers]);

  // Filter events for current period
  const filteredEvents = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    return events.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
  }, [events, currentDate, viewMode]);

  // Group by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEvents.forEach(event => {
      const date = new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const navigatePeriod = (direction: -1 | 1) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'escalated':
        return <ArrowUpRight className="w-4 h-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'sla_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'sla_breach':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'blocked':
        return 'border-l-red-500';
      case 'sla_warning':
        return 'border-l-amber-500';
      case 'sla_breach':
        return 'border-l-red-500';
      case 'escalated':
        return 'border-l-orange-500';
      case 'resolved':
        return 'border-l-emerald-500';
      default:
        return 'border-l-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Timeline des blocages
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Vue chronologique des événements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                viewMode === 'week'
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "px-3 py-1 rounded text-sm transition-colors",
                viewMode === 'month'
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <button
          onClick={() => navigatePeriod(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {viewMode === 'week' 
              ? `Semaine du ${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
              : currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            }
          </span>
        </div>

        <button
          onClick={() => navigatePeriod(1)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <div key={date}>
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              {date}
            </h3>

            <div className="space-y-2 ml-4 border-l border-slate-200 dark:border-slate-800">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => openTab({
                    type: 'dossier',
                    id: `dossier:${event.dossier.id}`,
                    title: event.dossier.subject.substring(0, 30) + '...',
                    icon: '📋',
                    data: { dossierId: event.dossier.id },
                  })}
                  className={cn(
                    "ml-4 p-4 rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors",
                    getEventColor(event.type)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getEventIcon(event.type)}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {event.dossier.subject}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {event.dossier.id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {event.dossier.bureau}
                        </span>
                        <span>
                          {new Date(event.date).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {Object.keys(groupedEvents).length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun événement sur cette période</p>
          <p className="text-sm mt-1">Naviguez pour voir d'autres dates</p>
        </div>
      )}
    </div>
  );
}

