/**
 * Navigation secondaire et tertiaire
 * Sous-onglets et sous-sous-onglets
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { getMainCategory, getSubCategories, getSubSubCategories } from './config';

export function SubNavigation() {
  const { navigation, navigate } = useGovernanceCommandCenterStore();
  
  const mainCategory = getMainCategory(navigation.mainCategory);
  const subCats = getSubCategories(navigation.mainCategory);
  const subSubCats = navigation.subCategory 
    ? getSubSubCategories(navigation.subCategory) 
    : [];

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb - Cliquable */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <button
          onClick={() => {
            const firstSub = subCats.length > 0 ? subCats[0].id : null;
            navigate(navigation.mainCategory, firstSub as any, null);
          }}
          className="text-slate-400 hover:text-slate-300 transition-colors"
        >
          Gouvernance
        </button>
        {mainCategory && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <button
              onClick={() => {
                const firstSub = subCats.length > 0 ? subCats[0].id : null;
                navigate(navigation.mainCategory, firstSub as any, null);
              }}
              className="text-slate-300 font-medium hover:text-slate-200 transition-colors"
            >
              {mainCategory.label}
            </button>
            {navigation.subCategory && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span className="text-slate-400">
                  {subCats.find(s => s.id === navigation.subCategory)?.label}
                </span>
              </>
            )}
            {navigation.subSubCategory && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span className="text-slate-400 text-xs">
                  {subSubCats.find(s => s.id === navigation.subSubCategory)?.label}
                </span>
              </>
            )}
          </>
        )}
      </div>

      {/* Sub Categories (Niveau 2) - Toujours affiché si des sous-domaines existent */}
      {subCats.length > 0 && (
        <div className="flex items-center gap-1 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-hide">
          {subCats.map((sub) => {
            const isActive = navigation.subCategory === sub.id;
            const Icon = sub.icon;
            
            return (
              <button
                key={sub.id}
                onClick={() => navigate(
                  navigation.mainCategory,
                  sub.id as any,
                  null
                )}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-blue-500/15 text-slate-200 border border-blue-500/30 scale-105'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent hover:scale-[1.02]'
                )}
              >
                {Icon && <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-400')} />}
                <span>{sub.label}</span>
                {sub.badge && (
                  <Badge
                    variant="default"
                    className={cn(
                      'h-4 min-w-4 px-1 text-xs transition-all duration-200',
                      sub.badgeType === 'critical'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : sub.badgeType === 'warning'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-slate-600/40 text-slate-400 border-slate-600/50',
                      isActive && 'scale-110'
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

      {/* Sub-Sub Categories (Niveau 3) */}
      {subSubCats.length > 0 && (
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-800/30 border-t border-slate-800/50 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-slate-400 mr-2">Filtrer:</span>
          {subSubCats.map((subSub) => {
            const isActive = navigation.subSubCategory === subSub.id;
            
            return (
              <button
                key={subSub.id}
                onClick={() => navigate(
                  navigation.mainCategory,
                  navigation.subCategory,
                  subSub.id as any
                )}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                    : 'text-slate-400 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
                )}
              >
                <span>{subSub.label}</span>
                {subSub.count !== undefined && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    isActive ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-700/40 text-slate-400'
                  )}>
                    {subSub.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

