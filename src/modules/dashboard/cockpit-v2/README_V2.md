# Cockpit DG V2 — Roadmap

## Implémenté (Phase 1 + suite)

- **Types** : `PredictiveInsight`, `AutoPilotAction`, `AutoPilotDecision`, `ChantierForPrediction` (`types/cockpitV2.ts`)
- **Moteur prédictif** : règles heuristiques (retards, rupture ciment/peinture, bureau de contrôle) — `predictive-engine.ts`
- **Auto-pilot** : exécution avec garde-fous (budget auto max 500k FCFA), events DG (`autopilot-engine.ts`)
- **UI** : `CockpitDG_V2Page` (header IA V2, briefing, grille 3D ou **Vue 4D**, panneau Auto-pilot, prédictions 7j, quadrants, modules)
- **Vue 4D** : `FourDimensionalView` — axe temps vertical (Présent / +7j / +30j), sphères chantiers à y=0, marqueurs insights à y=5/10, lignes causales chantier → insight
- **Toggle Vue 3D / Vue 4D** : boutons « 3D Portfolio » et « 4D Temps + Prédictions » sur la page V2
- **Panneau décisions** : `AutoPilotPanel` (Approuver / Rejeter)
- **Navigation** : Vue d’ensemble → **Centrale V2 (IA)** (`overview/summary/cockpit-v2`)
- **Web Worker** : `src/workers/analytics.worker.ts` (compute_health_scores, predict_delays, optimize_resources) — **intégré** dans Cockpit V2 (postMessage au chargement chantiers)

## À brancher plus tard

- **TensorFlow.js** : `predictiveEngine.loadModel()` → `tf.loadLayersModel('/models/btp-predictor/model.json')` ; `predictDelay()` avec features réelles
- **LangChain / LLM** : `analyzeLLM()` pour patterns complexes (prompt chantier BTP Sénégal)
- **Collaboration CRDT** : Yjs + y-webrtc pour multi-DG temps réel (curseurs, décisions partagées)
- **Service Worker** : projet utilise déjà `next-pwa` ; étendre cache pour `/api/cockpit/*` et `/dashboard` (offline-first)
- **Blockchain** : traçabilité immuable (optionnel, Polygon/Ethereum)

## Utilisation

1. Aller sur **Tableau de bord** → **Accueil** → **Vue d’ensemble** → **Centrale V2 (IA)**.
2. Les prédictions 7j (retards, ruptures, BC) s’affichent ; les décisions en attente DG sont dans le panneau droit.
3. Approuver / Rejeter depuis le panneau Auto-pilot.
