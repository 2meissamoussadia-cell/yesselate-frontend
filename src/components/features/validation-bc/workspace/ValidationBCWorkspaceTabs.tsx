'use client';

import React, { useEffect, useCallback } from 'react';
import { useValidationBCWorkspaceStore } from '@/lib/stores/validationBCWorkspaceStore';
import { X, FileText, FileCheck, Receipt, FileEdit, GitCompare, Search, ChevronLeft, ChevronRight, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationBCWorkspaceTabsProps {
  onBackToDashboard?: () => void;
}

export function ValidationBCWorkspaceTabs({ onBackToDashboard }: ValidationBCWorkspaceTabsProps) {
  const { tabs, activeTabId, setActiveTab, closeTab, goToNextTab, goToPreviousTab, closeAllTabs } = useValidationBCWorkspaceStore();

  // Memoize tab icon function
  const getTabIcon = useCallback((type: string, icon: string) => {
    switch (type) {
      case 'inbox':
        return <FileText className="w-4 h-4" />;
      case 'bc':
        return <FileCheck className="w-4 h-4" />;
      case 'facture':
        return <Receipt className="w-4 h-4" />;
      case 'avenant':
        return <FileEdit className="w-4 h-4" />;
      case 'comparison':
        return <GitCompare className="w-4 h-4" />;
      case 'audit':
        return <Search className="w-4 h-4" />;
      default:
        return <span>{icon}</span>;
    }
  }, []);

  // Keyboard shortcuts with proper dependencies
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isModifier = e.metaKey || e.ctrlKey;
    
    // Ctrl+Tab - Onglet suivant
    if (isModifier && e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      goToNextTab();
      return;
    }
    
    // Ctrl+Shift+Tab - Onglet précédent
    if (isModifier && e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      goToPreviousTab();
      return;
    }
    
    // Ctrl+W - Fermer l'onglet actif
    if (isModifier && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      if (activeTabId) closeTab(activeTabId);
      return;
    }
    
    // Échap - Retour au dashboard si callback fourni
    if (e.key === 'Escape' && onBackToDashboard && tabs.length > 0) {
      e.preventDefault();
      onBackToDashboard();
      return;
    }
  }, [activeTabId, closeTab, goToNextTab, goToPreviousTab, onBackToDashboard, tabs.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (tabs.length === 0) return null;

  const showNavigationButtons = tabs.length > 1;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
      {/* Bouton Retour au Dashboard */}
      {onBackToDashboard && (
        <button
          onClick={onBackToDashboard}
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200',
            'bg-slate-50 dark:bg-[#141414] border-slate-200/60 dark:border-slate-800/60',
            'hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-slate-300 dark:hover:border-slate-700',
            'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
          )}
          title="Retour au dashboard (Esc)"
          aria-label="Retour au dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <LayoutDashboard className="w-4 h-4" />
        </button>
      )}

      {/* Boutons Navigation */}
      {showNavigationButtons && (
        <>
          <button
            onClick={goToPreviousTab}
            disabled={tabs.length <= 1}
            className={cn(
              'flex-none w-8 h-8 rounded-lg border flex items-center justify-center transition-all',
              'bg-slate-50 dark:bg-[#141414] border-slate-200/60 dark:border-slate-800/60',
              'hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-slate-300 dark:hover:border-slate-700',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              'text-slate-600 dark:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
            )}
            title="Onglet précédent (Ctrl+Shift+Tab)"
            aria-label="Onglet précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToNextTab}
            disabled={tabs.length <= 1}
            className={cn(
              'flex-none w-8 h-8 rounded-lg border flex items-center justify-center transition-all',
              'bg-slate-50 dark:bg-[#141414] border-slate-200/60 dark:border-slate-800/60',
              'hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-slate-300 dark:hover:border-slate-700',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              'text-slate-600 dark:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
            )}
            title="Onglet suivant (Ctrl+Tab)"
            aria-label="Onglet suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
        </>
      )}

      {/* Onglets */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 min-w-[140px] max-w-[240px]',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
              isActive
                ? 'bg-white dark:bg-[#1f1f1f] border-slate-300 dark:border-slate-700 shadow-sm'
                : 'bg-slate-50 dark:bg-[#141414] border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-slate-300 dark:hover:border-slate-700'
            )}
            role="tab"
            aria-selected={isActive}
            aria-label={`Onglet ${tab.title}`}
          >
            <div className={cn('flex-none', isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500')}>
              {getTabIcon(tab.type, tab.icon)}
            </div>

            <span className={cn('flex-1 truncate text-sm font-medium', isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>
              {tab.title}
            </span>

            {tab.closable !== false && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className={cn(
                  'flex-none w-5 h-5 rounded-lg flex items-center justify-center transition-colors',
                  'opacity-0 group-hover:opacity-100 focus:opacity-100',
                  'hover:bg-slate-200 dark:hover:bg-slate-700',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                )}
                title="Fermer (Ctrl+W)"
                aria-label={`Fermer l'onglet ${tab.title}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </button>
        );
      })}

      {/* Fermer tous les onglets */}
      {showNavigationButtons && (
        <>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
          <button
            onClick={closeAllTabs}
            className={cn(
              'flex-none px-3 py-2.5 rounded-xl border transition-all duration-200 text-xs font-medium',
              'bg-slate-50 dark:bg-[#141414] border-slate-200/60 dark:border-slate-800/60',
              'hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-slate-300 dark:hover:border-slate-700',
              'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
            )}
            title="Fermer tous les onglets"
            aria-label="Fermer tous les onglets"
          >
            Tout fermer
          </button>
        </>
      )}
    </div>
  );
}

