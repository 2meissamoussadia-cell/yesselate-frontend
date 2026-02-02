# Audit Dashboard — Modernité & look « ultra-moderne »

Ce document recense les éléments du dashboard qui ne sont **pas** modernes ou ultra-modernes, avec des pistes de mise à jour pour un rendu type 2025 (glassmorphism léger, micro-interactions, typo claire, hiérarchie visuelle forte).

---

## ✅ Déjà moderne / bien en place

- **Framer Motion** : transitions onglets (Vue finances / opérations / risques)
- **Design tokens** : `dashboardDesignTokens.ts` (couleurs, espacements, rayons, transitions)
- **Sections repliables** : `CollapsibleSection` avec animation grid-template-rows
- **Presets & vues sauvegardées** : logique métier claire
- **Thème clair/sombre** : variables CSS, contraste WCAG, persistance
- **SegmentedTabs** : onglets segmentés type SaaS
- **KpiCardClean** : cartes avec backdrop-blur, bordures colorées
- **Touch targets** : min 44px pour conformité mobile
- **Raccourcis clavier** : Échap, Ctrl+1/2/3

---

## ❌ Pas moderne / à améliorer

### 1. Emojis dans les libellés d’actions (Phase 4)

**Où :** `DashboardHome.tsx` — `phase4Actions` (labels "📞 Appeler entreprise", "📧 Relance automatique", etc.)

**Problème :** Les emojis dans les boutons donnent un côté « gadget » et varient selon l’OS/navigateur. Peu adapté à un cockpit DG « corporate ».

**Recommandation :** Remplacer par des **icônes Lucide** (Phone, Mail, Send, CalendarCheck) pour un rendu cohérent et professionnel.

---

### 2. Typographie trop petite et répétée

**Où :** Partout — `text-[10px]`, `text-[11px]` en masse (labels, timestamps, descriptions).

**Problème :** Trop de texte en 10–11px nuit à la lisibilité et à la hiérarchie. Les standards modernes privilégient 12–14px pour le secondaire.

**Recommandation :**
- Utiliser les tokens `typography.label.sm` / `typography.body.xs` (ou équivalent 12px) au lieu de 10–11px partout.
- Réserver 10px à des cas très secondaires (badges, timestamps compacts).

---

### 3. Panneaux et cartes : peu de profondeur / effet « surface »

**Où :** `DashboardPanel`, `CollapsibleSection`, blocs « Indicateurs complémentaires », « Activité récente ».

**Problème :** Bordures `border-slate-800/80`, fonds `bg-slate-950/80` ou `bg-slate-900/40` — look plat, peu de séparation visuelle par rapport au fond.

**Recommandation :**
- Léger **backdrop-blur** + bordure très fine sur les panneaux (déjà partiel sur `DashboardPanel`).
- **Ombres douces** en mode clair (`shadow-sm` / `shadow-md`) et en dark une bordure légère plutôt qu’une grosse ombre noire.
- Unifier avec les variables de thème (`--theme-border-primary`, `--theme-bg-secondary`) pour cohérence clair/sombre.

---

### 4. Tableau Phase 4 : look « grille Excel »

**Où :** Table Phase 4 dans `DashboardHome.tsx` (chantiers, CA, santé, actions).

**Problème :** Table HTML classique avec bordures partout, peu d’espacement, peu de distinction visuelle lignes/header.

**Recommandation :**
- **Espacement** : plus de padding (py-3, px-4), moins de bordures internes.
- **Header** : fond légèrement différent (`bg-slate-800/50`), police semibold, séparateur discret.
- **Lignes** : hover net (`hover:bg-slate-800/30`), pas de grille complète.
- Option : **rayures très légères** (zebra) ou bordures uniquement entre groupes, pas entre chaque cellule.

---

### 5. Sélecteurs (select) natifs

**Où :** Preset, Mode d’affichage, Densité, Filtre santé Phase 4, etc.

**Problème :** `<select>` natifs non stylés — apparence différente selon l’OS, peu alignée avec le reste du design.

**Recommandation :** Utiliser un composant **Select** du design system (Radix/shadcn ou équivalent) avec le même style que les boutons (bordures, rayons, focus ring) pour un rendu cohérent et moderne.

---

### 6. Boutons d’action Phase 4

**Où :** Boutons « Appeler », « Relance », « Escalade », « Planifier visite » dans chaque ligne du tableau.

**Problème :** Style inline (texte + couleur), pas de composant bouton unifié, pas d’état loading ni de micro-interaction.

**Recommandation :**
- Composant **Button** ou **IconButton** réutilisable (variants danger / warning).
- Icônes Lucide à la place des emojis.
- États : hover, focus-visible, optionnellement `active:scale-[0.98]` pour le clic.

---

### 7. DashboardCleanLayout (mode avec header)

**Où :** `DashboardCleanLayout.tsx` — logo « Y » dans un carré dégradé bleu–violet.

