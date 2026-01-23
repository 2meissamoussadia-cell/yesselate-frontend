#!/usr/bin/env node
/**
 * SCAN_PROJECT - Scanner complet du projet ERP BTP
 * Génère inventory.json et component-domain-map.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = PROJECT_ROOT;

// Domaines métier identifiés
const DOMAINS = {
  'chantiers': { label: 'Gestion de Chantiers', priority: 'high' },
  'demandes': { label: 'Gestion des Demandes RH', priority: 'high' },
  'validation-bc': { label: 'Validation Bons de Commande', priority: 'high' },
  'blocked': { label: 'Dossiers Bloqués', priority: 'high' },
  'governance': { label: 'Gouvernance', priority: 'medium' },
  'analytics': { label: 'Analytics', priority: 'medium' },
  'clients': { label: 'Gestion Clients', priority: 'medium' },
  'delegations': { label: 'Délégations', priority: 'medium' },
  'arbitrages': { label: 'Arbitrages', priority: 'low' },
  'calendrier': { label: 'Calendrier', priority: 'low' },
  'documents': { label: 'Documents', priority: 'low' },
  'finances': { label: 'Finances', priority: 'medium' },
  'dashboard': { label: 'Dashboard', priority: 'high' }
};

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relativePath = path.relative(PROJECT_ROOT, fullPath);
      
      // Ignorer certains dossiers
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === '.next' ||
          entry.name === 'coverage' ||
          entry.name === 'dist' ||
          entry.name === 'build') {
        continue;
      }
      
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          results.push(relativePath);
        }
      }
    }
  }
  
  walk(dir);
  return results;
}

function categorizeFile(filePath) {
  const categories = {
    pages: [],
    components: [],
    services: [],
    stores: [],
    hooks: [],
    types: [],
    utils: [],
    api: []
  };
  
  if (filePath.includes('/app/') && filePath.includes('/page.tsx')) {
    categories.pages.push(filePath);
  } else if (filePath.includes('/components/')) {
    categories.components.push(filePath);
  } else if (filePath.includes('/services/') || filePath.includes('/api/')) {
    if (filePath.includes('/app/api/')) {
      categories.api.push(filePath);
    } else {
      categories.services.push(filePath);
    }
  } else if (filePath.includes('/stores/')) {
    categories.stores.push(filePath);
  } else if (filePath.includes('/hooks/')) {
    categories.hooks.push(filePath);
  } else if (filePath.includes('/types/') || filePath.endsWith('.types.ts')) {
    categories.types.push(filePath);
  } else if (filePath.includes('/utils/')) {
    categories.utils.push(filePath);
  }
  
  return categories;
}

function mapComponentToDomain(filePath) {
  const domainMap = {};
  
  for (const [domainId, domainInfo] of Object.entries(DOMAINS)) {
    const patterns = [
      domainId,
      domainId.replace('-', ''),
      domainId.replace('-', '_')
    ];
    
    const lowerPath = filePath.toLowerCase();
    if (patterns.some(pattern => lowerPath.includes(pattern))) {
      if (!domainMap[domainId]) {
        domainMap[domainId] = {
          ...domainInfo,
          files: []
        };
      }
      domainMap[domainId].files.push(filePath);
    }
  }
  
  return domainMap;
}

function generateInventory() {
  console.log('🔍 Scanning project structure...');
  
  const allFiles = [
    ...scanDirectory(path.join(PROJECT_ROOT, 'app')),
    ...scanDirectory(path.join(PROJECT_ROOT, 'src')),
    ...scanDirectory(path.join(PROJECT_ROOT, 'lib'))
  ];
  
  const categories = {
    pages: [],
    components: [],
    services: [],
    stores: [],
    hooks: [],
    types: [],
    utils: [],
    api: []
  };
  
  allFiles.forEach(file => {
    const cat = categorizeFile(file);
    Object.keys(categories).forEach(key => {
      if (cat[key]) {
        categories[key].push(...cat[key]);
      }
    });
  });
  
  // Lire package.json pour les dépendances
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
  );
  
  const inventory = {
    project: {
      name: packageJson.name || 'yesselate-frontend',
      version: packageJson.version || '0.1.0',
      type: 'Next.js Application',
      framework: packageJson.dependencies?.next || 'unknown',
      react: packageJson.dependencies?.react || 'unknown',
      typescript: packageJson.dependencies?.typescript || 'unknown',
      buildTool: 'Turbopack',
      lastScan: new Date().toISOString().split('T')[0]
    },
    packageManager: {
      type: fs.existsSync(path.join(PROJECT_ROOT, 'package-lock.json')) ? 'npm' : 
            fs.existsSync(path.join(PROJECT_ROOT, 'yarn.lock')) ? 'yarn' : 
            fs.existsSync(path.join(PROJECT_ROOT, 'pnpm-lock.yaml')) ? 'pnpm' : 'unknown',
      lockFile: fs.existsSync(path.join(PROJECT_ROOT, 'package-lock.json')) ? 'package-lock.json' : 
                fs.existsSync(path.join(PROJECT_ROOT, 'yarn.lock')) ? 'yarn.lock' : 
                fs.existsSync(path.join(PROJECT_ROOT, 'pnpm-lock.yaml')) ? 'pnpm-lock.yaml' : null
    },
    dependencies: {
      core: {
        next: packageJson.dependencies?.next || packageJson.devDependencies?.next,
        react: packageJson.dependencies?.react || packageJson.devDependencies?.react,
        'react-dom': packageJson.dependencies?.['react-dom'] || packageJson.devDependencies?.['react-dom'],
        typescript: packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript
      },
      stateManagement: {
        zustand: packageJson.dependencies?.zustand,
        '@tanstack/react-query': packageJson.dependencies?.['@tanstack/react-query']
      },
      ui: {
        '@radix-ui/react-dialog': packageJson.dependencies?.['@radix-ui/react-dialog'],
        '@radix-ui/react-tooltip': packageJson.dependencies?.['@radix-ui/react-tooltip'],
        'lucide-react': packageJson.dependencies?.['lucide-react'],
        'framer-motion': packageJson.dependencies?.['framer-motion'],
        tailwindcss: packageJson.dependencies?.tailwindcss
      },
      forms: {
        'react-hook-form': packageJson.dependencies?.['react-hook-form'],
        '@hookform/resolvers': packageJson.dependencies?.['@hookform/resolvers'],
        zod: packageJson.dependencies?.zod
      }
    },
    structure: {
      pages: {
        count: categories.pages.length,
        files: categories.pages.slice(0, 50) // Limiter pour la lisibilité
      },
      components: {
        count: categories.components.length,
        files: categories.components.slice(0, 100)
      },
      services: {
        count: categories.services.length,
        files: categories.services
      },
      stores: {
        count: categories.stores.length,
        files: categories.stores
      },
      hooks: {
        count: categories.hooks.length,
        files: categories.hooks
      },
      apiRoutes: {
        count: categories.api.length,
        files: categories.api.slice(0, 50)
      }
    },
    metrics: {
      totalFiles: allFiles.length,
      totalLines: 0, // Calculé séparément si nécessaire
      testFiles: allFiles.filter(f => f.includes('.test.') || f.includes('.spec.')).length,
      coverage: 'unknown'
    }
  };
  
  return inventory;
}

function generateComponentDomainMap() {
  console.log('🗺️  Generating component-domain map...');
  
  const allFiles = [
    ...scanDirectory(path.join(PROJECT_ROOT, 'app')),
    ...scanDirectory(path.join(PROJECT_ROOT, 'src')),
    ...scanDirectory(path.join(PROJECT_ROOT, 'lib'))
  ];
  
  const domainMap = {};
  
  // Initialiser les domaines
  Object.keys(DOMAINS).forEach(domainId => {
    domainMap[domainId] = {
      ...DOMAINS[domainId],
      pages: [],
      components: [],
      services: [],
      stores: [],
      apiRoutes: [],
      businessLogic: [],
      domainExtraction: {
        status: 'none',
        needsExtraction: true,
        targetPath: `src/domain/${domainId}`
      },
      tests: {
        unit: 0,
        e2e: 0,
        coverage: '0%'
      }
    };
  });
  
  // Mapper les fichiers aux domaines
  allFiles.forEach(file => {
    const lowerPath = file.toLowerCase();
    
    for (const [domainId, domainInfo] of Object.entries(DOMAINS)) {
      const patterns = [
        `/${domainId}/`,
        `/${domainId.replace('-', '')}/`,
        `/${domainId.replace('-', '_')}/`,
        domainId,
        domainInfo.label.toLowerCase().replace(/\s+/g, '-')
      ];
      
      if (patterns.some(pattern => lowerPath.includes(pattern))) {
        if (file.includes('/app/') && file.includes('/page.tsx')) {
          domainMap[domainId].pages.push(file);
        } else if (file.includes('/components/')) {
          domainMap[domainId].components.push(file);
        } else if (file.includes('/services/') && !file.includes('/app/api/')) {
          domainMap[domainId].services.push(file);
        } else if (file.includes('/stores/')) {
          domainMap[domainId].stores.push(file);
        } else if (file.includes('/app/api/')) {
          domainMap[domainId].apiRoutes.push(file);
        } else if (file.includes('/domain/') || file.includes('/business/')) {
          domainMap[domainId].businessLogic.push(file);
        }
      }
    }
  });
  
  const metadata = {
    version: '2.1.0',
    lastScan: new Date().toISOString().split('T')[0],
    scanner: 'cursor-ai-scan-v2',
    totalDomains: Object.keys(domainMap).length,
    totalPages: Object.values(domainMap).reduce((sum, d) => sum + d.pages.length, 0),
    totalComponents: Object.values(domainMap).reduce((sum, d) => sum + d.components.length, 0),
    totalServices: Object.values(domainMap).reduce((sum, d) => sum + d.services.length, 0),
    totalStores: Object.values(domainMap).reduce((sum, d) => sum + d.stores.length, 0)
  };
  
  return {
    metadata,
    domains: domainMap
  };
}

// Exécution
try {
  console.log('🚀 Starting project scan...\n');
  
  const inventory = generateInventory();
  const componentDomainMap = generateComponentDomainMap();
  
  // Écrire les fichiers
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'inventory.json'),
    JSON.stringify(inventory, null, 2),
    'utf8'
  );
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'component-domain-map.json'),
    JSON.stringify(componentDomainMap, null, 2),
    'utf8'
  );
  
  console.log('\n✅ Scan completed successfully!');
  console.log(`📊 Inventory: ${inventory.structure.pages.count} pages, ${inventory.structure.components.count} components`);
  console.log(`🗺️  Domain map: ${componentDomainMap.metadata.totalDomains} domains mapped`);
  console.log(`\n📁 Files generated:`);
  console.log(`   - ${path.join(OUTPUT_DIR, 'inventory.json')}`);
  console.log(`   - ${path.join(OUTPUT_DIR, 'component-domain-map.json')}`);
  
} catch (error) {
  console.error('❌ Error during scan:', error);
  process.exit(1);
}

