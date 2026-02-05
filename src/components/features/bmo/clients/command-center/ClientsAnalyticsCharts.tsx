/**
 * Charts Analytics pour Clients
 * Graphiques avancés - inspirés de BlockedAnalyticsCharts
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Crown,
  AlertTriangle,
  DollarSign,
  Building2,
  Star,
} from 'lucide-react';

// ================================
// Client Growth Trend Chart
// ================================
export function ClientsGrowthChart() {
  // Données de démonstration - simulated trend data
  const data = [
    { month: 'Juil', clients: 128, prospects: 8 },
    { month: 'Août', clients: 132, prospects: 10 },
    { month: 'Sept', clients: 138, prospects: 12 },
    { month: 'Oct', clients: 145, prospects: 15 },
    { month: 'Nov', clients: 150, prospects: 11 },
    { month: 'Déc', clients: 156, prospects: 12 },
  ];

  const maxValue = Math.max(...data.map(d => d.clients));
  
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1 h-32">
        {data.map((item, idx) => {
          const height = (item.clients / maxValue) * 100;
          const prospectHeight = (item.prospects / maxValue) * 100;
          
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-24">
                <div
                  className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                  title={`${item.clients} clients`}
                />
                <div
                  className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all hover:opacity-80"
                  style={{ height: `${prospectHeight}%` }}
                  title={`${item.prospects} prospects`}
                />
              </div>
              <span className="text-[10px] text-slate-400">{item.month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-500" />
          <span className="text-slate-400">Clients actifs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-slate-400">Prospects</span>
        </div>
      </div>
    </div>
  );
}

// ================================
// Revenue by Client Type Chart
// ================================
export function ClientsRevenueChart() {
  const segments = [
    { label: 'Premium', value: 65, color: 'bg-amber-500', amount: '2.8M€' },
    { label: 'Standard', value: 30, color: 'bg-cyan-500', amount: '1.2M€' },
    { label: 'Nouveaux', value: 5, color: 'bg-blue-500', amount: '180K€' },
  ];

  return (
    <div className="space-y-4">
      {/* Donut representation */}
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          {segments.reduce(
            (acc, segment, idx) => {
              const circumference = 2 * Math.PI * 15.9155;
              const strokeDasharray = `${(segment.value / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -acc.offset;
              
              acc.elements.push(
                <circle
                  key={idx}
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  strokeWidth="3"
                  className={cn(
                    'transition-all duration-500',
                    segment.color.replace('bg-', 'stroke-')
                  )}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              );
              acc.offset += (segment.value / 100) * circumference;
              return acc;
            },
            { elements: [] as React.ReactNode[], offset: 0 }
          ).elements}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold text-slate-200">4.2M€</span>
          <span className="text-xs text-slate-400">CA Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded', segment.color)} />
              <span className="text-sm text-slate-400">{segment.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300">{segment.amount}</span>
              <span className="text-xs text-slate-400">({segment.value}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// Client Satisfaction Chart
// ================================
export function ClientsSatisfactionChart() {
  const data = [
    { month: 'Juil', score: 88 },
    { month: 'Août', score: 89 },
    { month: 'Sept', score: 91 },
    { month: 'Oct', score: 90 },
    { month: 'Nov', score: 93 },
    { month: 'Déc', score: 94 },
  ];

  const minScore = Math.min(...data.map(d => d.score)) - 5;
  const maxScore = 100;

  // Create SVG path for the line
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.score - minScore) / (maxScore - minScore)) * 100;
    return `${x},${y}`;
  });

  return (
    <div className="space-y-4">
      <div className="relative h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" className="text-slate-800/50" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-slate-800/50" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" className="text-slate-800/50" strokeWidth="0.5" />
          
          {/* Area fill */}
          <polygon
            points={`0,100 ${points.join(' ')} 100,100`}
            className="fill-emerald-500/10"
          />
          
          {/* Line */}
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="url(#satisfactionGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Gradient */}
          <defs>
            <linearGradient id="satisfactionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.score - minScore) / (maxScore - minScore)) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                className="fill-emerald-400"
              />
            );
          })}
        </svg>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-[10px] text-slate-400">
        {data.map((d, i) => (
          <span key={i}>{d.month}</span>
        ))}
      </div>
      
      {/* Current score */}
      <div className="flex items-center justify-center gap-2">
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <span className="text-lg font-bold text-emerald-400">{data[data.length - 1].score}%</span>
        <span className="text-sm text-slate-400">satisfaction</span>
        <TrendingUp className="w-4 h-4 text-emerald-400" />
      </div>
    </div>
  );
}

// ================================
// Sectors Distribution Chart
// ================================
export function ClientsSectorChart() {
  const sectors = [
    { name: 'Technologie', count: 35, color: 'bg-blue-500' },
    { name: 'Industrie', count: 42, color: 'bg-amber-500' },
    { name: 'Services', count: 28, color: 'bg-emerald-500' },
    { name: 'Finance', count: 18, color: 'bg-purple-500' },
    { name: 'Santé', count: 15, color: 'bg-rose-500' },
    { name: 'Commerce', count: 18, color: 'bg-cyan-500' },
  ];

  const maxCount = Math.max(...sectors.map(s => s.count));

  return (
    <div className="space-y-3">
      {sectors.map((sector, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{sector.name}</span>
            <span className="font-medium text-slate-300">{sector.count}</span>
          </div>
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn('absolute inset-y-0 left-0 rounded-full transition-all', sector.color)}
              style={{ width: `${(sector.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ================================
// Regions Map Chart
// ================================
export function ClientsRegionChart() {
  const regions = [
    { name: 'Île-de-France', count: 65, percentage: 42 },
    { name: 'Auvergne-Rhône-Alpes', count: 28, percentage: 18 },
    { name: 'PACA', count: 22, percentage: 14 },
    { name: 'Occitanie', count: 18, percentage: 12 },
    { name: 'Autres', count: 23, percentage: 14 },
  ];

  return (
    <div className="space-y-4">
      {/* Visual representation */}
      <div className="grid grid-cols-5 gap-1 h-24">
        {regions.map((region, idx) => (
          <div
            key={idx}
            className={cn(
              'rounded-lg flex items-end justify-center transition-all hover:opacity-80',
              idx === 0 ? 'bg-cyan-500/30' :
              idx === 1 ? 'bg-blue-500/30' :
              idx === 2 ? 'bg-purple-500/30' :
              idx === 3 ? 'bg-amber-500/30' :
              'bg-slate-500/30'
            )}
            style={{ height: `${region.percentage * 2}%` }}
            title={`${region.name}: ${region.count}`}
          >
            <span className="text-xs font-bold text-slate-300 mb-1">{region.percentage}%</span>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {regions.map((region, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
            <span className="text-slate-400 truncate">{region.name}</span>
            <span className="font-medium text-slate-300 ml-2">{region.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// Client Lifecycle Chart
// ================================
export function ClientsLifecycleChart() {
  const stages = [
    { stage: 'Prospect', count: 12, color: 'bg-blue-500', icon: Users },
    { stage: 'Nouveau', count: 24, color: 'bg-emerald-500', icon: TrendingUp },
    { stage: 'Actif', count: 98, color: 'bg-cyan-500', icon: Star },
    { stage: 'Premium', count: 8, color: 'bg-amber-500', icon: Crown },
    { stage: 'À risque', count: 8, color: 'bg-rose-500', icon: AlertTriangle },
    { stage: 'Inactif', count: 6, color: 'bg-slate-500', icon: TrendingDown },
  ];

  const total = stages.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-4">
      {/* Funnel representation */}
      <div className="flex items-center justify-center gap-1 h-8">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className={cn('h-full rounded transition-all hover:opacity-80', stage.color)}
            style={{ width: `${(stage.count / total) * 100}%`, minWidth: '20px' }}
            title={`${stage.stage}: ${stage.count}`}
          />
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={idx}
              className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn('w-2 h-2 rounded-full', stage.color)} />
                <Icon className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-200">{stage.count}</p>
              <p className="text-[10px] text-slate-400">{stage.stage}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================
// Monthly Revenue Trend
// ================================
export function ClientsMonthlyRevenueChart() {
  const data = [
    { month: 'J', current: 320, previous: 280 },
    { month: 'F', current: 340, previous: 310 },
    { month: 'M', current: 360, previous: 320 },
    { month: 'A', current: 380, previous: 350 },
    { month: 'M', current: 420, previous: 380 },
    { month: 'J', current: 450, previous: 410 },
  ];

  const maxValue = Math.max(...data.flatMap(d => [d.current, d.previous]));

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-28">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex items-end gap-0.5">
            <div
              className="flex-1 bg-slate-600/50 rounded-t-sm transition-all"
              style={{ height: `${(item.previous / maxValue) * 100}%` }}
              title={`${item.previous}K€ (N-1)`}
            />
            <div
              className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all"
              style={{ height: `${(item.current / maxValue) * 100}%` }}
              title={`${item.current}K€ (N)`}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-between text-[10px] text-slate-400">
        {data.map((d, i) => (
          <span key={i}>{d.month}</span>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-slate-400">Année N</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-600" />
          <span className="text-slate-400">Année N-1</span>
        </div>
      </div>

      {/* Growth indicator */}
      <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-400">+9.8%</span>
        <span className="text-xs text-slate-400">vs année précédente</span>
      </div>
    </div>
  );
}

// ================================
// Interactions Heatmap
// ================================
export function ClientsInteractionsHeatmap() {
  // Simulated heatmap data (5 days x 8 hours)
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  const hours = ['9h', '10h', '11h', '14h', '15h', '16h', '17h', '18h'];
  
  const heatmapData = [
    [3, 5, 8, 6, 4, 5, 3, 1],
    [4, 6, 9, 7, 5, 6, 4, 2],
    [5, 7, 10, 8, 6, 7, 5, 2],
    [4, 6, 9, 7, 5, 6, 4, 2],
    [3, 4, 7, 5, 4, 4, 3, 1],
  ];

  const getIntensityClass = (value: number) => {
    if (value >= 9) return 'bg-cyan-400';
    if (value >= 7) return 'bg-cyan-500';
    if (value >= 5) return 'bg-cyan-600';
    if (value >= 3) return 'bg-cyan-700';
    return 'bg-cyan-900';
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <div className="w-8" /> {/* Spacer for labels */}
        {hours.map((hour, idx) => (
          <div key={idx} className="flex-1 text-center text-[9px] text-slate-400">
            {hour}
          </div>
        ))}
      </div>
      
      {days.map((day, dayIdx) => (
        <div key={dayIdx} className="flex gap-1 items-center">
          <div className="w-8 text-[10px] text-slate-400">{day}</div>
          {heatmapData[dayIdx].map((value, hourIdx) => (
            <div
              key={hourIdx}
              className={cn(
                'flex-1 h-6 rounded-sm transition-all hover:scale-110 cursor-pointer',
                getIntensityClass(value)
              )}
              title={`${day} ${hours[hourIdx]}: ${value} interactions`}
            />
          ))}
        </div>
      ))}
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-1 mt-3 text-xs text-slate-400">
        <span>Peu</span>
        <div className="flex gap-0.5">
          {[1, 3, 5, 7, 9].map(v => (
            <div key={v} className={cn('w-4 h-3 rounded-sm', getIntensityClass(v))} />
          ))}
        </div>
        <span>Beaucoup</span>
      </div>
    </div>
  );
}

