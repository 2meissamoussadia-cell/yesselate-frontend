'use client';

import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface AlertPerformanceIndicatorsProps {
  stats: {
    avgResolutionTime: string;
    resolutionRate: number;
    escalationRate: number;
    criticalResolved: number;
    criticalTotal: number;
  };
}

export function AlertPerformanceIndicators({ stats }: AlertPerformanceIndicatorsProps) {
  const { darkMode } = useAppStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-semibold">Temps moyen</span>
          </div>
          <p className="text-xl font-bold text-blue-400">{stats.avgResolutionTime}</p>
          <p className="text-[9px] text-slate-400 mt-1">Résolution</p>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">Taux</span>
          </div>
          <p className="text-xl font-bold text-emerald-400">{stats.resolutionRate}%</p>
          <p className="text-[9px] text-slate-400 mt-1">Résolution</p>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-semibold">Escalade</span>
          </div>
          <p className="text-xl font-bold text-amber-400">{stats.escalationRate}%</p>
          <p className="text-[9px] text-slate-400 mt-1">Taux</p>
        </CardContent>
      </Card>

      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400 font-semibold">Critiques</span>
          </div>
          <p className="text-xl font-bold text-red-400">
            {stats.criticalResolved}/{stats.criticalTotal}
          </p>
          <p className="text-[9px] text-slate-400 mt-1">Résolues</p>
        </CardContent>
      </Card>
    </div>
  );
}

