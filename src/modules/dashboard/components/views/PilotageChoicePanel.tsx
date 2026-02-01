/**
 * Panneau de choix contextuel — affiché au clic sur une carte Pilotage
 *
 * Demande « Que souhaitez-vous voir ? » et propose les sous-options.
 * Aligné sur PILOTAGE_HIERARCHY.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PILOTAGE_HIERARCHY, type PilotageHierarchyNode } from '../../navigation/pilotageHierarchyConfig';
import { getModuleHref } from '@/lib/navigation/moduleLinks';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory } from '@/lib/stores/dashboardCommandCenterStore';

export interface PilotageChoicePanelProps {
  /** Section sélectionnée (ex: tresorerie, risques) */
  sectionId: string;
  onClose: () => void;
}

export function PilotageChoicePanel({ sectionId, onClose }: PilotageChoicePanelProps) {
  const router = useRouter();
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const node = PILOTAGE_HIERARCHY.find((n) => n.id === sectionId);
  const children = node?.children ?? [];

  if (children.length === 0) return null;

  const handleSelect = (child: PilotageHierarchyNode) => {
    if (child.target.type === 'dashboard') {
      const t = child.target;
      navigate(t.main as DashboardMainCategory, t.sub, t.leaf);
    } else {
      router.push(getModuleHref(child.target));
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="pilotage-choice-title"
      aria-describedby="pilotage-choice-desc"
      className="w-full max-w-2xl mx-auto"
    >
      <button
        type="button"
        onClick={onClose}
        className={cn(
          'flex items-center gap-2 mb-6 text-sm text-slate-400 hover:text-slate-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 rounded px-1 -ml-1'
        )}
        aria-label="Retour aux cartes"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Retour
      </button>

      <h2 id="pilotage-choice-title" className="text-lg font-semibold text-slate-100 mb-1">
        {node?.label}
      </h2>
      <p id="pilotage-choice-desc" className="text-sm text-slate-400 mb-6">
        Que souhaitez-vous voir ?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {children.map((child) => {
          const href = getModuleHref(child.target);
          const isDashboard = child.target.type === 'dashboard';

          const content = (
            <>
              <span className="flex-1">{child.label}</span>
              <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
            </>
          );

          const classes = cn(
            'flex items-center gap-3 w-full text-left rounded-xl p-4',
            'border border-slate-800/80 bg-slate-900/50',
            'hover:border-slate-700 hover:bg-slate-800/50',
            'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50'
          );

          if (isDashboard) {
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => handleSelect(child)}
                className={classes}
                aria-label={child.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={child.id} href={href} onClick={onClose} className={classes} aria-label={child.label}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
