'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface DocumentItemProps {
  name: string;
  version: string;
  date: string;
  status: 'Validé' | 'En attente' | 'Brouillon' | 'Rejeté';
  className?: string;
}

export function DocumentItem({
  name,
  version,
  date,
  status,
  className,
}: DocumentItemProps) {
  const statusClasses =
    status === 'Validé'
      ? 'bg-emerald-900/60 text-emerald-200'
      : status === 'En attente'
        ? 'bg-amber-900/60 text-amber-200'
        : status === 'Rejeté'
          ? 'bg-rose-900/60 text-rose-200'
          : 'bg-slate-700/60 text-slate-300';

  return (
    <div
      className={cn(
        'flex justify-between items-center p-2 border-b border-slate-800/60 last:border-b-0',
        className
      )}
    >
      <span className="text-sm text-slate-100 truncate min-w-0 mr-2">{name}</span>
      <div className="flex gap-2 items-center shrink-0">
        <span className="text-xs text-slate-400">v{version}</span>
        <span className="text-xs text-slate-400">{date}</span>
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded font-medium',
            statusClasses
          )}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
