#!/usr/bin/env node
/**
 * Script de démarrage du CRON de rafraîchissement des vues matérialisées
 * Phase P3: Rafraîchit toutes les vues matérialisées
 * Phase P4: Observabilité intégrée
 * 
 * Usage:
 *   # Développement
 *   npx tsx scripts/start-refresh-cron.ts
 * 
 *   # Production (direct)
 *   NODE_ENV=production DATABASE_URL=postgres://... npx tsx scripts/start-refresh-cron.ts
 * 
 *   # Production (via CRON)
 *   */10 * * * * /usr/bin/env NODE_ENV=production DATABASE_URL=postgres://... /path/to/npx tsx /app/scripts/start-refresh-cron.ts >> /var/log/refresh_mviews.log 2>&1
 * 
 *   # Ou via API (recommandé pour production)
 *   */10 * * * * curl -X POST http://localhost:3000/api/cron/refresh-views -H "x-cron-secret: $CRON_SECRET" >> /var/log/refresh_mviews.log 2>&1
 */

import 'dotenv/config';
import { executeRefreshCronJob } from '../lib/server/dashboard/workers/refreshMViewsCron';
import { logger } from '../lib/server/logging';

const log = logger.child({ component: 'cron-script' });

log.info({ env: process.env.NODE_ENV }, '[Script] 🚀 Démarrage du CRON de rafraîchissement des vues...');

// Vérification des variables d'environnement critiques
if (!process.env.DATABASE_URL) {
  log.error({}, '[Script] ❌ DATABASE_URL non défini');
  process.exit(1);
}

// Exécuter le job CRON
executeRefreshCronJob()
  .then(() => {
    log.info({}, '[Script] ✅ CRON terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    log.error({ err: error }, '[Script] ❌ Erreur fatale lors de l\'exécution du CRON');
    process.exit(1);
  });
