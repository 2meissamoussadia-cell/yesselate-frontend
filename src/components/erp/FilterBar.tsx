/**
 * FilterBar ERP — Filtres intelligents pour vues listes (chantiers, demandes, alertes, arbitrages).
 * Périmètre (programme, chantier, entreprise), multi-états (statut, priorité, gravité),
 * dates (période, avancement, retard), avancés (écarts budget, délais, risques), vues sauvegardées.
 */

'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Filter, X, Save } from 'lucide-react';
import type { ErpFilters, ErpSavedView } from './types';

export interface FilterBarProps {
  filters: ErpFilters;
  onFilterChange: (key: string, value: unknown) => void;
  savedViews?: ErpSavedView[];
  onSaveView?: (name: string) => void;
  onLoadView?: (view: ErpSavedView) => void;
  /** Options pour les selects (sinon valeurs par défaut) */
  options?: {
    programmes?: Array<{ value: string; label: string }>;
    chantiers?: Array<{ value: string; label: string }>;
    entreprises?: Array<{ value: string; label: string }>;
    statuts?: string[];
    priorites?: string[];
    gravites?: string[];
    periodes?: string[];
    avancements?: string[];
  };
  /** Masquer certaines sections */
  hideSections?: ('perimetre' | 'etats' | 'dates' | 'avances' | 'savedViews')[];
  className?: string;
}

const DEFAULT_PROGRAMMES = [
  { value: '', label: 'Tous' },
  { value: 'P1', label: 'Programme 1' },
  { value: 'P2', label: 'Programme 2' },
  { value: 'NICE', label: 'Nice Rénovation' },
];
const DEFAULT_STATUTS = ['Tous', 'En cours', 'En attente', 'Terminé', 'Bloqué'];
const DEFAULT_PRIORITES = ['Toutes', 'Basse', 'Moyenne', 'Haute', 'Critique'];
const DEFAULT_GRAVITES = ['Toutes', 'Info', 'Moyenne', 'Haute', 'Critique'];
const DEFAULT_PERIODES = ['Ce mois', 'Ce trimestre', 'Cette année', 'Personnalisé'];
const DEFAULT_AVANCEMENTS = ['Tous', 'En retard', 'À jour', 'En avance'];

