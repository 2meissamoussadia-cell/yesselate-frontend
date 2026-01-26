# 🚀 Démarrage rapide du Worker

## Commande de production

Le worker est en TypeScript, donc vous devez utiliser `tsx` ou `ts-node` :

```bash
# Option 1: Avec tsx (recommandé - plus rapide)
NODE_ENV=production DATABASE_URL=postgres://user:pass@host:5432/dbname npx tsx scripts/start-refresh-worker.ts

# Option 2: Avec ts-node
NODE_ENV=production DATABASE_URL=postgres://user:pass@host:5432/dbname node -r ts-node/register scripts/start-refresh-worker.ts

# Option 3: Script wrapper (Linux/Mac)
DATABASE_URL=postgres://... bash scripts/start-worker.sh

# Option 4: Script wrapper (Windows PowerShell)
$env:DATABASE_URL="postgres://..."; powershell scripts/start-worker.ps1
```

## Installation des dépendances (si nécessaire)

```bash
# Installer tsx (recommandé)
npm install -D tsx

# Ou installer ts-node
npm install -D ts-node typescript
```

## Vérification

Une fois démarré, vous devriez voir :
```
[WORKER] 🚀 Écoute du canal "dashboard_refresh"…
```

## PM2 (production recommandée)

```bash
# Installation PM2
npm install -g pm2

# Démarrage
pm2 start scripts/start-refresh-worker.ts \
  --name "dashboard-refresh-worker" \
  --interpreter tsx \
  --env NODE_ENV=production \
  --env DATABASE_URL=postgres://...

# Vérification
pm2 status
pm2 logs dashboard-refresh-worker
```

## Documentation complète

Voir `lib/server/dashboard/workers/WORKER_DEPLOYMENT.md` pour :
- Configuration Systemd
- Configuration Docker
- Dépannage
- Monitoring
