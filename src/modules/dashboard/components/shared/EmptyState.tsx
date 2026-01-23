/**
 * Composant EmptyState pour afficher des états vides
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, Search, FilterX } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'search' | 'filter';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const defaultIcons = {
    default: Inbox,
    search: Search,
    filter: FilterX,
  };

  const DisplayIcon = Icon || defaultIcons[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center min-w-0 overflow-hidden',
        className
      )}
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0">
        <DisplayIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 break-words px-2">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-3 sm:mb-4 break-words px-2">{description}</p>
      )}
      {action && <div className="mt-2 min-w-0">{action}</div>}
    </div>
  );
}

