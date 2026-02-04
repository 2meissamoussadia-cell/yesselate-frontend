'use client';

import { useEffect, useCallback } from 'react';
import { X, MoreHorizontal, ChevronLeft, ChevronRight, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';

const TAB_TYPE_COLORS: Record<string, string> = {
  inbox: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  dossier: 'bg-red-500/10 text-red-600 dark:text-red-400',
  matrix: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  timeline: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  bureau: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  resolution: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  escalation: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  substitution: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  audit: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  analytics: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
};

export function BlockedWorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, closeOthers, closeAll } = useBlockedWorkspaceStore();

  // Raccourcis clavier pour navigation entre onglets
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isModifier = e.metaKey || e.ctrlKey;
    
    // Ctrl+Tab ou Ctrl+PageDown - Onglet suivant
    if ((isModifier && e.key === 'Tab' && !e.shiftKey) || (isModifier && e.key === 'PageDown')) {
      e.preventDefault();
      if (tabs.length < 2) return;
      const currentIdx = tabs.findIndex(t => t.id === activeTabId);
      const nextIdx = (currentIdx + 1) % tabs.length;
      setActiveTab(tabs[nextIdx].id);
      return;
    }

    // Ctrl+Shift+Tab ou Ctrl+PageUp - Onglet précédent
    if ((isModifier && e.key === 'Tab' && e.shiftKey) || (isModifier && e.key === 'PageUp')) {
      e.preventDefault();
      if (tabs.length < 2) return;
      const currentIdx = tabs.findIndex(t => t.id === activeTabId);
      const prevIdx = currentIdx === 0 ? tabs.length - 1 : currentIdx - 1;
      setActiveTab(tabs[prevIdx].id);
      return;
    }

    // Ctrl+W - Fermer l'onglet actif
    if (isModifier && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      if (activeTabId) closeTab(activeTabId);
      return;
    }
  }, [tabs, activeTabId, setActiveTab, closeTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Navigation avec boutons
  const navigateTabs = (direction: 'prev' | 'next') => {
    if (tabs.length < 2) return;
    const currentIdx = tabs.findIndex(t => t.id === activeTabId);
    const newIdx = direction === 'next' 
      ? (currentIdx + 1) % tabs.length
      : currentIdx === 0 ? tabs.length - 1 : currentIdx - 1;
    setActiveTab(tabs[newIdx].id);
  };

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Navigation gauche */}
      {tabs.length > 1 && (
        <button
          className="p-2 rounded-lg border border-slate-200/70 bg-white/80 
                     hover:bg-slate-100 dark:border-slate-800 dark:bg-[#1f1f1f]/70 dark:hover:bg-slate-800/60
                     disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => navigateTabs('prev')}
          disabled={tabs.length < 2}
          title="Onglet précédent (Ctrl+Shift+Tab)"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Onglets */}
      <div
        className={cn(
          "flex-1 min-w-0",
          "rounded-xl border border-slate-200/70 bg-white/80 backdrop-blur",
          "dark:border-slate-800 dark:bg-[#1f1f1f]/70"
        )}
      >
        <div className="flex flex-nowrap items-center gap-1 overflow-x-auto whitespace-nowrap p-1 scrollbar-subtle">
          {tabs.map((t, idx) => {
            const active = t.id === activeTabId;
            const isCritical = t.data?.impact === 'critical';
            const typeColor = TAB_TYPE_COLORS[t.type] || '';
            
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    closeTab(t.id);
                  }
                }}
                className={cn(
                  "group inline-flex items-center gap-2",
                  "min-w-[180px] max-w-[320px]",
                  "px-3 py-2 rounded-lg text-sm",
                  "transition-all duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-orange-500/50",
                  active
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : cn(
                        "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        "dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                      ),
                  isCritical && !active && "border border-red-500/50 animate-pulse"
                )}
                title={`${t.title} (${idx + 1}/${tabs.length})`}
              >
                {/* Indicateur critique */}
                {isCritical && (
                  <AlertTriangle className={cn(
                    "w-4 h-4 flex-none",
                    active ? "text-red-300" : "text-red-500"
                  )} />
                )}
                
                {/* Icon */}
                <span className="flex-none text-base">{t.icon ?? '🚧'}</span>
                
                {/* Titre */}
                <span className="truncate flex-1 text-left font-medium">{t.title}</span>

                {/* Badge type */}
                {!active && t.type !== 'inbox' && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                    typeColor
                  )}>
                    {t.type}
                  </span>
                )}

                {/* Indicateur de position */}
                {active && tabs.length > 1 && (
                  <span className="flex-none text-xs opacity-60 font-mono">
                    {idx + 1}/{tabs.length}
                  </span>
                )}

                {/* Bouton fermer */}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Fermer ${t.title}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeTab(t.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      closeTab(t.id);
                    }
                  }}
                  className={cn(
                    "flex-none rounded-md p-1 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-orange-500/50",
                    active 
                      ? "hover:bg-white/20 dark:hover:bg-black/20" 
                      : "hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100"
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation droite */}
      {tabs.length > 1 && (
        <button
          className="p-2 rounded-lg border border-slate-200/70 bg-white/80 
                     hover:bg-slate-100 dark:border-slate-800 dark:bg-[#1f1f1f]/70 dark:hover:bg-slate-800/60
                     disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => navigateTabs('next')}
          disabled={tabs.length < 2}
          title="Onglet suivant (Ctrl+Tab)"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Menu rapide */}
      <div className="relative flex gap-1">
        <button
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm
                     hover:bg-slate-100 dark:border-slate-800 dark:bg-[#1f1f1f]/70 dark:hover:bg-slate-800/60
                     disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (!activeTabId) return;
            closeOthers(activeTabId);
          }}
          disabled={tabs.length < 2}
          title="Fermer les autres onglets"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden md:inline">Autres</span>
        </button>

        <button
          className="inline-flex items-center rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm
                     hover:bg-slate-100 dark:border-slate-800 dark:bg-[#1f1f1f]/70 dark:hover:bg-slate-800/60
                     text-rose-600 dark:text-rose-400"
          onClick={() => closeAll()}
          title="Fermer tous les onglets (Ctrl+Shift+W)"
        >
          <X className="h-4 w-4" />
          <span className="hidden md:inline ml-1">Tout</span>
        </button>
      </div>
    </div>
  );
}

