'use client';

/**
 * Showcase BMO — Tests visuels des composants
 * Accès : /maitre-ouvrage/showcase
 */

import React, { useState } from 'react';
import {
  FilterBar,
  QuickActionsBar,
  StatusBadge,
  CategoryBadge,
  TabBadge,
  ListItem,
  ListItemContent,
  TimeAgo,
  ReferenceNumber,
  ActionButton,
  EmptyState,
  TruncateWithTooltip,
} from '@/components/bmo/ui';
import { KPICard } from '@/components/bmo/dashboard';
import { Badge } from '@/components/ui/badge';

const SECTION_CLASS =
  'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3';

export default function ShowcasePage() {
  const [activeView, setActiveView] = useState('prioritaire');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Showcase composants BMO
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Tests visuels et accessibilité — /maitre-ouvrage/showcase
          </p>
        </header>

        {/* FilterBar */}
        <section className={SECTION_CLASS}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">FilterBar</h2>
          <FilterBar
            viewTabs={[
              { id: 'prioritaire', label: 'Prioritaire', count: 12 },
              { id: 'autres', label: 'Autres', count: 8 },
            ]}
            activeView={activeView}
            onViewChange={setActiveView}
            activeFilters={activeFilters}
            onFilterToggle={(id) =>
              setActiveFilters((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            sortLabel="Par date"
            onSortClick={() => {}}
            searchPlaceholder="Rechercher..."
            onSearch={() => {}}
          />
        </section>

        {/* QuickActionsBar */}
        <section className={SECTION_CLASS}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">QuickActionsBar</h2>
          <QuickActionsBar
            primaryLabel="Nouveau"
            onPrimaryClick={() => {}}
            actions={[
              { id: 'delete', icon: <span>🗑</span>, label: 'Supprimer', variant: 'ghost', onClick: () => {} },
              { id: 'archive', icon: <span>📦</span>, label: 'Archiver', variant: 'secondary', onClick: () => {} },
            ]}
            selectedCount={0}
          />
        </section>

        {/* Badges */}
        <section className={SECTION_CLASS}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Badges</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <StatusBadge variant="success">Validé</StatusBadge>
            <StatusBadge variant="warning">En attente</StatusBadge>
            <StatusBadge variant="error">Rejeté</StatusBadge>
            <StatusBadge variant="info">En cours</StatusBadge>
            <StatusBadge variant="neutral">Brouillon</StatusBadge>
            <CategoryBadge category="financier" />
            <span className="inline-flex items-center gap-1.5">
              <TabBadge count={12} /> <span className="text-sm text-slate-600 dark:text-slate-400">Critiques</span>
            </span>
            <Badge variant="secondary">Badge UI</Badge>
          </div>
        </section>

        {/* KPI Cards */}
        <section className={SECTION_CLASS}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">KPICard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              label="En attente"
              value={24}
              subtitle="demandes"
              trend={{ value: 12, direction: 'up' }}
              color="blue"
            />
            <KPICard
              label="Validées"
              value={156}
              subtitle="ce mois"
              trend={{ value: 156, direction: 'down' }}
              color="green"
            />
            <KPICard label="Taux" value={94} subtitle="%" color="purple" />
          </div>
        </section>

        {/* ListItem + TimeAgo + ReferenceNumber */}
        <section className={SECTION_CLASS}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">ListItem, TimeAgo, ReferenceNumber</h2>
          <div className="space-y-0">
            <ListItem id="item-1" onClick={() => {}}>
              <ListItemContent
                topLine={<TimeAgo date={new Date(Date.now() - 86400000).toISOString()} />}
                title="BC-2024-0847 — Travaux VRD Phase 2"
                subtitle="DRE · 125 500 000 FCFA"
                badge={<ReferenceNumber value="BC-2024-0847" prefix="BC" />}
              />
            </ListItem>
            <ListItem id="item-2" onClick={() => {}}>
              <ListItemContent
                title="Facture FC-2024-0123"
                subtitle="DSI · 2 000 000 FCFA"
                topLine={<TimeAgo date={new Date(Date.now() - 3600000).toISOString()} />}
                badge={<StatusBadge variant="warning">En attente</StatusBadge>}
              />
            </ListItem>
          </div>
        </section>

        {/* ActionButton */}
        <section className={SECTION_CLASS}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">ActionButton</h2>
          <div className="flex flex-wrap gap-2">
            <ActionButton variant="primary" onClick={() => {}}>Nouveau</ActionButton>
            <ActionButton variant="secondary" onClick={() => {}}>Enregistrer</ActionButton>
            <ActionButton variant="outline" onClick={() => {}}>Annuler</ActionButton>
            <ActionButton variant="ghost" onClick={() => {}}>Plus...</ActionButton>
          </div>
        </section>

        {/* TruncateWithTooltip */}
        <section className={SECTION_CLASS}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">TruncateWithTooltip</h2>
          <div className="max-w-xs">
            <TruncateWithTooltip lines={1}>
              Texte long qui sera tronqué avec une ellipse et affichera le contenu complet au survol dans un tooltip.
            </TruncateWithTooltip>
          </div>
        </section>

        {/* EmptyState */}
        <section className={SECTION_CLASS}>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">EmptyState</h2>
          <EmptyState
            type="no-data"
            title="Aucun document"
            description="Aucun bon de commande en attente pour le moment."
            primaryAction={{ label: 'Créer un BC', onClick: () => {} }}
          />
        </section>

        <footer className="text-sm text-slate-500 dark:text-slate-400 pt-8 border-t border-slate-200 dark:border-slate-700">
          Showcase BMO — Cohérence visuelle et accessibilité WCAG 2.1
        </footer>
      </div>
    </div>
  );
}
