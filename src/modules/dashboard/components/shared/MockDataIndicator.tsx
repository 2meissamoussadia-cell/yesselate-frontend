/**
 * MockDataIndicator - Composant pour identifier clairement les données mockées
 * 
 * Affiche un badge discret mais visible pour indiquer que les données sont mockées
 * (Phase 1 - en attente du backend)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface MockDataIndicatorProps {
  /**
   * Position du badge
   * @default 'top-right'
   */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

  /**
   * Taille du badge
   * @default 'sm'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Message personnalisé
   */
  message?: string;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

const positionClasses = {
  'top-right': 'top-2 right-2',
  'top-left': 'top-2 left-2',
  'bottom-right': 'bottom-2 right-2',
  'bottom-left': 'bottom-2 left-2',
};

const sizeClasses = {
  sm: 'h-5 w-5 text-[10px]',
  md: 'h-6 w-6 text-xs',
  lg: 'h-7 w-7 text-sm',
};

export function MockDataIndicator({
  position = 'top-right',
  size = 'sm',
  message = 'Données mockées (Phase 1) - Backend en attente',
  className,
}: MockDataIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute z-50 flex items-center justify-center',
              'rounded-full border border-amber-500/40 bg-amber-500/10',
              'backdrop-blur-sm shadow-sm',
              'cursor-help transition-all hover:bg-amber-500/20 hover:border-amber-500/60',
              positionClasses[position],
              sizeClasses[size],
              className
            )}
            aria-label="Données mockées"
          >
            <Info className="h-3 w-3 text-amber-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="text-xs">
            <div className="font-semibold text-amber-300 mb-1">⚠️ Données mockées</div>
            <div className="text-slate-300">{message}</div>
            <div className="text-slate-400 text-[10px] mt-2">
              Phase 2 : Remplacement par API backend
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Hook pour wrapper un composant avec l'indicateur mock
 */
export function withMockDataIndicator<P extends object>(
  Component: React.ComponentType<P>,
  indicatorProps?: Omit<MockDataIndicatorProps, 'className'>
) {
  return function MockDataWrappedComponent(props: P) {
    return (
      <div className="relative">
        <MockDataIndicator {...indicatorProps} />
        <Component {...props} />
      </div>
    );
  };
}
