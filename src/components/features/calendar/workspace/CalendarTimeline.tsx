'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';
import {
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Users,
  MapPin,
  RefreshCw,
  ArrowRight,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarClock,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

// ================================
// Types
// ================================
interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'cancelled' | 'completed' | 'rescheduled' | 'participant_added' | 'conflict_detected' | 'conflict_resolved' | 'sla_warning' | 'sla_overdue';
  eventId: string;
  eventTitle: string;
  actorName: string;
  actorId: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

// ================================
// Constants
// ================================
const EVENT_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  created: { icon: <CalendarPlus className="w-4 h-4" />, label: 'Créé', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
  updated: { icon: <Edit className="w-4 h-4" />, label: 'Modifié', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  cancelled: { icon: <CalendarX className="w-4 h-4" />, label: 'Annulé', color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30' },
  completed: { icon: <Check className="w-4 h-4" />, label: 'Terminé', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
  rescheduled: { icon: <CalendarClock className="w-4 h-4" />, label: 'Replanifié', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' },
  participant_added: { icon: <Users className="w-4 h-4" />, label: 'Participant ajouté', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  conflict_detected: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Conflit détecté', color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30' },
  conflict_resolved: { icon: <CalendarCheck className="w-4 h-4" />, label: 'Conflit résolu', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
  sla_warning: { icon: <Clock className="w-4 h-4" />, label: 'Alerte SLA', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' },
  sla_overdue: { icon: <AlertTriangle className="w-4 h-4" />, label: 'SLA dépassé', color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30' },
};

// ================================
// Helpers
// ================================
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ================================
// Mock data generator
// ================================
function generateMockTimeline(): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const now = new Date();

  const eventTypes: TimelineEvent['type'][] = [
    'created', 'updated', 'cancelled', 'completed', 'rescheduled',
    'participant_added', 'conflict_detected', 'conflict_resolved', 'sla_warning', 'sla_overdue'
  ];

  const eventTitles = [
    'Réunion de suivi projet',
    'Visite de chantier Site A',
    'Comité de pilotage',
    'Validation BC-2026-001',
    'Signature contrat XYZ',
    'Deadline rapport Q1',
    'Réunion hebdomadaire',
  ];

  const actors = [
    { id: 'USR-001', name: 'A. DIALLO' },
    { id: 'USR-002', name: 'M. KANE' },
    { id: 'USR-003', name: 'S. TRAORE' },
    { id: 'USR-004', name: 'F. OUEDRAOGO' },
  ];

  for (let i = 0; i < 15; i++) {
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const title = eventTitles[Math.floor(Math.random() * eventTitles.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const hoursAgo = Math.floor(Math.random() * 72);

    let details: string | undefined;
    let oldValue: string | undefined;
    let newValue: string | undefined;

    switch (type) {
      case 'rescheduled':
        oldValue = '15 Jan 10:00';
        newValue = '17 Jan 14:00';
        details = 'Conflit avec réunion DG';
        break;
      case 'participant_added':
        details = `${actors[Math.floor(Math.random() * actors.length)].name} ajouté`;
        break;
      case 'updated':
        details = 'Description mise à jour';
        break;
      case 'cancelled':
        details = 'Annulation demandée par le responsable';
        break;
    }

    events.push({
      id: `TL-${i.toString().padStart(3, '0')}`,
      type,
      eventId: `EVT-${(i % 7 + 1).toString().padStart(3, '0')}`,
      eventTitle: title,
      actorName: actor.name,
      actorId: actor.id,
      details,
      oldValue,
      newValue,
      createdAt: new Date(now.getTime() - hoursAgo * 3600000),
    });
  }

  return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ================================
// Component
// ================================
interface CalendarTimelineProps {
  limit?: number;
  className?: string;
  showHeader?: boolean;
}

export function CalendarTimeline({ limit = 10, className, showHeader = true }: CalendarTimelineProps) {
  const { openTab } = useCalendarWorkspaceStore();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 300));
      setEvents(generateMockTimeline());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const displayedEvents = useMemo(() => {
    return expanded ? events : events.slice(0, limit);
  }, [events, expanded, limit]);

  const handleOpenEvent = useCallback((event: TimelineEvent) => {
    openTab({
      id: `event:${event.eventId}`,
      type: 'viewer',
      title: event.eventTitle,
      icon: '📅',
      data: { eventId: event.eventId },
    });
  }, [openTab]);

  if (loading) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Activité récente
          </h3>
          <FluentButton size="sm" variant="secondary" onClick={loadTimeline}>
            <RefreshCw className="w-3.5 h-3.5" />
          </FluentButton>
        </div>
      )}

      <div className="space-y-3">
        {displayedEvents.map((event, idx) => {
          const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.updated;

          return (
            <div
              key={event.id}
              className="flex items-start gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl p-2 -mx-2 transition-colors"
              onClick={() => handleOpenEvent(event)}
            >
              {/* Icon */}
              <div className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center", config.color)}>
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{event.eventTitle}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-400">
                    {config.label}
                  </span>
                </div>
                
                <div className="text-xs text-slate-400 mt-0.5">
                  par <span className="font-medium">{event.actorName}</span>
                  {event.details && (
                    <span className="ml-1">• {event.details}</span>
                  )}
                </div>

                {event.oldValue && event.newValue && (
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-slate-400 line-through">{event.oldValue}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-600">{event.newValue}</span>
                  </div>
                )}
              </div>

              {/* Time & action */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {formatRelativeTime(event.createdAt)}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      {events.length > limit && (
        <button
          className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center justify-center gap-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Voir plus ({events.length - limit} autres)
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default CalendarTimeline;

