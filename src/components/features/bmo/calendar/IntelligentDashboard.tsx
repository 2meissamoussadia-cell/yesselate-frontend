'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, Activity } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';

interface IntelligentDashboardProps {
  activities: CalendarEvent[];
  selectedDate: Date;
}

export function IntelligentDashboard({ activities, selectedDate }: IntelligentDashboardProps) {
  const { darkMode } = useAppStore();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const todayEvents = activities.filter(a => a.date === today);
    const weekEvents = activities.filter(a => {
      const eventDate = new Date(a.date);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });

    const criticalEvents = activities.filter(a => 
      (a.priority === 'critical' || a.priority === 'urgent') && 
      new Date(a.date) >= new Date()
    );

    const conflicts = activities.filter(a => a.conflicts && a.conflicts.length > 0);
    
    const upcomingDeadlines = activities
      .filter(a => a.type === 'deadline' && new Date(a.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    const byBureau = activities.reduce((acc, activity) => {
      if (activity.bureau) {
        acc[activity.bureau] = (acc[activity.bureau] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostActiveBureau = Object.entries(byBureau)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      today: todayEvents.length,
      thisWeek: weekEvents.length,
      critical: criticalEvents.length,
      conflicts: conflicts.length,
      upcomingDeadlines,
      mostActiveBureau: mostActiveBureau ? {
        code: mostActiveBureau[0],
        count: mostActiveBureau[1]
      } : null,
    };
  }, [activities, selectedDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Aujourd'hui */}
      <Card className={cn(
        'border-l-4 border-l-blue-500 transition-all hover:shadow-lg',
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Aujourd'hui
            </span>
            <Badge variant="info">{stats.today}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-400">{stats.today}</p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.today === 0 ? 'Aucun événement' : 'événement(s) prévu(s)'}
          </p>
        </CardContent>
      </Card>

      {/* Cette semaine */}
      <Card className={cn(
        'border-l-4 border-l-emerald-500 transition-all hover:shadow-lg',
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Cette semaine
            </span>
            <Badge variant="success">{stats.thisWeek}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-400">{stats.thisWeek}</p>
          <p className="text-xs text-slate-400 mt-1">activité(s) planifiée(s)</p>
        </CardContent>
      </Card>

      {/* Urgentes */}
      <Card className={cn(
        'border-l-4 border-l-red-500 transition-all hover:shadow-lg',
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Urgentes
            </span>
            <Badge variant="urgent">{stats.critical}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.critical === 0 ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Aucune urgence
              </span>
            ) : (
              'demande(nt) attention'
            )}
          </p>
        </CardContent>
      </Card>

      {/* Conflits */}
      <Card className={cn(
        'border-l-4 border-l-amber-500 transition-all hover:shadow-lg',
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Conflits
            </span>
            <Badge variant={stats.conflicts > 0 ? 'warning' : 'success'}>
              {stats.conflicts}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-amber-400">{stats.conflicts}</p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.conflicts === 0 ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Aucun conflit
              </span>
            ) : (
              'à résoudre'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

