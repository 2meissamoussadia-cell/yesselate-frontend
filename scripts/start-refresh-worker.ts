#!/usr/bin/env node
/**
 * Script de démarrage du worker Event-Driven Refresh
 * Phase P3: Lance le worker qui écoute les notifications PostgreSQL
 * Phase P4: Observabilité intégrée
 * 
 * Usage:
 *   # Développement (avec tsx ou ts-node)
 *   npx tsx scripts/start-refresh-worker.ts
 *   # ou
 *   node -r ts-node/register scripts/start-refresh-worker.ts
 * 
 *   # Production (après build Next.js)
 *   NODE_ENV=production DATABASE_URL=postgres://... node scripts/start-refresh-worker.js
 *   # ou avec tsx directement
 *   NODE_ENV=production DATABASE_URL=postgres://... npx tsx scripts/start-refresh-worker.ts
 * 
 *   # Avec PM2
 *   pm2 start scripts/start-refresh-worker.ts --name "dashboard-refresh-worker" --interpreter tsx
 */

import 'dotenv/config';
import { startRefreshWorker } from '../lib/server/dashboard/workers/refreshMViewsWorker';
import { logger } from '../lib/server/logging';

const log = logger.child({ component: 'worker-script' });

log.info({ env: process.env.NODE_ENV }, '[Script] 🚀 Démarrage du worker Event-Driven Refresh...');

// Vérification des variables d'environnement critiques
if (!process.env.DATABASE_URL) {
  log.error({}, '[Script] ❌ DATABASE_URL non défini');
  process.exit(1);
}

// Démarrer le worker
startRefreshWorker().catch((error) => {
  log.error({ err: error }, '[Script] ❌ Erreur fatale lors du démarrage');
  process.exit(1);
});

// Gestion des signaux pour arrêt propre
process.on('SIGTERM', () => {
  log.info({}, '[Script] 🛑 Arrêt demandé (SIGTERM)');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info({}, '[Script] 🛑 Arrêt demandé (SIGINT)');
  process.exit(0);
});
