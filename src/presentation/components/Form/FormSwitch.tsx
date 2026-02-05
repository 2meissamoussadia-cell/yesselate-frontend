/**
 * FormSwitch Component
 * Switch/Toggle de formulaire amélioré
 */

'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface FormSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
  ({ label, description, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              ref={ref}
              className="sr-only"
              role="switch"
              {...props}
            />
            <div
              className={cn(
                'w-11 h-6 rounded-full transition-all relative',
                props.checked
                  ? 'bg-blue-500'
                  : 'bg-slate-700 group-hover:bg-slate-600',
                error && 'bg-red-500/50',
                props.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                  props.checked ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </div>
          </div>
          <div className="flex-1">
            {label && (
              <span className={cn(
                'text-sm font-medium',
                props.checked ? 'text-slate-200' : 'text-slate-300',
                props.disabled && 'opacity-50'
              )}>
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
        </label>
        {error && (
          <p className="text-sm text-red-400 ml-8">{error}</p>
        )}
      </div>
    );
  }
);

FormSwitch.displayName = 'FormSwitch';

