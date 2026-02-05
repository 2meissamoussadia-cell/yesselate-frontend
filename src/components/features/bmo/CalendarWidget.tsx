'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

interface CalendarWidgetProps {
  upcomingEvents?: Array<{
    id: string;
    title: string;
    date: Date | string;
    type: 'meeting' | 'deadline' | 'event';
    urgent?: boolean;
  }>;
  todayDeadlines?: number;
  className?: string;
}

export function CalendarWidget({
  upcomingEvents = [],
  todayDeadlines = 0,
  className,
}: CalendarWidgetProps) {
  const { darkMode } = useAppStore();

  // Générer des événements d'exemple si aucun n'est fourni
  const events = useMemo(() => {
    if (upcomingEvents.length > 0) return upcomingEvents;

    const today = new Date();
    return [
      {
        id: '1',
        title: 'Réunion BMO',
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        type: 'meeting' as const,
        urgent: false,
      },
      {
        id: '2',
        title: 'Échéance validation paiements',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        type: 'deadline' as const,
        urgent: true,
      },
      {
        id: '3',
        title: 'Revue trimestrielle',
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        type: 'event' as const,
        urgent: false,
      },
    ];
  }, [upcomingEvents]);

  const todayEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((e) => {
      const eventDate = typeof e.date === 'string' ? new Date(e.date) : e.date;
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
  }, [events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="w-3 h-3" />;
      case 'deadline':
        return <Clock className="w-3 h-3" />;
      default:
        return <CheckCircle className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: string, urgent?: boolean) => {
    if (urgent) return 'text-red-400';
    switch (type) {
      case 'meeting':
        return 'text-blue-400';
      case 'deadline':
        return 'text-amber-400';
      default:
        return 'text-purple-400';
    }
  };

  return (
    <DashboardCard
      title="📅 Calendrier & Agenda"
      subtitle="Événements et échéances"
      icon="📅"
      borderColor="#10B981"
      badge={todayEvents.length + todayDeadlines}
      badgeVariant={todayEvents.length + todayDeadlines > 0 ? 'warning' : 'default'}
      className={className}
    >
      <div className="space-y-3">
        {/* Aujourd'hui */}
        {(todayEvents.length > 0 || todayDeadlines > 0) && (
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
              <span className="text-amber-400">Aujourd'hui</span>
              {(todayEvents.length > 0 || todayDeadlines > 0) && (
                <Badge variant="warning" className="text-[9px]">
                  {todayEvents.length + todayDeadlines}
                </Badge>
              )}
            </h4>
            <div className="space-y-1">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'p-2 rounded-lg border-l-4 flex items-center gap-2',
                    darkMode ? 'bg-slate-800/30' : 'bg-gray-50',
                    event.urgent ? 'border-l-red-400/60' : 'border-l-blue-400/60'
                  )}
                >
                  <div className={cn('flex-shrink-0', getEventColor(event.type, event.urgent))}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">{event.title}</p>
                    <p className="text-[9px] text-slate-400">
                      {format(typeof event.date === 'string' ? new Date(event.date) : event.date, 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
              {todayDeadlines > 0 && (
                <div
                  className={cn(
                    'p-2 rounded-lg border-l-4 flex items-center gap-2',
                    darkMode ? 'bg-red-400/10' : 'bg-red-50',
                    'border-l-red-400/60'
                  )}
                >
                  <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium">
                      {todayDeadlines} échéance(s) critique(s)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* À venir */}
        <div>
          <h4 className="text-xs font-semibold mb-2">À venir (7 jours)</h4>
          <div className="space-y-1">
            {events
              .filter((e) => {
                const eventDate = typeof e.date === 'string' ? new Date(e.date) : e.date;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diff = eventDate.getTime() - today.getTime();
                return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
              })
              .slice(0, 3)
              .map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'p-2 rounded-lg border-l-4 flex items-center gap-2',
                    darkMode ? 'bg-slate-800/30' : 'bg-gray-50',
                    event.urgent ? 'border-l-red-400/60' : 'border-l-blue-400/60'
                  )}
                >
                  <div className={cn('flex-shrink-0', getEventColor(event.type, event.urgent))}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate">{event.title}</p>
                    <p className="text-[9px] text-slate-400">
                      {format(typeof event.date === 'string' ? new Date(event.date) : event.date, 'EEE d MMM', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Lien vers calendrier complet */}
        <Link href="/maitre-ouvrage/calendrier">
          <Button size="sm" variant="ghost" className="w-full text-xs">
            Voir le calendrier complet →
          </Button>
        </Link>
      </div>
    </DashboardCard>
  );
}

