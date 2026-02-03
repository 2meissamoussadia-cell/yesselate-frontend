#!/usr/bin/env node
/**
 * Script d'audit BMO — Analyse du projet pour la migration Outlook-like
 * Usage: node scripts/audit-bmo.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function walkDir(dir, ext, ignore) {
  const results = [];
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

function extractExports(content) {
  const exports = [];
  let m;
  const exportRegex = /export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+(\w+)/g;
  while ((m = exportRegex.exec(content)) !== null) exports.push(m[1]);
  const namedRegex = /export\s*\{([^}]+)\}/g;
  while ((m = namedRegex.exec(content)) !== null) {
    m[1].split(',').forEach((s) => {
      const name = s.split(/\s+as\s+/)[0].trim().split(':')[0].trim();
      if (name && name !== 'type') exports.push(name);
    });
  }
  return [...new Set(exports)];
}

function extractDependencies(content) {
  const deps = [];
  const importRegex = /from\s+['"](@\/[^'"]+|[^'"]+)['"]/g;
  let m;
  while ((m = importRegex.exec(content)) !== null) deps.push(m[1]);
  return deps;
}

function determineComponentType(filePath) {
  if (filePath.includes('/layout') || filePath.includes('Layout')) return 'layout';
  if (filePath.includes('/bmo/')) return 'bmo';
  if (filePath.includes('/features/')) return 'feature';
  if (filePath.includes('/ui/')) return 'ui';
  return 'bmo';
}

function isReusable(content) {
  return content.includes('interface') && content.includes('Props') && !content.includes('any') && content.includes('export');
}

function needsUpgrade(content) {
  return !content.includes('class ') && content.includes('export') && (content.includes('any') || !content.includes('Props'));
}

function stringSimilarity(a, b) {
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

function arraysSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const inter = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 100 : (inter.size / union.size) * 100;
}

function calculateSimilarity(a, b) {
  return stringSimilarity(a.name, b.name) * 0.3 + arraysSimilarity(a.exports, b.exports) * 0.4 + arraysSimilarity(a.dependencies, b.dependencies) * 0.3;
}

function countUsages(filePath, allFiles) {
  const baseName = path.basename(filePath, path.extname(filePath));
  let count = 0;
  for (const f of allFiles) {
    if (f === filePath) continue;
    try {
      const c = fs.readFileSync(path.join(PROJECT_ROOT, f), 'utf-8');
      if (c.includes(baseName)) count++;
    } catch (_) {}
  }
  return count;
}

function scanComponents() {
  const ignore = new Set(['node_modules', '.next', 'coverage', 'dist']);
  const files = walkDir(path.join(PROJECT_ROOT, 'src/components'), ['.tsx', '.ts'], ignore);
  const srcFiles = walkDir(path.join(PROJECT_ROOT, 'src'), ['.ts', '.tsx'], ignore);
  const components = [];

  for (const file of files) {
    const fullPath = path.join(PROJECT_ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    components.push({
      path: file,
      name: path.basename(file, path.extname(file)),
      type: determineComponentType(file),
      exports: extractExports(content),
      dependencies: extractDependencies(content),
      usageCount: countUsages(file, srcFiles),
      canBeReused: isReusable(content),
      needsUpgrade: needsUpgrade(content),
      conflicts: [],
    });
  }
  return components;
}

function scanTypes() {
  const ignore = new Set(['node_modules']);
  const files = walkDir(path.join(PROJECT_ROOT, 'src/lib/types'), ['.ts'], ignore);
  return files.map((file) => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf-8');
    return { path: file, name: path.basename(file, '.ts'), exports: extractExports(content) };
  });
}

function scanConfigs() {
  const configs = [];
  const modulesPath = path.join(PROJECT_ROOT, 'src/lib/config/modules');
  if (fs.existsSync(modulesPath)) {
    fs.readdirSync(modulesPath)
      .filter((f) => f.endsWith('.config.ts'))
      .forEach((f) => {
        configs.push({ path: `src/lib/config/modules/${f}`, name: f.replace('.config.ts', ''), moduleId: f.replace('.config.ts', '') });
      });
  }
  return configs;
}

function detectDuplicates(components) {
  const duplicates = [];
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

function generateRecommendations(components, duplicates) {
  const recs = [];
  duplicates.forEach((dup) => {
    if (dup.recommendation === 'merge') {
      recs.push({ priority: 'high', category: 'duplication', message: `Fusionner: ${dup.instances.map((i) => i.path).join(' + ')}`, autoFixable: false });
    }
  });
  components.forEach((c) => {
    if (c.needsUpgrade && c.type === 'layout') {
      recs.push({ priority: 'medium', category: 'structure', message: `${c.name} pourrait être amélioré`, autoFixable: false });
    }
  });
  return recs;
}

function generateMarkdownReport(report) {
  const critical = report.recommendations.filter((r) => r.priority === 'critical');
  return `# 🔍 BMO Project Audit Report

**Date**: ${new Date().toLocaleString('fr-FR')}

## 📊 Résumé

- **Composants**: ${report.existingComponents.length}
- **Layouts**: ${report.existingLayouts.length}
- **Types**: ${report.existingTypes.length}
- **Configs modules**: ${report.existingConfigs.length}
- **Doublons**: ${report.duplicates.length}
- **Recommandations critiques**: ${critical.length}

## ⚠️ Doublons

${report.duplicates.map((d) => `- ${d.instances.map((i) => i.path).join(' + ')} (${d.instances[0].similarity}%)`).join('\n')}

## 💡 Recommandations

${report.recommendations.map((r) => `- [${r.priority}] ${r.message}`).join('\n')}

## 📋 Composants BMO/Layout

${report.existingComponents
  .filter((c) => c.type === 'bmo' || c.type === 'layout')
  .map((c) => `- **${c.name}** (${c.path}) - Réutilisable: ${c.canBeReused ? '✅' : '❌'}, Usages: ${c.usageCount}`)
  .join('\n')}
`;
}

function main() {
  console.log('🔍 Scan du projet BMO...\n');
  const components = scanComponents();
  const duplicates = detectDuplicates(components);
  const recommendations = generateRecommendations(components, duplicates);

  const report = {
    existingComponents: components,
    existingLayouts: components.filter((c) => c.type === 'layout'),
    existingTypes: scanTypes(),
    existingConfigs: scanConfigs(),
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
  console.log('\n✅ Audit terminé');
}

main();
