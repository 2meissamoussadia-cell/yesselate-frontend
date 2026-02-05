/**
 * FormField Component
 * Champ de formulaire amélioré avec label, erreur et aide
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AlertCircle, Info } from 'lucide-react';
import { EnhancedTooltip } from '../Tooltip';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  tooltip?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}

export function FormField({
  label,
  required = false,
  error,
  hint,
  tooltip,
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <label
          className={cn(
            'text-sm font-medium text-slate-200',
            required && "after:content-['*'] after:ml-1 after:text-red-400",
            labelClassName
          )}
        >
          {label}
        </label>
        {tooltip && (
          <EnhancedTooltip content={tooltip} side="top">
            <Info className="w-4 h-4 text-slate-400 cursor-help" />
          </EnhancedTooltip>
        )}
      </div>
      
      {children}
      
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

