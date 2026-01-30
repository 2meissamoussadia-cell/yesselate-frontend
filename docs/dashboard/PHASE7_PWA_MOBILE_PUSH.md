# Phase 7 — PWA Installable + Push Notifications + Cockpit Mobile-First

Cockpit DG 100% mobile : PWA installable (YESSALATE Centrale DG), push notifications critiques, layout swipe quadrants, header compact, executive controls.

## 1. PWA Manifest + Service Worker

- **Manifest** : `public/manifest.json` — nom « YESSALATE Centrale DG », `short_name` « Yessalate DG », `display: standalone`, `theme_color: #3b82f6`, `background_color: #0f172a`, icônes 192/512 (fallback `images/log_yessalate.png`).
- **Service Worker** : `public/sw.js` — cache `yessalate-dg-v1`, offline fallback, push handler avec `chantierId`, actions « Voir Chantier » / « Huissier », `notificationclick` vers dashboard/chantier.
- **Enregistrement** : `PwaRegistration` et `useServiceWorker` enregistrent `/sw.js` (scope `/`).
- **Next** : `next.config.ts` — headers no-cache pour `/sw.js`, `remotePatterns` pour `yessalate-photos.s3.af-south-1.amazonaws.com`.

## 2. Layout mobile (swipe quadrants)

- **MobileCockpit** : `src/modules/dashboard/components/cockpit/MobileCockpit.tsx` — header h-16, 3 quadrants (Spheres = HealthSphereGrid, Workflow, Écosystème), swipe gauche/droite via `useTouchGestures`, footer 4 boutons exécutifs.
- **Cockpit V2** : sur `useIsMobile()` la page Cockpit DG V2 affiche `MobileCockpit` au lieu du layout desktop.

## 3. Push notifications critiques

- **SW push** : `sw.js` écoute `push`, affiche notification avec `data.message`, `data.chantierId`, actions VIEW / HUISSIER.
- **Hook** : `usePushNotifications` — `requestPermission()`, `sendCriticalAlert(chantierId, message)`, `isSupported`. Utilisable pour bannière consentement ou tests.
- **Abonnement** : `usePushConsent` + API `/api/push/vapid-public`, `/api/push/subscribe` pour envoi serveur.

## 4. Optimisations mobile 60 FPS

- **MobileSphereOptimizer** : composant R3F `InstancedMesh` pour afficher beaucoup de sphères (1000+) à 60 FPS sur mobile. Utilisable en mode « performance » à la place de N `ChantierSphere`.

## 5. Critères de validation Phase 7

- [ ] PWA installable iPhone (« Ajouter à l’écran d’accueil »)
- [ ] PWA installable Android Chrome (« Installer l’application »)
- [ ] Push notification « Phase4 bloqué » (ou alerte critique) reçue (navigateur fermé)
- [ ] Swipe gauche/droite entre quadrants fluide
- [ ] Header compact mobile (h-16)
- [ ] 1000 sphères InstancedMesh = 60 FPS iPhone 12 (optionnel, via MobileSphereOptimizer)
- [ ] Mode offline (cache spheres / shell)
- [ ] Dark theme (theme-color #0f172a)
- [ ] Mobile executive controls (4 gros boutons)

## 6. Test mobile checklist

- iPhone Safari → « Ajouter à l’écran d’accueil » ✓
- Android Chrome → « Installer l’app » ✓
- Push reçue (navigateur fermé) ✓
- Swipe gauche/droite quadrants ✓
- 60 FPS sur 100+ sphères (InstancedMesh si activé) ✓
- Offline : spheres visibles depuis le cache ✓
- Voice commands mobile (optionnel) ✓

## 7. Déploiement PWA

```bash
# Générer icônes PWA (optionnel)
npx pwa-asset-generator ./public/images/log_yessalate.png ./public --icon-only

# Production
vercel --prod

# Audit PWA
lighthouse https://votre-domaine.vercel.app --view
# Objectif : Score PWA 100/100
```

## Fichiers modifiés / ajoutés

| Fichier | Rôle |
|--------|------|
| `public/manifest.json` | PWA YESSALATE Centrale DG |
| `public/sw.js` | SW offline + push (chantierId, VIEW, HUISSIER) |
| `next.config.ts` | Headers sw.js, images S3 photos |
| `app/layout.tsx` | themeColor #0f172a, apple-touch-icon |
| `src/components/pwa/PwaRegistration.tsx` | Enregistre `/sw.js` |
| `src/hooks/useServiceWorker.ts` | Enregistre `/sw.js` |
| `src/modules/dashboard/hooks/usePushNotifications.ts` | Hook push (permission, sendCriticalAlert) |
| `src/modules/dashboard/components/cockpit/MobileCockpit.tsx` | Layout mobile swipe quadrants |
| `src/modules/dashboard/components/cockpit/MobileSphereOptimizer.tsx` | InstancedMesh 60 FPS |
| `src/modules/dashboard/components/views/CockpitDG_V2Page.tsx` | Branche mobile → MobileCockpit |
