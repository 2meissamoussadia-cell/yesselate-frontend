/**
 * Script de génération de composants Dashboard
 * Usage: node scripts/generate-dashboard-component.js <ComponentName> <routeKey>
 * 
 * Exemple: node scripts/generate-dashboard-component.js ValidationsValideesPage "performance::validation::validees"
 */

const fs = require('fs');
const path = require('path');

const [componentName, routeKey] = process.argv.slice(2);

if (!componentName || !routeKey) {
  console.error('Usage: node generate-dashboard-component.js <ComponentName> <routeKey>');
  console.error('Exemple: node generate-dashboard-component.js ValidationsValideesPage "performance::validation::validees"');
  process.exit(1);
}

const componentTemplate = `/**
 * Page ${componentName.replace(/Page$/, '')}
 * TODO: Ajouter description
 */

'use client';

import React, { memo } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardPanel,
  KPICard,
  type KPICardData,
  MockDataIndicator,
} from '../shared';
import { EmptyState } from './EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';

export const ${componentName} = memo(function ${componentName}() {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // TODO: Charger les données depuis l'API
  const data = [];
  const stats = {
    total: 0,
  };

  const kpis: KPICardData[] = [
    {
      id: 'total',
      label: 'Total',
      value: stats.total,
      color: 'blue',
      trend: '+0%',
    },
  ];

  return (
    <DashboardPageLayout>
      <MockDataIndicator />
      
      <DashboardSection title="${componentName.replace(/Page$/, '')}" description="TODO: Ajouter description">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher..."
              />
              <ExportButton onExportCSV={() => {}} onExportJSON={() => {}} />
            </div>
          </div>

          {data.length === 0 ? (
            <EmptyState
              title="Aucun élément"
              description="Il n'y a actuellement aucun élément disponible."
              icon={FileText}
              variant="info"
            />
          ) : (
            <div className="space-y-3">
              {/* TODO: Implémenter la liste */}
              <p className="text-slate-400 text-sm">Liste à implémenter</p>
            </div>
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
`;

const viewsDir = path.join(__dirname, '..', 'src', 'modules', 'dashboard', 'components', 'views');
const componentPath = path.join(viewsDir, `${componentName}.tsx`);

// Créer le fichier du composant
fs.writeFileSync(componentPath, componentTemplate, 'utf8');
console.log(`✅ Composant créé: ${componentPath}`);

// Mettre à jour index.ts
const indexPath = path.join(viewsDir, 'index.ts');
let indexContent = fs.readFileSync(indexPath, 'utf8');

if (!indexContent.includes(`export { ${componentName} }`)) {
  const exportLine = `export { ${componentName} } from './${componentName}';`;
  indexContent = indexContent.trim() + '\n' + exportLine + '\n';
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`✅ Export ajouté dans index.ts`);
}

// Générer l'entrée du registry
const [main, sub, leaf] = routeKey.split('::');
const registryEntry = `
  '${routeKey}': {
    id: '${routeKey.replace(/::/g, '-')}',
    title: '${componentName.replace(/Page$/, '')}',
    ttl: 60_000,
    loader: async () => ({ key: '${routeKey}', fetchedAt: Date.now(), data: {} }),
    render: () => {
      const ${componentName} = React.lazy(() => import('../components/views/${componentName}').then(m => ({ default: m.${componentName} })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <${componentName} />
        </React.Suspense>
      );
    },
  },`;

console.log('\n📋 Entrée à ajouter dans dashboardRegistry.tsx:');
console.log(registryEntry);

console.log('\n✅ Génération terminée!');
console.log(`   - Composant: ${componentName}.tsx`);
console.log(`   - Route: ${routeKey}`);
console.log(`   - N'oubliez pas d'ajouter l'entrée dans dashboardRegistry.tsx`);
