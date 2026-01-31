/**
 * Panneau d'alertes nécessitant attention
 * Affiche 3 cartes avec compteurs et boutons d'action
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Flag, Users, ArrowRight } from 'lucide-react';
import { useCalendrierFiltersStore } from '../stores/calendrierFiltersStore';

interface AlertCardProps {
  title: string;
  count: number;
  description?: string;
  ctaLabel: string;
  ctaLink: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'warning' | 'critical';
}

function AlertCard({
  title,
  count,
  description,
  ctaLabel,
  ctaLink,
  icon: Icon,
  variant = 'default',
}: AlertCardProps) {
  const router = useRouter();

  const variantStyles = {
    default: 'bg-slate-800/50 border-slate-700/50',
    warning: 'bg-amber-500/10 border-amber-500/30',
    critical: 'bg-red-500/10 border-red-500/30',
  };

  const textStyles = {
    default: 'text-slate-300',
    warning: 'text-amber-300',
    critical: 'text-red-300',
  };

  const iconStyles = {
    default: 'text-slate-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border transition-all hover:border-opacity-60',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-3 flex-1">
        <div
          className={cn(
            'p-2 rounded-lg bg-slate-700/50',
            iconStyles[variant]
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('font-semibold text-sm', textStyles[variant])}>
              {title}
            </h3>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold',
                variant === 'critical'
                  ? 'bg-red-500/20 text-red-400'
                  : variant === 'warning'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-500/20 text-slate-400'
              )}
            >
              {count}
            </span>
          </div>
          {description && (
            <p className="text-xs text-slate-400 mb-2">{description}</p>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push(ctaLink)}
            aria-label={ctaLabel}
            className={cn(
              'min-h-[44px] px-3 text-xs font-medium focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500',
              variant === 'critical'
                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                : variant === 'warning'
                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
            )}
          >
            {ctaLabel}
            <ArrowRight className="h-3 w-3 ml-1" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AlertsSummaryPanel() {
  const { stats } = useCalendrierFiltersStore();

  const alerts = [
    {
      title: 'Jalons SLA à risque',
      count: stats?.jalons_at_risk_count || 0,
      description: 'Jalons nécessitant une attention immédiate',
      ctaLabel: 'Voir dans Contrats',
      ctaLink: '/maitre-ouvrage/calendrier/jalons/sla-risque',
      icon: Flag,
      variant: 'warning' as const,
    },
    {
      title: 'Retards détectés',
      count: stats?.retards_detectes_count || 0,
      description: 'Éléments en retard nécessitant un suivi',
      ctaLabel: 'Voir dans Gestion Chantiers',
      ctaLink: '/maitre-ouvrage/projets-en-cours',
      icon: AlertTriangle,
      variant: 'critical' as const,
    },
    {
      title: 'Sur-allocation ressources',
      count: stats?.sur_allocation_ressources_count || 0,
      description: 'Ressources sur-allouées sur la période',
      ctaLabel: 'Voir dans Ressources',
      ctaLink: '/maitre-ouvrage/employes',
      icon: Users,
      variant: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">
          Alertes nécessitant attention
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {alerts.map((alert, index) => (
          <AlertCard key={index} {...alert} />
        ))}
      </div>
    </div>
  );
}

