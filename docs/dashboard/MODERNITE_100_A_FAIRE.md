# 100 modernités à faire — Dashboard & Frontend

Liste de 100 actions de modernisation pour le dashboard et l’application (état après refonte Phase 4 + Select/icônes).

---

## 1. Design system & tokens (1–15)

| # | Action | Priorité |
|---|--------|----------|
| 1 | Documenter les `border-radius` dans `dashboardDesignTokens.ts` (sm/lg/xl + usage par type de composant) | Moyenne |
| 2 | Définir une couleur d’accent unique (ex. `--accent-primary`) et l’utiliser partout (boutons, focus, liens) | Haute |
| 3 | Ajouter des tokens pour les états « disabled » et « loading » (opacité, curseur) | Basse |
| 4 | Créer des tokens de « spacing » sémantiques (section, card, inline) au lieu de valeurs en dur | Moyenne |
| 5 | Unifier les ombres (e.g. `--shadow-panel`, `--shadow-modal`) en variables CSS | Basse |
| 6 | Exporter les tokens en CSS custom properties pour le thème clair/sombre | Moyenne |
| 7 | Définir une échelle typographique stricte (min 5 niveaux) et l’appliquer partout | Moyenne |
| 8 | Documenter les touch targets (min 44px) dans les tokens et auditer les composants | Haute |
| 9 | Créer des tokens pour les durées d’animation (fast/normal/slow) et les réutiliser | Basse |
| 10 | Ajouter des tokens pour les z-index (modal, dropdown, toast, etc.) | Moyenne |
| 11 | Harmoniser les couleurs de statut (success/warning/error/info) dans tout le module | Moyenne |
| 12 | Définir des tokens pour les bordures de focus (ring) accessibles (contraste 3:1) | Haute |
| 13 | Créer un fichier de démo / Storybook des tokens pour la doc design | Basse |
| 14 | Remplacer les couleurs en dur (ex. `sky-500`) par des alias sémantiques dans les tokens | Moyenne |
| 15 | Ajouter des tokens pour les breakpoints (sm/md/lg/xl) et les utiliser en cohérence | Basse |

---

## 2. Composants UI (16–28)

| # | Action | Priorité |
|---|--------|----------|
| 16 | Remplacer les `<select>` restants par le composant Select (ValidationPaiementsPage, KPIBar, etc.) | Moyenne |
| 17 | Utiliser un composant Combobox (recherche + liste) pour les listes longues (chantiers, bureaux) | Moyenne |
| 18 | Remplacer les `<input type="date">` par un DatePicker du design system (si disponible) | Basse |
| 19 | Créer un composant « Empty state » réutilisable avec illustration + CTA | Moyenne |
| 20 | Uniformiser les modales : même padding, même footer (actions à droite), même fermeture | Moyenne |
| 21 | Ajouter des skeletons dédiés pour les widgets lourds (Trésorerie, graphiques Phase 4) | Moyenne |
| 22 | Créer un composant Badge unifié (statut, compteur, gravité) avec tokens | Basse |
| 23 | Remplacer les tooltips custom par le composant Tooltip du design system partout | Basse |
| 24 | Utiliser un composant Tabs accessible (clavier, ARIA) pour les vues cockpit (finances/opérations/risques) | Moyenne |
| 25 | Créer un composant « Command palette » global (recherche rapide, raccourcis) | Basse |
| 26 | Uniformiser les boutons (primary/secondary/ghost) avec les variants du design system | Moyenne |
| 27 | Ajouter un composant « Inline edit » pour les champs éditables (tableaux, KPI) | Basse |
| 28 | Utiliser un DataTable réutilisable (tri, pagination, sélection) pour les listes métier | Moyenne |

---

## 3. Accessibilité (29–38)

| # | Action | Priorité |
|---|--------|----------|
| 29 | Vérifier tous les boutons icon-only : `aria-label` ou `aria-labelledby` | Haute |
| 30 | S’assurer que les modales piègent le focus et renvoient le focus à l’élément déclencheur à la fermeture | Haute |
| 31 | Ajouter des `role="status"` / `aria-live` pour les mises à jour dynamiques (toasts, compteurs) | Moyenne |
| 32 | Contraster les textes secondaires (slate-400) à au moins 4,5:1 en mode clair/sombre | Haute |
| 33 | Documenter et tester la navigation au clavier (Tab, Enter, Échap) sur DashboardHome et modales | Haute |
| 34 | Ajouter des « skip links » contextuels (ex. « Aller au tableau Phase 4 ») | Basse |
| 35 | Vérifier que les graphiques ont des alternatives textuelles ou `aria-describedby` | Moyenne |
| 36 | Utiliser des `fieldset` / `legend` pour les groupes de champs (filtres, formulaire) | Moyenne |
| 37 | S’assurer que les messages d’erreur sont associés aux champs (`aria-describedby`, `aria-invalid`) | Moyenne |
| 38 | Tester avec un lecteur d’écran (NVDA/VoiceOver) sur les parcours critiques | Haute |

