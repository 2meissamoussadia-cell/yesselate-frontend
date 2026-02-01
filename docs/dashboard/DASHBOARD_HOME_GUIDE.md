# Guide utilisateur — Vue d'accueil Dashboard (Dashboard Home)

Vue d'accueil du tableau de bord : synthèse exécution, finances, risques, chantiers Phase 4. Affichée par défaut sur **Pilotage → Dashboard**.

---

## 1. Vue d'ensemble

- **Indicateurs KPI** (bande repliable) : Demandes, Validations, Blocages, Décisions, Délai paiement.
- **Vue finances DG** : onglets Vue finances / Vue opérations / Vue risques ; budget, trésorerie, prévisionnel 90j, alertes.
- **HSE & Conformité**, **Risques & satisfaction**, **Indicateurs complémentaires**, **Activité récente**.
- **Phase 4 - Exécution** : tableau des chantiers avec tri, filtre par santé, actions rapides.

---

## 2. Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| **Échap** | Replier la bande KPI |
| **Ctrl+1** (ou Cmd+1 sur Mac) | Onglet Vue finances |
| **Ctrl+2** | Onglet Vue opérations |
| **Ctrl+3** | Onglet Vue risques |

Indication dans l’interface : survoler **« Raccourcis »** en haut à droite pour afficher la liste.

---

## 3. Vues par rôle (presets)

Sélecteur **« Vue : »** en haut :

- **Exécutive (DG)** : toutes les sections dépliées, onglet Finances.
- **Financière** : seule la section « Vue finances DG » dépliée.
- **Opérationnelle** : seule « Phase 4 - Exécution » dépliée, onglet Vue opérations.
- **HSE** : seule « HSE & Conformité » dépliée.
- **Personnalisée** : affiche le sélecteur **« Affichage »** (Tout / Synthétique / Critiques uniquement).

Les préférences (vue, affichage, onglet, densité) sont **sauvegardées automatiquement** et rechargées à la prochaine visite.

---

## 4. Affichage (mode Personnalisée)

- **Tout afficher** : toutes les sections dépliées.
- **Synthétique (sections repliées)** : sections repliées par défaut.
- **Critiques uniquement** : seules « Vue finances DG » et « Phase 4 - Exécution » dépliées ; filtre Phase 4 réglé sur « Critique (&lt; 50 %) ».

---

## 5. Vues sauvegardées (filtres nommés)

- **Sauvegarder cette vue** : enregistre la configuration actuelle (preset, affichage, onglet, filtre Phase 4) sous un nom (max. 20 vues).
- **Vues sauvegardées…** : menu pour appliquer une vue enregistrée.
- **Gérer (N)** : liste des vues avec **Appliquer** et **Supprimer**.

Stockage : `localStorage` (clé `dashboard-home-saved-views`).

---

## 6. Densité d'affichage

Sélecteur **« Densité : »** :

- **Compact** : moins de padding et d’espacements, texte plus petit.
- **Normal** : réglage par défaut.
- **Confortable** : plus de padding et d’espacements.

Réglage sauvegardé dans les préférences.

---

## 7. Historique de session

Bouton **« Historique session (N) »** : affiche les dernières actions (changement de vue, affichage, onglet, export CSV) avec l’heure. Max. 10 entrées par session.

---

## 8. Sections repliables

Chaque bloc (Vue finances DG, HSE, Risques & satisfaction, etc.) est une **section repliable** : clic sur le titre pour déplier/replier. Réduit la densité visuelle.

---

## 9. Accessibilité

- **Landmark** : contenu principal dans un `<main>` avec `aria-label="Tableau de bord — Vue d'ensemble"`.
- **Annonces** : zone `aria-live="polite"` pour les messages « Vue appliquée », « Vue sauvegardée » (lecteurs d’écran).
- **Onglets** : `role="tablist"` / `role="tab"` / `role="tabpanel"` pour Vue finances / opérations / risques.
- **Tooltips** : explications sur les KPI (Demandes, Validations, Blocages, Décisions, Délai paiement).
- **Contraste** : palette sombre avec couleurs d’état (vert / orange / rouge). En cas de difficulté, augmenter le zoom ou la densité « Confortable ».

---

## 10. Fichiers principaux

- **Vue** : `src/modules/dashboard/components/views/DashboardHome.tsx`
- **Section repliable** : `src/modules/dashboard/components/shared/CollapsibleSection.tsx`
- **Widget trésorerie** : `src/modules/dashboard/components/shared/TresoreriePrevisionnelleWidget.tsx`
- **Logique presets** : `src/modules/dashboard/utils/dashboardHomeSectionExpanded.ts` (fonction pure `computeSectionExpanded`, testée unitairement)
- **Préférences** : `localStorage` clés `dashboard-home-prefs`, `dashboard-home-saved-views`

---

## 11. Pour les développeurs

- **Props** : `DashboardHome` accepte `kpis?: Array<{ label; value?; delta? }>` et `perimetreFilter?: PerimetreId` pour aligner les KPI affichés avec la barre KPI du shell.
- **Tests** : `src/modules/dashboard/utils/__tests__/dashboardHomeSectionExpanded.test.ts` — tests de la logique « quelles sections sont dépliées » selon preset et displayMode.
- **Types** : `SavedView`, `Density`, `SessionAction` sont définis en tête de `DashboardHome.tsx` ; `SectionExpandedState` et `computeSectionExpanded` sont exportés depuis `dashboardHomeSectionExpanded.ts`.
- **Accessibilité** : zone `aria-live="polite"` (id `dashboard-home-live`) pour annoncer « Vue appliquée » / « Vue sauvegardée » aux lecteurs d’écran.

---

## 12. Dépannage

- **Les sections ne se replient pas** : vérifier que vous n’êtes pas en « Vue personnalisable » (bouton pour revenir en « Vue classique »).
- **Vues sauvegardées perdues** : vider le cache / localStorage du site supprime les vues ; elles ne sont pas synchronisées serveur.
- **Raccourcis sans effet** : s’assurer que le focus n’est pas dans un champ de formulaire (input, select, textarea).
