'use client';

import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Clock, X } from 'lucide-react';
import type { DetectedConflict, LoadData, SLAStatus } from '@/lib/utils/calendar-helpers';

interface CalendarOverlaysProps {
  conflicts: DetectedConflict[];
  loadData: LoadData[];
  slaStatuses: SLAStatus[];
  onClose: () => void;
}

export function CalendarOverlays({ conflicts, loadData, slaStatuses, onClose }: CalendarOverlaysProps) {
  const { darkMode } = useAppStore();

  const criticalConflicts = conflicts.filter((c) => c.severity === 'critical');
  const overloadedDays = loadData.filter((l) => l.overload);
  const overdueSLAs = slaStatuses.filter((s) => s.isOverdue);

  if (criticalConflicts.length === 0 && overloadedDays.length === 0 && overdueSLAs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 flex flex-wrap gap-2">
      {/* Conflits critiques */}
      {criticalConflicts.length > 0 && (
        <Card className={cn('border-red-500/50 bg-red-500/10 shadow-lg', darkMode ? '' : 'bg-red-50')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Conflits critiques</span>
                <Badge variant="urgent">{criticalConflicts.length}</Badge>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {criticalConflicts.slice(0, 3).map((conflict, idx) => (
                <div key={idx} className="text-xs p-2 rounded bg-red-500/20">
                  <p className="font-semibold">{conflict.bureau} - {conflict.date}</p>
                  <p className="text-slate-300">{conflict.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Surcharges */}
      {overloadedDays.length > 0 && (
        <Card className={cn('border-amber-500/50 bg-amber-500/10 shadow-lg', darkMode ? '' : 'bg-amber-50')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Surcharges</span>
                <Badge variant="warning">{overloadedDays.length}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {overloadedDays.slice(0, 3).map((load, idx) => (
                <div key={idx} className="text-xs p-2 rounded bg-amber-500/20">
                  <p className="font-semibold">{load.bureau} - {load.date}</p>
                  <p className="text-slate-300">
                    {load.totalHours}h / {load.capacity}h ({load.overloadPercent}%)
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SLA en retard */}
      {overdueSLAs.length > 0 && (
        <Card className={cn('border-red-500/50 bg-red-500/10 shadow-lg', darkMode ? '' : 'bg-red-50')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                <span>SLA en retard</span>
                <Badge variant="urgent">{overdueSLAs.length}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {overdueSLAs.slice(0, 3).map((sla, idx) => (
                <div key={idx} className="text-xs p-2 rounded bg-red-500/20">
                  <p className="font-semibold">Item {sla.itemId.slice(0, 8)}</p>
                  <p className="text-slate-300">En retard de {sla.daysOverdue} jour(s)</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

