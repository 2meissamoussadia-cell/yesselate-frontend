# 🚀 Guide de Déploiement BMO

## Prérequis

- Node.js 18+
- npm 9+
- Base de données PostgreSQL
- Redis (optionnel, pour cache)
- Compte Vercel / AWS / OVH

---

## Configuration Environnement

### Variables d'environnement

```bash
# .env.production

# Database
DATABASE_URL="postgresql://user:password@host:5432/bmo_prod"
DIRECT_URL="postgresql://user:password@host:5432/bmo_prod"

# Auth
NEXTAUTH_URL="https://bmo.yessalate.sn"
NEXTAUTH_SECRET="votre-secret-tres-securise"

# API
API_BASE_URL="https://api.bmo.yessalate.sn"
API_TIMEOUT=30000

# Storage
STORAGE_PROVIDER="s3"  # ou "azure" ou "local"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="eu-west-3"
AWS_S3_BUCKET="bmo-documents"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="notifications@yessalate.sn"
SMTP_PASSWORD="your-password"

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
LOGTAIL_TOKEN="your-logtail-token"

# Features
ENABLE_OFFLINE_MODE=true
ENABLE_WEB_SEARCH=true
ENABLE_FILE_CREATION=true

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60000
```

---

## Build Production

```bash
# Install dependencies
npm ci --production=false

# Run type check
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test
npm run test:e2e

# Build
npm run build

# Vérifier build
npm run start
```

---

## Déploiement Vercel

### 1. Configuration Vercel

Créer ou modifier `vercel.json` à la racine :

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.bmo.yessalate.sn/:path*"
    }
  ]
}
```

### 2. Déploiement

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod
```

---

## Déploiement AWS (EC2 + RDS)

### 1. Infrastructure

- **Instance EC2** : t3.medium (2 vCPU, 4GB RAM), Ubuntu 22.04 LTS  
- **Security Group** : Port 443 (HTTPS), 22 (SSH)  
- **RDS PostgreSQL** : db.t3.micro, 20GB SSD, Multi-AZ, Backup 7 jours  

### 2. Configuration serveur

```bash
# SSH vers serveur
ssh ubuntu@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 3. Configuration Nginx

Fichier `/etc/nginx/sites-available/bmo` :

```nginx
server {
    listen 80;
    server_name bmo.yessalate.sn;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bmo.yessalate.sn;

    ssl_certificate /etc/letsencrypt/live/bmo.yessalate.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bmo.yessalate.sn/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /images {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### 4. Déploiement application

```bash
# Clone repository
git clone https://github.com/yessalate/yesselate-frontend.git
cd yesselate-frontend

# Install dependencies
npm ci --production=false

# Build
npm run build

# Configure PM2
pm2 start npm --name "bmo" -- start
pm2 save
pm2 startup

# Enable Nginx
sudo ln -s /etc/nginx/sites-available/bmo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL Certificate
sudo certbot --nginx -d bmo.yessalate.sn
```

---

## Monitoring & Logs

### 1. Configuration Sentry

Fichier `sentry.client.config.ts` (à la racine ou dans `sentry/`) :

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

### 2. Logs Logtail

```typescript
// lib/logger.ts (exemple)
import { Logtail } from '@logtail/node';

const logtail = process.env.LOGTAIL_TOKEN
  ? new Logtail(process.env.LOGTAIL_TOKEN)
  : null;

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    logtail?.info(message, context);
  },
  error: (message: string, error?: Error, context?: Record<string, unknown>) => {
    logtail?.error(message, {
      error: error?.message,
      stack: error?.stack,
      ...context,
    });
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    logtail?.warn(message, context);
  },
};
```

### 3. PM2 Monitoring

```bash
# Installer pm2-logrotate
pm2 install pm2-logrotate

# Configuration
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitoring dashboard
pm2 monitor

# View logs
pm2 logs bmo
pm2 logs bmo --lines 100
pm2 logs bmo --err
```

---

## Backup & Restore

### Base de données

Script `/etc/cron.daily/bmo-backup` :

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/bmo"
mkdir -p "$BACKUP_DIR"

pg_dump -h localhost -U bmo_user -d bmo_prod > "$BACKUP_DIR/bmo_$DATE.sql"
gzip "$BACKUP_DIR/bmo_$DATE.sql"

aws s3 cp "$BACKUP_DIR/bmo_$DATE.sql.gz" s3://bmo-backups/database/

find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
```

### Restore

```bash
gunzip bmo_YYYYMMDD_HHMMSS.sql.gz
psql -h localhost -U bmo_user -d bmo_prod < bmo_YYYYMMDD_HHMMSS.sql
```

---

## Mise à jour

```bash
# Zero-downtime deployment

# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci --production=false

# 3. Build
npm run build

# 4. Reload PM2
pm2 reload bmo

# 5. Vérifier
curl https://bmo.yessalate.sn/api/health
```

---

## Rollback

```bash
# 1. Identifier le commit cible
git log --oneline

# 2. Checkout version précédente
git checkout <commit-hash>

# 3. Rebuild
npm ci --production=false
npm run build

# 4. Reload
pm2 reload bmo
```

---

## Health Checks

Le projet expose déjà un endpoint `/api/health` (voir `app/api/health/route.ts` et `lib/server/observability/health.ts`).

**Exemple de réponse :**

```json
{
  "status": "healthy",
  "timestamp": "2024-02-03T12:00:00.000Z",
  "services": {
    "database": "up"
  }
}
```

**Vérification :**

```bash
curl https://bmo.yessalate.sn/api/health
```

---

## Checklist Déploiement

- [ ] Tests passent (unit + e2e)
- [ ] Type check OK
- [ ] Lint OK
- [ ] Build réussit
- [ ] Variables environnement configurées
- [ ] Base de données migrée
- [ ] SSL configuré
- [ ] Monitoring configuré (Sentry, Logtail)
- [ ] Backups automatiques configurés
- [ ] Health checks OK
- [ ] Performance testée (Lighthouse > 90)
- [ ] Documentation à jour

---

## Voir aussi

- [P13_DEPLOYMENT_CHECKLIST.md](./P13_DEPLOYMENT_CHECKLIST.md) — Checklist résilience & DR  
- [docs/dashboard/DEPLOYMENT_VERCEL.md](../dashboard/DEPLOYMENT_VERCEL.md) — Déploiement Vercel détaillé  
- [docs/security/HARDENING_CHECKLIST.md](../security/HARDENING_CHECKLIST.md) — Sécurité  
- [docs/runbooks/DR_RUNBOOK.md](../runbooks/DR_RUNBOOK.md) — Procédure disaster recovery  
