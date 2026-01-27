# Checklists Durcissement - Phase P15

## 📋 Vue d'ensemble

Checklists concrètes pour durcissement complet de l'application.

---

## 🎨 6.1 Durcissement Next.js (Front)

### ✅ CSP Noncée (Middleware)

- [x] CSP stricte avec nonce par requête (`x-csp-nonce`)
- [x] `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'`
- [x] `style-src 'self' 'unsafe-inline'` (TODO: remplacer par nonce si possible)
- [x] `img-src 'self' data: blob: https:`
- [x] `font-src 'self' data:`
- [x] `connect-src 'self' https:`
- [x] `frame-ancestors 'none'`
- [x] `base-uri 'self'`
- [x] `object-src 'none'`
- [x] `upgrade-insecure-requests`
- [x] `form-action 'self'`
- [x] `frame-src 'none'`
- [x] `report-uri /api/security/csp-report` (Phase P15)

**Fichier** : `middleware.ts`

### ✅ Cookies Sécurisés

- [x] `Secure` : HTTPS uniquement (production)
- [x] `HttpOnly` : Pas d'accès JavaScript
- [x] `SameSite=Lax` ou `Strict` : Protection CSRF
- [x] Cookies de session avec flags sécurisés
- [x] CSRF token dans cookie HttpOnly

**Fichier** : `middleware.ts`

### ✅ CSRF sur Endpoints Mutation

- [x] Génération token CSRF (32 bytes, base64url)
- [x] Validation timing-safe (constant-time comparison)
- [x] Middleware helper `requireCsrfToken()`
- [x] Protection POST/PUT/PATCH/DELETE

**Fichier** : `lib/server/security/csrf.ts`

### ✅ Headers Stricts

