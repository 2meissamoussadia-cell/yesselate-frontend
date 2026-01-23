/**
 * Script utilitaire pour ajouter getServerSnapshot aux stores Zustand avec persist
 * 
 * Usage:
 *   npx ts-node scripts/add-getServerSnapshot-to-stores.ts
 * 
 * Ce script analyse tous les stores avec persist et génère le code getServerSnapshot
 */

import * as fs from 'fs';
import * as path from 'path';

interface StoreInfo {
  filePath: string;
  storeName: string;
  hasGetServerSnapshot: boolean;
  initialState: string;
}

function findStoresWithPersist(): StoreInfo[] {
  const storesDir = path.join(process.cwd(), 'src/lib/stores');
  
  // Fonction récursive pour trouver tous les fichiers .ts
  function findTsFiles(dir: string): string[] {
    const files: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...findTsFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorer les erreurs de lecture
    }
    return files;
  }
  
  const files = findTsFiles(storesDir);
  const stores: StoreInfo[] = [];
  
  for (const file of files) {
    const filePath = file;
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Vérifier si le fichier utilise persist
    if (content.includes('persist(')) {
      // Extraire le nom du store
      const storeMatch = content.match(/export const use(\w+)Store/);
      const storeName = storeMatch ? storeMatch[1] : 'Unknown';
      
      // Vérifier si getServerSnapshot existe déjà
      const hasGetServerSnapshot = content.includes('getServerSnapshot');
      
      // Extraire l'état initial (simplifié)
      const initialStateMatch = content.match(/(?:main|state|initialState):\s*\{[^}]*\}/);
      const initialState = initialStateMatch ? initialStateMatch[0] : '';
      
      stores.push({
        filePath,
        storeName,
        hasGetServerSnapshot,
        initialState,
      });
    }
  }
  
  return stores;
}

function generateGetServerSnapshot(storeInfo: StoreInfo): string {
  // Générer un getServerSnapshot basique
  // Note: Ceci est un template, à adapter selon chaque store
  return `
// ✅ NOUVEAU: getServerSnapshot pour SSR (évite l'erreur "should be cached")
const getServerSnapshot = () => ({
  // TODO: Adapter selon la structure du store
  // Exemple basé sur l'état initial du store
});
`;
}

function main() {
  console.log('🔍 Recherche des stores avec persist...\n');
  
  const stores = findStoresWithPersist();
  
  console.log(`📊 ${stores.length} stores trouvés avec persist\n`);
  
  const storesWithoutSnapshot = stores.filter(s => !s.hasGetServerSnapshot);
  
  console.log(`⚠️  ${storesWithoutSnapshot.length} stores sans getServerSnapshot:\n`);
  
  for (const store of storesWithoutSnapshot) {
    console.log(`  - ${store.storeName} (${path.relative(process.cwd(), store.filePath)})`);
  }
  
  console.log('\n✅ Stores déjà optimisés:\n');
  
  const storesWithSnapshot = stores.filter(s => s.hasGetServerSnapshot);
  
  for (const store of storesWithSnapshot) {
    console.log(`  ✓ ${store.storeName} (${path.relative(process.cwd(), store.filePath)})`);
  }
  
  if (storesWithoutSnapshot.length > 0) {
    console.log('\n📝 Pour ajouter getServerSnapshot, suivre ce pattern:\n');
    console.log(generateGetServerSnapshot(storesWithoutSnapshot[0]));
    console.log('\nEt ajouter dans la config persist:');
    console.log('  getServerSnapshot,');
  }
}

main();
