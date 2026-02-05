/**
 * Alert Component
 * Composant d'alerte amélioré
 */

'use client';

import { ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { FadeIn } from '../Animations';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
  icon?: ReactNode;
  className?: string;
  action?: ReactNode;
}

const variantStyles = {
  success: {
    container: 'bg-green-500/10 border-green-500/30 text-green-400',
    icon: 'text-green-400',
    title: 'text-green-300',
  },
  error: {
    container: 'bg-red-500/10 border-red-500/30 text-red-400',
    icon: 'text-red-400',
    title: 'text-red-300',
  },
  warning: {
    container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    icon: 'text-yellow-400',
    title: 'text-yellow-300',
  },
  info: {
    container: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    icon: 'text-blue-400',
    title: 'text-blue-300',
  },
};

const defaultIcons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  dismissible = false,
  icon,
  className,
  action,
}: AlertProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <FadeIn>
      <div
        className={cn(
          'rounded-lg border p-4',
          styles.container,
          className
        )}
      >
        <div className="flex items-start gap-3">
          {displayIcon && (
            <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
              {displayIcon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={cn('font-semibold mb-1', styles.title)}>
                {title}
              </h4>
            )}
            <div className="text-sm">{children}</div>
            {action && (
              <div className="mt-3">{action}</div>
            )}
          </div>
          {(dismissible || onClose) && (
            <button
              onClick={onClose}
              className={cn(
                'flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors',
                styles.icon
              )}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

