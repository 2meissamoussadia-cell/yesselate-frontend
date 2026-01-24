/**
 * Composant Drill-Down BTP
 * Permet la navigation hiérarchique avec breadcrumb
 */

'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnalyticsBTPNavigationStore } from '@/lib/stores/analyticsBTPNavigationStore';
import { findDomain, findModule, findSubModule } from '@/lib/config/analyticsBTPArchitecture';

export function BTPDrillDown() {
  const { navigation, navigateToDomain, navigateToModule, navigateToSubModule } = useAnalyticsBTPNavigationStore();
  const { domainId, moduleId, subModuleId } = navigation;

  const domain = domainId ? findDomain(domainId) : null;
  const mod = domainId && moduleId ? findModule(domainId, moduleId) : null;
  const subModule = domainId && moduleId && subModuleId ? findSubModule(domainId, moduleId, subModuleId) : null;

  if (!domainId) return null;

  const path = [
    { id: 'home', label: 'Analytics', onClick: () => navigateToDomain('') },
    { id: domainId, label: domain?.label || domainId, onClick: () => navigateToDomain(domainId) },
  ];

  if (mod) {
    path.push({
      id: moduleId!,
      label: mod.label,
      onClick: () => navigateToModule(domainId, moduleId!),
    });
  }

  if (subModule) {
    path.push({
      id: subModuleId!,
      label: subModule.label,
      onClick: () => navigateToSubModule(domainId, moduleId!, subModuleId!),
    });
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 overflow-x-auto">
      {path.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0" />}
          <button
            onClick={item.onClick}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
              index === 0
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                : index === path.length - 1
                ? 'text-slate-200 bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            )}
          >
            {index === 0 && <Home className="h-3.5 w-3.5" />}
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

