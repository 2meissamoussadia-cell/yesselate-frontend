# 🚀 Référence rapide - Configuration CRON

## Commande CRON recommandée (via API)

```bash
# Toutes les 10 minutes
*/10 * * * * curl -X POST http://localhost:3000/api/cron/refresh-views -H "x-cron-secret: $CRON_SECRET" >> /var/log/refresh_mviews.log 2>&1
```

**Prérequis** :
- Définir `CRON_SECRET` dans `.env` ou dans le crontab
- L'application Next.js doit être accessible sur `http://localhost:3000`

## Commande CRON alternative (script direct)

Si vous préférez exécuter le script directement :

```bash
# Avec tsx (recommandé)
*/10 * * * * /usr/bin/env NODE_ENV=production DATABASE_URL=postgres://user:pass@host:5432/dbname /usr/bin/npx tsx /app/scripts/start-refresh-cron.ts >> /var/log/refresh_mviews.log 2>&1

# Avec ts-node
*/10 * * * * /usr/bin/env NODE_ENV=production DATABASE_URL=postgres://user:pass@host:5432/dbname /usr/bin/node -r ts-node/register /app/scripts/start-refresh-cron.ts >> /var/log/refresh_mviews.log 2>&1
```

**Note importante** :
- Remplacez `/app` par le chemin réel de votre application
- Le fichier est en **TypeScript** (`.ts`), pas JavaScript (`.js`)
- Utilisez `tsx` ou `ts-node` pour l'exécuter

## Configuration dans crontab

```bash
# Éditer le crontab
crontab -e

# Ajouter ces lignes :
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/dbname
CRON_SECRET=your-secret-key

# CRON job (toutes les 10 minutes)
*/10 * * * * curl -X POST http://localhost:3000/api/cron/refresh-views -H "x-cron-secret: $CRON_SECRET" >> /var/log/refresh_mviews.log 2>&1
```

## Test manuel

```bash
# Tester l'API
curl -X POST http://localhost:3000/api/cron/refresh-views -H "x-cron-secret: your-secret-key"

# Tester le script directement
NODE_ENV=production DATABASE_URL=postgres://... npx tsx scripts/start-refresh-cron.ts
```

## Vérification

```bash
# Voir les logs
tail -f /var/log/refresh_mviews.log

# Vérifier que le CRON est actif
crontab -l

# Vérifier les métriques
curl -H "x-metrics-secret: $METRICS_SECRET" http://localhost:3000/api/internal/metrics | grep mview_refresh
```

## Documentation complète

Voir `scripts/CRON_SETUP.md` pour :
- Dépannage
- Rotation des logs
- Configuration avancée
- Gestion des erreurs
