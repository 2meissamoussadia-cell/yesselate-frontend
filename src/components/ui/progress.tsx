// ============================================
// Composant Progress pour les barres de progression
// ============================================

import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  indicatorClassName?: string;
}

export function Progress({ value, className, variant = 'default', indicatorClassName }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div
      className={cn('w-full h-2 bg-slate-700 rounded-full overflow-hidden', className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progression: ${clampedValue}%`}
    >
      <div
        className={cn('h-full transition-all duration-300', indicatorClassName ?? variantClasses[variant])}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
