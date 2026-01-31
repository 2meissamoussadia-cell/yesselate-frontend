# Plan d’audit d’un logiciel

**Structure professionnelle — utilisable pour un auditeur interne, externe ou un testeur QA.**

*Référence : Yesselate Frontend — Portail maître d’ouvrage, Dashboard DG, BMO, ERP BTP.*

---

## 1. Introduction de l’audit

### 1.1. Objectif de l’audit

Définir précisément :

| Élément | À renseigner |
|--------|----------------|
| **Pourquoi on fait l’audit** | Ex. : conformité livrable, recette client, certification, audit interne qualité. |
| **Ce que l’audit doit valider** | Ex. : respect du cahier des charges, normes accessibilité (WCAG), sécurité (OWASP), performance (SLO). |
| **Les livrables attendus** | Rapport d’audit, liste d’anomalies classées, plan d’action correctif, PV de recette. |
| **Le périmètre** | Modules (Dashboard, BMO, Calendrier, Gouvernance, etc.), versions (branche, tag), utilisateurs concernés (rôles MO, DG, admin). |

### 1.2. Contexte

| Élément | À renseigner |
|--------|----------------|
| **Présentation du logiciel audité** | Yesselate — portail maître d’ouvrage, cockpit DG, module BMO, ERP BTP, calendrier & jalons, gouvernance, demandes, analytics. |
| **Historique des versions** | Dernière version audité, environnement (staging / production). |
| **Équipe de développement** | Stack : Next.js, React, TypeScript, Prisma, Tailwind, etc. |
| **Périmètre métier** | BTP, maître d’ouvrage, direction générale, chantiers, bureaux, référentiels, exports, alertes. |

### 1.3. Méthodologie

**Méthodes utilisées :**

- [ ] Tests manuels
- [ ] Tests exploratoires
- [ ] Analyse UX/UI
- [ ] Interviews utilisateurs
- [ ] Revue technique (code, config, déploiement)
- [ ] Tests fonctionnels (scénarios métier)
- [ ] Tests automatisés (Jest, Playwright) — voir `__tests__/`, `e2e/`

**Normes de référence :**

- ISO 25010 (qualité des logiciels) si applicable
- WCAG 2.1 (accessibilité)
- OWASP Top 10 (sécurité)
- Référentiels métier (BTP, MO)

---

## 2. Audit fonctionnel

*Évaluer si le logiciel répond aux besoins.*

### 2.1. Vérification des modules

| Module principal | Conformité fonctionnelle | Commentaire |
|------------------|---------------------------|-------------|
| Dashboard (KPIs, vues, command center) | ☐ OK ☐ KO ☐ Partiel | |
| Cockpit DG | ☐ OK ☐ KO ☐ Partiel | |
| BMO (chantiers, blocked, missions) | ☐ OK ☐ KO ☐ Partiel | |
| Calendrier & jalons | ☐ OK ☐ KO ☐ Partiel | |
| Gouvernance & décisions | ☐ OK ☐ KO ☐ Partiel | |
| Demandes & validation BC | ☐ OK ☐ KO ☐ Partiel | |
| Analytics & rapports | ☐ OK ☐ KO ☐ Partiel | |
| Administration (utilisateurs, rôles, paramètres) | ☐ OK ☐ KO ☐ Partiel | |
| Exports (XLSX, PDF, CSV) | ☐ OK ☐ KO ☐ Partiel | |
| Alertes & notifications | ☐ OK ☐ KO ☐ Partiel | |

### 2.2. Complétude des fonctionnalités

- **Fonctions essentielles présentes ?** (liste selon cahier des charges)
- **Fonctions manquantes vs cahier des charges** (écart documenté)
- *Réf. projet : `docs/ANALYSE_INTERFACE_ET_TODOS.md`, `docs/dashboard/COCKPIT_DG_CAHIER_DES_CHARGES.md`*

### 2.3. Exactitude des calculs & règles métier

| Domaine | Vérification | Résultat |
|---------|--------------|----------|
| Calculs financiers (budgets, CA, trésorerie) | | ☐ OK ☐ KO |
| Calculs de temps / quantités (SLA, délais) | | ☐ OK ☐ KO |
| Règles de validation (workflow, seuils) | | ☐ OK ☐ KO |
| Agrégations & KPIs | | ☐ OK ☐ KO |

### 2.4. Workflow & cohérence des processus

- Transitions logiques entre étapes (états, statuts)
- Flux métier sans blocage (validation BC, arbitrages, escalade DG)
- Automatisations (MViews, workers, cron) — *réf. `lib/server/dashboard/workers/`, P13/P19*

---

## 3. Audit ergonomique (UX/UI)

*Analyser si l’interface est intuitive.*

### 3.1. Structure & navigation

