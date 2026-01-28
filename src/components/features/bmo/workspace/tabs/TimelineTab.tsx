'use client';

import { useMemo } from 'react';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

import { demands, decisions } from '@/lib/data';

type TimelineEvent = {
  id: string;
  type: 'demand' | 'decision' | 'exchange';
  date: string;
  timestamp: number;
  title: string;
  subtitle?: string;
  bureau?: string;
  icon: React.ReactNode;
  variant: 'default' | 'success' | 'warning' | 'urgent';
};

const parseDate = (dateStr: string): number => {
  const [d, m, y] = dateStr.split('/').map(Number);
  return new Date(y || 2025, (m || 1) - 1, d || 1).getTime();
};

export function TimelineTab() {
  const events: TimelineEvent[] = useMemo(() => {
    const items: TimelineEvent[] = [];

    // Demandes
    demands.forEach((d) => {
      items.push({
        id: `demand-${d.id}`,
        type: 'demand',
        date: d.date,
        timestamp: parseDate(d.date),
        title: d.subject,
        subtitle: `${d.bureau} • ${d.type}`,
        bureau: d.bureau,
        icon: <FileText className="w-4 h-4" />,
        variant: d.priority === 'urgent' ? 'urgent' : d.status === 'validated' ? 'success' : 'default',
      });
    });

    // Décisions
    decisions.forEach((d) => {
      items.push({
        id: `decision-${d.id}`,
        type: 'decision',
        date: d.date,
        timestamp: parseDate(d.date),
        title: d.subject,
        subtitle: `Décision ${d.id}`,
        icon: d.type === 'validated' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />,
        variant: d.type === 'validated' ? 'success' : 'warning',
      });
    });

    // Échanges - migré vers echanges-structures
    // Les échanges sont maintenant gérés dans le module echanges-structures

    // Tri par date décroissante
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    
    events.forEach((event) => {
      const date = new Date(event.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });

    return groups;
  }, [events]);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <FluentCard className="min-h-[600px]">
      <FluentCardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <FluentCardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>Timeline globale</span>
            <span className="text-[rgb(var(--muted))] font-normal">({events.length} événements)</span>
          </FluentCardTitle>
        </div>
      </FluentCardHeader>

      <FluentCardContent className="space-y-6">
        {Object.entries(groupedByMonth).map(([monthKey, monthEvents]) => {
          const [year, month] = monthKey.split('-');
          const monthName = monthNames[parseInt(month) - 1];

          return (
            <div key={monthKey}>
              {/* En-tête du mois */}
              <div className="sticky top-0 z-10 bg-[rgb(var(--bg)/0.95)] backdrop-blur-md py-2 mb-3 border-b border-[rgb(var(--border)/0.5)]">
                <div className="font-semibold text-sm">
                  {monthName} {year}
                  <span className="text-[rgb(var(--muted))] font-normal ml-2">
                    ({monthEvents.length})
                  </span>
                </div>
              </div>

              {/* Événements du mois */}
              <div className="space-y-3 relative pl-6">
                {/* Ligne verticale */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-[rgb(var(--border)/0.3)]" />

                {monthEvents.map((event) => (
                  <div key={event.id} className="relative">
                    {/* Point sur la timeline */}
                    <div
                      className={`absolute left-[-19px] top-2 w-3 h-3 rounded-full border-2 ${
                        event.variant === 'success'
                          ? 'bg-emerald-400 border-emerald-500'
                          : event.variant === 'urgent'
                          ? 'bg-red-400 border-red-500'
                          : event.variant === 'warning'
                          ? 'bg-amber-400 border-amber-500'
                          : 'bg-[rgb(var(--border))] border-[rgb(var(--border))]'
                      }`}
                    />

                    {/* Carte événement */}
                    <div className="p-3 rounded-lg border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--surface)/0.5)] hover:bg-[rgb(var(--surface-2)/0.7)] transition-colors">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            event.variant === 'success'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : event.variant === 'urgent'
                              ? 'bg-red-500/20 text-red-400'
                              : event.variant === 'warning'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-[rgb(var(--surface-2))]'
                          }`}
                        >
                          {event.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{event.title}</div>
                          {event.subtitle && (
                            <div className="text-xs text-[rgb(var(--muted))] mt-1">{event.subtitle}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant={
                              event.type === 'demand'
                                ? 'default'
                                : event.type === 'decision'
                                ? 'success'
                                : 'warning'
                            }
                            className="text-[10px]"
                          >
                            {event.type === 'demand' ? 'Demande' : event.type === 'decision' ? 'Décision' : 'Échange'}
                          </Badge>
                          <div className="text-xs text-[rgb(var(--muted))]">{event.date}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="py-20 text-center text-[rgb(var(--muted))] text-sm">
            Aucun événement à afficher.
          </div>
        )}
      </FluentCardContent>
    </FluentCard>
  );
}
