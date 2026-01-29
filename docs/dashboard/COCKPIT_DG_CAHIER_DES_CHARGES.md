# Cahier des charges – Cockpit DG Yessalate / NICE RÉNOVATION

**Centrale de commandement exécutive – Niveau aérospatial 2026**

| Attribut | Valeur |
|----------|--------|
| Version | 2.0 |
| Date | Janvier 2026 |
| Statut | Confidentiel – usage interne développement |
| Référence | CCD-COCKPIT-DG-2026 |

---

## 1. Contexte métier et objectifs

### 1.1 Écosystème NICE RÉNOVATION

- **Entité** : entreprise BTP intégrée (50M FCFA capital, 16 associés).
- **Digital** : 12 applications interconnectées (écosystème digital).
- **Cœur métier** : rénovation second œuvre (~70 %).
- **Mission** : formalisation de l’économie informelle (ouvriers, commerçants).
- **Segments** : Diaspora, Commerçants, Commerce informel, Établissements, Particuliers.
- **Workflow** : 26 étapes (Qualification → Certification huissier).
- **Qualité** : Bureau Contrôle (règle 2/3).
- **Parties prenantes** : Ouvriers, Quincailleries, Huissiers, Notaires.

### 1.2 Rôle du Cockpit DG

| Objectif | Description |
|----------|-------------|
| Vision 360° | Donner au DG une vue temps réel de tout l’écosystème (chantiers, ouvriers, fournisseurs, huissiers). |
| Détection | Identifier automatiquement les 3 risques critiques du moment. |
| Exécution | Commandes en 1 clic : relance, huissier, paiement, priorisation. |
| Prédiction | Anticiper les problèmes 48 h à l’avance (IA). |
| Pilotage | Contrôler 42 chantiers + 27 ouvriers + 3 quincailleries sur un seul écran. |

### 1.3 Niveau cible

- **Référence** : Marco Enterprise, 3P, Odoo Enterprise, centrales de commandement type aérospatial.
- **Interdit** : dashboards plats 2D, navigation statique, données purement statiques, patterns “dashboard basique”.

---

## 2. Architecture fonctionnelle globale

