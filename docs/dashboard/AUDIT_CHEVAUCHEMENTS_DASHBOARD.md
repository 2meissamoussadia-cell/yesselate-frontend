# Audit des chevauchements d'affichage — Dashboard

**Date :** 2025-01-30  
**Objectif :** Identifier et corriger tous les problèmes de chevauchement (z-index, positionnement, overflow) sur le dashboard.

---

## 1. Hiérarchie z-index actuelle

Le fichier `src/modules/dashboard/utils/zIndex.ts` définit une échelle :

- **0–9** : contenu normal  
- **10–19** : navigation (sidebars, breadcrumbs)  
- **20–29** : dropdowns  
- **30–39** : overlays, tooltips  
- **40–49** : notifications  
- **50+** : modals, chargements  

**Problème :** De nombreux composants utilisent des valeurs en dur (`z-[100]`, `z-[110]`, `z-40`, `z-50`) sans passer par cette échelle, ce qui crée des conflits.

---

## 2. Problèmes identifiés

### 2.1 Topbar BMO vs header sticky du dashboard

- **Constat :** La topbar n’a pas de `z-index`. Le header sticky du dashboard (breadcrumbs + KPI + subnav) a `z-30`. Comme `main` est rendu après la topbar dans le DOM, le header sticky peut passer **au-dessus** de la topbar au scroll.
- **Correction :** Donner à la topbar un `z-index` supérieur au header (ex. `z-40`) pour qu’elle reste toujours au-dessus du contenu scrollable.

### 2.2 Sidebar BMO (tiroir) et overlay

- **Constat :** Overlay `z-40`, sidebar `z-50`. Cohérent.
- **Action :** Aucun changement si on garde topbar à `z-40` (sidebar ouverte = `z-50` au-dessus de tout, y compris topbar).

### 2.3 Dropdown « trois points » de la topbar

- **Constat :** Déjà corrigé (deux colonnes, largeurs fixes, pas de chevauchement entre liste et panneau).
- **Action :** Aucun changement.

### 2.4 Menu Export dans DashboardKPIBar

- **Constat :** Overlay `fixed inset-0 z-40` et menu `z-50`. Si la topbar passe à `z-40`, l’overlay et la topbar sont au même niveau ; selon le contexte d’empilement, l’overlay peut couvrir la topbar (comportement souhaité pour fermer le menu au clic extérieur). Avec topbar à `z-40`, le contenu du dashboard (dont l’overlay) reste dans `main` (z par défaut). Pour que la topbar reste visible au scroll tout en restant sous l’overlay du menu export quand il est ouvert, on garde topbar à `z-40` et on laisse l’overlay en `z-40` dans son contexte (il couvre bien l’écran pour fermer le menu).
- **Action :** Aucun changement spécifique ; le réglage topbar `z-40` suffit pour le scroll.

### 2.5 CustomizableDashboard (bouton Personnaliser + panneau)

- **Constat :** Bouton fixe `bottom-6 right-6 z-50`, panneau « Ajouter un widget » `fixed left-4 top-24 z-40`. Sur petits écrans, le bouton peut croiser d’autres éléments fixes (ex. ExecutiveControls en bas). Le panneau `top-24` peut recouvrir la subnav ou le début du contenu.
- **Correction :** S’assurer que le panneau ne recouvre pas le header (ajuster `top` ou `max-height`) et que les z-index utilisent l’échelle du dashboard si besoin.

### 2.6 Modals (z-[100], z-[110])

- **Constat :** Beaucoup de modals utilisent `z-[100]` ou `z-[110]` alors que `zIndex.ts` monte jusqu’à 52. Pour une évolution future, on peut étendre `zIndex.ts` avec des paliers « modal élevé » (100) et « modal prioritaire » (110) et migrer progressivement.
- **Action :** Pour cet audit, pas de changement des modals ; l’objectif est d’abord les chevauchements visuels courants (topbar, sidebar, dropdowns).

### 2.7 Contenu principal (main) et overflow

- **Constat :** `BmoLayoutShell` : `main` a `overflow-x-hidden overflow-y-auto`. Pas de débordement horizontal ni de chevauchement vertical non géré.
- **Action :** Aucun changement.

---

## 3. Corrections appliquées

1. **BmoTopbar**  
   - Ajout de `relative z-[40]` sur le `<header>` pour que la topbar reste au-dessus du header sticky du dashboard (`z-30`) lors du scroll.

2. **BmoLayoutShell**  
   - Overlay de fermeture de la sidebar : `z-40` → `z-[45]` pour une hiérarchie claire.  
   - Sidebar tiroir : `z-50` → `z-[50]` (explicite) pour rester au-dessus de la topbar (z-40) et de l’overlay (z-45).

3. **DashboardCommandCenterPage**  
   - Header sticky : `z-30` → `z-[30]` (explicite) pour rester sous la topbar BMO (z-40).

4. **DashboardShell** (standalone)  
   - Zone sticky (breadcrumbs + KPI + subnav) : `z-20` → `z-[30]` pour alignement avec le header sticky du Command Center.

5. **CustomizableDashboard**  
   - Panneau « Ajouter un widget » : `top-24 z-40` → `top-28 z-[30]` pour ne pas masquer la topbar (z-40) et pour décaler sous le header.

6. **zIndex.ts**  
   - Ajout de `headerSticky: 30`, `topbar: 40`, `sidebarDrawer: 50`, `modalHigh: 100`, `modalHighest: 110` pour documenter l’échelle et permettre une migration progressive des modals.

7. **Dropdown-menu (topbar)**  
   - Déjà corrigé précédemment (structure deux colonnes, largeurs fixes).

---

## 4. Résumé

| Zone                    | Problème                          | Correction                    |
|-------------------------|-----------------------------------|-------------------------------|
| Topbar vs sticky header | Sticky passe au-dessus de la barre | Topbar `z-40`                 |
| Sidebar / overlay       | OK                                | —                             |
| Menu trois points       | OK (corrigé précédemment)         | —                             |
| Export KPI bar          | OK                                | —                             |
| CustomizableDashboard   | Panneau peut couvrir le header    | Ajustement position / z-index |
| Modals z-[100/110]      | Hors périmètre court terme       | Éventuelle unification plus tard |
