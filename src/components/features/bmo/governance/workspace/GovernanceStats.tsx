/**
 * Composant de statistiques avancées pour la gouvernance
 * Affiche des métriques détaillées et des tendances
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GovernanceStatsProps {
  className?: string;
}

export function GovernanceStats({ className }: GovernanceStatsProps) {
  // Mock data - à remplacer par vraies données API
  const stats = {
    raci: {
      total: 42,
      complete: 37,
      incomplete: 5,
      conflicts: 3,
      critical: 8,
      avgCompletionRate: 88,
      trend: 'up' as const,
      trendValue: '+5%',
    },
    alerts: {
      total: 23,
      critical: 2,
      warning: 8,
      info: 10,
      success: 3,
      resolved: 15,
      avgResolutionTime: '2.3h',
      trend: 'down' as const,
      trendValue: '-12%',
    },
    performance: {
      responseTime: '1.2s',
      uptime: '99.8%',
      tasksCompleted: 127,
      tasksThisWeek: 23,
    },
  };
  
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {/* RACI Stats */}
      <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            Matrice RACI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-white">{stats.raci.total}</div>
              <div className="text-xs text-white/60">Activités totales</div>
            </div>
            <TrendBadge trend={stats.raci.trend} value={stats.raci.trendValue} />
          </div>
          
          <div className="space-y-2">
            <StatBar
              label="Complétude"
              value={stats.raci.avgCompletionRate}
              max={100}
              color="emerald"
            />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <MiniStat
                label="Conflits"
                value={stats.raci.conflicts}
                color="text-red-400"
                icon={AlertTriangle}
              />
              <MiniStat
                label="Critiques"
                value={stats.raci.critical}
                color="text-amber-400"
                icon={Activity}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Alerts Stats */}
      <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Alertes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-white">{stats.alerts.total}</div>
              <div className="text-xs text-white/60">Alertes actives</div>
            </div>
            <TrendBadge trend={stats.alerts.trend} value={stats.alerts.trendValue} />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Résolution moy.</span>
              <span className="text-white font-semibold">{stats.alerts.avgResolutionTime}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <MiniStat
                label="Critiques"
                value={stats.alerts.critical}
                color="text-red-400"
                icon={AlertTriangle}
              />
              <MiniStat
                label="Résolues"
                value={stats.alerts.resolved}
                color="text-emerald-400"
                icon={CheckCircle2}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Performance Stats */}
      <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-white">{stats.performance.tasksCompleted}</div>
              <div className="text-xs text-white/60">Tâches complétées</div>
            </div>
            <Badge variant="default" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              +{stats.performance.tasksThisWeek} cette semaine
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Temps de réponse</span>
              <span className="text-emerald-400 font-semibold">{stats.performance.responseTime}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Disponibilité</span>
              <span className="text-emerald-400 font-semibold">{stats.performance.uptime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TrendBadgeProps {
  trend: 'up' | 'down' | 'same';
  value: string;
}

function TrendBadge({ trend, value }: TrendBadgeProps) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const color = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';
  
  return (
    <div className={cn('flex items-center gap-1 text-xs font-semibold', color)}>
      <Icon className="h-3 w-3" />
      {value}
    </div>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: 'emerald' | 'blue' | 'amber' | 'red';
}

function StatBar({ label, value, max, color = 'emerald' }: StatBarProps) {
  const percentage = (value / max) * 100;
  
  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };
  
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MiniStat({ label, value, color, icon: Icon }: MiniStatProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
      <Icon className={cn('h-4 w-4', color)} />
      <div className="flex-1 min-w-0">
        <div className={cn('text-lg font-bold', color)}>{value}</div>
        <div className="text-xs text-white/60 truncate">{label}</div>
      </div>
    </div>
  );
}