| Critère | Évaluation | Commentaire |
|---------|------------|-------------|
| Organisation claire des menus | ☐ OK ☐ KO ☐ Partiel | |
| Nombre de clics pour réaliser une action | | |
| Aide utilisateur (tooltips, messages, docs) | ☐ OK ☐ KO ☐ Partiel | |
| Accessibilité (WCAG) : skip link, focus, contrastes, headings (h1→h2), aria | ☐ OK ☐ KO ☐ Partiel | *Réf. corrections P0–P2, `docs/dashboard/`* |

### 3.2. Interface utilisateur

| Critère | Évaluation | Commentaire |
|---------|------------|-------------|
| Qualité visuelle | ☐ OK ☐ KO ☐ Partiel | |
| Cohérence graphique (tokens, composants partagés) | ☐ OK ☐ KO ☐ Partiel | |
| Réactivité des éléments (feedback, chargements) | ☐ OK ☐ KO ☐ Partiel | |
| Messages d’erreur adaptés (EmptyState, ErrorBoundary) | ☐ OK ☐ KO ☐ Partiel | |

---

## 4. Audit technique

### 4.1. Performance

| Critère | Méthode / outil | Résultat |
|---------|------------------|----------|
| Temps de chargement (LCP, FCP, TTI) | Lighthouse, RUM | |
| Test sous charge | k6, bench (P19) | *Réf. `bench/`, `docs/bench/P19_BENCH_CAPACITY_PLANNING.md`* |
| Optimisation base de données (requêtes, index, MViews) | Revue SQL, pg_stat | |
| Comportement en cas de réseau faible / offline | PWA, cache, retry (P13) | |

### 4.2. Stabilité

| Critère | Évaluation | Commentaire |
|---------|------------|-------------|
| Crash tests (erreurs non gérées) | ErrorBoundary, monitoring | |
| Gestion des erreurs (API, DB, Redis) | Circuit breaker, retry (P13) | |
| Robustesse des traitements longs (exports, jobs) | Timeouts, back-pressure (P16) | |

### 4.3. Compatibilité

| Cible | Navigateurs / OS / résolutions | Résultat |
|-------|--------------------------------|----------|
| Navigateurs | Chrome, Firefox, Safari, Edge (versions cibles) | ☐ OK ☐ KO ☐ Partiel |
| OS | Windows, macOS, Linux | ☐ OK ☐ KO ☐ Partiel |
| Mobile / tablette | Responsive, PWA | ☐ OK ☐ KO ☐ Partiel |
| Résolutions d’écran | Desktop, tablette, mobile | ☐ OK ☐ KO ☐ Partiel |

---

## 5. Audit de sécurité

### 5.1. Gestion des accès

| Critère | Vérification | Résultat |
|---------|---------------|----------|
| Rôles utilisateurs (RBAC) | `lib/server/security/policy.ts`, dashboard permissions | ☐ OK ☐ KO |
| Restrictions d’accès correctes (ABAC, tenant, bureau) | `src/modules/dashboard/api/security.ts`, RLS | ☐ OK ☐ KO |
| Séparation des permissions (MO, DG, admin) | Navigation filtrée, `nodeAllowed` | ☐ OK ☐ KO |

### 5.2. Protection des données

| Critère | Vérification | Résultat |
|---------|---------------|----------|
| Chiffrement des mots de passe / secrets | Politique mot de passe, secrets manager | ☐ OK ☐ KO |
| Masquage données sensibles (UI, logs) | | ☐ OK ☐ KO |
| Stockage sécurisé des fichiers (upload, export) | Export scellé (P9), chiffrement (P15/P18) | ☐ OK ☐ KO |

### 5.3. Vulnérabilités

| Risque | Mesure de contrôle | Résultat |
|--------|--------------------|----------|
| Injection SQL | Requêtes paramétrées, ORM/Prisma | ☐ OK ☐ KO |
| XSS | CSP, échappement, React | ☐ OK ☐ KO |
| CSRF | Tokens, SameSite cookies | ☐ OK ☐ KO |
| Upload fichier sécurisé | Validation type, taille, scan | ☐ OK ☐ KO |
| Brute force / rate limiting | Redis rate limit (P11/P13), blocage compte | ☐ OK ☐ KO |

*Réf. `docs/security/HARDENING_CHECKLIST.md`, `PR_P15_SECURITY_COMPLETE.md`*

---

## 6. Audit qualité des données

### 6.1. Validation et cohérence

| Critère | Évaluation | Commentaire |
|---------|------------|-------------|
| Champs obligatoires (formulaires, API) | Zod, validation côté client/serveur | ☐ OK ☐ KO |
| Formats (dates, montants, emails) | | ☐ OK ☐ KO |
| Contraintes uniques (DB, métier) | | ☐ OK ☐ KO |
| Vérification des doublons | | ☐ OK ☐ KO |

### 6.2. Import/Export

| Critère | Évaluation | Commentaire |
|---------|------------|-------------|
| Export PDF/Excel correct (localisation, formats) | P12, `lib/server/dashboard/export/` | ☐ OK ☐ KO |
| Import Excel avec gestion d’erreurs | | ☐ OK ☐ KO |
| Limites et quotas (FinOps P16) | | ☐ OK ☐ KO |