---

## 4. Performance (39–48)

| # | Action | Priorité |
|---|--------|----------|
| 39 | Lazy-loader les vues dashboard peu visitées (Performance, Risks, Decisions) | Moyenne |
| 40 | Mémoriser les listes longues (Phase 4, activités) avec `React.memo` ou virtualisation | Moyenne |
| 41 | Réduire les re-renders du store (sélecteurs fins, découpage du state) | Moyenne |
| 42 | Charger les graphiques (Chart.js / autre) en dynamique pour réduire le bundle initial | Basse |
| 43 | Optimiser les images (next/image, formats WebP/AVIF, tailles responsives) | Moyenne |
| 44 | Mettre en cache les réponses API (SWR, React Query) avec invalidation cohérente | Moyenne |
| 45 | Débouncer les champs de recherche et filtres (ex. 300 ms) | Basse |
| 46 | Utiliser des Web Workers pour les calculs lourds (agrégations, exports) | Basse |
| 47 | Auditer le bundle (analyse de taille) et couper les dépendances inutiles | Moyenne |
| 48 | Précharger les routes probables (prefetch) au survol des liens sidebar | Basse |

---

## 5. Animations & micro-interactions (49–55)

| # | Action | Priorité |
|---|--------|----------|
| 49 | Ajouter des transitions d’entrée/sortie (AnimatePresence) sur les modales | Moyenne |
| 50 | Animer les changements d’onglets (finances/opérations/risques) avec une transition courte | Basse |
| 51 | Utiliser des transitions sur les sections repliables (CollapsibleSection) | Fait partiel |
| 52 | Ajouter un feedback visuel (scale/opacity) sur les boutons au clic | Basse |
| 53 | Animer les listes (stagger) à l’apparition des lignes du tableau Phase 4 | Basse |
| 54 | Uniformiser les durées d’animation (ex. 200 ms) via les tokens | Basse |
| 55 | Éviter les animations pour `prefers-reduced-motion: reduce` (media query) | Haute |

---

## 6. Responsive & mobile (56–62)

| # | Action | Priorité |
|---|--------|----------|
| 56 | Tester et corriger le tableau Phase 4 sur petit écran (scroll horizontal, colonnes prioritaires) | Haute |
| 57 | Adapter la barre de filtres (Vue, Densité, etc.) en mode mobile (drawer ou accordéon) | Moyenne |
| 58 | Vérifier que les Select Radix s’ouvrent correctement sur mobile (position, hauteur) | Moyenne |
| 59 | Augmenter la taille des zones cliquables sur mobile (min 44px) partout | Haute |
| 60 | Proposer une vue « cartes » en plus du tableau pour la liste Phase 4 sur mobile | Basse |
| 61 | Tester le volet latéral (sub-sidebar) en overlay sur mobile | Fait partiel |
| 62 | Optimiser le MobileCockpit (swipe, boutons) pour une utilisation une main | Moyenne |

---

## 7. Données & API (63–70)

| # | Action | Priorité |
|---|--------|----------|
| 63 | Remplacer les mocks Phase 4 par des appels API réels (chantiers, santé) | Métier |
| 64 | Remplacer les mocks « Indicateurs complémentaires » par l’API | Métier |
| 65 | Remplacer les mocks « Activité récente » par l’API | Métier |
| 66 | Gérer les états d’erreur API (retry, message utilisateur, fallback) | Haute |
| 67 | Afficher des états vides explicites (aucune donnée, pas de résultat filtre) partout | Moyenne |
| 68 | Paginer ou virtualiser les grosses listes côté client si l’API ne pagine pas | Moyenne |
| 69 | Unifier le format des dates (ISO, timezone) et l’affichage (locale FR) | Moyenne |
| 70 | Typiser strictement les réponses API (types générés ou Zod) | Moyenne |