### 2.1 Schéma de l’écran principal

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER COMMAND & CONTROL (80px fixe)                                                 │
│ [Logo] [AI Briefing] [Smart Search] [Voice] [Alertes] [Profil]                        │
│ "Phase4-042 bloqué peinture. Stock 0%. NPS Diaspora ▼15pts"                           │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌─ NAV 3D CONTEXTUELLE (250px) ──────┐ ┌─ CENTRALE 4 QUADRANTS ────────────────────────┐
│ MISSION CONTROL ●●●                │ │ Q1: HealthReactor3D (sphère vitale)            │
│ ├─ 360° (42 | 18M | 23%)           │ │ Q2: LiveChantier3D (chantier critique GPS)     │
│ ├─ Prédictif IA (▼12% Q2)          │ │ Q3: ÉcosystèmeVivant (organigramme pulsant)   │
│ └─ Alertes (3 CRITIQUES)           │ │ Q4: WorkflowNucléaire (26 étapes Kanban 3D)   │
│ WORKFLOW 26 ÉTAPES                 │ │                                                 │
│ ├─ Phase1–6 (Drag&Drop)            │ │ EXECUTIVE CONTROLS (barre fixe bas)            │
│ ├─ Matériaux (ruptures)            │ │ [ÉMERGENCE][BOOST][CALL][PAY][HUISSIER][RELANCE]│
│ └─ Bureau Contrôle (2/3)           │ └─────────────────────────────────────────────────┘
│ ÉCOSYSTÈME (27 KYC, quincailleries)│
└────────────────────────────────────┘
```

### 2.2 Zonage et proportions

| Zone | Largeur | Rôle |
|------|---------|------|
| Header | 100 % × 80px | Briefing IA, recherche, voix, alertes. |
| Nav contextuelle | 250px | Pilotage, workflow, écosystème (arborescence 3 niveaux). |
| Quadrant 1 | 25 % largeur centrale | HealthReactor3D. |
| Quadrant 2 | 25 % | LiveChantier3D. |
| Quadrant 3 | 25 % | ÉcosystèmeVivant. |
| Quadrant 4 | 25 % | WorkflowNucléaire. |
| Executive Controls | 100 % × 56px | 8 boutons d’action 1 clic. |

---

## 3. Spécifications détaillées par bloc

### 3.1 Header Command & Control (80px)

#### 3.1.1 Éléments obligatoires

| Élément | Type | Comportement |
|--------|------|--------------|
| Logo | Lien | Retour accueil / tableau de bord. |
| AI Briefing | Texte dynamique (1–3 lignes) | Mis à jour selon état global (voir 3.1.2). |
| Smart Search | Champ recherche | Recherche sémantique (chantier, phase, ouvrier, huissier, segment). |
| Voice | Bouton micro | Lance reconnaissance vocale → exécution de commande (voir 7.2). |
| Alertes | Badge + dropdown | Nombre critiques/attention + liste cliquable. |
| Profil | Avatar / menu | Déconnexion, préférences, thème. |

#### 3.1.2 Règles AI Briefing

- **Tout nominal** : « 42 chantiers OK. CA 18M. Marge 23 %. »
- **Attentions** : « 3 ATTENTIONS – Phase4 à surveiller. »
- **Critiques** : « 3 CRITIQUES – Action immédiate : Phase4-042 bloqué peinture, stock 0 %. »
- Mise à jour : temps réel (WebSocket) ou polling ≤ 30 s.
- Longueur : max 2 lignes, phrase courte par alerte.

#### 3.1.3 Smart Search (recherche intelligente)

- Requête libre : « phase4 peinture », « ouvrier absent », « diaspora retard », « huissier 042 ».
- Réponse : résultats en < 1 s (chantiers, phases, ouvriers, dossiers huissier).
- Actions : clic sur un résultat → focus sur le quadrant concerné (ex. chantier 042 dans LiveChantier3D ou Workflow).

---

### 3.2 Quadrant 1 : HealthReactor3D®

#### 3.2.1 Rôle

- Sphère 3D représentant la “santé” globale (Opérations, Finance, Workflow).
- Clic sur une zone → drill-down vers la cause racine (phase, segment, chantier).

#### 3.2.2 Comportement visuel

| Élément | Spécification |
|---------|----------------|
| Sphère principale | Pulse 0,1–2 Hz selon niveau de criticité (plus critique = plus rapide). |
| Sous-sphères | 3 orbites : Opérations, Finance, Workflow. |
| Couleurs | Vert (OK), Jaune (attention), Rouge (critique), selon seuils (voir 7.1). |
| Particules | Densité proportionnelle à la gravité (plus critique = plus de particules). |
| Interaction | Clic → panneau “diagnostic IA” (cause racine + actions suggérées). |

#### 3.2.3 Métriques affichées (sous ou autour de la sphère)

- Opérations : % (ex. 87 %) + indicateur vert/jaune/rouge.
- Finance : CA (ex. 18M/50M), Marge (ex. 23 %).
- Workflow : % global + phase la plus en retard (ex. Phase4 62 %).
- KYC : ex. 27/25 ouvriers (objectif dépassé = vert).

#### 3.2.4 Technologie

- **Moteur 3D** : Three.js (r165+) avec React Three Fiber + Drei.
- **Shaders** : GLSL pour pulsation et particules (optionnel en V1).
- **Contrôles** : OrbitControls (rotation, pas de zoom ou zoom limité).
- **Performance** : 60 fps cible, LOD si nécessaire sur mobile.

---

### 3.3 Quadrant 2 : LiveChantier3D®

#### 3.3.1 Rôle

- Vue 3D temps réel du chantier “critique” du moment (sélection automatique ou manuelle).
- Position GPS, avancement, matériaux, Bureau Contrôle, photos GPS.

#### 3.3.2 Contenu

| Donnée | Affichage |
|--------|-----------|
| Chantier critique | ID ex. #042, libellé, segment. |
| GPS chef d’équipe | Point lumineux sur fond carte/3D (Thiès, etc.). |
| Avancement | Hauteur bâtiment 3D ou barre = 0–100 %. |
| Ouvriers | Points GPS (ex. 12/27 présents). |
| Matériaux | Icônes 3D ou badges : Peinture (stock 0 % = rouge), Carrelage (OK = vert). |
| Bureau Contrôle | Ex. 1/3 validations (affichage explicite). |
| Photos GPS | Miniatures cliquables (fullscreen au clic). |

#### 3.3.3 Contrôles utilisateur

- [Photos GPS] : galerie du chantier.
- [Mesures AR] : overlay plan vs réalité (V2).
- [Drone] : flux WebRTC si connecté (V2).
- [Appel équipe] : déclenchement appel WebRTC vers chef d’équipe.

#### 3.3.4 Technologie

- **3D** : React Three Fiber + Three.js.
- **GPS / Carte** : Mapbox GL JS ou Leaflet (déjà présent) + couche 3D.
- **Temps réel** : WebSocket (positions, statuts).
- **Appel** : WebRTC (Daily.co ou équivalent) ou lien tel:.

---

### 3.4 Quadrant 3 : ÉcosystèmeVivant®

#### 3.4.1 Rôle

- Organigramme animé “vivant” : Humain (ouvriers), Quincailleries, Huissiers, Paiements.
- Pulsations et couleurs selon état (retards, ruptures, en attente).

#### 3.4.2 Blocs de contenu

| Bloc | Métriques / Infos |
|------|-------------------|
| **Humain (27 KYC)** | 12/27 sur chantier (GPS live), 3 équipes surchargées (>80 h/sem), Turnover +12 % (alerte). |
| **Quincailleries** | 34 h retard moyen, 3 ruptures critiques (ex. Peinture), 2 retards livraison récurrents. |
| **Huissiers** | 2 dossiers en attente (ex. Dossier#042 certification UCIE, Litige#015). |
| **Paiements** | Répartition Orange Money / Wave / Cash (ex. 67 % / 23 % / 10 %). |

#### 3.4.3 Comportement

- Noeuds cliquables → détail (liste ouvriers, liste commandes, dossier huissier).
- Animation : pulsation légère (GSAP ou Framer Motion), couleur selon seuil.
- Mise à jour : WebSocket ou polling 30 s.

#### 3.4.4 Technologie

- **Graphe** : D3.js (v7) force-directed ou React Flow pour organigramme.
- **Animations** : Framer Motion ou GSAP.
- **Données** : API REST + WebSocket pour compteurs et statuts.

---

### 3.5 Quadrant 4 : WorkflowNucléaire® (26 étapes)

#### 3.5.1 Rôle

- Kanban 3D (ou 2.5D) en 6 colonnes : Phase1 → Phase6.
- Chaque colonne = sous-ensemble des 26 étapes métier.
- Statuts “intelligents” : ●●●○○○ (OK), ●○○○○○ (attention), 🔴○○○○○ (critique).

#### 3.5.2 Contenu par colonne (ex. Phase4)

- Nombre de chantiers (ex. 15).
- Indicateurs :
  - Matériel : OK / Attention / Rupture (ex. Peinture 0 %).
  - Bureau Contrôle : x/3 validations.
  - Photos GPS : à jour / absence > 3 j.
  - Prédiction IA : ex. 87 % probabilité retard.
- GPS Live : ex. 12/27 ouvriers.

#### 3.5.3 Interactions

- **Drag & Drop** : déplacer un chantier Phase4 → Phase5 → appel API mise à jour immédiate.
- **Bulk** : sélection multiple + action (relance, priorisation, export).
- **Inline** : édition rapide (statut, affectation) dans la carte.
- **AI Predict** : bouton “Prédiction retard” → modal ou panneau avec probabilité et recommandations.

#### 3.5.4 Technologie

- **Drag & Drop** : @dnd-kit (déjà dans le projet) ou react-beautiful-dnd.
- **Listes longues** : virtualisation (@tanstack/react-virtual déjà présent).
- **Temps réel** : WebSocket pour mise à jour des colonnes et compteurs.
- **IA** : appel API prédiction (backend) ou modèle côté client (TensorFlow.js) en V2.

---

### 3.6 Executive Controls (barre fixe bas)

#### 3.6.1 Boutons obligatoires (8)

| Bouton | Action | Règle métier |
|--------|--------|--------------|
| ÉMERGENCE | Litiges, redémarrage urgence | Ouverture modal/scène “crise” + actions ciblées. |
| BOOST | Prioriser, ressources extra | API priorisation chantier / équipe. |
| CALL TEAM | Appel équipe | WebRTC ou lien tel: vers chef chantier sélectionné. |
| PAY NOW | Paiement | Orange Money / Wave (ouverture flux paiement). |
| HUISSIER | Certification UCIE | Génération PDF + envoi automatique partenaire huissier. |
| RELANCE | Relance fournisseurs/clients | Envoi relance (email/SMS) selon template. |
| FORECAST | Prédiction IA 7 j | Affichage prévisions (retards, besoins matériaux). |
| ARCHIVER | Fermer dossier | Passage statut “archivé” + API. |

#### 3.6.2 Contraintes

- Chaque bouton : 1 clic → 1 action (pas de tunnel multi-étapes sans nécessité).
- Feedback : loading + toast succès/erreur.
- HUISSIER : PDF généré + envoyé en < 10 s (objectif).
- CALL : connexion WebRTC < 3 s (objectif).

---

## 4. Stack technique détaillée

### 4.1 Frontend (Cockpit DG)

| Domaine | Technologie | Version cible | Usage |
|---------|-------------|--------------|--------|
| Framework | Next.js | 16.x (existant) | App Router, API Routes, SSR/ISR si besoin. |
| Langage | TypeScript | 5.x (existant) | Typage strict, interfaces partagées. |
| UI de base | shadcn/ui + Tailwind | 4.x (existant) | Composants, design system. |
| Utilitaire CSS | clsx / tailwind-merge | (existant) | Classes conditionnelles. |
| 3D | @react-three/fiber, @react-three/drei, Three.js | r165+ | HealthReactor3D, LiveChantier3D. |
| Animations | Framer Motion, GSAP | 12.x / 3.12 | Transitions, pulsations, orchestration. |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable | (existant) | WorkflowNucléaire. |
| Graphes | D3.js ou React Flow | v7 / 11.x | ÉcosystèmeVivant. |
| Charts | Recharts | (existant) | Courbes prédictives, mini graphiques. |
| État global | Zustand | (existant) | État cockpit, navigation, sélection chantier. |
| Données temps réel | Socket.io-client, useSWR / TanStack Query | (existant) | Live KPIs, positions, alertes. |
| Carte / GPS | Leaflet, react-leaflet | (existant) | Fond carte 2D ; Mapbox en option pour 3D. |
| Vocale | Web Speech API (reconnaissance) | - | Commandes vocales (navigateur). |

**À ajouter au projet si absent :**

- `@react-three/fiber`, `@react-three/drei`, `three`
- `gsap` (si animations complexes au-delà de Framer)
- `d3` (si graphe force-directed pour ÉcosystèmeVivant)
- Optionnel V2 : `@tensorflow/tfjs` pour prédiction côté client

### 4.2 Backend et données

| Domaine | Technologie | Usage |
|---------|-------------|--------|
| API | Next.js Route Handlers ou NestJS | Endpoints REST + WebSocket. |
| Base | PostgreSQL + Prisma | (existant) Modèles chantiers, phases, ouvriers, alertes. |
| Cache / sessions | Redis | (existant si présent) Cache KPIs, sessions temps réel. |
| Files | S3 ou stockage projet | Photos GPS, plans, PDF huissier. |
| Géoloc | Mapbox API ou équivalent | Géocodage, isochrones si besoin. |
| Paiements | Orange Money API, Wave API | Intégration bouton PAY NOW. |
| SMS / Email | Twilio ou Sendinblue etc. | Relances, notifications. |
| Appels | Daily.co ou WebRTC maison | CALL TEAM. |

### 4.3 Déploiement et qualité

| Domaine | Technologie | Usage |
|---------|-------------|--------|
| Hébergement front | Vercel (existant) | Build, preview, prod. |
| Backend | Render / Railway / VPS | APIs, workers, WebSocket. |
| CDN | Cloudflare (optionnel) | Assets, images. |
| Monitoring | Sentry, Datadog (optionnel) | Erreurs, perfs. |
| Tests E2E | Playwright (existant) | Scénarios critiques cockpit. |

---

## 5. Métriques et alertes intelligentes

### 5.1 Seuils critiques (rouge)

| Condition | Seuil | Exemple |
|-----------|--------|---------|
| Phase sans photo GPS | > 5 j | Phase4-042 : 6 j sans photo. |
| Stock matériaux | < 5 % | Peinture 0 %. |
| Budget dépassement | > 15 % | Chantier 042 : +18 %. |
| Bureau Contrôle | < 2/3 après 48 h | 1/3 validations. |
| Litige détecté | Mot-clé “problème” / ticket | Ticket #015. |

### 5.2 Seuils attention (jaune)

| Condition | Seuil |
|-----------|--------|
| Phase durée | > 120 % durée prévue |
| NPS segment | < 70 |
| Turnover ouvrier | > 10 % |
| Retard quincaillerie | > 48 h |

### 5.3 Prédiction IA (48 h à l’avance)

- **Livrables** : probabilité retard par chantier, risque litige (%), besoin matériaux 7 j.
- **Interface** : panneau ou modal “Recommandations IA” (ex. “Relancer quincaillerie X”).
- **Implémentation** : API dédiée (modèle backend) ou TensorFlow.js côté client (V2).

---

## 6. Commandes vocales

### 6.1 Exemples de commandes

| Commande vocale | Action système |
|-----------------|----------------|
| “Montre Phase4 bloqué” | Filtre Phase4 + statut bloqué, zoom Workflow + éventuellement LiveChantier. |
| “Appelez équipe 042” | Déclenchement appel WebRTC vers chef chantier 042. |
| “Huissier dossier 042” | Génération PDF + envoi huissier partenaire. |
| “Phase4 peinture” | Smart Search “phase4 peinture” + affichage résultats. |

### 6.2 Technologie

- **Reconnaissance** : Web Speech API (navigateur) ou Whisper (API) pour transcription.
- **Interprétation** : règles métier (keywords) ou petit modèle NLU / LLM.
- **Exécution** : même actions que boutons et recherche (navigation, API, WebRTC).

---

## 7. Livrables et phasage

### 7.1 MVP (4 semaines)

- [ ] HealthReactor3D (sphère vitale avec 3 sous-sphères, couleurs, clic drill-down).
- [ ] WorkflowNucléaire 6 phases (Kanban Drag&Drop, mise à jour API).
- [ ] Header avec AI Briefing + Smart Search (données mock ou API existantes).
- [ ] Executive Controls (8 boutons, actions mock ou 1–2 réelles).
- [ ] Données mock : 42 chantiers, 27 ouvriers, 3 quincailleries, alertes.

### 7.2 V1.0 (8 semaines)

- [ ] LiveChantier3D (chantier critique, GPS, avancement, matériaux, Bureau Contrôle).
- [ ] ÉcosystèmeVivant (organigramme Humain / Quincailleries / Huissiers).
- [ ] Commandes vocales (3–5 commandes).
- [ ] APIs réelles (PostgreSQL, Prisma).
- [ ] WebSocket temps réel (positions, alertes, KPIs).

### 7.3 V2.0 (12 semaines)

- [ ] Prédiction IA intégrée (retard, litige, matériaux).
- [ ] AR Plan vs Réalité (overlay).
- [ ] Flux Drone (WebRTC) si équipement.
- [ ] Bulk Actions (sélection multiple, export, relances groupées).
- [ ] Responsive / tablette DG.

---

## 8. Critères de recette (obligatoires)

| # | Critère | Condition de validation |
|---|--------|---------------------------|
| R1 | HealthReactor | Sphère pulse 0,1–2 Hz selon criticité. |
| R2 | Workflow | Drag&Drop Phase4→Phase5 met à jour l’API et l’UI en < 2 s. |
| R3 | Smart Search | “phase4 peinture” renvoie des résultats pertinents en < 1 s. |
| R4 | Voice | “Appelez équipe 042” déclenche flux appel (WebRTC ou tel:) en < 3 s. |
| R5 | HUISSIER | Bouton HUISSIER génère PDF et envoie en < 10 s. |
| R6 | Perfs | 1000 chantiers simulés : interface fluide (60 fps ou équivalent). |
| R7 | Accessibilité | Dark mode + critères WCAG AA (contraste, focus, labels). |

---

## 9. Références projet

- **Dashboard actuel** : `app/(portals)/maitre-ouvrage/dashboard/`, `src/modules/dashboard/`.
- **État global** : `src/lib/stores/dashboardCommandCenterStore.ts`.
- **Registry vues** : `src/modules/dashboard/registry/dashboardRegistry.tsx`.
- **Navigation** : `src/modules/dashboard/navigation/dashboardNavigationConfig.ts`.
- **Domaine métier** : `src/domain/` (demandes, gouvernance, calendrier).

---

## 10. Ordre de mise en œuvre recommandé

1. **HealthReactor3D** : impact visuel fort, dépendances limitées (Three.js + données agrégées).
2. **Header AI Briefing + Smart Search** : central pour l’usage quotidien.
3. **WorkflowNucléaire** : réutilisation @dnd-kit et store existant.
4. **Executive Controls** : branchement progressif des APIs (HUISSIER, RELANCE, etc.).
5. **LiveChantier3D** : après mise en place des flux GPS et chantier “critique”.
6. **ÉcosystèmeVivant** : après APIs écosystème (ouvriers, quincailleries, huissiers).
7. **Commandes vocales** : en parallèle ou après stabilisation des écrans.

---

*Document à traiter comme référence normative pour le développement du Cockpit DG. Toute déviation doit être documentée et validée.*
