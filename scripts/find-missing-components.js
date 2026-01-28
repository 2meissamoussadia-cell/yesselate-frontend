/**
 * Script pour identifier les composants manquants
 * Compare dashboardNavigationConfig avec dashboardRegistry
 */

const fs = require('fs');
const path = require('path');

// Lire le fichier de configuration de navigation
const navConfigPath = path.join(__dirname, '..', 'src', 'modules', 'dashboard', 'navigation', 'dashboardNavigationConfig.ts');
const navConfigContent = fs.readFileSync(navConfigPath, 'utf8');

// Lire le registry
const registryPath = path.join(__dirname, '..', 'src', 'modules', 'dashboard', 'registry', 'dashboardRegistry.tsx');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extraire tous les routes de la configuration de navigation
const routesFromConfig = new Set();

// Pattern pour extraire les routes depuis la config
// Format: { id: 'xxx', ... } dans children
const routePattern = /children:\s*\[([\s\S]*?)\]/g;
let match;

// Extraire les routes depuis la structure de navigation
function extractRoutes(node, mainCategory, subCategory = null) {
  if (node.children) {
    node.children.forEach((child) => {
      if (child.children) {
        // C'est un sous-catégorie
        extractRoutes(child, mainCategory, child.id);
      } else {
        // C'est une feuille (route finale)
        const routeKey = `${mainCategory}::${subCategory || ''}::${child.id}`;
        routesFromConfig.add(routeKey);
      }
    });
  }
}

// Parser manuellement la structure depuis le fichier TypeScript
const mainCategories = ['overview', 'performance', 'actions', 'risks', 'decisions', 'realtime', 'administration'];

mainCategories.forEach((main) => {
  // Extraire les sous-catégories pour chaque catégorie principale
  const subPattern = new RegExp(`${main}:\\s*\\{[\\s\\S]*?children:\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const subMatch = navConfigContent.match(subPattern);
  
  if (subMatch) {
    // Extraire chaque sous-catégorie
    const subCategories = subMatch[1].match(/\{\s*id:\s*'([^']+)'[\s\S]*?children:\s*\[([\s\S]*?)\]\s*\}/g);
    
    if (subCategories) {
      subCategories.forEach((subCat) => {
        const subIdMatch = subCat.match(/id:\s*'([^']+)'/);
        if (subIdMatch) {
          const subId = subIdMatch[1];
          // Extraire les feuilles
          const leavesMatch = subCat.match(/children:\s*\[([\s\S]*?)\]/);
          if (leavesMatch) {
            const leaves = leavesMatch[1].match(/\{\s*id:\s*'([^']+)'/g);
            if (leaves) {
              leaves.forEach((leaf) => {
                const leafIdMatch = leaf.match(/id:\s*'([^']+)'/);
                if (leafIdMatch) {
                  const routeKey = `${main}::${subId}::${leafIdMatch[1]}`;
                  routesFromConfig.add(routeKey);
                }
              });
            }
          }
        }
      });
    }
  }
});

// Extraire les routes existantes du registry
const existingRoutes = new Set();
const registryRoutePattern = /'([a-z]+::[a-z-]+::[a-z-]+)':/g;
let registryMatch;
while ((registryMatch = registryRoutePattern.exec(registryContent)) !== null) {
  existingRoutes.add(registryMatch[1]);
}

// Trouver les routes manquantes
const missingRoutes = Array.from(routesFromConfig).filter(route => !existingRoutes.has(route));

console.log(`\n📊 Analyse des composants manquants\n`);
console.log(`Total routes dans la config: ${routesFromConfig.size}`);
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
  
  Object.keys(grouped).sort().forEach(main => {
    console.log(`\n### ${main.toUpperCase()}`);
    Object.keys(grouped[main]).sort().forEach(sub => {
      console.log(`  ${sub}:`);
      grouped[main][sub].forEach(({ route, leaf }) => {
        console.log(`    - ${route} (${leaf})`);
      });
    });
  });
  
  console.log(`\n\n📝 Pour générer ces composants:\n`);
  console.log(`node scripts/generate-all-dashboard-components.js\n`);
} else {
  console.log('✅ Tous les composants sont présents dans le registry!');
}
