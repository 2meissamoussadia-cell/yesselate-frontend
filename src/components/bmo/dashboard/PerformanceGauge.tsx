'use client';

import { cn } from '@/lib/utils';

export interface PerformanceGaugeProps {
  value: number;
  label: string;
  thresholds?: {
    warning: number;
    critical: number;
  };
}

export function PerformanceGauge({
  value,
  label,
  thresholds = { warning: 70, critical: 50 },
}: PerformanceGaugeProps) {
  const getColor = () => {
    if (value >= thresholds.warning) return 'text-green-600 dark:text-green-400';
    if (value >= thresholds.critical) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStrokeColor = () => {
    if (value >= thresholds.warning) return '#10B981';
    if (value >= thresholds.critical) return '#F59E0B';
    return '#EF4444';
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-40 h-40">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />

          <circle
            cx="80"
            cy="80"
            r="70"
            stroke={getStrokeColor()}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-4xl font-bold', getColor())}>{value}%</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">{label}</p>
    </div>
  );
}
