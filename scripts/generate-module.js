#!/usr/bin/env node
/**
 * Générateur de modules BMO — Crée la structure complète d'un module Outlook-like.
 * Usage: node scripts/generate-module.js [--id=mon-module] [--name="Mon Module"]
 *        ou node scripts/generate-module.js (mode interactif)
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

function capitalize(str) {
  return str
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function kebabToPascal(str) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

const templates = {
  page: (config) => `'use client';

/**
 * ${config.nameCapitalized} — Vue Outlook-like (layout 3 colonnes)
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { ${config.id}ModuleConfig } from '@/lib/config/modules/${config.id}.config';
import { cn } from '@/lib/utils';

interface ${config.nameCapitalized}Item {
  id: string;
  titre: string;
  statut: string;
  dateCreation: string;
}

const MOCK_ITEMS: ${config.nameCapitalized}Item[] = [
  { id: '1', titre: 'Exemple', statut: 'Actif', dateCreation: new Date().toISOString() },
];

export default function ${config.nameCapitalized}OutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('tous');

  const items = MOCK_ITEMS;
  const selectedItem = selectedId ? items.find((d) => d.id === selectedId) : null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouveau ${config.name}"
      primaryIcon={<Plus className="h-5 w-5" />}
      onPrimaryClick={() => {}}
      selectedCount={selectedId ? 1 : 0}
    />
  );

  const renderDetail = selectedItem ? (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">{selectedItem.titre}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500">Statut</span>
          <p className="font-medium">{selectedItem.statut}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Sélectionnez un élément
    </div>
  );

  return (
    <BmoModulePage
      module="${config.id}"
      config={${config.id}ModuleConfig}
      items={items}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderQuickActions={quickActions}
      renderDetail={renderDetail}
      emptyMessage="Aucun ${config.name}"
      renderListItem={(item, { isSelected }) => (
        <div
          className={cn(
            'flex flex-col gap-1 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40 cursor-pointer',
            isSelected && 'bg-sky-50 dark:bg-sky-900/20'
          )}
        >
          <div className="font-medium text-sm">{item.titre}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{item.statut}</div>
        </div>
      )}
    />
  );
}
`,

  types: (config) => `/**
 * Types pour le module ${config.name}
 */

export interface ${config.nameCapitalized} {
  id: string;
  numero: string;
  titre: string;
  description: string;
  statut: 'actif' | 'en-cours' | 'termine' | 'archive';
  dateCreation: Date;
  dateModification: Date;
  creePar: { id: string; nom: string };
  archived: boolean;
  deleted: boolean;
  version: number;
}

export interface ${config.nameCapitalized}Filters {
  statuts?: string[];
  dateDebut?: Date;
  dateFin?: Date;
}

export type ${config.nameCapitalized}SortField = 'date' | 'titre' | 'statut';
export type SortOrder = 'asc' | 'desc';

