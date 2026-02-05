/**
 * EnhancedTabs Component
 * Système d'onglets amélioré avec animations
 */

'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { FadeIn } from '../Animations';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content: ReactNode;
}

interface EnhancedTabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  orientation?: 'horizontal' | 'vertical';
}

export function EnhancedTabs({
  items,
  defaultTab,
  onChange,
  className,
  variant = 'default',
  orientation = 'horizontal',
}: EnhancedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabChange = (tabId: string) => {
    const tab = items.find(item => item.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTab(tabId);
      onChange?.(tabId);
    }
  };

  const activeTabContent = items.find(item => item.id === activeTab)?.content;

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex gap-4', className)}>
        <div className="flex flex-col gap-1 min-w-[200px]">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              disabled={item.disabled}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-left transition-all',
                activeTab === item.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon && item.icon}
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <FadeIn key={activeTab}>
            {activeTabContent}
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Headers */}
      <div
        className={cn(
          'flex gap-1',
          variant === 'pills' && 'bg-slate-800/50 p-1 rounded-lg',
          variant === 'underline' && 'border-b border-slate-700/50'
        )}
      >
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            disabled={item.disabled}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 font-medium transition-all relative',
              variant === 'default' && cn(
                'border-b-2',
                activeTab === item.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              ),
              variant === 'pills' && cn(
                'rounded-md',
                activeTab === item.id
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
              ),
              variant === 'underline' && cn(
                'border-b-2 -mb-[1px]',
                activeTab === item.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              ),
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {item.icon && item.icon}
            {item.label}
            {item.badge && (
              <span className={cn(
                'ml-1.5 px-2 py-0.5 rounded-full text-xs',
                activeTab === item.id
                  ? 'bg-blue-500/30 text-blue-300'
                  : 'bg-slate-700/50 text-slate-400'
              )}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        <FadeIn key={activeTab}>
          {activeTabContent}
        </FadeIn>
      </div>
    </div>
  );
}