export function FilterBar({
  filters,
  onFilterChange,
  savedViews = [],
  onSaveView,
  onLoadView,
  options = {},
  hideSections = [],
  className,
}: FilterBarProps) {
  const programmes = options.programmes ?? DEFAULT_PROGRAMMES;
  const statuts = options.statuts ?? DEFAULT_STATUTS;
  const priorites = options.priorites ?? DEFAULT_PRIORITES;
  const gravites = options.gravites ?? DEFAULT_GRAVITES;
  const periodes = options.periodes ?? DEFAULT_PERIODES;
  const avancements = options.avancements ?? DEFAULT_AVANCEMENTS;

  const handleClear = useCallback(() => {
    ['programme', 'chantier', 'entreprise', 'statut', 'priorite', 'gravite', 'periode', 'avancement', 'retard', 'ecartBudget', 'delais', 'risques'].forEach((key) =>
      onFilterChange(key, key === 'retard' || key === 'ecartBudget' ? 'tous' : '')
    );
  }, [onFilterChange]);

  const hasActiveFilters =
    Boolean(filters.programme) ||
    Boolean(filters.chantier) ||
    Boolean(filters.entreprise) ||
    Boolean(filters.statut) ||
    Boolean(filters.priorite) ||
    Boolean(filters.gravite) ||
    Boolean(filters.periode) ||
    Boolean(filters.avancement) ||
    (filters.retard && filters.retard !== 'tous') ||
    (filters.ecartBudget && filters.ecartBudget !== 'tous');

  const Select = ({
    label,
    value,
    onChange,
    options: opts,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Array<{ value: string; label: string }> | string[];
  }) => {
    const items = Array.isArray(opts) && typeof opts[0] === 'string'
      ? [{ value: '', label: opts[0] }, ...opts.slice(1).map((o) => ({ value: o, label: o }))]
      : opts as Array<{ value: string; label: string }>;
    return (
      <div className="flex flex-col gap-0.5">
        <label className="text-[11px] text-slate-400 font-medium">{label}</label>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-8 min-w-[120px] rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
            'transition-colors hover:border-slate-600'
          )}
          aria-label={label}
        >
          {items.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 p-3 border-b border-slate-800/60 bg-slate-950/60',
        className
      )}
      role="region"
      aria-label="Filtres"
    >
      <div className="flex items-center gap-2 text-slate-400 shrink-0">
        <Filter className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium">Filtres</span>
      </div>

      {!hideSections.includes('perimetre') && (
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Programme"
            value={String(filters.programme ?? '')}
            onChange={(v) => onFilterChange('programme', v)}
            options={programmes}
          />
          {options.chantiers && options.chantiers.length > 0 ? (
            <Select
              label="Chantier"
              value={String(filters.chantier ?? '')}
              onChange={(v) => onFilterChange('chantier', v)}
              options={[{ value: '', label: 'Tous' }, ...options.chantiers]}
            />
          ) : null}
          {options.entreprises && options.entreprises.length > 0 ? (
            <Select
              label="Entreprise"
              value={String(filters.entreprise ?? '')}
              onChange={(v) => onFilterChange('entreprise', v)}
              options={[{ value: '', label: 'Toutes' }, ...options.entreprises]}
            />
          ) : null}
        </div>
      )}

      {!hideSections.includes('etats') && (
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Statut"
            value={String(filters.statut ?? '')}
            onChange={(v) => onFilterChange('statut', v)}
            options={statuts}
          />
          <Select
            label="Priorité"
            value={String(filters.priorite ?? '')}
            onChange={(v) => onFilterChange('priorite', v)}
            options={priorites}
          />
          <Select
            label="Gravité"
            value={String(filters.gravite ?? '')}
            onChange={(v) => onFilterChange('gravite', v)}
            options={gravites}
          />
        </div>
      )}

      {!hideSections.includes('dates') && (
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Période"
            value={String(filters.periode ?? '')}
            onChange={(v) => onFilterChange('periode', v)}
            options={periodes}
          />
          <Select
            label="Avancement"
            value={String(filters.avancement ?? '')}
            onChange={(v) => onFilterChange('avancement', v)}
            options={avancements}
          />
          <Select
            label="Retard"
            value={String(filters.retard ?? 'tous')}
            onChange={(v) => onFilterChange('retard', v)}
            options={[
              { value: 'tous', label: 'Tous' },
              { value: 'oui', label: 'En retard' },
              { value: 'non', label: 'À jour' },
            ]}
          />
        </div>
      )}

      {!hideSections.includes('avances') && (
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Écart budget"
            value={String(filters.ecartBudget ?? 'tous')}
            onChange={(v) => onFilterChange('ecartBudget', v)}
            options={[
              { value: 'tous', label: 'Tous' },
              { value: 'oui', label: 'Avec écart' },
              { value: 'non', label: 'Conforme' },
            ]}
          />
        </div>
      )}

      {savedViews.length > 0 && !hideSections.includes('savedViews') && (
        <div className="flex flex-col gap-0.5">
          <label className="text-[11px] text-slate-400 font-medium">Vue</label>
          <select
            value=""
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              const view = savedViews.find((v) => v.id === id);
              if (view) onLoadView?.(view);
            }}
            className={cn(
              'h-8 min-w-[140px] rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50'
            )}
            aria-label="Vue sauvegardée"
          >
            <option value="">Personnalisée</option>
            {savedViews.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {onSaveView && (
        <button
          type="button"
          onClick={() => {
            const name = window.prompt('Nom de la vue à sauvegarder');
            if (name?.trim()) onSaveView(name.trim());
          }}
          className={cn(
            'h-8 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-300',
            'hover:bg-slate-800 hover:border-slate-600 hover:text-slate-100 transition-all active:scale-[0.98]'
          )}
          title="Sauvegarder les filtres actuels"
        >
          <Save className="h-3.5 w-3.5" />
          Sauvegarder la vue
        </button>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'h-8 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-xs text-slate-400',
            'hover:bg-slate-800 hover:text-slate-200 transition-all active:scale-[0.98]'
          )}
          aria-label="Effacer tous les filtres"
        >
          <X className="h-3.5 w-3.5" />
          Effacer
        </button>
      )}
    </div>
  );
}
