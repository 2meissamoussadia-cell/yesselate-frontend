/**
 * ChartWrapper Component
 * Wrapper amélioré pour les charts Recharts avec styles cohérents
 */

'use client';

import { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/cn';
import { LoadingSpinner } from '../Loading';

interface ChartWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: string | Error | null;
  height?: number | string;
  className?: string;
  emptyMessage?: string;
  hasData?: boolean;
}

export function ChartWrapper({
  children,
  title,
  description,
  isLoading = false,
  error,
  height = 300,
  className,
  emptyMessage = 'Aucune donnée disponible',
  hasData = true,
}: ChartWrapperProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)} style={{ height }}>
        <LoadingSpinner size="lg" text="Chargement des données..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)} style={{ height }}>
        <p className="text-red-400 mb-2">Erreur de chargement</p>
        <p className="text-sm text-slate-400">
          {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-slate-400', className)} style={{ height }}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>}
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

