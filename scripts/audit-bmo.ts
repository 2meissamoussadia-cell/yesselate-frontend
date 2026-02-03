#!/usr/bin/env node
/**
 * Script d'audit BMO — Analyse du projet pour la migration Outlook-like
 * Détecte composants, layouts, types, configs, doublons et recommandations
 * Usage: npx tsx scripts/audit-bmo.ts  ou  node scripts/audit-bmo.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

interface ComponentAudit {
  path: string;
  name: string;
  type: 'ui' | 'layout' | 'bmo' | 'feature';
  exports: string[];
  dependencies: string[];
  usageCount: number;
  canBeReused: boolean;
  needsUpgrade: boolean;
  conflicts: string[];
}

interface LayoutAudit extends ComponentAudit {
  type: 'layout';
}

interface TypeAudit {
  path: string;
  name: string;
  exports: string[];
}

interface ConfigAudit {
  path: string;
  name: string;
  moduleId?: string;
}

interface DuplicateReport {
  type: 'component' | 'type' | 'function';
  instances: Array<{ path: string; similarity: number }>;
  recommendation: 'merge' | 'keep-both' | 'delete';
}

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'duplication' | 'naming' | 'structure' | 'performance';
  message: string;
  autoFixable: boolean;
  fixCommand?: string;
}

interface AuditResult {
  existingComponents: ComponentAudit[];
  existingLayouts: LayoutAudit[];
  existingTypes: TypeAudit[];
  existingConfigs: ConfigAudit[];
  duplicates: DuplicateReport[];
  recommendations: Recommendation[];
}

function walkDir(dir: string, ext: string[], ignore: Set<string>): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(PROJECT_ROOT, fullPath);

    if (ignore.has(entry.name) || relative.includes('node_modules')) continue;
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, ext, ignore));
    } else if (entry.isFile() && ext.includes(path.extname(entry.name))) {
      results.push(relative);
    }
  }
  return results;
}

function extractExports(content: string): string[] {
  const exports: string[] = [];
  const exportRegex = /export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+(\w+)/g;
  let m;
  while ((m = exportRegex.exec(content)) !== null) {
    exports.push(m[1]);
  }
  const namedRegex = /export\s*\{([^}]+)\}/g;
  while ((m = namedRegex.exec(content)) !== null) {
    m[1].split(',').forEach((s) => {
      const name = s.split(/\s+as\s+/)[0].trim().split(':')[0].trim();
      if (name && name !== 'type') exports.push(name);
    });
  }
  return [...new Set(exports)];
}

function extractDependencies(content: string): string[] {
  const deps: string[] = [];
  const importRegex = /from\s+['"](@\/[^'"]+|[^'"]+)['"]/g;
  let m;
  while ((m = importRegex.exec(content)) !== null) {
    deps.push(m[1]);
  }
  return deps;
}

function determineComponentType(filePath: string): ComponentAudit['type'] {
  if (filePath.includes('/layout') || filePath.includes('Layout')) return 'layout';
  if (filePath.includes('/bmo/')) return 'bmo';
  if (filePath.includes('/features/')) return 'feature';
  if (filePath.includes('/ui/')) return 'ui';
  return 'bmo';
}

function isReusable(content: string): boolean {
  return (
    content.includes('interface') &&
    content.includes('Props') &&
    !content.includes('any') &&
    content.includes('export')
  );
}

function needsUpgrade(content: string): boolean {
  return (
    !content.includes('class ') &&
    content.includes('export') &&
    (content.includes('any') || !content.includes('Props'))
  );
}

function detectConflicts(_content: string): string[] {
  return [];
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 100;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 100;
  let d = 0;
  for (let i = 0; i < longer.length; i++) {
    if (shorter[i] !== longer[i]) d++;
  }
  return ((longer.length - d) / longer.length) * 100;
}

function arraysSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const inter = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 100 : (inter.size / union.size) * 100;
}

function calculateSimilarity(a: ComponentAudit, b: ComponentAudit): number {
  const nameSim = stringSimilarity(a.name, b.name);
  const expSim = arraysSimilarity(a.exports, b.exports);
  const depSim = arraysSimilarity(a.dependencies, b.dependencies);
  return nameSim * 0.3 + expSim * 0.4 + depSim * 0.3;
}

function countUsages(filePath: string): number {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  const baseName = path.basename(filePath, path.extname(filePath));
  let count = 0;
  const srcFiles = walkDir(path.join(PROJECT_ROOT, 'src'), ['.ts', '.tsx'], new Set(['node_modules']));
  for (const f of srcFiles) {
    try {
      const c = fs.readFileSync(path.join(PROJECT_ROOT, f), 'utf-8');
      if (c.includes(baseName) && f !== filePath) count++;
    } catch {
      /* ignore */
    }
  }
  return count;
}

