# Centre d'alertes MOA — Suivi audit et plan d'action

**Date rapport** : 05/02/2026  
**Module** : Maître d'Ouvrage / Alertes (`/maitre-ouvrage/alerts`)  
**Rapport** : 58 défauts (32 critiques), ROI estimé ~280 k€/an, payback < 3 mois.

**Hotfix 05/02 (validé 17h15)** : (1) Bug "positionIndex is not defined" corrigé (props déstructurées). (2) Bug "viewLabel is not defined" corrigé (`VIEW_LABELS` + `viewLabel`). **Validation finale : 3/3 scénarios OK** (clic alerte Liste, filtre "Action requise", clic alerte Regroupées). **GO déploiement staging** — module stable pour consultation détail.

**Tests d’intégration 05/02 (18h)** : 6/6 validés (100 %) — Communication parent/enfant, store global, API success, gestion erreur 404, persistance (URL + préférences), synchro URL ↔ état. Verdict : intégration de niveau production.

---

## 1. Synthèse du rapport

### Problèmes principaux
- **Bug bloquant** : Champ "Sans chantier" sur 100 % des alertes → module inutilisable pour un MOA.
- **Surcharge info** : 99+ alertes non hiérarchisées = fatigue cognitive.
- **Contexte manquant** : Détails incomplets, pas de liens chantier/docs, impact €/jours peu visible.
- **UX inadaptée** : Vocabulaire technique, workflow "Traiter" peu guidé.
- **Responsive** : Inutilisable tablette/mobile si non traité.

### Impact business
- Coût actuel : 35–45 min/alerte critique (recherche contexte + traitement).
- Alertes manquées : ~15/mois.
- Coût retards évités si corrigé : ~50–80 k€/trimestre.
- **ROI** : Investissement 8–10 semaines → gains ~280 k€/an, payback < 3 mois.

### Bugs techniques identifiés (annexe A)
| Bug | Symptôme | Priorité | Statut |
|-----|----------|----------|--------|
| #1 | "Sans chantier" sur 100 % | P0 | ✅ Corrigé (mocks + mapping) |
| #2 | Compteurs incohérents (132 vs 99+) | P1 | ⚠️ Partiel (affichage 99+ volontaire) |
| #3 | Assignation toujours "Non assignée" | P1 | 🔲 Backend / workflow |

---

## 2. État des correctifs (frontend)

### Sprint 0 – Correctifs urgents ✅
| Livrable | Fait | Fichiers / remarques |
|----------|------|----------------------|
| Bug "Sans chantier" | ✅ | `src/lib/data/alerts.ts` : mocks avec `project` / `relatedId`. Si l’API renvoie ces champs, le mapping affiche le chantier. |
| Enrichir panneau détail | ✅ | Lien "Voir le chantier", bloc **Impact €/jours** en tête, breadcrumb avec vue, position 2/100. |
| Contraste WCAG AA | ✅ | Badge "Action requise", timestamps, badge "CRITIQUE" dédié. |
| Dé-tronquer titres + tooltips | ✅ | `line-clamp-2` + tooltip complet sur le titre. |
| Hiérarchie visuelle criticité | ✅ | Barre 6px + pulse, badge "CRITIQUE" XXL animé. |

### Sprint 1 – Dashboard & regroupement ⚠️
| Livrable | Fait | Remarque |
|----------|------|----------|
| Page tableau de bord | 🔲 | Non fait. Wireframe fourni (KPIs, Top 5 risques, tendances, mes chantiers). |
| Regroupement intelligent | ✅ | Vue **Regroupées** (par titre) + vue **Par chantier** existante. |
| Filtres rapides MOA | ✅ | Action requise, Cette semaine, Non affecté, **En retard**, **Impact >50k€**. |

### Sprint 2 – Workflow & interactions 🔲
| Livrable | Fait | Remarque |
|----------|------|----------|
| Wizard "Traiter" guidé | 🔲 | Modal multi-étapes (assigner, commenter, clôturer) à faire. |
| Vue "Par chantier" améliorée | ⚠️ | Vue existante avec stats ; hiérarchie Programme → Chantier à préciser si besoin. |
| Actions groupées | ⚠️ | Traiter/Archiver/Supprimer en masse OK ; "Assigner à…" sur N alertes à faire. |
| Historique & traçabilité | 🔲 | Affiché dans le détail ; traçabilité complète = backend. |

