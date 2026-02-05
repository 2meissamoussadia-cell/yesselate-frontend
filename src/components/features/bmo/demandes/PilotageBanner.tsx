'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, Zap } from 'lucide-react';
import type { Demand } from '@/lib/types/bmo.types';

interface PilotageBannerProps {
  demands: Demand[];
  previousPeriod?: Demand[];
  onFilterClick: (filter: 'urgent' | 'overdue' | 'blocked') => void;
}

export function PilotageBanner({ demands, previousPeriod, onFilterClick }: PilotageBannerProps) {
  const { darkMode } = useAppStore();

  const stats = useMemo(() => {
    const now = new Date();
    const urgent = demands.filter(d => d.priority === 'urgent').length;
    const overdue = demands.filter(d => {
      const [day, month, year] = d.date.split('/').map(Number);
      const demandDate = new Date(year, month - 1, day);
      const diffDays = Math.ceil((now.getTime() - demandDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 7 && d.status !== 'validated';
    }).length;
    const blocked = demands.filter(d => d.status === 'pending').length;
    const high = demands.filter(d => d.priority === 'high').length;
    const normal = demands.filter(d => d.priority === 'normal').length;

    // Calculer les variations si période précédente disponible
    const previousStats = previousPeriod ? {
      total: previousPeriod.length,
      urgent: previousPeriod.filter(d => d.priority === 'urgent').length,
      overdue: previousPeriod.filter(d => {
        const [day, month, year] = d.date.split('/').map(Number);
        const demandDate = new Date(year, month - 1, day);
        const diffDays = Math.ceil((now.getTime() - demandDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 7 && d.status !== 'validated';
      }).length,
    } : null;

    const variations = previousStats ? {
      total: ((demands.length - previousStats.total) / previousStats.total) * 100,
      urgent: previousStats.urgent > 0 ? ((urgent - previousStats.urgent) / previousStats.urgent) * 100 : 0,
      overdue: previousStats.overdue > 0 ? ((overdue - previousStats.overdue) / previousStats.overdue) * 100 : 0,
    } : null;

    return {
      total: demands.length,
      urgent,
      overdue,
      blocked,
      high,
      normal,
      variations,
    };
  }, [demands, previousPeriod]);

  const KPICard = ({ 
    title, 
    value, 
    variation, 
    color, 
    icon: Icon,
    onClick 
  }: { 
    title: string; 
    value: number; 
    variation?: number | null;
    color: string;
    icon: any;
    onClick?: () => void;
  }) => {
    const isPositive = variation !== null && variation !== undefined && variation < 0;
    
    return (
      <Card
        className={cn(
          'border-l-4 transition-all hover:shadow-lg cursor-pointer',
          color,
          onClick && 'hover:scale-[1.02]'
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn(
                    'w-4 h-4',
                    color.includes('red') ? 'text-red-400' :
                    color.includes('amber') ? 'text-amber-400' :
                    color.includes('blue') ? 'text-blue-400' : 'text-emerald-400'
                  )} />
                <span className="text-xs text-slate-400">{title}</span>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                color.includes('red') ? 'text-red-400' :
                color.includes('amber') ? 'text-amber-400' :
                color.includes('blue') ? 'text-blue-400' : 'text-emerald-400'
              )}>
                {value}
              </p>
              {variation !== null && variation !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {isPositive ? (
                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-red-400" />
                  )}
                  <span className={cn(
                    'text-xs font-semibold',
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {Math.abs(variation).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard
          title="Total demandes"
          value={stats.total}
          variation={stats.variations?.total}
          color="border-l-blue-500 bg-blue-500/10"
          icon={Zap}
        />
        <KPICard
          title="Urgentes"
          value={stats.urgent}
          variation={stats.variations?.urgent}
          color="border-l-red-500 bg-red-500/10"
          icon={AlertTriangle}
          onClick={() => onFilterClick('urgent')}
        />
        <KPICard
          title="En retard"
          value={stats.overdue}
          variation={stats.variations?.overdue}
          color="border-l-orange-500 bg-orange-500/10"
          icon={Clock}
          onClick={() => onFilterClick('overdue')}
        />
        <KPICard
          title="Prioritaires"
          value={stats.high}
          color="border-l-amber-500 bg-amber-500/10"
          icon={Zap}
        />
        <KPICard
          title="Normales"
          value={stats.normal}
          color="border-l-emerald-500 bg-emerald-500/10"
          icon={Zap}
        />
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={stats.urgent > 0 ? 'destructive' : 'outline'}
          onClick={() => onFilterClick('urgent')}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Urgentes ({stats.urgent})
        </Button>
        <Button
          size="sm"
          variant={stats.overdue > 0 ? 'warning' : 'outline'}
          onClick={() => onFilterClick('overdue')}
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          En retard ({stats.overdue})
        </Button>
        <Button
          size="sm"
          variant={stats.blocked > 0 ? 'warning' : 'outline'}
          onClick={() => onFilterClick('blocked')}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Bloquées ({stats.blocked})
        </Button>
      </div>
    </div>
  );
}