async function scanComponents(): Promise<ComponentAudit[]> {
  const ignore = new Set(['node_modules', '.next', 'coverage', 'dist']);
  const files = walkDir(path.join(PROJECT_ROOT, 'src/components'), ['.tsx', '.ts'], ignore);
  const components: ComponentAudit[] = [];

  for (const file of files) {
    const fullPath = path.join(PROJECT_ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    components.push({
      path: file,
      name: path.basename(file, path.extname(file)),
      type: determineComponentType(file),
      exports: extractExports(content),
      dependencies: extractDependencies(content),
      usageCount: countUsages(file),
      canBeReused: isReusable(content),
      needsUpgrade: needsUpgrade(content),
      conflicts: detectConflicts(content),
    });
  }
  return components;
}

async function scanTypes(): Promise<TypeAudit[]> {
  const ignore = new Set(['node_modules']);
  const files = walkDir(path.join(PROJECT_ROOT, 'src/lib/types'), ['.ts'], ignore);
  const types: TypeAudit[] = [];
  for (const file of files) {
    const fullPath = path.join(PROJECT_ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    types.push({
      path: file,
      name: path.basename(file, '.ts'),
      exports: extractExports(content),
    });
  }
  return types;
}

async function scanConfigs(): Promise<ConfigAudit[]> {
  const configs: ConfigAudit[] = [];
  const modulesPath = path.join(PROJECT_ROOT, 'src/lib/config/modules');
  if (fs.existsSync(modulesPath)) {
    const files = fs.readdirSync(modulesPath).filter((f) => f.endsWith('.config.ts'));
    for (const f of files) {
      configs.push({
        path: `src/lib/config/modules/${f}`,
        name: f.replace('.config.ts', ''),
        moduleId: f.replace('.config.ts', ''),
      });
    }
  }
  return configs;
}

function detectDuplicates(components: ComponentAudit[]): DuplicateReport[] {
  const duplicates: DuplicateReport[] = [];
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const sim = calculateSimilarity(components[i], components[j]);
      if (sim > 70) {
        duplicates.push({
          type: 'component',
          instances: [
            { path: components[i].path, similarity: Math.round(sim) },
            { path: components[j].path, similarity: Math.round(sim) },
          ],
          recommendation: sim > 90 ? 'merge' : 'keep-both',
        });
      }
    }
  }
  return duplicates;
}

function generateRecommendations(
  components: ComponentAudit[],
  duplicates: DuplicateReport[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  duplicates.forEach((dup) => {
    if (dup.recommendation === 'merge') {
      recs.push({
        priority: 'high',
        category: 'duplication',
        message: `Fusionner composants similaires: ${dup.instances.map((i) => i.path).join(' + ')}`,
        autoFixable: false,
      });
    }
  });
  components.forEach((c) => {
    if (c.needsUpgrade && c.type === 'layout') {
      recs.push({
        priority: 'medium',
        category: 'structure',
        message: `Composant ${c.name} pourrait être amélioré pour la nouvelle architecture`,
        autoFixable: false,
      });
    }
  });
  return recs;
}

function generateMarkdownReport(report: AuditResult): string {
  const critical = report.recommendations.filter((r) => r.priority === 'critical');
  return `# 🔍 BMO Project Audit Report

**Date**: ${new Date().toLocaleString('fr-FR')}

## 📊 Résumé

- **Composants**: ${report.existingComponents.length}
- **Layouts**: ${report.existingLayouts.length}
- **Types**: ${report.existingTypes.length}
- **Configs modules**: ${report.existingConfigs.length}
- **Doublons détectés**: ${report.duplicates.length}
- **Recommandations critiques**: ${critical.length}

## ⚠️ Doublons détectés

${report.duplicates
  .map(
    (d) => `
### ${d.type}
- **Instances**: ${d.instances.map((i) => i.path).join(', ')}
- **Similarité**: ${d.instances[0].similarity}%
- **Recommandation**: ${d.recommendation}
`
  )
  .join('\n')}

## 💡 Recommandations

${report.recommendations
  .sort((a, b) => {
    const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (o[a.priority] ?? 4) - (o[b.priority] ?? 4);
  })
  .map(
    (r) => `
### ${r.priority.toUpperCase()}: ${r.category}
${r.message}
${r.autoFixable && r.fixCommand ? `\n**Auto-fix**: \`${r.fixCommand}\`` : ''}
`
  )
  .join('\n')}

## 📋 Composants BMO / Layout

${report.existingComponents
  .filter((c) => c.type === 'bmo' || c.type === 'layout')
  .map(
    (c) => `
- **${c.name}** (${c.type})
  - Path: ${c.path}
  - Réutilisable: ${c.canBeReused ? '✅' : '❌'}
  - À améliorer: ${c.needsUpgrade ? '⚠️' : '✅'}
  - Usages: ${c.usageCount}
`
  )
  .join('\n')}
`;
}

async function auditBMOProject(): Promise<AuditResult> {
  console.log('🔍 Scan du projet BMO...\n');

  const components = await scanComponents();
  const duplicates = detectDuplicates(components);
  const recommendations = generateRecommendations(components, duplicates);

  const report: AuditResult = {
    existingComponents: components,
    existingLayouts: components.filter((c) => c.type === 'layout') as LayoutAudit[],
    existingTypes: await scanTypes(),
    existingConfigs: await scanConfigs(),
    duplicates,
    recommendations,
  };

  const reportsDir = path.join(PROJECT_ROOT, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonPath = path.join(reportsDir, `audit-bmo-${ts}.json`);
  const mdPath = path.join(reportsDir, `audit-bmo-${ts}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, generateMarkdownReport(report));

  console.log(`\n✅ Rapport JSON: ${jsonPath}`);
  console.log(`✅ Rapport Markdown: ${mdPath}`);

  return report;
}

auditBMOProject()
  .then(() => console.log('\n✅ Audit terminé'))
  .catch((err) => console.error('❌ Erreur:', err));
