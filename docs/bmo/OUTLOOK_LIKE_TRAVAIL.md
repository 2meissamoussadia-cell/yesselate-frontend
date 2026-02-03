# Layout Outlook-like BMO — Tout le travail (fait et à faire)

Référence : `docs/bmo/OUTLOOK_LIKE_INTEGRATION.md` pour les règles détaillées.

---

## ✅ TRAVAIL DÉJÀ FAIT

### 1. Layout et structure
- **OutlookLikeLayout** (`src/components/bmo/layout/OutlookLikeLayout.tsx`) : layout 3 colonnes (sidebar | liste | détail), barre d’actions, barre de filtres.
- Stratégie responsive documentée (JSDoc + `layout/README_OUTLOOK_LIKE.md`) : desktop 3 colonnes, tablette 2 colonnes, mobile liste pleine page.

### 2. Composants UI génériques
- **QuickActionsBar** (`src/components/bmo/ui/QuickActionsBar.tsx`) : barre d’actions (Nouveau…, Supprimer, Archiver, etc.).
- **FilterBar** (`src/components/bmo/ui/FilterBar.tsx`) : onglets vue, filtres rapides, tri.
- **SidebarFolders** (`src/components/bmo/ui/SidebarFolders.tsx`) : arborescence dossiers (projets, chantiers, catégories).

### 3. Composants messagerie / liste-détail
- **MessageList** (`src/components/bmo/messages/MessageList.tsx`) : liste scrollable d’éléments (messages, alertes, tickets).
- **MessageListRow** (`src/components/bmo/messages/MessageListRow.tsx`) : une ligne (avatar, expéditeur, objet, aperçu, date).
- **MessageDetailPanel** (`src/components/bmo/messages/MessageDetailPanel.tsx`) : panneau détail (header, corps, actions) avec **DOMPurify** et prop **bodyHtmlSanitized** (parent peut passer du HTML déjà sanitisé).

### 4. Types et organisation
- **Types** (`src/components/bmo/messages/types.ts`) : `BmoMessage`, `BmoFolder`, `BmoMessageAddress` (génériques pour messages, alertes, tickets).
- **Organisation** : layout dans `bmo/layout`, messages dans `bmo/messages`, UI dans `bmo/ui`. Exports via `layout/index`, `messages/index`, `ui/index`.

### 5. Page pilote et doc
- **Page pilote** : `app/(portals)/maitre-ouvrage/messages/page.tsx` avec **données mockées** (dossiers, messages), état et callbacks gérés par la page.
- **Doc** : `OUTLOOK_LIKE_INTEGRATION.md` (contexte métier BTP, fidélité Outlook/BMO, responsive, contrats API, sanitization, itération) + `OUTLOOK_LIKE_TRAVAIL.md` (ce fichier).

---

## 🔲 TRAVAIL À FAIRE (par priorité)

### Priorité 1 — Menu contextuel sur la liste ✅ (fait)
- **Clic droit** sur une ligne de la liste : menu contextuel (Marquer lu/non lu, Archiver, Supprimer, Ouvrir dans un nouvel onglet, etc.).
- **Bouton « … »** sur chaque ligne (visible au hover) : même menu à la position du bouton.
- Composant **pure UI** : `MessageListContextMenu` reçoit `actions` et `onAction` ; la page gère l’état (position + item) et les actions métier.
- Fichiers : `messages/MessageListContextMenu.tsx`, `MessageListRow.tsx` (onContextMenuRequest + bouton …), `MessageList.tsx` (onContextMenuRequest), page pilote (état + actions).

### Priorité 2 — Connexion aux vraies données BMO
- Remplacer les mocks par des **appels API BMO** (alertes chantier, messages internes, demandes de validation, etc.).
- Créer un **hook** (ex. `useMessages(folderId, filters)`) ou brancher les endpoints existants ; la page pilote (ou une page dédiée alertes/messages) alimente `MessageList` / `MessageDetailPanel` avec les données réelles.
- Mapping des types métier (AlertItem, etc.) vers `BmoMessage` / `BmoFolder` dans la page ou un adapter, pas dans les composants UI.