**Problème :** Logo texte « Y » dans un gradient très marqué — look « template générique » plutôt que marque BTP/DG.

**Recommandation :** Utiliser le **vrai logo** (image) comme dans `BmoSidebar`, ou un mot « YESSALATE » / sigle épuré, avec couleurs de marque (ambre/orange) au lieu d’un dégradé bleu–violet.

---

### 8. Indicateurs complémentaires : grille de mini-cartes

**Où :** Bloc « Indicateurs complémentaires » — 6 cartes (HSE, productivité, délai paiement, ROI, utilisation, carbone).

**Problème :** Cartes très denses (texte 10–11px, peu d’air), bordures `border-slate-800` partout, pas de hiérarchie claire valeur vs label.

**Recommandation :**
- **Valeur en gros** (text-xl ou 2xl), label en `text-xs` ou `text-sm` en muted.
- Plus d’espace (p-4, gap-4), bordures plus discrètes ou fond légèrement différent.
- Option : une seule ligne horizontale avec séparateurs au lieu d’une grille de boîtes.

---

### 9. Absence de skeleton / état vide illustré

**Où :** Chargement des KPIs, des graphiques, listes vides (historique session, vues sauvegardées).

**Problème :** Spinner ou texte brut « Aucune action » — expérience un peu vide.

**Recommandation :**
- **Skeletons** (rectangles animés) pour la barre KPI et les blocs principaux pendant le chargement.
- **États vides** avec une petite illustration ou icône + message (ex. « Aucune action enregistrée pour cette session ») au lieu d’une seule ligne de texte.

---

### 10. Footer / barre du bas (DashboardCleanLayout)

**Où :** Barre fixe en bas avec « Dernière MAJ », liens, etc.

**Problème :** Si la barre est très chargée ou visuellement lourde, elle peut faire « vieux logiciel ».

**Recommandation :** Barre fine, texte discret (muted), un seul niveau d’info. Éviter trop de liens ou de boutons dans le footer.

---

### 11. Cohérence des rayons (border-radius)

**Où :** Mix de `rounded-lg`, `rounded-xl`, `rounded-2xl` sans règle claire.

**Problème :** Parfois trop de variété pour des composants similaires (panneaux, cartes, boutons).

**Recommandation :** Règles simples : **boutons/pills** → `rounded-xl`, **cartes/panneaux** → `rounded-2xl`, **inputs** → `rounded-lg`. Documenter dans `dashboardDesignTokens.ts` et s’y tenir.

---

### 12. Couleur d’accent (bleu vs cyan vs orange)

**Où :** SegmentedTabs (bleu), ThemeToggle (cyan), BmoSidebar (ambre), liens et focus (sky/blue).

**Problème :** Plusieurs accents (bleu, cyan, ambre) selon les zones — moins de cohérence « une marque, une accent ».

**Recommandation :** Choisir **une couleur d’accent principale** (ex. cyan pour le cockpit DG, ou ambre pour la marque) et l’utiliser pour : onglets actifs, focus, boutons primaires, liens. Réserver les autres à des rôles sémantiques (succès, alerte, danger).

---

## 🎯 Synthèse par priorité

| Priorité | Action |
|----------|--------|
| **Haute** | Remplacer emojis par icônes Lucide (Phase 4 + MobileCockpit + ActionRapideButton) |
| **Haute** | Monter la taille typo secondaire (11px → 12px, 10px → 11px) et utiliser les tokens |
| **Moyenne** | Unifier les selects avec un composant Select du design system |
| **Moyenne** | Affiner le tableau Phase 4 (espacement, header, hover, moins de grille) |
| **Moyenne** | Définir une accent principale et l’appliquer (onglets, focus, boutons) |
| **Basse** | Skeletons et états vides illustrés |
| **Basse** | Logo / identité dans DashboardCleanLayout |
| **Basse** | Documenter et uniformiser border-radius (tokens) |

---

## Fichiers à modifier en priorité

1. `src/modules/dashboard/components/views/DashboardHome.tsx` — phase4Actions (emojis → icônes), typo, tableau Phase 4
2. `src/modules/dashboard/components/shared/DashboardPanel.tsx` — ombres / bordures selon thème
3. `src/modules/dashboard/components/shared/CollapsibleSection.tsx` — cohérence avec design tokens
4. `src/modules/dashboard/utils/dashboardDesignTokens.ts` — étendre (typo min, radius, accent)
5. `src/modules/dashboard/components/cockpit/ActionRapideButton.tsx` — emojis → icônes
6. `src/modules/dashboard/components/cockpit/MobileCockpit.tsx` — emoji Contact → icône
7. `app/(portals)/maitre-ouvrage/dashboard/page.tsx` — KPI strip / cartes si besoin
8. `src/modules/dashboard/components/shared/DashboardCleanLayout.tsx` — logo et footer

---

*Audit réalisé pour aligner le dashboard sur un rendu « moderne / ultra-moderne » type 2025 (lisibilité, cohérence, micro-interactions, design system).*
