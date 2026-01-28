/**
 * Script pour ajouter automatiquement les entrées au registry
 * Usage: node scripts/add-registry-entries.js
 * 
 * Lit les composants générés et ajoute les entrées manquantes au registry
 */

const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '..', 'src', 'modules', 'dashboard', 'registry', 'dashboardRegistry.tsx');
const viewsDir = path.join(__dirname, '..', 'src', 'modules', 'dashboard', 'components', 'views');

// Liste des composants à ajouter (routeKey, componentName, title)
const componentsToAdd = [
  ['performance::trends::mensuelles', 'TrendsMensuellesPage', 'Tendances Mensuelles'],
  ['performance::trends::trimestrielles', 'TrendsTrimestriellesPage', 'Tendances Trimestrielles'],
  ['performance::trends::annuelles', 'TrendsAnnuellesPage', 'Tendances Annuelles'],
  ['actions::type::contrats', 'ActionsTypeContratsPage', 'Actions Contrats'],
  ['actions::type::arbitrages', 'ActionsTypeArbitragesPage', 'Actions Arbitrages'],
  ['actions::type::paiements', 'ActionsTypePaiementsPage', 'Actions Paiements'],
  ['actions::type::bc', 'ActionsTypeBcPage', 'Actions BC'],
  ['actions::type::autres', 'ActionsTypeAutresPage', 'Actions Autres'],
  ['actions::priority::critique', 'ActionsPriorityCritiquePage', 'Actions Priorité Critique'],
  ['actions::priority::haute', 'ActionsPriorityHautePage', 'Actions Priorité Haute'],
  ['actions::priority::moyenne', 'ActionsPriorityMoyennePage', 'Actions Priorité Moyenne'],
  ['actions::blocked::blocages', 'ActionsBlockedBlocagesPage', 'Actions Blocages'],
  ['actions::blocked::escalades', 'ActionsBlockedEscaladesPage', 'Actions Escalades'],
  ['actions::blocked::analyse', 'ActionsBlockedAnalysePage', 'Analyse des Blocages'],
  ['actions::assigned::moi', 'ActionsAssignedMoiPage', 'Actions À Moi'],
  ['actions::assigned::equipe', 'ActionsAssignedEquipePage', 'Actions À Mon Équipe'],
  ['actions::assigned::non-assignees', 'ActionsAssignedNonAssigneesPage', 'Actions Non Assignées'],
  ['actions::history::recentes', 'ActionsHistoryRecentPage', 'Actions Récentes'],
  ['actions::history::anciennes', 'ActionsHistoryAnciennesPage', 'Actions Anciennes'],
  ['actions::history::archivees', 'ActionsHistoryArchiveesPage', 'Actions Archivées'],
];

let registryContent = fs.readFileSync(registryPath, 'utf8');

// Vérifier quelles entrées existent déjà
const existingEntries = new Set();
const entryPattern = /'([^']+)':\s*\{/g;
let match;
while ((match = entryPattern.exec(registryContent)) !== null) {
  existingEntries.add(match[1]);
}

// Générer les entrées à ajouter
const entriesToAdd = componentsToAdd
  .filter(([routeKey]) => !existingEntries.has(routeKey))
  .map(([routeKey, componentName, title]) => {
    const id = routeKey.replace(/::/g, '-');
    return `  '${routeKey}': {
    id: '${id}',
    title: '${title}',
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
  });

if (entriesToAdd.length === 0) {
  console.log('✅ Toutes les entrées sont déjà présentes dans le registry');
  process.exit(0);
}

// Trouver la position avant la fermeture du registry
const lastBraceIndex = registryContent.lastIndexOf('};');
if (lastBraceIndex === -1) {
  console.error('❌ Impossible de trouver la fermeture du registry');
  process.exit(1);
}

// Insérer les nouvelles entrées
const beforeClosing = registryContent.substring(0, lastBraceIndex);
const afterClosing = registryContent.substring(lastBraceIndex);

const newEntries = '\n' + entriesToAdd.join('\n\n') + '\n';
const updatedContent = beforeClosing + newEntries + afterClosing;

fs.writeFileSync(registryPath, updatedContent, 'utf8');

console.log(`✅ ${entriesToAdd.length} entrées ajoutées au registry`);
console.log(`   Composants ajoutés:`);
entriesToAdd.forEach((_, index) => {
  const [routeKey, componentName] = componentsToAdd.filter(([rk]) => !existingEntries.has(rk))[index];
  console.log(`   - ${componentName} (${routeKey})`);
});
