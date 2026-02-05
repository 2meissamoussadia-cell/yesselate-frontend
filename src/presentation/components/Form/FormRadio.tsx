/**
 * FormRadio Component
 * Radio button de formulaire amélioré
 */

'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface FormRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
  ({ label, description, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="radio"
              ref={ref}
              className="sr-only"
              {...props}
            />
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center',
                props.checked
                  ? 'border-blue-500'
                  : 'border-slate-600 group-hover:border-slate-500',
                error && 'border-red-500',
                props.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {props.checked && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              )}
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

FormRadio.displayName = 'FormRadio';