### Priorité 3 — Responsive complet (mobile / tablette)
- **Sidebar** : sur mobile et tablette, afficher la sidebar en **drawer overlay** (bouton « Dossiers » / menu hamburger) au lieu de la colonne fixe.
- **Détail sur mobile** : ouvrir le détail en **route séparée** (ex. `/maitre-ouvrage/messages/[id]`) ou en **modal** avec bouton « Retour » vers la liste.
- **Tablette** : mécanisme simple pour basculer entre « sidebar + liste » et « liste + détail » (onglet ou bouton).

### Priorité 4 — Autres évolutions possibles
- **Dossiers métier** : brancher les dossiers sur projets/chantiers/phases (données BMO) dans `SidebarFolders`.
- **Actions rapides** : connecter les actions de la barre (Nouveau, Supprimer, Archiver) aux APIs métier.
- **Filtres** : connecter FilterBar aux vrais filtres (priorité, non lus, pièces jointes, etc.) et au tri côté API.
- **Multi-sélection** : sélection multiple dans la liste + actions groupées (archiver, supprimer, marquer).

---

## Résumé visuel

| Bloc | Statut | Fichiers principaux |
|------|--------|----------------------|
| Layout 3 colonnes | ✅ Fait | `layout/OutlookLikeLayout.tsx` |
| QuickActionsBar, FilterBar, SidebarFolders | ✅ Fait | `ui/QuickActionsBar.tsx`, `FilterBar.tsx`, `SidebarFolders.tsx` |
| MessageList, MessageListRow, MessageDetailPanel | ✅ Fait | `messages/MessageList.tsx`, `MessageListRow.tsx`, `MessageDetailPanel.tsx` |
| Page pilote + mocks | ✅ Fait | `app/.../messages/page.tsx` |
| Menu contextuel (clic droit / …) | ✅ Fait | `MessageListContextMenu`, `MessageListRow` (bouton … + onContextMenuRequest) |
| Connexion données BMO | 🔲 À faire | Hook / API / page |
| Responsive drawer + route détail mobile | 🔲 À faire | Page + layout / route `[id]` |

---

## Bloc : Menu contextuel (priorité 1) — Résumé avant/après

**Avant :** Liste sans menu contextuel ; clic sur une ligne = sélection uniquement.

**Fichiers touchés :**
- **Créé** : `src/components/bmo/messages/MessageListContextMenu.tsx` (menu flottant à position (x, y), actions fournies par la page).
- **Modifié** : `MessageListRow.tsx` (clic droit → `onContextMenuRequest(item, { clientX, clientY })` ; bouton « … » au hover → même callback avec position du bouton).
- **Modifié** : `MessageList.tsx` (prop `onContextMenuRequest` transmise à chaque row).
- **Modifié** : `app/(portals)/maitre-ouvrage/messages/page.tsx` (état `contextMenu`, `handleContextMenuRequest`, `handleContextMenuAction`, rendu conditionnel de `MessageListContextMenu` avec actions : Marquer lu, Marquer non lu, Archiver, Supprimer, Ouvrir dans un nouvel onglet).
- **Modifié** : `messages/index.ts` (exports `MessageListContextMenu`, types).

**Après :** Clic droit sur une ligne ou clic sur le bouton « … » ouvre le menu contextuel à la position du curseur (ou du bouton). La page fournit les actions ; « Ouvrir dans un nouvel onglet » ouvre `/maitre-ouvrage/messages/[id]`. Les autres actions (marquer lu, archiver, supprimer) sont prêtes à être branchées sur les APIs.

**Régressions :** Aucune.

---

*Dernière mise à jour : menu contextuel implémenté (priorité 1). Prochaine priorité : connexion données BMO.*
