/**
 * Sidebar de Navigation BTP
 * Navigation hiérarchique selon l'architecture BTP (Domaine > Module > Sous-module)
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { analyticsBTPArchitecture, type AnalyticsDomain, type AnalyticsModule } from '@/lib/config/analyticsBTPArchitecture';
import { useAnalyticsBTPNavigationStore } from '@/lib/stores/analyticsBTPNavigationStore';

interface BTPSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function BTPSidebar({ collapsed = false, onToggleCollapse }: BTPSidebarProps) {
  const { navigation, navigateToDomain, navigateToModule, navigateToSubModule } = useAnalyticsBTPNavigationStore();
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  // Auto-expand le domaine actif
  React.useEffect(() => {
    if (navigation.domainId) {
      setExpandedDomains((prev) => new Set(prev).add(navigation.domainId!));
    }
  }, [navigation.domainId]);
  
  // Auto-expand le module actif
  React.useEffect(() => {
    if (navigation.moduleId) {
      setExpandedModules((prev) => new Set(prev).add(navigation.moduleId!));
    }
  }, [navigation.moduleId]);

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

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleDomainClick = (domain: AnalyticsDomain) => {
    navigateToDomain(domain.id);
    if (!expandedDomains.has(domain.id)) {
      setExpandedDomains((prev) => new Set(prev).add(domain.id));
    }
  };

  const handleModuleClick = (domainId: string, module: AnalyticsModule) => {
    navigateToModule(domainId, module.id);
    if (!expandedModules.has(module.id)) {
      setExpandedModules((prev) => new Set(prev).add(module.id));
    }
  };

  const handleSubModuleClick = (domainId: string, moduleId: string, subModuleId: string) => {
    navigateToSubModule(domainId, moduleId, subModuleId);
  };

  return (
    <div
      className={cn(
        'h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-80'
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-slate-200">Analytics BTP</h2>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-[-90deg]" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {analyticsBTPArchitecture.map((domain) => {
            const isDomainActive = navigation.domainId === domain.id;
            const isDomainExpanded = expandedDomains.has(domain.id);
            const DomainIcon = domain.icon;

            return (
              <div key={domain.id} className="space-y-0.5">
                {/* Domain */}
                <button
                  onClick={() => handleDomainClick(domain)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-left',
                    isDomainActive
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  )}
                >
                  <DomainIcon className={cn('h-4 w-4 flex-shrink-0', isDomainActive ? 'text-blue-400' : 'text-slate-400')} />
                  {!collapsed && (
                    <>
                      <span className={cn('text-sm font-medium flex-1', isDomainActive ? 'text-blue-400' : 'text-slate-300')}>
                        {domain.label}
                      </span>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDomain(domain.id);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDomain(domain.id);
                          }
                        }}
                        className="p-0.5 hover:bg-slate-700 rounded cursor-pointer"
                      >
                        {isDomainExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </div>
                    </>
                  )}
                </button>

                {/* Modules */}
                {!collapsed && isDomainExpanded && (
                  <div className="ml-6 space-y-0.5">
                    {domain.modules.map((module) => {
                      const isModuleActive = navigation.domainId === domain.id && navigation.moduleId === module.id;
                      const isModuleExpanded = expandedModules.has(module.id);

                      return (
                        <div key={module.id} className="space-y-0.5">
                          {/* Module */}
                          <button
                            onClick={() => handleModuleClick(domain.id, module)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left text-sm',
                              isModuleActive
                                ? 'bg-blue-500/5 border border-blue-500/20'
                                : 'hover:bg-slate-800/30 border border-transparent'
                            )}
                          >
                            <span className={cn('flex-1', isModuleActive ? 'text-blue-300' : 'text-slate-400')}>
                              {module.label}
                            </span>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleModule(module.id);
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleModule(module.id);
                                }
                              }}
                              className="p-0.5 hover:bg-slate-700 rounded cursor-pointer"
                            >
                              {isModuleExpanded ? (
                                <ChevronDown className="h-3 w-3 text-slate-400" />
                              ) : (
                                <ChevronRight className="h-3 w-3 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {/* Sub-modules */}
                          {isModuleExpanded && (
                            <div className="ml-4 space-y-0.5">
                              {module.subModules.map((subModule) => {
                                const isSubModuleActive =
                                  navigation.domainId === domain.id &&
                                  navigation.moduleId === module.id &&
                                  navigation.subModuleId === subModule.id;

                                return (
                                  <button
                                    key={subModule.id}
                                    onClick={() => handleSubModuleClick(domain.id, module.id, subModule.id)}
                                    className={cn(
                                      'w-full px-3 py-1.5 rounded-lg transition-all duration-200 text-left text-xs',
                                      isSubModuleActive
                                        ? 'bg-blue-500/10 text-blue-300'
                                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/20'
                                    )}
                                  >
                                    {subModule.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

