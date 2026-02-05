'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, maxWidth: 16, maxHeight: 16 }}
        className={cn(
          'peer shrink-0 flex items-center justify-center rounded-sm border border-slate-600 ring-offset-slate-950',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          checked
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-transparent hover:border-slate-500',
          className
        )}
      >
        {checked && (
          <Check className="h-[9px] w-[9px] text-white shrink-0" strokeWidth={2.5} />
        )}
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={() => {}}
          className="sr-only"
          {...props}
        />
      </button>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };

