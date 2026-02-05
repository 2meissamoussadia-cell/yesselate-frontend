/**
 * FormInput Component
 * Input de formulaire amélioré avec styles cohérents
 */

'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Search, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ error, leftIcon, rightIcon, showPasswordToggle, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-slate-800 text-slate-200',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            error
              ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50'
              : 'border-slate-700/50',
            leftIcon && 'pl-10',
            (rightIcon || (isPassword && showPasswordToggle)) && 'pr-10'
          )}
          {...props}
        />
        
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

/**
 * SearchInput - Input de recherche spécialisé
 */
export const SearchInput = forwardRef<HTMLInputElement, Omit<FormInputProps, 'leftIcon'>>(
  ({ className, ...props }, ref) => {
    return (
      <FormInput
        ref={ref}
        leftIcon={<Search className="w-4 h-4" />}
        placeholder="Rechercher..."
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

