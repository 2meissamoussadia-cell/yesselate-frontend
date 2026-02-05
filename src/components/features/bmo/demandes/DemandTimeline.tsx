'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { Demand } from '@/lib/types/bmo.types';

interface DemandTimelineProps {
  demands: Demand[];
}

export function DemandTimeline({ demands }: DemandTimelineProps) {
  const { darkMode } = useAppStore();

  const timelineData = useMemo(() => {
    // Grouper les demandes par date
    const grouped: Record<string, Demand[]> = {};
    
    demands.forEach(demand => {
      const dateKey = demand.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(demand);
    });

    // Trier les dates
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateB.getTime() - dateA.getTime();
    });

    return sortedDates.map(date => ({
      date,
      demands: grouped[date],
    }));
  }, [demands]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timeline des demandes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineData.map((group, idx) => (
            <div key={idx} className="relative">
              {/* Ligne verticale */}
              {idx < timelineData.length - 1 && (
                <div className={cn(
                  'absolute left-4 top-8 w-0.5 h-full',
                  darkMode ? 'bg-slate-700' : 'bg-gray-200'
                )} />
              )}

              {/* Date */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  darkMode ? 'bg-orange-500/20 border-2 border-orange-500' : 'bg-orange-50 border-2 border-orange-300'
                )}>
                  {group.date.split('/')[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{group.date}</p>
                  <Badge variant="info" className="text-[9px]">
                    {group.demands.length} demande{group.demands.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* Demandes du jour */}
              <div className="ml-11 space-y-2">
                {group.demands.map((demand) => (
                  <div
                    key={demand.id}
                    className={cn(
                      'p-3 rounded-lg border-l-4',
                      demand.priority === 'urgent' ? 'border-l-red-500 bg-red-500/10' :
                      demand.priority === 'high' ? 'border-l-amber-500 bg-amber-500/10' :
                      'border-l-blue-500 bg-blue-500/10'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{demand.icon}</span>
                      <span className="font-mono text-xs text-orange-400">{demand.id}</span>
                      <Badge variant={demand.priority === 'urgent' ? 'urgent' : 'warning'}>
                        {demand.priority}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{demand.subject}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span>{demand.bureau}</span>
                      <span>•</span>
                      <span>{demand.type}</span>
                      {demand.amount !== '—' && demand.amount !== 'N/A' && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">{demand.amount}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

