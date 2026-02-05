/**
 * Barre d'onglets pour le Workspace Gouvernance
 * Gère l'affichage et la navigation entre plusieurs onglets ouverts
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, MoreHorizontal, Pin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useGovernanceWorkspaceStore } from '@/lib/stores/governanceWorkspaceStore';
import { Button } from '@/components/ui/button';

// Icônes par type d'onglet
const TAB_ICONS: Record<string, string> = {
  'dashboard': '🏠',
  'raci-inbox': '👥',
  'alerts-inbox': '🚨',
  'raci-activity': '📋',
  'alert-detail': '⚠️',
  'raci-comparator': '📊',
  'raci-heatmap': '🔥',
  'analytics': '📈',
};

export function GovernanceWorkspaceTabs() {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
    goToNextTab,
    goToPreviousTab,
    pinTab,
    unpinTab,
  } = useGovernanceWorkspaceStore();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  // Scroll l'onglet actif dans la vue
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const tab = activeTabRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      
      if (tabRect.left < containerRect.left) {
        container.scrollLeft -= containerRect.left - tabRect.left + 10;
      } else if (tabRect.right > containerRect.right) {
        container.scrollLeft += tabRect.right - containerRect.right + 10;
      }
    }
  }, [activeTabId]);
  
  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Tab : onglet suivant
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          goToPreviousTab();
        } else {
          goToNextTab();
        }
      }
      
      // Ctrl+W : fermer onglet actif
      if (e.ctrlKey && e.key === 'w' && activeTabId) {
        e.preventDefault();
        closeTab(activeTabId);
      }
      
      // Delete/Backspace : fermer onglet actif (si focus sur tab)
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeTabId) {
        const activeElement = document.activeElement;
        if (activeElement?.getAttribute('data-tab-id') === activeTabId) {
          e.preventDefault();
          closeTab(activeTabId);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, closeTab, goToNextTab, goToPreviousTab]);
  
  if (tabs.length === 0) return null;
  
  const activeIndex = tabs.findIndex(t => t.id === activeTabId);
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative flex items-center gap-2 border-b border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-900/30 backdrop-blur-xl">
      {/* Navigation gauche */}
      <div className="flex items-center gap-1 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousTab}
          disabled={tabs.length <= 1}
          className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
          title="Onglet précédent (Ctrl+Shift+Tab)"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextTab}
          disabled={tabs.length <= 1}
          className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
          title="Onglet suivant (Ctrl+Tab)"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Bouton scroll gauche */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleScrollLeft}
        className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {/* Conteneur scrollable des onglets */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          const icon = TAB_ICONS[tab.type] || '📄';
          
          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              data-tab-id={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group relative flex items-center gap-2 px-3 py-2 rounded-t-lg transition-all min-w-[120px] max-w-[200px]',
                'border-b-2 whitespace-nowrap',
                isActive
                  ? 'bg-white/10 border-blue-400 text-white'
                  : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              )}
              title={`${tab.title}${tab.subtitle ? ` - ${tab.subtitle}` : ''}`}
            >
              {/* Pin indicator */}
              {tab.isPinned && (
                <Pin className="h-3 w-3 text-amber-400 absolute top-1 right-1" />
              )}
              
              {/* Icône */}
              <span className="text-base flex-shrink-0">{icon}</span>
              
              {/* Titre */}
              <span className="text-sm font-medium truncate flex-1">
                {tab.title}
              </span>
              
              {/* Bouton fermer */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!tab.isPinned) {
                    closeTab(tab.id);
                  }
                }}
                className={cn(
                  'flex-shrink-0 rounded p-0.5 transition-colors',
                  tab.isPinned
                    ? 'opacity-30 cursor-not-allowed'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400'
                )}
                title={tab.isPinned ? "Épinglé - impossible de fermer" : "Fermer (Ctrl+W)"}
              >
                <X className="h-3 w-3" />
              </button>
            </button>
          );
        })}
      </div>
      
      {/* Bouton scroll droite */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleScrollRight}
        className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Menu actions */}
      <div className="flex items-center gap-2 px-2">
        {/* Indicateur position */}
        <span className="text-xs text-white/40 select-none">
          {activeIndex + 1}/{tabs.length}
        </span>
        
        {/* Menu dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          
          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50">
                {activeTabId && (
                  <>
                    <button
                      onClick={() => {
                        const tab = tabs.find(t => t.id === activeTabId);
                        if (tab) {
                          if (tab.isPinned) {
                            unpinTab(activeTabId);
                          } else {
                            pinTab(activeTabId);
                          }
                        }
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors text-left"
                    >
                      <Pin className="h-4 w-4" />
                      {tabs.find(t => t.id === activeTabId)?.isPinned ? 'Désépingler' : 'Épingler'}
                    </button>
                    
                    <button
                      onClick={() => {
                        const tab = tabs.find(t => t.id === activeTabId);
                        if (!tab?.isPinned) {
                          closeTab(activeTabId);
                        }
                        setShowMenu(false);
                      }}
                      disabled={tabs.find(t => t.id === activeTabId)?.isPinned}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                      Fermer l'onglet
                    </button>
                    
                    <button
                      onClick={() => {
                        closeOtherTabs(activeTabId);
                        setShowMenu(false);
                      }}
                      disabled={tabs.length <= 1}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                      Fermer les autres
                    </button>
                    
                    <div className="h-px bg-white/10 my-1" />
                  </>
                )}
                
                <button
                  onClick={() => {
                    closeAllTabs();
                    setShowMenu(false);
                  }}
                  disabled={tabs.length === 0}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  Tout fermer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