---

## 7. Audit des intégrations

### 7.1. API

| Critère | Évaluation | Commentaire |
|---------|------------|-------------|
| Tests des endpoints (auth, erreurs, cas limites) | Routes Next.js, loaders dashboard | ☐ OK ☐ KO |
| Authentification (JWT, session) | Middleware, RLS | ☐ OK ☐ KO |
| Gestion des erreurs (codes HTTP, messages) | | ☐ OK ☐ KO |
| Journalisation (structured logging) | `withReq`, P6 | ☐ OK ☐ KO |

### 7.2. Connecteurs externes

| Connecteur | Usage | Résultat |
|------------|--------|----------|
| Comptabilité | Si applicable | ☐ OK ☐ KO ☐ N/A |
| Services tiers (télémétrie, alertes) | P14, P15/P17 | ☐ OK ☐ KO ☐ N/A |
| Automatisations (workers, cron) | MViews, alerting, ops | ☐ OK ☐ KO ☐ N/A |

---

## 8. Audit sécurité informatique

### 8.1. Backups & restauration

| Critère | À documenter | Résultat |
|---------|----------------|----------|
| Plan de sauvegarde | Fréquence, scope (DB, fichiers) | ☐ OK ☐ KO |
| Tests de restauration | PITR, runbooks (P13) | ☐ OK ☐ KO |
| Fréquence sauvegarde | Quotidienne / hebdo / temps réel | |

*Réf. `docs/runbooks/DR_RUNBOOK.md`, `docs/database/PITR_BACKUP.md`*

### 8.2. Logs

| Type de log | Présent | Rétention | Résultat |
|-------------|---------|-----------|----------|
| Logs de connexion | ☐ Oui ☐ Non | | ☐ OK ☐ KO |
| Logs des actions sensibles (audit) | ☐ Oui ☐ Non | | ☐ OK ☐ KO |
| Logs techniques (erreurs, perf) | ☐ Oui ☐ Non | | ☐ OK ☐ KO |
| Durée de rétention | | | |

---

## 9. Audit documentation

### 9.1. Documentation technique

| Document | Emplacement / existence | Résultat |
|----------|-------------------------|----------|
| Architecture | `docs/`, README, schémas | ☐ OK ☐ KO ☐ Partiel |
| Base de données | Prisma schema, SQL migrations, `lib/server/dashboard/sql/` | ☐ OK ☐ KO ☐ Partiel |
| API | Routes, loaders, types | ☐ OK ☐ KO ☐ Partiel |
| Déploiement / runbooks | `docs/deployment/`, `docs/runbooks/`, `docs/ops/` | ☐ OK ☐ KO ☐ Partiel |

### 9.2. Documentation fonctionnelle

| Document | Emplacement / existence | Résultat |
|----------|-------------------------|----------|
| Manuel utilisateur | Guides, aide in-app | ☐ OK ☐ KO ☐ Partiel |
| Procédures internes | Runbooks, playbooks (P20) | ☐ OK ☐ KO ☐ Partiel |
| Cahier des charges / specs | `docs/dashboard/`, specs modules | ☐ OK ☐ KO ☐ Partiel |

---

## 10. Rapport final d’audit

*Ce que l’auditeur doit livrer.*

### 10.1. Résumé exécutif

| Section | Contenu |
|---------|--------|
| **Points forts** | |
| **Points faibles** | |
| **Risques critiques** | |
| **Verdict** | ☐ Conforme sous réserves ☐ Non conforme ☐ Conforme |

### 10.2. Liste des anomalies

Classées par criticité :

| Id | Criticité | Description | Reproduction | Capture / preuve | Priorité |
|----|-----------|-------------|--------------|------------------|----------|
| | Bloquante | | | | P0 |
| | Majeure | | | | P1 |
| | Mineure | | | | P2 |
| | Amélioration | | | | P3 |

*Légende criticité : Bloquante = régression majeure / blocage métier ; Majeure = fonction incorrecte ou manquante importante ; Mineure = défaut limité ; Amélioration = recommandation.*

### 10.3. Recommandations

| Module / thème | Fonctionnelles | Techniques | UX | Sécurité |
|----------------|----------------|------------|-----|----------|
| | | | | |
| | | | | |

### 10.4. Plan d’action

| Action | Priorité | Responsable | Échéance | Tests de validation |
|--------|----------|-------------|----------|---------------------|
| | | | | |
| | | | | |

---

*Document générique — à adapter à chaque campagne d’audit (date, version logiciel, périmètre, auditeur).*  
*Références projet : `docs/audit/AUDIT_MANQUEMENTS_INCOHERENCES.md`, `docs/audit/ETAT_EXECUTION_AUDITS.md`, `docs/dashboard/AUDIT_MANQUEMENTS_INCOHERENCES.md`.*
