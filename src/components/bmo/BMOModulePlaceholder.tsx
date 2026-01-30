'use client';

/**
 * BMOModulePlaceholder — Page placeholder pour un module BMO (11 phases BTP).
 * Affiche titre, description et message "À venir" pour les modules en construction.
 */

import { BusinessWindow } from '@/components/ui/BusinessWindow';

export interface BMOModulePlaceholderProps {
  title: string;
  description?: string;
  phaseLabel?: string;
}

export function BMOModulePlaceholder({
  title,
  description,
  phaseLabel,
}: BMOModulePlaceholderProps) {
  return (
    <BusinessWindow title={title}>
      <div className="space-y-4 text-sm">
        {phaseLabel && (
          <p className="text-amber-500/90 font-medium">{phaseLabel}</p>
        )}
        {description && (
          <p className="text-slate-300">{description}</p>
        )}
        <p className="text-slate-500 italic">
          Module en construction — KPIs, tableaux et workflows à venir.
        </p>
      </div>
    </BusinessWindow>
  );
}
