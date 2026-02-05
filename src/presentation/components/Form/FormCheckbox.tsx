/**
 * FormCheckbox Component
 * Checkbox de formulaire amélioré
 */

'use client';

import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, description, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              ref={ref}
              className="sr-only"
              {...props}
            />
            <div
              className={cn(
                'w-5 h-5 rounded border-2 transition-all',
                props.checked
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-slate-800 border-slate-600 group-hover:border-slate-500',
                error && 'border-red-500',
                props.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {props.checked && (
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
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

FormCheckbox.displayName = 'FormCheckbox';

