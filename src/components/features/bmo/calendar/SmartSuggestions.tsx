'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, TrendingUp, Clock, Users } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types/bmo.types';

interface SmartSuggestionsProps {
  activities: CalendarEvent[];
  onApplySuggestion: (suggestion: { type: string; data: any }) => void;
}

export function SmartSuggestions({ activities, onApplySuggestion }: SmartSuggestionsProps) {
  const { darkMode } = useAppStore();

  // Analyse intelligente et suggestions
  const suggestions = useMemo(() => {
    const suggestionsList: Array<{
      id: string;
      type: 'rebalance' | 'conflict' | 'overload' | 'optimization';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      impact: string;
      action: string;
      data: any;
    }> = [];

    // 1. Détecter les surcharges critiques
    const overloadedBureaux = new Map<string, { count: number; dates: string[] }>();
    activities.forEach((activity) => {
      if (!activity.bureau) return;
      if (!overloadedBureaux.has(activity.bureau)) {
        overloadedBureaux.set(activity.bureau, { count: 0, dates: [] });
      }
      const bureau = overloadedBureaux.get(activity.bureau)!;
      bureau.count++;
      if (!bureau.dates.includes(activity.date)) {
        bureau.dates.push(activity.date);
      }
    });

    overloadedBureaux.forEach((data, bureau) => {
      if (data.count > 10) {
        suggestionsList.push({
          id: `overload-${bureau}`,
          type: 'overload',
          priority: 'high',
          title: `Surcharge détectée : ${bureau}`,
          description: `${data.count} activités planifiées sur ${data.dates.length} jour(s)`,
          impact: 'Risque de blocage et retard',
          action: 'Replanifier certaines activités',
          data: { bureau, activities: data.count, dates: data.dates.length },
        });
      }
    });

    // 2. Détecter les jours avec trop d'activités critiques simultanées
    const criticalDays: Record<string, number> = {};
    activities.forEach((activity) => {
      if (activity.priority === 'critical' || activity.priority === 'urgent') {
        criticalDays[activity.date] = (criticalDays[activity.date] || 0) + 1;
      }
    });

    Object.entries(criticalDays).forEach(([date, count]) => {
      if (count >= 3) {
        const dateObj = new Date(date);
        suggestionsList.push({
          id: `critical-${date}`,
          type: 'conflict',
          priority: 'high',
          title: `Journée critique : ${dateObj.toLocaleDateString('fr-FR')}`,
          description: `${count} activités critiques/urgentes le même jour`,
          impact: 'Ressources surchargées, risque de non-traitement',
          action: 'Répartir les activités critiques',
          data: { date, count },
        });
      }
    });

    // 3. Optimisation : Détecter les créneaux vides qui pourraient absorber des activités
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekActivitiesByDate: Record<string, number> = {};
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      weekActivitiesByDate[dateStr] = activities.filter(a => a.date === dateStr).length;
    }

    const avgLoad = Object.values(weekActivitiesByDate).reduce((a, b) => a + b, 0) / 7;
    const lowLoadDays = Object.entries(weekActivitiesByDate)
      .filter(([, count]) => count < avgLoad * 0.5)
      .slice(0, 2);

    if (lowLoadDays.length > 0) {
      suggestionsList.push({
        id: 'optimize-distribution',
        type: 'optimization',
        priority: 'medium',
        title: 'Opportunité d\'optimisation',
        description: `${lowLoadDays.length} jour(s) peu chargé(s) détecté(s)`,
        impact: 'Rééquilibrer la charge pour améliorer l\'efficacité',
        action: 'Afficher les créneaux disponibles',
        data: { lowLoadDays },
      });
    }

    // 4. Détecter les activités sans bureau assigné
    const unassignedActivities = activities.filter(a => !a.bureau);
    if (unassignedActivities.length > 0) {
      suggestionsList.push({
        id: 'unassigned',
        type: 'rebalance',
        priority: 'medium',
        title: 'Activités sans bureau',
        description: `${unassignedActivities.length} activité(s) nécessite(nt) une affectation`,
        impact: 'Risque de non-traitement',
        action: 'Affecter les bureaux manquants',
        data: { count: unassignedActivities.length, activities: unassignedActivities },
      });
    }

    return suggestionsList.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [activities]);

  if (suggestions.length === 0) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-4 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-400">Planning optimisé</p>
          <p className="text-xs text-slate-400 mt-1">
            Aucune suggestion d'amélioration nécessaire
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          Suggestions Intelligentes BMO
          <Badge variant="warning" className="text-xs">{suggestions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const iconMap = {
              overload: TrendingUp,
              conflict: AlertCircle,
              rebalance: Users,
              optimization: Clock,
            };
            const Icon = iconMap[suggestion.type];

            return (
              <div
                key={suggestion.id}
                className={cn(
                  'p-3 rounded-lg border transition-all hover:scale-[1.02]',
                  suggestion.priority === 'high'
                    ? 'bg-red-500/10 border-red-500/30'
                    : suggestion.priority === 'medium'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    suggestion.priority === 'high'
                      ? 'bg-red-500/20'
                      : suggestion.priority === 'medium'
                      ? 'bg-orange-500/20'
                      : 'bg-blue-500/20'
                  )}>
                    <Icon className={cn(
                      'w-4 h-4',
                      suggestion.priority === 'high'
                        ? 'text-red-400'
                        : suggestion.priority === 'medium'
                        ? 'text-orange-400'
                        : 'text-blue-400'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold">{suggestion.title}</h4>
                      <Badge
                        variant={suggestion.priority === 'high' ? 'urgent' : 'warning'}
                        className="text-[9px]"
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{suggestion.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-slate-400">Impact :</span>
                      <span className="text-[10px] font-semibold text-amber-400">
                        {suggestion.impact}
                      </span>
                    </div>
                    <Button
                      size="xs"
                      variant={suggestion.priority === 'high' ? 'destructive' : 'warning'}
                      onClick={() => onApplySuggestion(suggestion)}
                      className="text-[9px]"
                    >
                      {suggestion.action} →
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