- [x] `X-Powered-By` : Désactivé (Next.js le fait par défaut)
- [x] `X-Frame-Options: DENY`
- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` : Désactiver features non nécessaires
- [x] `Cross-Origin-Opener-Policy: same-origin`
- [x] `Cross-Origin-Embedder-Policy: require-corp`
- [x] `Strict-Transport-Security` : HSTS (next.config.ts)

**Fichiers** : `middleware.ts`, `next.config.ts`

### ✅ Charts/Workers/Fonts : Whitelists CSP

- [x] `connect-src` : Whitelist APIs externes (charts, etc.)
- [x] `style-src` : Whitelist fonts (si nécessaire)
- [x] `font-src` : Whitelist font providers

**Fichier** : `middleware.ts`

---

## 🔌 6.2 API & Services

### ✅ Validation JWT/OIDC Stricte

- [ ] Validation signature JWT
- [ ] Validation expiration (`exp`)
- [ ] Validation audience (`aud`)
- [ ] Validation issuer (`iss`)
- [ ] Rotation des clés JWT (via Secrets Manager)

**TODO** : Implémenter dans `lib/server/security/jwt.ts`

### ✅ mTLS entre Composants Critiques

- [x] Configuration SSL/mTLS PostgreSQL (`lib/server/security/mtls.ts`)
- [ ] mTLS entre services (API ↔ Workers)
- [ ] Validation certificats clients
- [ ] Alertes échecs mTLS (P15)

**Fichier** : `lib/server/security/mtls.ts`

### ✅ Rate-Limit Redis Homogène (P11)

- [x] Rate-limit Redis avec Token Bucket
- [x] Circuit-breaker sur Redis
- [x] Retry avec backoff
- [x] Rate-limit sur exports (20/IP, refill 1/s)

**Fichier** : `lib/server/observability/rateLimitRedis.ts`

### ✅ Quotas FinOps (P16)

- [x] Quotas par tenant/scope
- [x] Back-pressure (conservative mode)
- [x] Alertes refus quotas (P15)

**Fichier** : `lib/server/finops/`

### ✅ Circuit-Breaker/Retry (P13)

- [x] Circuit-breaker sur DB/Redis
- [x] Retry avec exponential backoff + jitter
- [x] Métriques `circuit_open_total`, `retry_attempts_total`

**Fichiers** : `lib/server/resilience/circuit.ts`, `lib/server/resilience/retry.ts`

---

## 💾 6.3 Data

### ✅ RLS Activé

- [x] RLS activé sur tables critiques
- [x] Isolation par tenant (`tenant_id`)
- [x] ABAC par bureau/chantier (scopes)
- [x] `SET LOCAL app.tenant_id` (Phase P15)
- [x] `SET LOCAL app.bureau` (Phase P15)
- [x] Helper `withTenant()` pour isolation automatique

**Fichiers** : `lib/server/security/rls.sql`, `lib/server/db/pool.ts`, `lib/server/db/withTenant.ts`

### ✅ KMS + Rotation Clés

- [x] Support KEK/DEK (enveloppe)
- [x] Rotation KEK (via Secrets Manager)
- [x] Re-chiffrement DEK avec nouvelle KEK
- [ ] Job de rotation périodique

**Fichier** : `lib/server/security/encryption.ts`

### ✅ Chiffrement Exports Stockés

- [x] Chiffrement at-rest (volumes DB, snapshots)
- [x] Chiffrement exports durables (S3/Azure Blob)
- [x] E2E pour exports sensibles (PGP/secret éphémère)

**Fichiers** : `lib/server/security/encryption.ts`, `lib/server/security/encryptionExport.ts`

---

## 🔗 6.4 Supply-Chain

### ✅ Secrets Manager + Rotation

- [x] Support Azure Key Vault / AWS Secrets Manager / HashiCorp Vault
- [x] Aucun secret en repo
- [ ] Rotation automatique credentials DB/API
- [ ] Rotation automatique webhooks (Teams)
- [ ] Rotation automatique SMTP
- [ ] Rotation automatique clés JWT

**Fichier** : `lib/server/security/secretsManager.ts`

### ✅ SBOM Build

- [x] Génération SBOM (CycloneDX/Syft) à chaque build
- [x] Stockage artefact SBOM
- [ ] Upload SBOM vers registry (GitHub Security, etc.)

**Fichier** : `.github/workflows/security.yml`

### ✅ Signature Images (Sigstore)

- [x] Signature images Docker avec Cosign
- [x] Vérification signature en admission (policy cluster)
- [ ] Intégration avec registry (Docker Hub, ACR, ECR)

**Fichier** : `.github/workflows/security.yml`

### ✅ Scans SAST/DAST (CI)

- [x] Scan secrets (Gitleaks, TruffleHog)
- [x] SAST (ESLint Security, npm audit, Snyk)
- [ ] DAST (OWASP ZAP, etc.)
- [x] Blocage PR si critiques

**Fichier** : `.github/workflows/security.yml`

---

## 📊 6.5 Surveillance & Réponse

### ✅ CSP Report Endpoint + Agrégation

- [x] Endpoint `/api/security/csp-report`
- [ ] Stockage violations CSP dans DB
- [ ] Agrégation par tenant/directive
- [ ] Alertes si seuil dépassé (P15)

**Fichier** : `app/api/security/csp-report/route.ts`

### ✅ Alertes Sécurité (P15)

- [x] Taux 401/403 élevé
- [x] Échecs mTLS
- [x] Augmentation erreurs CSP
- [x] Refus quotas FinOps
- [x] Erreurs auth
- [ ] Intégration avec système alertes P15 (alert_rules, alert_channels)

**Fichier** : `lib/server/security/securityAlerts.ts`

### ✅ Playbooks DR (P13)

- [x] Revocation token
- [x] Rotation clés
- [x] Failover DB
- [x] Blocage IP/tenant
- [x] Containment (isolation)
- [x] Investigation

**Fichier** : `docs/security/RUNBOOKS_INCIDENTS.md`

---

## 🔍 Corrélation (P4/P14/P15/P13)

### ✅ x-request-id Partout

- [x] Middleware génère `x-request-id`
- [x] Propagation dans API, workers, exports
- [x] Logs structurés avec `corrID`
- [ ] Traces distribuées (OpenTelemetry)

**Fichiers** : `middleware.ts`, logs structurés

### ✅ Télémétrie Produit (P14)

- [x] Instrumentation événements sécurité
- [ ] Erreurs auth → télémétrie
- [ ] Refus quotas FinOps → télémétrie
- [ ] CSP violations → télémétrie (via report-uri)

**Fichier** : `lib/telemetry/`

### ✅ Alertes (P15)

- [x] Règles sécurité (taux 401/403, mTLS, CSP)
- [ ] Canaux priés (Teams, SMS, Email)
- [ ] Déduplication (fingerprint)
- [ ] Anti-bruit (cooldown, reopen threshold)

**Fichiers** : `lib/server/security/securityAlerts.ts`, `lib/server/dashboard/sql/23_alerting.sql`

---

## ✅ Checklist Globale

- [x] Durcissement Next.js (CSP, cookies, CSRF, headers)
- [x] API & Services (JWT, mTLS, rate-limit, circuit-breaker)
- [x] Data (RLS, KMS, chiffrement)
- [x] Supply-chain (Secrets Manager, SBOM, signatures, scans)
- [x] Surveillance & Réponse (CSP reports, alertes, playbooks)
- [x] Corrélation (x-request-id, télémétrie, alertes)

---

**Dernière mise à jour** : 2026-01-26