### Sprint 3 – Responsive & performance ⚠️
| Livrable | Fait | Remarque |
|----------|------|----------|
| Breakpoints responsive | ✅ | Sidebar masquée < lg, détail en Sheet sur mobile, `useIsMobile`. |
| Virtualisation liste | ⚠️ | `ItemList` + `virtualizeThreshold` ; infinite scroll / "Charger plus" = évolution possible. |
| Zones touch 44×44px | ✅ | Checkbox, boutons d’actions rapides. |
| Lazy loading | ⚠️ | Pagination en place ; chargement progressif selon API. |

---

## 3. Reste à faire (priorisé)

### Backend / données (bloquant si absent)
- **Chantier** : S’assurer que l’API réelle (`/api/alerts`) renvoie `project` ou `relatedId` (ou champ équivalent) pour chaque alerte.
- **Compteurs** : Une seule source de vérité (total, par statut) pour sidebar + barre de filtres.
- **Assignation** : Workflow et persistance pour "Assigner à…" (affichage "Non assignée" si non renseigné).

### Frontend (améliorations)
- **Tableau de bord** : Page d’accueil alertes (vision globale, Top 5 risques, tendances, mes chantiers) selon wireframe.
- **Wizard Traiter** : Modal étapes (assigner → commenter → clôturer) avec feedback clair.
- **Assignation groupée** : "Assigner les X alertes à…" avec sélection multiple.
- **Documents liés** : Bloc "Documents liés" dans le détail si l’API expose des pièces jointes / liens.

---

## 4. Checklist de validation post-corrections

### Tests fonctionnels
- [ ] Champ "Chantier" renseigné sur 100 % des alertes (hors cas réellement sans chantier).
- [x] Regroupement fonctionne (vue Regroupées par titre + Par chantier).
- [x] Filtres rapides MOA opérationnels (Action requise, Cette semaine, Non affecté, En retard, Impact >50k€).
- [x] Détail alerte : chantier, lien chantier, impact €/jours, deadline.
- [ ] Workflow "Traiter" guidé (wizard) fonctionnel.
- [x] Actions groupées (traiter/archiver/supprimer) sur sélection multiple.
- [ ] Historique visible et complet (backend).
- [x] Pagination en place ; [ ] lazy loading / "Charger plus" si requis.

### Tests UX
- [ ] Test utilisateur avec 3 MOA (taux succès > 80 %).
- [ ] Temps moyen traitement alerte < 10 min.
- [ ] Satisfaction NPS > 60.
- [ ] Taux abandon page < 15 %.

### Tests techniques
- [ ] Performance : chargement < 2 s avec 500 alertes (virtualisation / API).
- [x] Accessibilité : contraste, focus visible, ARIA sur actions (partiel).
- [ ] Responsive : test iPad, iPhone, Android.
- [ ] Navigateurs : Chrome, Firefox, Safari, Edge.
- [ ] Pas d’erreurs console en production.

### Tests sécurité
- [ ] Filtrage par habilitation utilisateur (backend).
- [ ] Traçabilité des actions (backend).
- [ ] Pas de fuite de données sensibles.
- [ ] RGPD : consentement cookies OK.

---

## 5. Diagnostic LIMITATION #1 — Toggle du tri (Date création)

**Constat E2E** : Le bouton « Date création » ne semblait pas inverser l’ordre (récent ↔ ancien).

**Chaîne vérifiée** :
- **Page** (`app/(portals)/maitre-ouvrage/alerts/page.tsx`) : `sortOrder` state `'asc' | 'desc'`, passé dans `sort: { field: 'date', order: sortOrder }` à `useAlertes`. Le `queryKey` inclut ces params → React Query refetch bien au changement.
- **Client** (`src/lib/api/alerts-btp.ts`) : `sortBy=createdAt` et `sortOrder=asc|desc` envoyés en query string.
- **Backend** (`app/api/alerts/route.ts`) : lit `sortBy` et `sortOrder`, applique le tri sur le tableau.

