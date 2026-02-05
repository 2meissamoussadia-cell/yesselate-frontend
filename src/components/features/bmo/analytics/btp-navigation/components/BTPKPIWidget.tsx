/**
 * Widget KPI BTP
 * Widget réutilisable pour afficher des KPIs avec indicateurs visuels
 */

'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ProgressRing } from '@/presentation/components/Progress';

interface BTPKPIWidgetProps {
  label: string;
  value: number;
  target?: number;
  unit?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  description?: string;
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
};

export function BTPKPIWidget({
  label,
  value,
  target,
  unit = '',
  status = 'info',
  description,
  className,
}: BTPKPIWidgetProps) {
  // Ensure status is valid, fallback to 'info' if not
  const validStatus: 'success' | 'warning' | 'error' | 'info' = 
    status && status in statusConfig ? status : 'info';
  const config = statusConfig[validStatus];
  const StatusIcon = config.icon;
  const percentage = target ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div
      className={cn(
        'bg-slate-800/50 rounded-lg p-4 border',
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon className={cn('h-4 w-4', config.color)} />
            <span className="text-sm font-medium text-slate-300">{label}</span>
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-2xl font-bold text-slate-200 mb-1">
            {value.toLocaleString()}
            {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
          </div>
          {target && (
            <div className="text-xs text-slate-400">
              Objectif : {target.toLocaleString()} {unit}
            </div>
          )}
        </div>

        {target && (
          <ProgressRing
            value={percentage}
            size={60}
            strokeWidth={6}
            color={status === 'success' ? '#10b981' : status === 'warning' ? '#f59e0b' : status === 'error' ? '#ef4444' : '#3b82f6'}
            showLabel={true}
            label={`${Math.round(percentage)}%`}
          />
        )}
      </div>
    </div>
  );
}

