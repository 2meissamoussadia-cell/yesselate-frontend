/**
 * Sidebar de navigation principale du Centre de Commandement
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Activity,
  Search,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { mainCategories, getSubCategories } from './config';

export function CommandCenterSidebar() {
  const { 
    navigation, 
    sidebarCollapsed, 
    navigate, 
    toggleSidebar,
    toggleCommandPalette,
  } = useGovernanceCommandCenterStore();

  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  // Auto-expand le domaine actif
  useEffect(() => {
    if (navigation.mainCategory) {
      setExpandedDomains((prev) => new Set(prev).add(navigation.mainCategory));
    }
  }, [navigation.mainCategory]);

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  };

  const handleDomainChange = (domainId: string) => {
    // Sélectionner automatiquement le premier sous-domaine
    const subCats = getSubCategories(domainId);
    const firstSub = subCats.length > 0 ? subCats[0].id : null;
    navigate(domainId as any, firstSub as any, null);
    
    // Auto-expand le domaine sélectionné
    if (!expandedDomains.has(domainId)) {
      setExpandedDomains((prev) => new Set(prev).add(domainId));
    }
  };

  const handleSectionClick = (domainId: string, sectionId: string) => {
    navigate(domainId as any, sectionId as any, null);
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">Centre de Commande</span>
          </div>
        )}
        {sidebarCollapsed && (
          <Activity className="h-5 w-5 text-blue-400 mx-auto" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Trigger */}
      {!sidebarCollapsed && (
        <div className="p-3">
          <Button
            variant="ghost"
            onClick={toggleCommandPalette}
            className="w-full justify-start gap-2 h-9 px-3 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Rechercher...</span>
            <kbd className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
          </Button>
        </div>
      )}
      {sidebarCollapsed && (
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCommandPalette}
            className="w-full h-9 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation Items avec Accordéons */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            const isDomainActive = navigation.mainCategory === category.id;
            const isDomainExpanded = expandedDomains.has(category.id);
            const subCats = getSubCategories(category.id);

            if (sidebarCollapsed) {
              // Mode collapsed : afficher seulement les domaines
              return (
                <button
                  key={category.id}
                  onClick={() => handleDomainChange(category.id)}
                  className={cn(
                    'w-full flex items-center justify-center p-2.5 rounded-lg transition-all relative',
                    isDomainActive
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'hover:bg-slate-700/40 border border-transparent'
                  )}
                  title={category.label}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    isDomainActive ? 'text-blue-400' : 'text-slate-400'
                  )} />
                  {category.badge && (
                    <div
                      className={cn(
                        'absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-xs flex items-center justify-center font-medium',
                        category.badgeType === 'critical'
                          ? 'bg-red-500 text-white'
                          : category.badgeType === 'warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-500 text-white'
                      )}
                    >
                      {category.badge}
                    </div>
                  )}
                </button>
              );
            }

            // Mode expanded : afficher avec accordéons
            return (
              <div key={category.id} className="space-y-0.5">
                {/* Domaine (bouton accordéon) */}
                <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleDomainChange(category.id)}
                      className={cn(
                        'flex-1 flex items-center gap-3 px-3 py-2.5 transition-all',
                        'group relative',
                        isDomainActive
                          ? 'bg-blue-500/10 border-b border-blue-500/30'
                          : 'hover:bg-slate-700/40'
                      )}
                    >
                    {/* Indicator */}
                    <div
                      className={cn(
                        'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all',
                        isDomainActive ? 'bg-blue-400' : 'bg-transparent'
                      )}
                    />
                    
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isDomainActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                      )} />
                      <span
                        className={cn(
                          'text-sm font-medium truncate',
                          isDomainActive ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'
                        )}
                      >
                        {category.label}
                      </span>
                      {category.badge && (
                        <Badge
                          variant="default"
                          className={cn(
                            'h-5 min-w-5 px-1.5 text-xs font-medium flex-shrink-0',
                            category.badgeType === 'critical'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : category.badgeType === 'warning'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          )}
                        >
                          {category.badge}
                        </Badge>
                      )}
                    </div>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDomain(category.id);
                      }}
                      className="p-2 hover:bg-slate-700/40 transition-colors"
                      title={isDomainExpanded ? 'Réduire' : 'Développer'}
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-slate-500 transition-transform',
                          isDomainExpanded ? 'rotate-0' : '-rotate-90'
                        )}
                      />
                    </button>
                  </div>

                  {/* Sous-domaines (expandable) */}
                  {isDomainExpanded && subCats.length > 0 && (
                    <div className="px-2 pb-2 space-y-0.5 bg-slate-800/30">
                      {subCats.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSectionActive = isDomainActive && navigation.subCategory === sub.id;
                        
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleSectionClick(category.id, sub.id)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all',
                              isSectionActive
                                ? 'bg-blue-500/15 text-slate-200 border border-blue-500/30'
                                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/40 border border-transparent'
                            )}
                          >
                            {SubIcon && (
                              <SubIcon className={cn(
                                'h-4 w-4 flex-shrink-0',
                                isSectionActive ? 'text-blue-400' : 'text-slate-500'
                              )} />
                            )}
                            <span className="flex-1 text-left truncate">{sub.label}</span>
                            {sub.badge && (
                              <Badge
                                variant="default"
                                className={cn(
                                  'h-4 min-w-4 px-1 text-xs flex-shrink-0',
                                  sub.badgeType === 'critical'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                    : sub.badgeType === 'warning'
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                    : 'bg-slate-600/40 text-slate-400 border-slate-600/50'
                                )}
                              >
                                {sub.badge}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-3">
        {!sidebarCollapsed && (
          <div className="text-xs text-slate-500 text-center">
            Gouvernance v4.0
          </div>
        )}
      </div>
    </aside>
  );
}