**Cause racine** : À chaque `GET /api/alerts`, le backend appelait `generateMockAlerts(100)`, qui régénérait **100 alertes avec des dates aléatoires**. En changeant le tri, une **nouvelle** requête renvoyait un **nouveau** jeu de données ; l’utilisateur ne voyait pas « la même liste en ordre inversé », d’où l’impression que le toggle ne faisait rien.

**Correctif appliqué** (06/02) :
- Cache process des alertes mock dans `app/api/alerts/route.ts` : un seul jeu de 100 alertes généré et réutilisé entre requêtes. Filtres/pagination/tri s’appliquent sur une copie de ce jeu → le tri asc/desc est désormais observable.
- Tri rendu stable (retour `0` si égalité, gestion des `null`/`undefined`).

**Valeurs** : `sortOrder` = `'asc'` (ancien d’abord) | `'desc'` (récent d’abord). Format attendu par l’API : `asc` / `desc`.

---

**Validation E2E** : Toggle confirmé fonctionnel — ordre inversé visible (desc : 05/02→03/02 ; asc : 07/01→09/01), même jeu de données. **LIMITATION #1 : RÉSOLU ✅**

### Persistance des filtres dans l’URL (06/02)
- Paramètres reflétés en query string : `folder`, `view`, `sort`, `page`, `perPage`, `q`, `density`.
- Au chargement : lecture des params et restauration de l’état (dossier, vue, tri, page, recherche, densité).
- À chaque changement : mise à jour de l’URL sans rechargement (`router.replace`), partage de lien possible.
- Page enveloppée dans `<Suspense>` pour `useSearchParams` (Next.js).

### Améliorations déjà en place (rapport intégration)
- **Error Boundary** : page Alertes enveloppée dans `<ErrorBoundary>` pour capturer les erreurs composant non catchées.
- **Retry API** : `useAlertes` (React Query) avec `retry: 2` et `retryDelay: 1000` en cas d'échec réseau.
- **Cache API** : React Query avec `staleTime: 30000` pour limiter les appels redondants.

### Redirection utilisateurs non connectés (06/02)
- **Comportement** : Les routes sous `/maitre-ouvrage/dashboard` sont protégées par `DashboardAuthGuard` ; accès sans session → redirection vers `/login?redirect=...`.
- **Test E2E** : `e2e/auth/redirect-unauthenticated.spec.ts` — valide la redirection vers `/login` et la présence du paramètre `redirect` (lancement : `npm run test:e2e -- e2e/auth/redirect-unauthenticated.spec.ts`).
- **Note** : La page `/maitre-ouvrage/alerts` n’est pas sous le layout dashboard ; pour la protéger de la même façon, envelopper le portail ou le layout alertes avec un garde d’authentification équivalent.

### Recommandations E2E / accessibilité (rapport E2E)
- **Menu mobile** : Vérifier la fermeture automatique du menu au clic sur l’overlay (hors menu).
- **Focus trap** : S’assurer que le focus reste dans le menu ouvert (navigation clavier).
- **Skip link** : Vérifier la présence d’un lien « Aller au contenu principal » visible au premier Tab et fonctionnel.

### Performance (rapport 06/02)
- **LCP** : ~3–4 s (à améliorer). Shell + skeletons immédiats ; contenu dynamique en 3–5 s. Objectif : &lt; 2,5 s.
- **FID** : &lt; 100 ms — réactivité excellente. **Accessibilité Lighthouse** : 85–95/100. **Images** : 0 KB ; **fuites mémoire** : aucune détectée.
- **Déjà en place** : React Query staleTime 30 s, dynamic() pour AlertDetailPanel et CreateAlertDialog, skeletons.
- **Recommandations** : LCP (cache persistant, préchargement, réduction bundle) ; Service Worker ; Web Vitals en prod ; compression Brotli/Gzip.

---

## 6. Références

- **Wireframes** : Rapport annexes B et C (détail enrichi, tableau de bord).
- **Plan d’action détaillé** : Semaines 1–10 (Sprints 0 à 3), rapport section "Plan d’action détaillé".
- **Code** : `app/(portals)/maitre-ouvrage/alerts/page.tsx`, `src/components/bmo/alerts/`, `src/lib/data/alerts.ts`, `src/lib/api/alerts-btp.ts`.
