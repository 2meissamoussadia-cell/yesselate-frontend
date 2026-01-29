# Phase 5 — Production Ready (APIs PostgreSQL + WebSocket Live)

Cockpit DG 100% production : 42k chantiers, GPS ouvriers live, stock quincaillerie.

## 1. Schéma Prisma (Production)

- **Chantier** : `numero`, `segment`, `prestation`, `phase` (1–26), `ca`, `marge`, `sante`, `stockPeinture`, `bureauControle`, `photosManquantes`, etc.
- **Ouvrier** : `nom`, `cni`, `kycStatus`, `gpsLat` / `gpsLng`, `chantierId`, `isPresent`, `lastPing`.
- **Quincaillerie** : `nom`, `localisation`, `stockPeinture`, `stockCarrelage`, `retardLivraison`, `critical`.

Pour **42k+ chantiers** : passer le provider à `postgresql` et `DATABASE_URL` → Render / Neon.

## 2. APIs Next.js (standalone)

| Route | Description |
|-------|-------------|
| `GET /api/chantiers` | Liste chantiers (`?phase=`, `?segment=`, `?limit=`) |
| `GET /api/chantiers/health` | Health spheres (top 42, triés par CA) |
| `GET /api/chantiers/ecosystem` | Écosystème live (chantiers + ouvriers + quincailleries) |

Données : mock (`chantiersMock`) ou Prisma lorsque les tables existent.

## 3. WebSocket Live

- **Hook** : `useCockpitLive` (types `gps_live_update`, `stock_critical`, `chantier:update`).
- **URL** : `NEXT_PUBLIC_COCKPIT_WS_URL` ou `NEXT_PUBLIC_WS_URL` (ex. `wss://yessalate-api.onrender.com`).
- Sur `gps_live_update` / `stock_critical` : invalidation `useLiveChantiers` + toast stock critique.

## 4. Frontend

- **useLiveChantiers** : `/api/chantiers/health`, refresh 5s, WebSocket → invalidate + alerte.
- **LiveHealthSpheres** : grille 3D Phase 5 (Cockpit DG V2, bouton **Live**).
- **HealthSphereGrid** : mode classique (`/api/cockpit/chantiers`).

## 5. Déploiement

### Backend (Render.com)

- Nouveau Web Service → GitHub.
- `DATABASE_URL` = `postgresql://user:pass@host:5432/db`.
- `npx prisma migrate deploy` puis `npx prisma generate`.

### Frontend (Vercel)

- `vercel --prod`.
- Variables d’environnement :
  - `NEXT_PUBLIC_API_URL` : API backend (optionnel si tout passe par Next.js).
  - `NEXT_PUBLIC_WS_URL` ou `NEXT_PUBLIC_COCKPIT_WS_URL` : WebSocket live.

### .env production (exemple)

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_WS_URL="wss://yessalate-api.onrender.com"
```

## 6. Seed chantiers

```bash
node scripts/seed-chantiers-phase5.js
```

Crée des chantiers réalistes (NICE RÉNOVATION). Pour 42k : augmenter la boucle et utiliser PostgreSQL.

## 7. Critères de validation Phase 5

- [ ] 42k chantiers PostgreSQL live (ou mock/API health)
- [ ] WebSocket GPS ouvriers realtime (`gps_live_update`)
- [ ] Spheres auto-refresh 5s
- [ ] Stock peinture critique → alerte
- [ ] Backend Render.com live (si NestJS dédié)
- [ ] Frontend Vercel live
- [ ] 1000 chantiers ≈ 60 FPS (LOD / InstancedMesh si besoin)

## 8. URLs production (exemple)

- Frontend : `https://yessalate-dg.vercel.app`
- Backend : `https://yessalate-api.onrender.com`
- WebSocket : `wss://yessalate-api.onrender.com`
