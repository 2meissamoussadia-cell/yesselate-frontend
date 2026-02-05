/**
 * AnalyticsWorkspaceTabs.tsx
 * ===========================
 * 
 * Barre d'onglets pour le workspace Analytics
 * Gère l'affichage et la navigation entre plusieurs onglets
 */

'use client';

import { useAnalyticsWorkspaceStore } from '@/lib/stores/analyticsWorkspaceStore';
import { cn } from '@/lib/cn';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';

export function AnalyticsWorkspaceTabs() {
  const { 
    tabs, 
    activeTabId, 
    isFullScreen,
    setActiveTab, 
    closeTab,
    toggleFullScreen,
  } = useAnalyticsWorkspaceStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
      {/* Onglets */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium',
                'border border-transparent min-w-0 max-w-[240px]',
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              )}
            >
              {/* Icon */}
              <span className="text-base flex-shrink-0">{tab.icon}</span>
              
              {/* Title */}
              <span className="truncate flex-1 text-left">
                {tab.title}
              </span>
              
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className={cn(
                  'flex-shrink-0 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors',
                  'opacity-0 group-hover:opacity-100',
                  isActive && 'opacity-100'
                )}
                aria-label="Fermer l'onglet"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </button>
          );
        })}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <FluentButton
          size="xs"
          variant="secondary"
          onClick={toggleFullScreen}
          title={isFullScreen ? 'Quitter plein écran' : 'Plein écran'}
        >
          {isFullScreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </FluentButton>
      </div>
    </div>
  );
}

