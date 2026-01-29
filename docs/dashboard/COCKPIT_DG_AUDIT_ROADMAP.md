# Audit Cockpit DG Yessalate — Roadmap d’amélioration

> Cockpit niveau Procore 2026 — 15 améliorations prioritaires pour le rendre imparable.

---

## 🎨 1. UX/UI — Raffinements premium (priorité haute)

| À améliorer | Solution | Statut |
|-------------|----------|--------|
| **Loading states absents** | Squelettons animés + progress bars (Procore-style) | ✅ Fait |
| **Empty states manquants** | "Aucun chantier critique" + CTA "Voir les chantiers" | ✅ Fait |
| **Tooltips pauvres** | Tooltip riche chantier (photos GPS, équipe, budget détail) | ✅ Fait |
| **Dark mode statique** | Auto-detect system preference (thème "Système") | ✅ Fait |
| **Responsive mobile** | Mobile-first : swipe quadrants (snap scroll) | ✅ Fait |
| **Thème sur Cockpit** | ThemeToggle (System/Dark/Dakar/Light) dans la barre briefing | ✅ Fait |
| **Barre Executive** | Loading placeholder (skeleton) pendant chargement | ✅ Fait |

---

## ⚡ 2. Performances — 100k chantiers scalable (priorité critique)

| Problème | Fix | Statut |
|----------|-----|--------|
| Three.js 42 sphères OK, 1000 = lag | InstancedMesh + LOD (Level of Detail) | ⬜ À faire |
| ForceGraph3D 50+ nœuds lent | react-force-graph + worker threads | ⬜ À faire |
| Drag & Drop recalcule tout | Virtual Scrolling + memoization React | ⬜ À faire |
| 60 FPS non garanti | requestAnimationFrame throttling + RAF limiter | ⬜ À faire |

**Benchmark cible :** 1000 chantiers + 500 ouvriers = 60 FPS iPhone 12.

---

## 🔌 3. APIs & intégrations réelles (priorité immédiate)

| Élément | Action | Statut |
|---------|--------|--------|
| **PostgreSQL + Prisma** (42k chantiers) | Modèle `Chantier` (numero, segment, phase, ca, marge, sante, gpsLatitude, gpsLongitude, photosGps, stockPeinture, bureauControle) | ⬜ À faire |
| **WebSocket Live** (Socket.io) | GPS ouvriers realtime + stock auto-maj | ⬜ À faire |
| **Orange Money / Wave API** | Bouton "PAY NOW" = transaction réelle | ⬜ À faire |
| **Mapbox GPS** | Position exacte ouvriers + géofencing chantier | ⬜ À faire |

---

## 🧠 4. IA & automatisation (priorité différenciante)

| Actuel | Cible | Statut |
|--------|-------|--------|
| IA basique | Prédiction retard 48h (TensorFlow.js) : phase/délai/stock/équipe → 87% retard | ⬜ À faire |
| — | Change detection auto (Procore) : "+18% budget vs devis" → alerte + workflow | ⬜ À faire |
| — | Anomalies smart : "3j sans photo GPS" → alerte auto | ⬜ À faire |
| NLP voice actuel | NLP voice avancé : "montre diaspora phase4 peinture" → filtre complexe | ⬜ À faire |

---

## 📱 5. Mobile & PWA (priorité business)

| Actuel | Cible | Statut |
|--------|-------|--------|
| Desktop only | PWA installable (manifest.json + service worker) | ⬜ À faire |
| — | iPhone dashboard fluide : swipe quadrants + pinch zoom sphères | ⬜ À faire |
| Push partiel | Push : "🚨 Phase4-042 stock peinture 0%" | ✅ Bannière consent (voir PUSH_SETUP.md) |
| — | Offline : cache sphères + sync auto | ⬜ À faire |

---

## 🔒 6. Sécurité & confiance (priorité juridique)

| Manque | Cible | Statut |
|--------|-------|--------|
| Auth générique | Authentification DG uniquement (NextAuth.js + Google/Orange) | ⬜ À faire |
| — | Audit trail : toutes actions loguées (qui / clic / quand) | ⬜ À faire |
| — | Photos GPS blockchain hash (SHA256) — huissier OK | ⬜ À faire |
| — | RGPD : consent ouvriers + oubli facile | ⬜ À faire |

---

## 📊 7. Métriques business (priorité KPI)

| Actuel | Cible | Statut |
|--------|-------|--------|
| Métriques génériques | Formalisation informel : +4 ouvriers KYC ce mois (graph) | ⬜ À faire |
| — | Marge target 25 % : alertes auto si &lt;20 % | ⬜ À faire |
| — | Workflow 26 étapes : phase la plus lente (heatmap) | ⬜ À faire |
| — | Diaspora vs locaux : split 50/50 CA + NPS | ⬜ À faire |

---

## 🎵 8. Sons & haptics (priorité immersion)

| Actuel | Cible | Statut |
|--------|-------|--------|
| Silencieux | Alertes sonores criticality : rouge = alarme, jaune = bip | ⬜ À faire |
| — | Haptics mobile : vibration forte = risque critique | ⬜ À faire |
| — | Feedback positifs : "Payé !" = son cash register | ⬜ À faire |

---

## 🛠️ 9. Roadmap priorisée (4 semaines)

### 🚨 Semaine 1 (critique)
- [ ] APIs PostgreSQL live
- [ ] WebSocket GPS realtime
- [x] Loading states + empty states Cockpit + briefing skeleton + tooltip riche sphères
- [ ] Perf 1000 sphères (InstancedMesh / LOD)

### ⚡ Semaine 2 (urgent)
- [ ] Mobile PWA + Push notifications
- [ ] Intégration Orange Money
- [ ] Auth DG uniquement

### 🎯 Semaine 3 (différenciation)
- [ ] Prédiction IA retard
- [ ] Photos GPS textures sphères
- [ ] Sons + haptics

### ✨ Semaine 4 (lancement)
- [ ] Démo 5 chantiers pilotes
- [ ] Formation DG (Mbaké)
- [ ] Vercel PRO deployment

---

## 💎 10. Critères de succès lancement (Nov 2025)

| Critère | Cible |
|---------|--------|
| Contrôle 42 chantiers | &lt; 30 s |
| Risques détectés auto | 3 / jour |
| 1-clic huissier | PDF envoyé &lt; 10 s |
| Voice "phase4 bloqué" | Filtre instantané |
| Mobile | Fluide iPhone 12 |
| Scalabilité | 1000 chantiers = 60 FPS |
| CA An1 | 50M FCFA feasible |

---

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/modules/dashboard/components/views/CockpitDGPage.tsx` | Page Cockpit DG (quadrants, briefing, grille 3D) |
| `src/modules/dashboard/components/cockpit/HealthSphereGrid.tsx` | Grille 3D sphères (Three.js) |
| `src/modules/dashboard/components/shared/EmptyState.tsx` | Empty states réutilisables |
| `src/modules/dashboard/components/ContentLoadingSkeleton.tsx` | Squelettes chargement |
| `docs/dashboard/PUSH_SETUP.md` | Web Push + PushConsentBanner |
| `docs/dashboard/COCKPIT_DG_V5_ROADMAP.md` | Roadmap V5 détaillée |

---

*Dernière mise à jour : audit complet — implémentation Semaine 1 UX en cours.*
