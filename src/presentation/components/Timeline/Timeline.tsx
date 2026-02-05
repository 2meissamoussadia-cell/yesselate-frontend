/**
 * Timeline Component
 * Composant de timeline amélioré
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { FadeIn } from '../Animations';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  content?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  showConnector?: boolean;
}

const variantStyles = {
  default: 'bg-slate-600 border-slate-500',
  success: 'bg-green-500 border-green-400',
  warning: 'bg-yellow-500 border-yellow-400',
  error: 'bg-red-500 border-red-400',
  info: 'bg-blue-500 border-blue-400',
};

export function Timeline({
  items,
  orientation = 'vertical',
  className,
  showConnector = true,
}: TimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-start', className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex-1 relative">
            {showConnector && index < items.length - 1 && (
              <div className="absolute top-6 left-1/2 w-full h-0.5 bg-slate-700/50" />
            )}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-12 h-12 rounded-full border-2 flex items-center justify-center z-10',
                  variantStyles[item.variant || 'default']
                )}
              >
                {item.icon || (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="mt-4 text-center">
                <h4 className="text-sm font-semibold text-slate-200">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-1">
                    {item.description}
                  </p>
                )}
                {item.date && (
                  <p className="text-xs text-slate-400 mt-1">{item.date}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {showConnector && (
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700/50" />
      )}
      <div className="space-y-8">
        {items.map((item, index) => (
          <FadeIn key={item.id} delay={index * 0.1}>
            <div className="relative flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 relative z-10">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full border-2 flex items-center justify-center',
                    variantStyles[item.variant || 'default']
                  )}
                >
                  {item.icon || (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-slate-200">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-slate-400 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.content && (
                      <div className="mt-3">{item.content}</div>
                    )}
                  </div>
                  {item.date && (
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {item.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

