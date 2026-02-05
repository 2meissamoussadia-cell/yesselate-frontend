'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { AlertTriangle, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { blockedDossiers, contractsToSign } from '@/lib/data';

interface AlternativeCalendarViewProps {
  activities: CalendarEvent[];
  onResolveBlocker: (blockerId: string) => void;
  onViewBlockerDetails: (blockerId: string) => void;
  onEscalateBlocker: (blockerId: string) => void;
  onViewEventDetails: (eventId: string) => void;
}

export function AlternativeCalendarView({
  activities,
  onResolveBlocker,
  onViewBlockerDetails,
  onEscalateBlocker,
  onViewEventDetails,
}: AlternativeCalendarViewProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  // Organiser les blocages
  const blockers = useMemo(() => {
    const allBlockers = [
      ...blockedDossiers.map(d => ({
        id: d.id,
        type: 'blocked' as const,
        severity: (d.impact === 'critical' ? 'critical' : 
                  d.impact === 'high' ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
        title: `Dossier bloqué ${d.delay || 0}j`,
        description: d.reason || d.subject,
        bureau: d.bureau,
        project: d.project,
        daysBlocked: d.delay || 0,
      })),
      ...contractsToSign.map(c => ({
        id: c.id,
        type: 'contract' as const,
        severity: 'medium' as const,
        title: 'Contrat en attente',
        description: c.subject,
        bureau: c.bureau,
        supplier: c.partner,
      })),
    ];

    return allBlockers.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, []);

  // Événements à venir (7 prochains jours)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return activities
      .filter(a => {
        if (!a.date) return false;
        const eventDate = new Date(a.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())
      .slice(0, 10);
  }, [activities]);

  const severityColors = {
    critical: 'border-l-red-500 bg-red-500/10',
    high: 'border-l-amber-500 bg-amber-500/10',
    medium: 'border-l-blue-500 bg-blue-500/10',
  };

  const severityButtonColors = {
    critical: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50',
    high: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/50',
    medium: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/50',
  };

  return (
    <div className="space-y-6">
      {/* Section "Ce qui casse l'organisation" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold text-red-400">
                Ce qui casse l'organisation
              </h2>
            </div>
            <Badge variant="urgent" className="text-sm px-2 py-1">
              {blockers.length}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blockers.map((blocker) => (
            <Card
              key={blocker.id}
              className={cn(
                'border-l-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer',
                severityColors[blocker.severity]
              )}
              onClick={() => onViewBlockerDetails(blocker.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={blocker.severity === 'critical' ? 'urgent' : blocker.severity === 'high' ? 'warning' : 'info'}
                        className="text-xs"
                      >
                        {blocker.severity}
                      </Badge>
                      {blocker.bureau && (
                        <BureauTag bureau={blocker.bureau} className="text-xs" />
                      )}
                    </div>
                    <CardTitle className="text-sm font-bold mb-1 line-clamp-1">
                      {blocker.title}
                    </CardTitle>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {blocker.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                      {'project' in blocker && blocker.project && (
                        <Badge variant="info" className="text-[10px] px-1.5">
                          {blocker.project}
                        </Badge>
                      )}
                      {blocker.type === 'blocked' && 'daysBlocked' in blocker && blocker.daysBlocked !== undefined && (
                        <Badge variant="warning" className="text-[10px] px-1.5">
                          {blocker.daysBlocked} jour{blocker.daysBlocked > 1 ? 's' : ''}
                        </Badge>
                      )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolveBlocker(blocker.id);
                    }}
                    className={cn(
                      'flex-1 text-xs h-8',
                      severityButtonColors[blocker.severity]
                    )}
                  >
                    Résoudre →
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEscalateBlocker(blocker.id);
                    }}
                    className="text-xs h-8 px-2"
                  >
                    Escalader
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Section "Événements à venir" */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold">Événements à venir</h2>
          <Badge variant="info" className="text-sm px-2 py-1">
            {upcomingEvents.length}
          </Badge>
        </div>

        <div className="space-y-2">
          {upcomingEvents.length === 0 ? (
            <Card className={cn(
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
            )}>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-slate-400">Aucun événement à venir dans les 7 prochains jours</p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event) => {
              const eventTypes: Record<string, { icon: string; color: string }> = {
                meeting: { icon: '📅', color: 'bg-blue-500/20' },
                visio: { icon: '💻', color: 'bg-purple-500/20' },
                deadline: { icon: '⏰', color: 'bg-red-500/20' },
                site: { icon: '🏗️', color: 'bg-orange-500/20' },
                training: { icon: '📚', color: 'bg-pink-500/20' },
                formation: { icon: '🎓', color: 'bg-pink-500/20' },
              };

              const typeInfo = eventTypes[event.type] || { icon: '📌', color: 'bg-gray-500/20' };
              const isUrgent = event.priority === 'critical' || event.priority === 'urgent';

              return (
                <Card
                  key={event.id}
                  className={cn(
                    'border-l-4 transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer',
                    isUrgent ? 'border-l-red-500 bg-red-500/10' : 'border-l-blue-500 bg-blue-500/10',
                    darkMode ? 'border-slate-700' : 'border-gray-200'
                  )}
                  onClick={() => onViewEventDetails(event.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0',
                        typeInfo.color
                      )}>
                        {typeInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                          {isUrgent && (
                            <Badge variant="urgent" className="text-[9px] px-1.5">
                              {event.priority}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                          {event.date && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </span>
                          )}
                          {event.bureau && (
                            <BureauTag bureau={event.bureau} className="text-[9px] px-1.5" />
                          )}
                          {event.participants && event.participants.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.participants.length}
                            </span>
                          )}
                        </div>
                        {event.location && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            📍 {event.location}
                          </p>
                        )}
                        {event.project && (
                          <Badge variant="info" className="text-[9px] px-1.5 mt-1.5">
                            {event.project}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

