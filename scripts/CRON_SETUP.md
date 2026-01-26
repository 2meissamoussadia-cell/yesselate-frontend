# Configuration CRON pour rafraîchissement des vues matérialisées

## 🎯 Objectif

Le CRON de secours rafraîchit toutes les vues matérialisées toutes les 5-10 minutes, même si le worker Event-Driven ne fonctionne pas.

## 📋 Options de déploiement

### Option 1: Via API (recommandé)

L'endpoint `/api/cron/refresh-views` est protégé par un secret et peut être appelé via `curl` :

```bash
# Toutes les 10 minutes
*/10 * * * * curl -X POST http://localhost:3000/api/cron/refresh-views -H "x-cron-secret: $CRON_SECRET" >> /var/log/refresh_mviews.log 2>&1
```

**Avantages** :
- Pas besoin de Node.js dans le CRON
- Gestion d'erreurs via HTTP
- Logs centralisés dans l'application
- Plus simple à maintenir

**Configuration** :
1. Définir `CRON_SECRET` dans `.env`
2. Ajouter la ligne CRON ci-dessus

### Option 2: Exécution directe du script

Si vous préférez exécuter le script directement :

```bash
# Avec tsx (recommandé)
*/10 * * * * /usr/bin/env NODE_ENV=production DATABASE_URL=postgres://... /usr/bin/npx tsx /app/scripts/start-refresh-cron.ts >> /var/log/refresh_mviews.log 2>&1

# Avec ts-node
*/10 * * * * /usr/bin/env NODE_ENV=production DATABASE_URL=postgres://... /usr/bin/node -r ts-node/register /app/scripts/start-refresh-cron.ts >> /var/log/refresh_mviews.log 2>&1
```

**Note** : Remplacez `/app` par le chemin réel de votre application.

## 🔧 Configuration CRON

### Éditer le crontab

```bash
# Éditer le crontab de l'utilisateur
crontab -e

# Ou pour root
sudo crontab -e
```

### Exemple de configuration complète

```bash
# Variables d'environnement (ajoutées en haut du crontab)
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/dbname
CRON_SECRET=your-secret-key

# CRON de rafraîchissement des vues (toutes les 10 minutes)
*/10 * * * * curl -X POST http://localhost:3000/api/cron/refresh-views -H "x-cron-secret: $CRON_SECRET" >> /var/log/refresh_mviews.log 2>&1
```

### Format de la commande CRON

```
*/10 * * * * <commande>
│   │ │ │ │
│   │ │ │ └─── Jour de la semaine (0-7, 0 et 7 = dimanche)
│   │ │ └───── Mois (1-12)
│   │ └─────── Jour du mois (1-31)
│   └───────── Heure (0-23)
└───────────── Minute (0-59) - */10 = toutes les 10 minutes
```

## 📊 Logs

### Fichier de log

Les logs sont écrits dans `/var/log/refresh_mviews.log` (ou le chemin que vous spécifiez).

### Vérifier les logs

```bash
# Dernières lignes
tail -f /var/log/refresh_mviews.log

# Rechercher les erreurs
grep -i error /var/log/refresh_mviews.log

# Dernières 100 lignes
tail -n 100 /var/log/refresh_mviews.log
```

### Rotation des logs

Pour éviter que les logs deviennent trop volumineux, configurez `logrotate` :

```bash
# Créer /etc/logrotate.d/refresh-mviews
/var/log/refresh_mviews.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 root root
}
```

## 🔍 Vérification

### Tester manuellement

```bash
# Via API
curl -X POST http://localhost:3000/api/cron/refresh-views -H "x-cron-secret: $CRON_SECRET"

# Via script direct
NODE_ENV=production DATABASE_URL=postgres://... npx tsx scripts/start-refresh-cron.ts
```

### Vérifier que le CRON s'exécute

```bash
# Voir les jobs CRON actifs
crontab -l

# Vérifier les logs système (si disponible)
grep CRON /var/log/syslog

# Vérifier les métriques Prometheus
curl -H "x-metrics-secret: $METRICS_SECRET" http://localhost:3000/api/internal/metrics | grep mview_refresh
```

## ⚠️ Points de vigilance

### 1. Variables d'environnement

Le CRON n'hérite pas automatiquement des variables d'environnement de votre shell. Utilisez :
- `/usr/bin/env` pour passer les variables
- Ou définissez-les directement dans le crontab

### 2. Chemins absolus

Utilisez des chemins absolus dans le CRON :
- `/usr/bin/npx` au lieu de `npx`
- `/app/scripts/start-refresh-cron.ts` au lieu de `scripts/start-refresh-cron.ts`

### 3. Permissions

Assurez-vous que :
- Le fichier de log est accessible en écriture
- Les scripts sont exécutables
- L'utilisateur CRON a les permissions nécessaires

### 4. Concurrence avec le worker Event-Driven

Le CRON et le worker Event-Driven peuvent s'exécuter en parallèle. Le worker utilise des advisory locks PostgreSQL pour éviter les conflits.

## 🐛 Dépannage

### Le CRON ne s'exécute pas

1. Vérifier que le service CRON est actif :
   ```bash
   sudo systemctl status cron
   # ou
   sudo systemctl status crond
   ```

2. Vérifier les logs système :
   ```bash
   grep CRON /var/log/syslog
   ```

3. Tester la commande manuellement :
   ```bash
   /usr/bin/env NODE_ENV=production DATABASE_URL=postgres://... npx tsx scripts/start-refresh-cron.ts
   ```

### Le CRON échoue silencieusement

1. Vérifier les permissions du fichier de log :
   ```bash
   ls -la /var/log/refresh_mviews.log
   ```

2. Rediriger stderr explicitement :
   ```bash
   */10 * * * * ... >> /var/log/refresh_mviews.log 2>&1
   ```

3. Ajouter un email de notification :
   ```bash
   */10 * * * * ... >> /var/log/refresh_mviews.log 2>&1 || echo "CRON failed" | mail -s "CRON Error" admin@example.com
   ```

### Les vues ne se rafraîchissent pas

1. Vérifier les logs :
   ```bash
   tail -f /var/log/refresh_mviews.log
   ```

2. Vérifier la connexion PostgreSQL :
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

3. Vérifier les permissions :
   ```bash
   psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_overview;"
   ```

## 📚 Références

- [Crontab man page](https://man7.org/linux/man-pages/man5/crontab.5.html)
- [Cron format](https://crontab.guru/)
- [Logrotate documentation](https://linux.die.net/man/8/logrotate)
