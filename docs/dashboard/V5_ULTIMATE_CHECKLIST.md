# Cockpit DG V5 Ultimate — Checklist

Checklist de déploiement et validation pour la version V5 Ultimate du Cockpit DG (Nice Rénovation).

---

## Performance

| Statut | Item |
|--------|------|
| ✅ | FPS mesuré (hook `useCockpitFps`) |
| ✅ | Qualité adaptative (low / medium / high / ultra) |
| ✅ | Réduction sphères 3D en qualité low (10 sphères max) |
| ⬜ | 120 FPS cible (dépend GPU / device) |
| ⬜ | GPU compute shaders (backend / WebGL avancé) |
| ⬜ | Object pooling 3D (optionnel) |
| ⬜ | Web Workers (analytics / sync) |
| ⬜ | IndexedDB cache (mode hors-ligne) |

---

## Executive Panel V5

| Statut | Item |
|--------|------|
| ✅ | 12 boutons 1-clic (Urgence, Orange Money, Wave, Huissier UCIE, Contrat, Call, Broadcast, Boost, Relance, Forecast, Rapport DG, Archiver) |
| ✅ | Raccourcis clavier (Ctrl+Shift+E/O/W/H/C/F, Cmd sur Mac) |
| ✅ | Feedback visuel (EXECUTION…, Dernière commande) |
| ⬜ | Intégration Orange Money réelle (backend) |
| ⬜ | Intégration Wave réelle (backend) |
| ⬜ | Huissier UCIE (génération PDF + envoi) |
| ⬜ | WebRTC Call Team (backend) |
| ⬜ | Broadcast système (backend) |

---

## Commandes vocales

| Statut | Item |
|--------|------|
| ✅ | Web Speech API (fr-FR) |
| ✅ | Patterns FR / EN / Wolof (exact match) |
| ✅ | Fuzzy match (Levenshtein, seuil 55 %) |
| ✅ | Panneau « En écoute » + transcript + confiance |
| ✅ | Suggestions affichées |
| ⬜ | Audio feedback (sons accept / error) |
| ⬜ | Support multilingue dynamique (changement de langue) |

---

## Données & API

| Statut | Item |
|--------|------|
| ✅ | API Cockpit chantiers (`/api/cockpit/chantiers`) avec fallback mock |
| ✅ | Hook `useCockpitChantiers` (React Query + fallback) |
| ✅ | Hook `useCockpitLive` (WebSocket quand `NEXT_PUBLIC_COCKPIT_WS_URL` défini) |
| ⬜ | WebSocket serveur (événements chantier, GPS, stock, alertes) |
| ⬜ | PostgreSQL / Prisma (chantiers réels) |

---

## IA & ML (backend)

| Statut | Item |
|--------|------|
| ⬜ | GPT-4 briefing (OpenAI API) |
| ⬜ | Prédictions ML (XGBoost / TensorFlow.js) |
| ⬜ | Vector embeddings chantiers |
| ⬜ | Anomaly detection |

---

## Phase 6 (Photos GPS, Plan AR, Pointage, Drone)

| Statut | Item |
|--------|------|
| ✅ | Galerie Photos GPS (mock, filtrage chantier) |
| ✅ | Plan AR vs Réalité (slider comparaison) |
| ✅ | Pointage QR (mock scan + résultat) |
| ✅ | Drone feed (placeholder ou iframe si URL) |
| ⬜ | Photos réelles (stockage / CDN) |
| ⬜ | Scan QR réel (caméra / API) |

---

## Sécurité & RBAC

| Statut | Item |
|--------|------|
| ⬜ | RBAC granulaire (DG / Chef / Ouvrier) sur cockpit |
| ⬜ | Rate limiting API cockpit |
| ⬜ | Audit log actions exécutives |

---

## Mobile & PWA

| Statut | Item |
|--------|------|
| ⬜ | Responsive Cockpit (touch, petits écrans) |
| ⬜ | PWA manifest + Service Worker |
| ⬜ | Push notifications (urgences) |
| ⬜ | Mode hors-ligne (cache IndexedDB) |

---

## Indicateurs V5 dans l’UI

| Statut | Item |
|--------|------|
| ✅ | Badge FPS + qualité dans le briefing Cockpit DG |
| ✅ | Badge Live (WebSocket) quand connecté |
| ✅ | Health Spheres avec indicateur « live » si données API |

---

## Fichiers clés V5 (frontend)

- `src/modules/dashboard/components/cockpit/executiveCommandsV5.ts` — 12 commandes + shortcuts
- `src/modules/dashboard/components/cockpit/voiceCommandsV5.ts` — Patterns FR/EN/Wolof + fuzzy
- `src/modules/dashboard/components/cockpit/ExecutiveControls.tsx` — Barre 12 boutons + voix
- `src/modules/dashboard/hooks/useCockpitFps.ts` — FPS + qualité adaptative
- `src/modules/dashboard/components/views/CockpitDGPage.tsx` — Page Cockpit + indicateurs V5

---

**Légende** : ✅ fait (frontend ou mock) | ⬜ à faire (backend ou optionnel)
