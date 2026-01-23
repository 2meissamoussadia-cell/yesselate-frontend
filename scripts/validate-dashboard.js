#!/usr/bin/env node

/**
 * Script de validation du Dashboard
 * Vérifie que tous les composants critiques sont présents et fonctionnels
 * 
 * Usage: node scripts/validate-dashboard.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log(`✅ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`❌ ${description}: ${filePath} (MANQUANT)`, 'red');
    return false;
  }
}

function checkFileContent(filePath, searchString, description) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`❌ ${description}: Fichier non trouvé`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const found = content.includes(searchString);
  
  if (found) {
    log(`✅ ${description}: Trouvé dans ${filePath}`, 'green');
    return true;
  } else {
    log(`⚠️  ${description}: Non trouvé dans ${filePath}`, 'yellow');
    return false;
  }
}

function main() {
  log('\n🔍 VALIDATION DU DASHBOARD\n', 'blue');
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  // 1. Vérifier les fichiers critiques
  log('\n📁 Vérification des fichiers critiques:', 'blue');
  
  const criticalFiles = [
    ['app/(portals)/maitre-ouvrage/dashboard/page.tsx', 'Page Dashboard'],
    ['src/modules/dashboard/components/DashboardKPIBar.tsx', 'DashboardKPIBar'],
    ['src/modules/dashboard/components/DashboardViewRouter.tsx', 'DashboardViewRouter'],
    ['src/modules/dashboard/navigation/DashboardSidebar.tsx', 'DashboardSidebar'],
    ['src/modules/dashboard/navigation/DashboardSubNavigation.tsx', 'DashboardSubNavigation'],
    ['src/lib/stores/dashboardNavigationStore.ts', 'Store Navigation'],
    ['src/lib/stores/dashboardCommandCenterStore.ts', 'Store Command Center'],
    ['src/components/features/bmo/dashboard/command-center/DashboardModals.tsx', 'DashboardModals'],
    ['src/modules/dashboard/utils/routeValidation.ts', 'Route Validation'],
    ['src/modules/dashboard/components/shared/getTrendIcon.tsx', 'TrendIcon'],
  ];
  
  criticalFiles.forEach(([filePath, description]) => {
    if (checkFileExists(filePath, description)) {
      passed++;
    } else {
      failed++;
    }
  });
  
  // 2. Vérifier les modules créés
  log('\n📦 Vérification des modules créés:', 'blue');
  
  const createdModules = [
    ['src/modules/dashboard/components/DashboardCommandCenterPage.tsx', 'DashboardCommandCenterPage'],
    ['src/modules/dashboard/components/DashboardUrlSync.tsx', 'DashboardUrlSync'],
    ['src/modules/dashboard/components/DynamicSidebar.tsx', 'DynamicSidebar'],
    ['src/modules/dashboard/components/DynamicSubnav.tsx', 'DynamicSubnav'],
    ['src/modules/dashboard/hooks/useDashboardNavigationSafe.ts', 'useDashboardNavigationSafe'],
    ['src/modules/dashboard/components/DashboardBreadcrumbs.tsx', 'DashboardBreadcrumbs'],
  ];
  
  createdModules.forEach(([filePath, description]) => {
    if (checkFileExists(filePath, description)) {
      passed++;
    } else {
      warnings++;
    }
  });
  
  // 3. Vérifier les corrections critiques
  log('\n🔧 Vérification des corrections critiques:', 'blue');
  
  // 3.1 getServerSnapshot mémorisé
  if (checkFileContent(
    'src/lib/stores/dashboardNavigationStore.ts',
    'const getServerSnapshot = () => serverSnapshot',
    'getServerSnapshot mémorisé'
  )) {
    passed++;
  } else {
    failed++;
  }
  
  // 3.2 Fonction migrate
  if (checkFileContent(
    'src/lib/stores/dashboardNavigationStore.ts',
    'function migrate',
    'Fonction migrate'
  )) {
    passed++;
  } else {
    failed++;
  }
  
  // 3.3 TrendIcon avec ArrowUpRight
  if (checkFileContent(
    'src/modules/dashboard/components/shared/getTrendIcon.tsx',
    'ArrowUpRight',
    'TrendIcon avec ArrowUpRight'
  )) {
    passed++;
  } else {
    failed++;
  }
  
  // 3.4 routeValidation utilisé
  if (checkFileContent(
    'src/modules/dashboard/components/DashboardViewRouter.tsx',
    'getRouteComponent',
    'routeValidation utilisé'
  )) {
    passed++;
  } else {
    failed++;
  }
  
  // 3.5 AppImage créé
  if (checkFileExists('src/components/ui/AppImage.tsx', 'AppImage')) {
    passed++;
  } else {
    warnings++;
  }
  
  // 4. Vérifier les hooks
  log('\n🪝 Vérification des hooks:', 'blue');
  
  const hooks = [
    ['src/modules/dashboard/hooks/useKPIFilter.ts', 'useKPIFilter'],
    ['src/modules/dashboard/hooks/useDashboardRefresh.ts', 'useDashboardRefresh'],
    ['src/modules/dashboard/hooks/useKPINotifications.ts', 'useKPINotifications'],
    ['src/modules/dashboard/hooks/useAutoRefresh.ts', 'useAutoRefresh'],
  ];
  
  hooks.forEach(([filePath, description]) => {
    if (checkFileExists(filePath, description)) {
      passed++;
    } else {
      warnings++;
    }
  });
  
  // 5. Résumé
  log('\n📊 RÉSUMÉ:', 'blue');
  log(`✅ Passés: ${passed}`, 'green');
  log(`❌ Échoués: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`⚠️  Avertissements: ${warnings}`, warnings > 0 ? 'yellow' : 'green');
  
  const total = passed + failed + warnings;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  log(`\n📈 Taux de réussite: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
  
  if (failed > 0) {
    log('\n❌ Des fichiers critiques sont manquants. Veuillez les créer.', 'red');
    process.exit(1);
  } else if (warnings > 0) {
    log('\n⚠️  Certains fichiers optionnels sont manquants. Vérifiez si nécessaire.', 'yellow');
    process.exit(0);
  } else {
    log('\n✅ Tous les fichiers critiques sont présents!', 'green');
    process.exit(0);
  }
}

main();
