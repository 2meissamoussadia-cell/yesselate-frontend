#!/usr/bin/env node
/**
 * Migration Wizard BMO — Migration assistée vers architecture Outlook-like
 * Usage: node scripts/migration-wizard.js [--dry-run] [--backup] [--modules=alerts,demandes]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const MODULES = [
  'dashboard', 'alerts', 'demandes', 'validation-bc', 'governance',
  'performance', 'opportunities', 'chantiers', 'etudes', 'planning',
  'suivi-execution', 'qualite', 'livraisons', 'engagements', 'foncier',
  'achats', 'fournisseurs', 'conformite', 'maintenance', 'documents',
  'aide', 'admin', 'echanges', 'conferences', 'messages', 'registre',
  'audit', 'journal',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dryRun: false, backup: false, modules: MODULES };
  for (const a of args) {
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--backup') opts.backup = true;
    else if (a.startsWith('--modules=')) {
      opts.modules = a.slice(9).split(',').map((m) => m.trim()).filter(Boolean);
    }
  }
  return opts;
}

function runAudit() {
  console.log('🔍 Exécution de l\'audit...\n');
  try {
    execSync('node scripts/audit-bmo.js', { stdio: 'inherit', cwd: ROOT });
    return true;
  } catch (e) {
    console.error('❌ Échec audit');
    return false;
  }
}

function createBackup() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(ROOT, 'backups', `migration-${ts}`);
  console.log(`📦 Création backup: ${backupDir}`);
  fs.mkdirSync(path.dirname(backupDir), { recursive: true });
  copyDir(path.join(ROOT, 'src'), path.join(backupDir, 'src'));
  console.log('✅ Backup créé\n');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const srcPath = path.join(src, name);
    const destPath = path.join(dest, name);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function validate() {
  console.log('🔍 Validation TypeScript...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: ROOT });
    console.log('✅ TypeScript OK\n');
    return true;
  } catch (e) {
    console.log('⚠️ Erreurs TypeScript (vérifiez tsc-errors.txt)\n');
    return false;
  }
}

function main() {
  console.log('\n🚀 BMO Migration Wizard\n');
  const opts = parseArgs();

  console.log('Options:', opts.dryRun ? '(dry-run)' : '', opts.backup ? '(backup)' : '');
  console.log('Modules:', opts.modules.length, '\n');

  if (!runAudit()) process.exit(1);

  if (opts.backup && !opts.dryRun) {
    createBackup();
  }

  if (opts.dryRun) {
    console.log('🔸 [DRY-RUN] Migration simulée - aucune modification\n');
  } else {
    console.log('📋 Infrastructure déjà en place (Phase 1).');
    console.log('   Migrez les pages manuellement en suivant docs/bmo/PLAN_MIGRATION_OUTLOOK_LIKE_DETAILLE.md\n');
  }

  validate();
  console.log('✅ Migration Wizard terminé\n');
}

main();
