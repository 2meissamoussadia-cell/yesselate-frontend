/**
 * Sub-navigation verticale — hiérarchique pour Pilotage, plate pour les autres blocs.
 *
 * Pilotage : structure 1, 1.1, 1.1.1 avec expand/collapse.
 * Autres blocs : liste plate des sous-catégories (comportement existant).
 */

'use client';

import React, { useCallback, useMemo, memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { getSubCategories, dashboardNavigationConfig } from './dashboardNavigationConfig';
import { getDefaultLeafForSub } from '../utils/routeValidation';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { nodeAllowed } from './permissions';
import { useDashboardPermissions } from '../hooks/useDashboardPermissions';
import { useDashboardPermissionsStore } from '@/lib/stores/dashboardPermissionsStore';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';
import { PILOTAGE_HIERARCHY, type PilotageHierarchyNode } from './pilotageHierarchyConfig';
import { getModuleHref } from '@/lib/navigation/moduleLinks';

export const DashboardSubSidebar = memo(function DashboardSubSidebar() {
  const [expanded, setExpanded] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['vue-dg', 'vue-dg-kpis', 'tresorerie', 'tresorerie-synthese'])
  );
  const router = useRouter();

  const main = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  useDashboardPermissions();
  const permissions = useDashboardPermissionsStore((s) => s.permissions);
  const userContext = useMemo(
    () => ({
      perms: permissions.permissions,
      flags: permissions.featureFlags,
      roles: permissions.roles,
    }),
    [permissions.permissions, permissions.featureFlags, permissions.roles]
  );

  const currentMain = (typeof main === 'string' ? main.toLowerCase() : 'pilotage') as DashboardMainCategory;
  const usePilotageHierarchy = currentMain === 'pilotage';

  const allSubCategories = getSubCategories(currentMain) || [];
  const subCategories = useMemo(
    () =>
      currentMain === 'systeme'
        ? []
        : allSubCategories.filter((subCat) => nodeAllowed(userContext, subCat.requires)),
    [currentMain, allSubCategories, userContext]
  );

  const handleSubClick = useCallback(
    (subId: string) => {
      const defaultLeaf = getDefaultLeafForSub(currentMain, subId);
      navigate(currentMain as DashboardMainCategory, subId, defaultLeaf ?? undefined);
    },
    [currentMain, navigate]
  );

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleHierarchyClick = useCallback(
    (node: PilotageHierarchyNode) => {
      if (node.children?.length) {
        toggleNode(node.id);
      }
      const href = getModuleHref(node.target);
      if (node.target.type === 'dashboard') {
        const t = node.target;
        navigate(t.main as DashboardMainCategory, t.sub, t.leaf);
      } else {
        router.push(href);
      }
    },
    [navigate, router, toggleNode]
  );

  if (usePilotageHierarchy) {
    return (
      <PilotageHierarchySidebar
        expanded={expanded}
        setExpanded={setExpanded}
        expandedNodes={expandedNodes}
        toggleNode={toggleNode}
        handleHierarchyClick={handleHierarchyClick}
        hierarchy={PILOTAGE_HIERARCHY}
      />
    );
  }

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        'shrink-0 flex flex-col border-r border-slate-200 bg-gray-50 dark:border-slate-800/70 dark:bg-slate-950/60 overflow-y-auto overflow-x-hidden scrollbar-dashboard transition-[width] duration-200 ease-out',
        expanded ? 'w-52' : 'w-14'
      )}
      aria-label="Sub-navigation"
      aria-expanded={expanded}
    >
      <div className="py-3 px-2">
        <nav
          className="space-y-0.5"
          aria-label={dashboardNavigationConfig[currentMain] ? `Sections ${dashboardNavigationConfig[currentMain].label}` : 'Sections'}
        >
          {subCategories.map((subCat) => {
            const active = subCat.id === sub;
            const Icon = subCat.icon;
            const btn = (
              <button
                key={subCat.id}
                type="button"
                onClick={() => handleSubClick(subCat.id)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-lg py-2 text-left text-sm transition-colors min-h-[36px]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                  expanded ? 'px-3 justify-start' : 'px-2 justify-center',
                  active
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-100 border-l-2 border-sky-500'
                    : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 border-l-2 border-transparent'
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={subCat.label}
              >
                {Icon && (
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                    <Icon className="h-3 w-3 min-h-0 min-w-0 max-h-full max-w-full" aria-hidden />
                  </span>
                )}
                {expanded && <span className="truncate">{subCat.label}</span>}
              </button>
            );
            return expanded ? (
              btn
            ) : (
              <Tooltip key={subCat.id} delayDuration={300}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {subCat.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </aside>
  );
});

interface PilotageHierarchySidebarProps {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  handleHierarchyClick: (node: PilotageHierarchyNode) => void;
  hierarchy: PilotageHierarchyNode[];
}

function PilotageHierarchySidebar({
  expanded,
  setExpanded,
  expandedNodes,
  toggleNode,
  handleHierarchyClick,
  hierarchy,
}: PilotageHierarchySidebarProps) {
  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        'shrink-0 flex flex-col border-r border-slate-200 bg-gray-50 dark:border-slate-800/70 dark:bg-slate-950/60 overflow-y-auto overflow-x-hidden scrollbar-dashboard transition-[width] duration-200 ease-out',
        expanded ? 'w-64 min-w-[200px]' : 'w-14'
      )}
      aria-label="Navigation Pilotage hiérarchique"
      aria-expanded={expanded}
    >
      <div className="py-3 px-2">
        <nav className="space-y-0.5" aria-label="Sections Pilotage">
          {hierarchy.map((node) => (
            <HierarchyNode
              key={node.id}
              node={node}
              expanded={expanded}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onSelect={handleHierarchyClick}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

interface HierarchyNodeProps {
  node: PilotageHierarchyNode;
  expanded: boolean;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  onSelect: (node: PilotageHierarchyNode) => void;
}

function HierarchyNode({ node, expanded, expandedNodes, toggleNode, onSelect }: HierarchyNodeProps) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expandedNodes.has(node.id);

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNode(node.id);
  };

  const handleLabelClick = () => {
    if (hasChildren) {
      toggleNode(node.id);
    } else {
      onSelect(node);
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLabelClick();
    }
  };

  const content = (
    <>
      {hasChildren && expanded ? (
        <button
          type="button"
          onClick={handleChevronClick}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800/60 focus:outline-none"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Replier' : 'Déplier'}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>
      ) : (
        hasChildren && <span className="w-5 shrink-0" aria-hidden />
      )}
      {expanded && <span className="truncate flex-1">{node.label}</span>}
    </>
  );

  const baseClasses = cn(
    'w-full flex items-center gap-1.5 rounded-lg py-2 text-left text-sm transition-colors min-h-[36px]',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border-l-2 border-transparent',
    expanded ? 'px-2 justify-start' : 'px-2 justify-center'
  );

  return (
    <div key={node.id}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleLabelClick}
        onKeyDown={handleLabelKeyDown}
        className={baseClasses}
        aria-label={node.label}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {content}
      </div>
      {hasChildren && isExpanded && expanded && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800/60 pl-2" role="group" aria-label={`Sous-dossiers de ${node.label}`}>
          {node.children!.map((child) => (
            <HierarchyNode
              key={child.id}
              node={child}
              expanded={expanded}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