---

## 8. Formulaires & validation (71–76)

| # | Action | Priorité |
|---|--------|----------|
| 71 | Utiliser une lib de validation (Zod, react-hook-form) pour les modales (Call, Relance, Escalade, Visite) | Moyenne |
| 72 | Afficher les erreurs de validation en temps réel sous les champs | Moyenne |
| 73 | Désactiver le submit tant que le formulaire est invalide (ou afficher un récap) | Basse |
| 74 | Sauvegarder les brouillons des modales (localStorage ou brouillon serveur) | Basse |
| 75 | Ajouter une confirmation avant actions destructives (suppression vue, etc.) | Moyenne |
| 76 | Unifier les messages d’erreur (ton, format) et les lier aux champs pour l’accessibilité | Basse |

---

## 9. Thème clair / sombre (77–80)

| # | Action | Priorité |
|---|--------|----------|
| 77 | Vérifier que tous les nouveaux composants utilisent les variables CSS de thème (--theme-bg, etc.) | Moyenne |
| 78 | Tester le contraste des graphiques (fond, grilles, lignes) en mode clair | Moyenne |
| 79 | Proposer un cycle 3 états : clair / sombre / système | Basse |
| 80 | Persister la préférence thème (localStorage + script early pour éviter flash) | Fait partiel |

---

## 10. Internationalisation (81–83)

| # | Action | Priorité |
|---|--------|----------|
| 81 | Extraire toutes les chaînes du dashboard vers des clés i18n (namespace dashboard) | Moyenne |
| 82 | Gérer le pluriel et les formats de nombre/dates selon la locale | Basse |
| 83 | Vérifier que les libellés des Select et options sont traduits | Basse |

---

## 11. Tests & qualité (84–90)

| # | Action | Priorité |
|---|--------|----------|
| 84 | Ajouter des tests unitaires pour les utils (computeSectionExpanded, getHealthBarBgClass, etc.) | Moyenne |
| 85 | Ajouter des tests E2E pour les parcours critiques (ouvrir dashboard, appliquer preset, ouvrir modal) | Moyenne |
| 86 | Tester les Select (ouverture, sélection, fermeture) en E2E | Basse |
| 87 | Configurer des tests de régression visuelle (Playwright, Percy ou équivalent) | Basse |
| 88 | Vérifier l’absence de `console.log` / `debugger` en prod | Basse |
| 89 | Activer la validation TypeScript stricte sur tout le module dashboard | Moyenne |
| 90 | Documenter les composants partagés (props, exemples) dans Storybook ou MDX | Basse |

---

## 12. Sécurité & conformité (91–93)

| # | Action | Priorité |
|---|--------|----------|
| 91 | S’assurer que les données sensibles (téléphones, emails) ne sont pas loggées | Haute |
| 92 | Vérifier les en-têtes CSP et les politiques de chargement des scripts | Moyenne |
| 93 | Auditer les permissions (RBAC) côté front pour chaque action (export, escalade, etc.) | Métier |

---

## 13. UX & contenu (94–100)

| # | Action | Priorité |
|---|--------|----------|
| 94 | Remplacer le logo « Y » générique par le vrai logo YESSALATE (SVG/PNG) où c’est pertinent | Moyenne |
| 95 | Ajouter des infobulles courtes sur les KPIs (définition, périmètre) | Moyenne |
| 96 | Proposer un mode « démo » ou tutoriel au premier passage sur le dashboard | Basse |
| 97 | Unifier les libellés (tu/vous, ton/titre) dans toute l’app | Basse |
| 98 | Ajouter un indicateur de « dernière mise à jour » visible sur les widgets (déjà partiel) | Moyenne |
| 99 | Permettre l’export des tableaux (CSV/Excel) avec les colonnes visibles et filtres appliqués | Moyenne |
| 100 | Créer une page « Aide » ou FAQ dédiée au dashboard (liens, raccourcis, glossaire) | Basse |

---

## Légende priorités

- **Haute** : impact direct utilisateur (accessibilité, perf, bugs) ou blocant métier.
- **Moyenne** : amélioration nette de la qualité ou de la cohérence.
- **Basse** : confort ou polish.
- **Métier** : dépend des choix produit / backend.

---

## Fichier

- **Source** : `docs/dashboard/MODERNITE_100_A_FAIRE.md`
- **Dernière mise à jour** : 2025-02-01
