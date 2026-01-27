# Risques & atténuations · Plan de déploiement · Suite P19/P20

## 8) Risques & atténuations

| Risque | Atténuation |
|--------|-------------|
| **CSP trop stricte** | Tests sur tous les environnements (dev, staging, prod). Utiliser `Content-Security-Policy-Report-Only` avant enforcement, analyser les rapports (`/api/security/csp-report`), puis basculer en CSP enforcing. |
| **RLS mal paramétré** | Tests d’accès croisés (tenant A ne doit pas voir les données de tenant B). Intégration systématique de `SET app.tenant_id` via `withTenant` / `withContext` avant toute requête sensible. Voir `lib/server/db/withTenant.ts`, `lib/server/security/rls.ts`. |
| **E2E exports** | Gestion des clés (KMS, rotation) et UX de partage claire. Prévoir **playbooks de récupération** (clé perdue, turnover, incident). Voir `lib/server/security/encryption.ts`, `ENCRYPTION_DEPLOYMENT.md`, `RUNBOOKS_INCIDENTS.md`. |
| **CI/CD** | Discipline équipe : **aucun secret en repo**. Outillage shift-left : SBOM, scans de vulnérabilités et de secrets en CI, signatures d’artefacts. Voir `.github/workflows/security.yml`, `lib/server/security/sbom.ts`. |

---

## 9) Déploiement — plan rapide

| PR | Périmètre | Principaux éléments |
|----|-----------|---------------------|
| **PR Sec-Front** | Middleware, front | CSP + headers stricts, cookies sécurisés, (option) CSRF. Fichiers : `middleware.ts`, `lib/server/security/csrf.ts`, `cspNonce.tsx`. |
| **PR Sec-API** | API, backend | JWT strict (`lib/server/auth/jwt.ts`), mTLS (`lib/server/security/mtls.ts`), rate-limit global homogénéisé (`lib/server/security/rateLimit.ts`, `observability/rateLimitRedis.ts`). |
| **PR Sec-Data** | Données | RLS activé + `SET app.tenant_id` systématique, KMS + rotation, chiffrement des exports. `lib/server/db/withTenant.ts`, `lib/server/security/rls.ts`, `encryption.ts`, `exportEncryption.ts`. |
| **PR Supply-chain** | Build & déploiement | SBOM + signatures + secrets manager + scans CI. `lib/server/security/sbom.ts`, `secretsManager.ts`, workflows `.github/workflows/`. |
| **PR Observabilité Sécurité** | Monitoring | CSP reports (`/api/security/csp-report`), alertes P15 (`lib/server/security/securityAlerts.ts`), playbooks P13 (`lib/server/ops/playbooks/`, `RUNBOOKS_INCIDENTS.md`). |

### Compatibilité

- **Routeur avancé** (affichage), **registry** (loaders TTL), **navigation** (URL + store), **KPI Bar** (actions) : compatibilité confirmée.
- **Zéro friction** côté utilisateurs, **sécurité maximaliste** côté plateforme.

---

## Suite logique (proposée)

| Phase | Objectif |
|-------|----------|
| **P19 – Bench & Capacity Planning** | Modèles de charge multi-tenant, sizing auto, budgets SLO/SLA. Voir [P19_BENCH_CAPACITY_PLANNING.md](../bench/P19_BENCH_CAPACITY_PLANNING.md), [RUNBOOK_BENCH.md](../bench/RUNBOOK_BENCH.md), [CAPACITY_REPORT_TEMPLATE.md](../bench/CAPACITY_REPORT_TEMPLATE.md). |
| **P20 – Playbooks Ops & Remediations** | Automatiser les corrections courantes : recalcul MViews, purge caches, escalades ciblées. |

---

## Références

- [HARDENING_CHECKLIST.md](./HARDENING_CHECKLIST.md) — Checklists durcissement P15 (CSP, cookies, CSRF, JWT, RLS, etc.)
- [RUNBOOKS_INCIDENTS.md](./RUNBOOKS_INCIDENTS.md) — Runbooks incidents sécurité
- [ENCRYPTION_DEPLOYMENT.md](../../lib/server/security/ENCRYPTION_DEPLOYMENT.md) — Déploiement chiffrement exports