export interface ${config.nameCapitalized}Sort {
  field: ${config.nameCapitalized}SortField;
  order: SortOrder;
}
`,

  config: (config) => `/**
 * Configuration du module ${config.name}
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const ${config.id}ModuleConfig: ModuleConfig = {
  id: '${config.id}',
  name: '${config.name}',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'DOSSIERS',
        items: [
          { id: 'tous', label: 'Tous les ${config.namePlural}', icon: 'Inbox', badge: 0 },
          { id: 'actifs', label: 'Actifs', icon: 'Circle', badge: 0 },
          { id: 'archives', label: 'Archivés', icon: 'Archive' },
        ],
      },
    ],
  },

  quickActions: {
    primary: { label: 'Nouveau ${config.name}', icon: 'Plus' },
    secondary: [
      { id: 'edit', label: 'Modifier', icon: 'Edit', disabledWithoutSelection: true },
      { id: 'delete', label: 'Supprimer', icon: 'Trash2', disabledWithoutSelection: true },
    ],
  },

  filterBar: {
    views: [
      { id: 'tous', label: 'Tous', badge: 0 },
      { id: 'actifs', label: 'Actifs', badge: 0, color: 'blue' },
    ],
    quickFilters: [
      { id: 'recent', icon: 'Clock', label: 'Récents' },
    ],
    sort: [
      { id: 'date', label: 'Date', defaultOrder: 'desc' },
      { id: 'titre', label: 'Titre' },
    ],
  },
};
`,

  loading: (config) => `'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ${config.nameCapitalized}Loading() {
  return (
    <div className="flex h-full gap-0 animate-pulse">
      <div className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 px-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr]">
          <div className="border-r border-slate-200 dark:border-slate-800 p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <div className="hidden md:flex items-center justify-center p-8">
            <Skeleton className="h-32 w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
`,

  error: (config) => `'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ${config.nameCapitalized}Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <AlertCircle className="h-12 w-12 text-rose-500" />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Erreur chargement ${config.namePlural}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
        {error.message}
      </p>
      <Button variant="outline" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
`,

  api: (config) => `/**
 * API client module ${config.name}
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const ${config.id}Api = {
  async get${config.namePluralCapitalized}(params) {
    const qs = new URLSearchParams(params);
    const res = await fetch(\`\${API_BASE}/${config.namePlural}?\${qs}\`);
    if (!res.ok) throw new Error('Erreur récupération');
    return res.json();
  },

  async get${config.nameCapitalized}(id) {
    const res = await fetch(\`\${API_BASE}/${config.namePlural}/\${id}\`);
    if (!res.ok) throw new Error('Non trouvé');
    return res.json();
  },

  async create${config.nameCapitalized}(data) {
    const res = await fetch(\`\${API_BASE}/${config.namePlural}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur création');
    return res.json();
  },

  async update${config.nameCapitalized}(id, data) {
    const res = await fetch(\`\${API_BASE}/${config.namePlural}/\${id}\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    return res.json();
  },

  async delete${config.nameCapitalized}(id) {
    const res = await fetch(\`\${API_BASE}/${config.namePlural}/\${id}\`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur suppression');
  },
};
`,

  hooks: (config) => `/**
 * Hooks React Query pour le module ${config.name}
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ${config.id}Api } from '@/lib/api/${config.id}';

const QUERY_KEY = ['${config.id}'];

export function use${config.namePluralCapitalized}(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params],
    queryFn: () => ${config.id}Api.get${config.namePluralCapitalized}(params),
  });
}

export function use${config.nameCapitalized}(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => ${config.id}Api.get${config.nameCapitalized}(id!),
    enabled: !!id,
  });
}

export function useCreate${config.nameCapitalized}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => ${config.id}Api.create${config.nameCapitalized}(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdate${config.nameCapitalized}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      ${config.id}Api.update${config.nameCapitalized}(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: [...QUERY_KEY, id] }),
  });
}

export function useDelete${config.nameCapitalized}() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ${config.id}Api.delete${config.nameCapitalized}(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
`,
};

async function prompt(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    rl.question(`${question}${defaultValue ? ` (${defaultValue})` : ''}: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let id = args.find((a) => a.startsWith('--id='))?.slice(5);
  let name = args.find((a) => a.startsWith('--name='))?.slice(7).replace(/^["']|["']$/g, '');

  if (!id || !name) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    id = id || (await prompt(rl, "ID du module (kebab-case, ex: mes-demandes)", ""));
    name = name || (await prompt(rl, "Nom singulier", id.replace(/-/g, ' ')));
    rl.close();
  }

  if (!id || !/^[a-z0-9-]+$/.test(id)) {
    console.error('❌ ID invalide (ex: mes-demandes)');
    process.exit(1);
  }

  const namePlural = name.endsWith('s') ? name : name + 's';
  const config = {
    id,
    name,
    namePlural,
    nameCapitalized: capitalize(name),
    namePluralCapitalized: capitalize(namePlural),
  };

  const base = path.join(process.cwd());
  const dirs = {
    page: path.join(base, 'app', '(portals)', 'maitre-ouvrage', id, 'outlook'),
    types: path.join(base, 'src', 'lib', 'types'),
    config: path.join(base, 'src', 'lib', 'config', 'modules'),
    api: path.join(base, 'src', 'lib', 'api'),
    components: path.join(base, 'src', 'components', 'bmo', id),
    hooks: path.join(base, 'src', 'hooks', id),
  };

  console.log('\n🚀 Génération du module', config.name, '...\n');

  try {
    await fs.mkdir(dirs.page, { recursive: true });
    await fs.writeFile(path.join(dirs.page, 'page.tsx'), templates.page(config));
    await fs.writeFile(path.join(dirs.page, 'loading.tsx'), templates.loading(config));
    await fs.writeFile(path.join(dirs.page, 'error.tsx'), templates.error(config));

    await fs.mkdir(dirs.types, { recursive: true });
    await fs.writeFile(path.join(dirs.types, `${id}.types.ts`), templates.types(config));

    await fs.mkdir(dirs.config, { recursive: true });
    await fs.writeFile(path.join(dirs.config, `${id}.config.ts`), templates.config(config));

    await fs.mkdir(dirs.api, { recursive: true });
    await fs.writeFile(path.join(dirs.api, `${id}.ts`), templates.api(config));

    await fs.mkdir(dirs.components, { recursive: true });
    const comps = [`${config.nameCapitalized}ListRow`, `${config.nameCapitalized}DetailPanel`, `Create${config.nameCapitalized}Dialog`];
    for (const comp of comps) {
      await fs.writeFile(
        path.join(dirs.components, `${comp}.tsx`),
        `'use client';\n\n// TODO: Implémenter ${comp}\n\nexport function ${comp}() {\n  return <div>${comp}</div>;\n}\n`
      );
    }

    await fs.mkdir(dirs.hooks, { recursive: true });
    await fs.writeFile(path.join(dirs.hooks, `use${config.namePluralCapitalized}.ts`), templates.hooks(config));

    console.log('✅ Module généré avec succès!\n');
    console.log('📁 Fichiers créés:');
    console.log(`   ✓ app/(portals)/maitre-ouvrage/${id}/outlook/page.tsx`);
    console.log(`   ✓ app/(portals)/maitre-ouvrage/${id}/outlook/loading.tsx`);
    console.log(`   ✓ app/(portals)/maitre-ouvrage/${id}/outlook/error.tsx`);
    console.log(`   ✓ src/lib/types/${id}.types.ts`);
    console.log(`   ✓ src/lib/config/modules/${id}.config.ts`);
    console.log(`   ✓ src/lib/api/${id}.ts`);
    console.log(`   ✓ src/components/bmo/${id}/ (${comps.length} composants)`);
    console.log(`   ✓ src/hooks/${id}/use${config.namePluralCapitalized}.ts\n`);
    console.log('⚠️  Prochaines étapes:');
    console.log('   1. Implémenter les composants générés');
    console.log('   2. Connecter l\'API');
    console.log('   3. Tester la route /maitre-ouvrage/' + id + '/outlook');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

main();
