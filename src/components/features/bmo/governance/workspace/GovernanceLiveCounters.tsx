/**
 * Compteurs en temps réel pour le Workspace Gouvernance
 * Affiche les statistiques clés avec tendances et animations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useGovernanceWorkspaceStore } from '@/lib/stores/governanceWorkspaceStore';
import { 
  Users, 
  AlertTriangle, 
  Shield, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CounterData {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down' | 'same';
  action: () => void;
  critical?: boolean;
}

interface GovernanceLiveCountersProps {
  mode?: 'compact' | 'extended';
}

export function GovernanceLiveCounters({ mode = 'compact' }: GovernanceLiveCountersProps) {
  const { openTab, setRACIQueue, setAlertQueue } = useGovernanceWorkspaceStore();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Mock data - à remplacer par vraies données API
  const [counters, setCounters] = useState<CounterData[]>([
    {
      label: 'Activités RACI',
      value: 42,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      trend: 'same',
      action: () => {
        setRACIQueue('all');
        openTab('raci-inbox', 'Matrice RACI');
      },
    },
    {
      label: 'Conflits',
      value: 3,
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      trend: 'up',
      critical: true,
      action: () => {
        setRACIQueue('conflicts');
        openTab('raci-inbox', 'Conflits RACI');
      },
    },
    {
      label: 'Alertes Actives',
      value: 8,
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
      trend: 'up',
      critical: true,
      action: () => {
        setAlertQueue('all');
        openTab('alerts-inbox', 'Alertes');
      },
    },
    {
      label: 'Critiques',
      value: 2,
      icon: XCircle,
      color: 'from-purple-500 to-fuchsia-500',
      trend: 'down',
      critical: true,
      action: () => {
        setAlertQueue('critical');
        openTab('alerts-inbox', 'Alertes Critiques');
      },
    },
    {
      label: 'Résolues',
      value: 15,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-green-500',
      trend: 'up',
      action: () => {
        // Ouvrir vue des alertes résolues
        setAlertQueue('all');
        openTab('alerts-inbox', 'Alertes Résolues');
      },
    },
  ]);
  
  // Auto-refresh toutes les 30s
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock: Update avec légères variations
    setCounters(prev => prev.map(counter => ({
      ...counter,
      value: counter.value + Math.floor(Math.random() * 3 - 1), // -1, 0, or +1
      trend: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same',
    })));
    
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };
  
  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'same' }) => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-400" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-emerald-400" />;
      case 'same':
        return <Minus className="h-3 w-3 text-slate-400" />;
    }
  };
  
  if (mode === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {counters.map((counter, index) => {
          const Icon = counter.icon;
          return (
            <button
              key={index}
              onClick={counter.action}
              className={cn(
                'group relative flex items-center gap-2 px-3 py-1.5 rounded-lg',
                'border border-white/10 bg-gradient-to-br backdrop-blur-xl',
                'hover:scale-105 transition-all',
                counter.color,
                counter.critical && counter.value > 0 && 'animate-pulse'
              )}
              title={counter.label}
            >
              <Icon className="h-4 w-4 text-white" />
              <span className="text-white font-bold">{counter.value}</span>
              <TrendIcon trend={counter.trend} />
            </button>
          );
        })}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
          title={`Dernière mise à jour: ${lastUpdate.toLocaleTimeString()}`}
        >
          <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
        </Button>
      </div>
    );
  }
  
  // Extended mode
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Vue d'ensemble</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            MAJ: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Actualiser
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {counters.map((counter, index) => {
          const Icon = counter.icon;
          return (
            <button
              key={index}
              onClick={counter.action}
              className={cn(
                'group relative p-4 rounded-lg',
                'border border-white/10 bg-gradient-to-br backdrop-blur-xl',
                'hover:scale-105 transition-all text-left',
                counter.color,
                counter.critical && counter.value > 0 && 'ring-2 ring-red-500/50 animate-pulse'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className="h-5 w-5 text-white" />
                <TrendIcon trend={counter.trend} />
              </div>
              
              <div className="text-3xl font-bold text-white mb-1">
                {counter.value}
              </div>
              
              <div className="text-sm text-white/80">
                {counter.label}
              </div>
              
              {counter.critical && counter.value > 0 && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

