# Roadmap Semaine 1 — Priorité critique

Ce document relie la roadmap produit (UX premium, 100k chantiers, APIs live) aux fichiers et actions concrètes du repo.

## ✅ Déjà fait (ce PR / session)

### 1. UX/UI — Loading states (Procore-style)
- **Fichiers :**
  - `src/modules/dashboard/components/shared/DashboardLoadingFallback.tsx` — squelette animé + barre de progression
  - `DashboardViewRouter.tsx` — utilise `DashboardLoadingFallback` quand `isLoading`
  - `DashboardContentSwitch.tsx` — overlay de chargement remplacé par skeleton + progress
- **Effet :** plus de simple "Chargement…" ; l’utilisateur voit une structure de page cohérente pendant le fetch.

### 2. UX/UI — Empty states avec CTA
- **Fichiers :**
  - `CockpitDGPage.tsx` — "Aucun chantier critique" avec CTA **"Nouveau chantier"** (navigation vers performance > projets)
  - `HealthSphereGrid.tsx` — prop `onNewChantier` ; empty state "Aucun chantier" avec CTA **"Nouveau chantier"**
  - `CockpitDG_V2Page.tsx` — passage de `onNewChantier` à `HealthSphereGrid`
- **Effet :** empty states explicites avec action claire au lieu d’un simple message.

### 3. Modèle de données Chantier (Prisma)
- **Fichier :** `prisma/schema.prisma`
- **Modèle :** `Chantier` avec `numero`, `segment`, `phase`, `ca`, `marge`, `sante`, `gpsLatitude/Longitude`, `photosGps` (JSON), `stockPeinture`, `bureauControle`, chef chantier, etc.
- **Note :** le schéma est en SQLite par défaut. Pour **42k+ chantiers** et production, passer à PostgreSQL (voir ci‑dessous).

---

## 🚨 Semaine 1 — À faire (priorité absolue)

### 1. APIs PostgreSQL live

**Objectif :** remplacer les mocks par des données Prisma (chantiers, ouvriers, etc.).

**Actions :**
1. **Option A — Rester en SQLite pour la démo :**
   - `pnpm prisma generate` puis `pnpm prisma db push` (ou `migrate dev`) pour créer la table `Chantier`.
   - Créer une route API : `app/api/dashboard/cockpit/chantiers/route.ts` qui lit `prisma.chantier.findMany()` et retourne un JSON compatible avec le cockpit (id, numero, segment, phase, ca, marge, sante, gpsLatitude, gpsLongitude, photosGps, etc.).

2. **Option B — PostgreSQL (production 42k chantiers) :**
   - Changer dans `schema.prisma` : `provider = "postgresql"` et `url = env("DATABASE_URL")` (URL Postgres sur Render.com, Neon, Supabase, etc.).
   - Déployer la DB, lancer `prisma migrate deploy`.
   - Même route API que ci‑dessus ; le cockpit consomme déjà des structures type `ChantierMock` qu’on peut mapper depuis le modèle Prisma.

**Fichiers à créer/modifier :**
- `app/api/dashboard/cockpit/chantiers/route.ts` (GET list chantiers, avec pagination si besoin)
- Hook ou fetch dans `useCockpitChantiers` pour appeler cette API au lieu du mock (voir `src/modules/dashboard/hooks/useCockpitChantiers.ts`).

### 2. WebSocket GPS / realtime

**Objectif :** position ouvriers en temps réel, mise à jour stock auto.

**Fichiers existants à relier :**
- `lib/websocket/alertBroadcaster.ts`, `scripts/websocket-server.js` ou équivalent
- Événement type `chantier:update` déjà écouté dans `CockpitDGPage` / `CockpitDG_V2Page` (`queryClient.invalidateQueries({ queryKey: ['cockpit', 'chantiers'] })`).

**Actions :**
- Backend : émettre des événements WebSocket sur mise à jour chantier (position, stock).
- Frontend : garder l’invalidation des queries ; optionnellement abonnement WebSocket direct pour mise à jour temps réel sans refetch complet.

### 3. Perf 1000 sphères (objectif 60 FPS)

**Fichiers :**
- `src/modules/dashboard/components/cockpit/HealthSphereGrid.tsx` — grille Three.js
- `ChantierSphere.tsx` — sphères individuelles

**Roadmap doc (référence) :** `COCKPIT_DG_AUDIT_ROADMAP.md` §2 — InstancedMesh + LOD (Level of Detail).  
À planifier en Semaine 1 (spike) puis implémentation en Semaine 2 si besoin.

---

## Liens utiles

- **Tuto Next.js + Prisma + Render.com :** à suivre pour connecter une base PostgreSQL et déployer l’API.
- **Vercel (frontend) :** déploiement du front Next.js en 5 min ; les associés peuvent voir le cockpit avec les nouvelles UX (loading, empty states, CTA).

---

## Critères de succès Semaine 1

- [ ] Au moins une route API chantiers alimentée par Prisma (SQLite ou PostgreSQL).
- [ ] Cockpit affiche des chantiers venant de l’API (ou mock mixte) avec loading skeleton + empty state "Nouveau chantier".
- [ ] WebSocket ou polling pour rafraîchissement chantiers documenté / branch prêt.

Une fois ces points en place, la priorité suivante est **Semaine 2** : PWA, push notifications, auth DG, Orange Money (voir roadmap produit).
