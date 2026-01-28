/**
 * Script pour identifier les composants manquants
 * Analyse dashboardNavigationConfig et compare avec dashboardRegistry
 */

const fs = require('fs');
const path = require('path');

// Structure de navigation manuelle basée sur dashboardNavigationConfig.ts
const navigationStructure = {
  overview: {
    summary: ['dashboard'],
    kpis: ['highlights', 'projets', 'demandes', 'budget'],
    alerts: ['actives', 'urgentes'],
    activity: ['timeline', 'notifications'],
  },
  performance: {
    indicators: ['synthese', 'projets', 'demandes', 'budget'],
    validation: ['en-attente', 'validees', 'rejetees', 'circuit'],
    budget: ['consommation', 'restant', 'previsions', 'analyse'],
    delays: ['critiques', 'moyens', 'analyse-causes'],
    comparison: ['bureaux', 'projets', 'periode', 'benchmarking'],
    achats: ['dashboard', 'trends', 'fournisseurs', 'open-orders'],
    stocks: ['overview', 'trends'],
    materiel: ['overview'],
    compliance: ['dashboard', 'documents', 'backlog', 'lots'],
    reporting: ['dashboard', 'tendances', 'bureaux', 'chantiers'],
    bureaux: ['all', 'bmo', 'bf', 'bj', 'bct', 'bop', 'bcg', 'bja', 'brc', 'bpl', 'bex', 'comparaison'],
    trends: ['mensuelles', 'trimestrielles', 'annuelles'],
  },
  actions: {
    inbox: ['urgentes', 'aujourdhui', 'semaine', 'personnalisees'],
    type: ['contrats', 'arbitrages', 'paiements', 'bc', 'autres'],
    priority: ['critique', 'haute', 'moyenne'],
    blocked: ['blocages', 'escalades', 'analyse'],
    assigned: ['moi', 'equipe', 'non-assignees'],
    history: ['recentes', 'anciennes', 'archivees'],
  },
  risks: {
    critical: ['risques', 'alertes'],
    warnings: ['moyens', 'faibles'],
    type: ['paiements-retard', 'contrats-expires', 'blocages', 'alertes-systeme'],
    analyse: ['tendances', 'causes-racines', 'previsions'],
    'actions-correctives': ['en-cours', 'planifiees'],
  },
  decisions: {
    pending: ['urgentes', 'normales', 'planifiees'],
    executed: ['recentes', 'anciennes', 'par-type'],
    timeline: ['chronologique', 'par-type', 'par-auteur'],
    audit: ['traces', 'rapports', 'conformite'],
    modeles: ['substitution', 'delegation', 'arbitrage'],
  },
  realtime: {
    monitoring: ['vue-globale', 'metriques', 'performance'],
    alerts: ['actives', 'resolues', 'historique'],
    notifications: ['non-lues', 'toutes', 'preferences'],
    sync: ['etat', 'historique', 'configuration'],
  },
  administration: {
    settings: ['dashboard', 'kpis', 'notifications'],
    users: ['liste', 'permissions'],
    permissions: ['roles', 'acces'],
    logs: ['activite', 'systeme'],
  },
};

// Générer tous les routes depuis la structure
const allRoutes = new Set();
Object.keys(navigationStructure).forEach(main => {
  Object.keys(navigationStructure[main]).forEach(sub => {
    navigationStructure[main][sub].forEach(leaf => {
      const routeKey = `${main}::${sub}::${leaf}`;
      allRoutes.add(routeKey);
    });
  });
});

// Lire le registry
const registryPath = path.join(__dirname, '..', 'src', 'modules', 'dashboard', 'registry', 'dashboardRegistry.tsx');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extraire les routes existantes du registry
const existingRoutes = new Set();
const registryRoutePattern = /'([a-z]+::[a-z-]+::[a-z-]+)':/g;
let registryMatch;
while ((registryMatch = registryRoutePattern.exec(registryContent)) !== null) {
  existingRoutes.add(registryMatch[1]);
}

// Trouver les routes manquantes
const missingRoutes = Array.from(allRoutes).filter(route => !existingRoutes.has(route));

console.log(`\n📊 Analyse des composants manquants\n`);
console.log(`Total routes dans la config: ${allRoutes.size}`);
console.log(`Total routes dans le registry: ${existingRoutes.size}`);
console.log(`Routes manquantes: ${missingRoutes.length}\n`);

if (missingRoutes.length > 0) {
  console.log('🚨 Composants manquants:\n');
  
  // Grouper par catégorie principale
  const grouped = {};
  missingRoutes.forEach(route => {
    const [main, sub, leaf] = route.split('::');
    if (!grouped[main]) grouped[main] = {};
    if (!grouped[main][sub]) grouped[main][sub] = [];
    grouped[main][sub].push({ route, leaf });
  });
  
  let totalMissing = 0;
  Object.keys(grouped).sort().forEach(main => {
    console.log(`\n### ${main.toUpperCase()}`);
    Object.keys(grouped[main]).sort().forEach(sub => {
      console.log(`  ${sub}:`);
      grouped[main][sub].forEach(({ route, leaf }) => {
        console.log(`    - ${route} (${leaf})`);
        totalMissing++;
      });
    });
  });
  
  console.log(`\n\n📝 Total: ${totalMissing} composants manquants\n`);
  console.log(`Pour générer ces composants:\n`);
  console.log(`node scripts/generate-all-dashboard-components.js\n`);
  
  // Générer la liste pour le script de génération
  console.log(`\n📋 Liste des composants à générer:\n`);
  missingRoutes.forEach(route => {
    const [main, sub, leaf] = route.split('::');
    const componentName = `${capitalize(main)}${capitalize(sub)}${capitalize(leaf)}Page`;
    console.log(`  ['${componentName}', '${route}', '${capitalize(sub)} ${capitalize(leaf)}'],`);
  });
} else {
  console.log('✅ Tous les composants sont présents dans le registry!');
}

function capitalize(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}
