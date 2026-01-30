'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  actions?: NotificationAction[];
  read?: boolean;
  className?: string;
}

export function NotificationItem({
  title,
  message,
  time,
  type,
  actions = [],
  read = false,
  className,
}: NotificationItemProps) {
  const typeLabel = type === 'danger' ? 'Critique' : type === 'warning' ? 'Attention' : type === 'success' ? 'Info' : 'Info';
  const typeClasses =
    type === 'danger'
      ? 'bg-rose-900/60 text-rose-200'
      : type === 'warning'
        ? 'bg-amber-900/60 text-amber-200'
        : type === 'success'
          ? 'bg-emerald-900/60 text-emerald-200'
          : 'bg-slate-700/60 text-slate-200';

  return (
    <li
      className={cn(
        'p-3 border border-slate-800/60 rounded-lg transition-colors',
        read ? 'bg-slate-900/30 opacity-80' : 'bg-slate-900/60',
        className
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn('text-xs px-2 py-0.5 rounded font-medium', typeClasses)}>
          {typeLabel}
        </span>
        <span className="text-xs text-slate-400 tabular-nums">{time}</span>
      </div>
      <h4 className="mt-1 text-sm font-medium text-slate-100">{title}</h4>
      <p className="mt-1 text-xs text-slate-400 line-clamp-2">{message}</p>
      {actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="px-2 py-1 text-xs rounded border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 transition-colors"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
