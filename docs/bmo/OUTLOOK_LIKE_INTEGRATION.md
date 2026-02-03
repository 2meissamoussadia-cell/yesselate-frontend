# Intégration layout type Outlook dans BMO

Règles et conventions pour le module Outlook-like (layout 3 colonnes, barres, filtres, liste, détail).

---

## Contexte métier – ERP BTP (BMO / Yessalate)

L’application **n’est pas un client mail générique** : c’est un **ERP BTP Maître d’Ouvrage**.

Le layout type Outlook est un **pattern d’interface** pour gérer :

- des **messages internes**,
- des **alertes chantier**,
- des **dossiers / documents**,
- des **tickets ou demandes** liés aux projets BTP.

Les concepts “emails”, “boîte de réception”, “dossiers” doivent être **adaptés au métier BTP** :

- **“Message”** peut être : une alerte de chantier, une demande de validation, un courrier entrant, un ticket, etc.
- **Dossiers** peuvent représenter : projets, chantiers, phases, catégories métier.

**Objectif** : offrir une vue 3 colonnes efficace pour le **pilotage BTP** (DG, MOA, équipes) en s’inspirant d’Outlook, **sans transformer BMO en simple client mail**.

---

## 8. Fidélité à Outlook vs identité BMO

Nous ne voulons **pas** d’un clone pixel-perfect d’Outlook.

- **Tu t’inspires d’Outlook pour la structure** : layout 3 colonnes, barre d’actions, barre de filtres, panneau de détail — pas pour copier exactement le style Microsoft.
- **Tu gardes le design BMO** : couleurs, typographies, radius, ombres, iconographie actuelle (tokens `--theme-*`, slate, lucide-react).
- **Interdit** de mettre les couleurs Microsoft en dur (#0078D4, etc.) : mapper sur les design tokens BMO (ou proposer de nouveaux tokens BMO si nécessaire).

---

## 8bis. Logique visuelle Outlook + adaptation BMO

**Objectif** : que chaque écran BMO donne la **même sensation d’efficacité** qu’Outlook, tout en restant **clairement une interface BMO / ERP BTP**, pas une simple copie d’Outlook.

### Ce qu’on peut dupliquer d’Outlook (logique visuelle et UX)

Pour les composants UI (QuickActionsBar, FilterBar, SidebarFolders, MessageList, MessageDetailPanel, etc.) :

- **Même organisation** : barre d’actions en haut, barre de filtres au-dessus de la liste, liste à gauche, panneau de détail à droite.
- **Mêmes comportements UX** :
  - Hover sur les lignes (surbrillance, bouton « … » au survol).
  - Sélection visuelle claire (ligne sélectionnée, bordure ou fond distinct).
  - États vide / chargement (message centré, skeleton ou spinner).
  - Badges (non lus, compteurs par dossier, indicateurs de priorité).
  - Menu contextuel (clic droit, bouton « … » sur une ligne).
  - Tri et filtres rapides (onglets, icônes toggle, tri par date/priorité).

Tu peux **dupliquer cette logique visuelle d’Outlook autant que possible** pour garder la même efficacité de lecture et d’action.

### Ce qu’on adapte toujours à BMO

- **Design system BMO** : couleurs, typographies, icônes (lucide-react), radius, ombres — pas les couleurs ni le style Microsoft.
- **Vocabulaire métier ERP BTP** : libellés et contextes « alertes », « chantiers », « décisions », « demandes », « dossiers bloqués », « validation BC », etc. — pas le vocabulaire email pur (boîte de réception, envoyés, brouillons) sauf pour l’écran Messages.
- **Architecture BMO** : BmoLayoutShell, PageTemplate, sections PILOTAGE / EXÉCUTION / etc., pas de structure parallèle type client mail.

En résumé : **structure et comportements UX = inspirés d’Outlook ; apparence et vocabulaire = BMO / ERP BTP.**

---

## 8ter. Guide d’adaptation Outlook → BMO (exemples concrets)

### 1. Comment traduire un écran Outlook en écran BMO

Pour chaque nouveau module (Centre d’alertes, Demandes, Validation BC, etc.), suivre ce processus en **4 étapes** :

**1. Identifier l’équivalent Outlook**

- Centre d’alertes BMO → “Boîte de réception” Outlook (liste de messages + détail).
- Demandes / Tickets → “Dossiers” ou “tickets support” dans une vue liste+détail.
- Gouvernance & décisions → vues “tâches / to‑do” ou “suivi de cas” façon Outlook + Planner.

**2. Décider du gabarit (A/B/C)**

- Si c’est “liste + détail” → **gabarit A** (OutlookLikeLayout).
- Si c’est “navigation + contenu unique” → **gabarit B** (TwoPaneLayout).
- Si c’est un cockpit / synthèse → **gabarit C** (Dashboard / Full content).

**3. Mapper les zones**

Pour un écran gabarit A, remplir explicitement :

- **sidebar** = dossiers/filtres métier BTP (typologies d’alertes, chantiers, statuts).
- **filterBar** = onglets (ex. “Prioritaire / Autres” → “Critiques / Importantes / Toutes”) + icônes de filtres (non traitées, avec pièces jointes, chantiers ciblés).
- **quickActions** = actions principales métier (Nouvelle alerte, Nouvelle demande, Filtrer par chantier, Export).
- **list** = lignes métier (une alerte, une demande, une décision).
- **detail** = toutes les infos clés de l’élément (contexte chantier, montants, délais, actions possibles).

**4. Adapter les libellés et icônes**

- “Nouveau message” → “Nouvelle alerte”, “Nouvelle demande”, “Nouvelle décision” selon le module.
- “Boîte de réception” → “Alertes en cours”, “Demandes ouvertes”, “Décisions en attente”.
- Icônes : privilégier lucide-react cohérentes avec BTP (building, file-text, alert-circle, etc.).

### 2. Règles détaillées pour chaque composant clé

**QuickActionsBar (exemples concrets)**

- **Centre d’alertes** : Bouton primaire “Nouvelle alerte”. Secondaires : “Assigner à…”, “Marquer traité”, “Archiver”, menu “…” (Exporter, Ajouter un commentaire global).
- **Demandes / Validation BC** : Bouton primaire “Nouvelle demande” ou “Créer BC”. Secondaires : “Valider”, “Rejeter”, “Mettre en attente”.

**FilterBar (exemples concrets)**

- **Centre d’alertes** : Onglets “Critiques”, “Importantes”, “Toutes”. Icônes filtres : Non traitées, Avec pièce jointe, Alertes liées à mon périmètre, Alertes liées aux chantiers prioritaires.
- **Demandes** : Onglets “En attente de moi”, “Toutes”, “Clôturées”. Icônes : “En retard”, “> 10k€”, “Avec risque juridique”.

**SidebarFolders (exemples concrets)**

- **Alertes** : Dossiers “Toutes les alertes”, “Alertes chantier”, “Alertes fournisseurs”, “Alertes financières”, “Alertes conformité”. Sous‑dossiers possibles par chantier ou zone géographique.
- **Demandes** : “Demandes en cours”, “Demandes validées”, “Demandes rejetées”, “Demandes à surveiller”.

**MessageList / MessageListRow adaptés au BTP**

- **Champs obligatoires sur une ligne** : Colonne gauche : icône/type (risque, alerte sécurité, demande budget). Titre : objet métier (“Retard chantier X”, “Demande validation BC n°123”). Sous‑texte : chantier / projet, montant, échéance raccourcie. Droite : date, statut (badge couleur), icône pièce jointe si étude / rapport joint.
- **Règles visuelles** : Non traité = gras + badge “NOUVEAU” ou “À traiter”. Critique = pastille rouge/orange sur la gauche.

**MessageDetailPanel adapté au BTP**

- **Header** : Titre métier (ex. “Alerte sécurité – Chute de matériel”). Métadonnées clés : chantier, maître d’ouvrage, phase, montant, échéance, responsable.
- **Corps** : Description textuelle (HTML sanitisé). Pièces jointes (compte‑rendu, photos, documents contractuels).
- **Actions** : Toujours 2–3 actions métier visibles (Valider, Rejeter, Assigner, Planifier action). Bouton “Historique” / “Journal des décisions” accessible.

### 3. Orientation spécifique ERP BTP

À chaque fois qu’on ajoute ou modifie un écran :

- **Questions à se poser** : Quel est l’équivalent dans Outlook (liste+détail, centre de notifications, tâches) ? Quel est l’objectif métier BTP (réduire les retards, sécuriser les chantiers, suivre les budgets, gérer les risques juridiques) ? Quelles informations un DG / MOA doit voir immédiatement dans la liste et dans le détail ?
- **En cas d’hésitation** : Proposer au moins 2 variantes de layout / contenu (ex. plus de champs dans la liste vs plus dans le détail) avec avantages/inconvénients, puis attendre validation avant d’implémenter.
- **Documentation** : Dans `PLAN_MIGRATION_LAYOUT_OUTLOOK_LIKE.md` pour chaque route : gabarit choisi (A/B/C), type de contenu métier (alertes, décisions, demandes…), choix UX majeurs (ce qui apparaît dans la liste, ce qui apparaît seulement dans le détail).

---

## 8quater. Spécification fine d’une page BMO type Outlook (comportements & finitions)

*Bloc “micro‑comportement” pour une page type A (OutlookLikeLayout), à généraliser aux autres.*

### 1. Comportement général de la page

**Chargement initial**

- Pendant le premier chargement des données (mock ou API) : squelette pour la liste (3–5 lignes grises animées), placeholder dans le panneau droit (“Sélectionnez un élément dans la liste”) plutôt qu’un grand vide.
- Le header, la QuickActionsBar et la FilterBar sont visibles dès le départ (pas de flash).

**État vide (aucun élément)**

- Si la liste est vide (après filtres ou dans un dossier vide) : centre de la colonne 2 : illustration légère ou icône (ex. InboxZero) + texte “Aucune alerte pour ce filtre” + bouton “Effacer les filtres” ou “Créer une nouvelle demande”.
- Panneau de détail affiche le même message, ou reste dans l’état “Sélectionnez un élément”.

**Erreurs**

- En cas d’erreur de chargement : bandeau d’erreur non bloquant au‑dessus de la liste (“Impossible de charger les alertes, Réessayer”).
- La page reste utilisable (navigation dans les dossiers/filtres).

### 2. QuickActionsBar – comportements détaillés

- **Affichage** : Toujours visible en haut de la zone contenu, collée sous le header BMO / PageTemplate. Sur scrolling vertical de la liste, la barre reste fixe (sticky top dans la zone contenu) pour garder les actions accessibles.
- **Bouton primaire** : État normal = bouton rempli couleur primaire BMO, icône à gauche, label texte. Hover = légère augmentation de contraste + ombre douce. Disabled = si l’action n’est pas possible (ex. droits manquants) → opacité réduite, curseur not-allowed, tooltip expliquant pourquoi. Click = ouvre une modal de création ou navigue vers une page de création ; le composant appelle simplement `onPrimaryAction()`.
- **Actions secondaires** : Désactivées (disabled) tant qu’aucune ligne n’est sélectionnée. Hover actif = change de fond (bg subtle) + tooltip avec libellé + raccourci clavier si disponible. Si plusieurs éléments sélectionnés : badge “3 sélectionnés” à droite de la barre.
- **Menu “…” overflow** : Au clic, ouvre un menu contextuel aligné sous le bouton ; items cliquables, état disabled pour les actions non disponibles, fermeture automatique au clic ou à Esc.

### 3. FilterBar – comportements détaillés

- **Onglets** : Un seul onglet actif à la fois. Click sur un onglet = met cet onglet en état actif (fond coloré, texte accentué), déclenche `onViewChange(viewId)`, réinitialise la pagination (page 1) mais conserve les filtres rapides. Sur mobile, les onglets restent visibles, barre pleine largeur.
- **Filtres rapides (icônes)** : Comportement toggle : premier clic → actif (fond bleu pâle, icône bleue), second clic → inactif. Multiples filtres peuvent être actifs. Badge discret “Filtres actifs : X” si au moins 1 filtre actif. `onFilterToggle(id)` remonte l’événement ; la page applique le filtrage.
- **Tri** : Bouton “Par date” / “Par chantier”. Au clic : soit toggle asc/desc si un seul critère, soit menu “Trier par” (Date, Montant, Chantier…). Indicateur de direction : flèche ↑ ou ↓, ou texte “Plus récent d’abord”.

### 4. Liste (MessageList / MessageListRow) – comportements détaillés

- **Sélection & navigation** : Clic sur une ligne = ligne en état sélectionné (fond teinté + bord gauche coloré), panneau de détail mis à jour, `onSelect(id)` appelé. Simple sélection par défaut ; sélection multiple via checkbox à préciser module par module.
- **Hover** : Survol = fond clair distinct de l’état sélectionné, bouton “…” à droite (menu contextuel ligne). Le survol ne casse pas l’état sélectionné (couleurs différentes).
- **État “non lu / non traité”** : Fond plus clair (ex. bleu pâle) + titre en gras. Optionnel : petit bullet/pastille à gauche. Au clic, la page peut passer l’élément en “lu”, la ligne se met à jour.
- **Menu contextuel de ligne** : Accessible via bouton “…” au hover et (plus tard) clic droit. Props : `onRowAction(id, actionId)` pour “Assigner”, “Clôturer”, “Ouvrir dans un nouvel onglet”, etc.
- **Performances** : Liste > 50–100 éléments → virtualiser ou limiter la hauteur avec scroll interne pour un scroll fluide.

### 5. Panneau de détail (MessageDetailPanel) – comportements détaillés

- **Chargement** : Si le détail est fetché séparément : skeleton dans le header (barres grises), skeleton dans le corps (paragraphes grisés), icônes d’actions désactivées.
- **Header** : Toujours : titre métier (objet), infos clés en une ligne (chantier, statut, échéance, montant si pertinent), actions principales (Valider, Rejeter, Assigner…) en boutons secondaires/ghost à droite.
- **Corps** : bodyText ou bodyHtml (sanitisé) avec typographie confortable (prose). Liens clicables = `target="_blank"`, `rel="noopener noreferrer"`. Long contenu = scroll interne vertical dans le panneau droit (header du panneau reste visible).
- **Pièces jointes** : Liste de cartes avec icône de type, nom du fichier, taille, action au clic = ouverture dans un nouvel onglet ou téléchargement. UI cohérente avec le reste BMO (mêmes styles de cards que documents existants).

### 6. Réactions visuelles & micro‑interactions

- **Transitions** : Transitions douces (150–200 ms) pour hover, changement d’onglet, ouverture de menus, apparition du panneau de détail. Aucune animation lourde qui bloque l’interaction.
- **Feedback d’action** : Après une action critique (Valider, Rejeter, Supprimer) : toast de confirmation BMO (“Alerte #123 validée”), ligne mise à jour (statut, style) sans reload complet.
- **Accessibilité** : Tab pour passer d’une barre à l’autre, flèches haut/bas pour changer de sélection dans la liste, Enter pour ouvrir l’élément. Focus visible sur tous les boutons/icônes, y compris les “…” contextuels.

---

## 9. Comportement responsive attendu (dès la V1)

Le layout Outlook-like doit être responsive dès la V1.

| Breakpoint | Comportement |
|------------|--------------|
| **Desktop (> 1024px)** | 3 colonnes visibles : sidebar dossiers, liste, détail. |
| **Tablette (≈ 768–1024px)** | 2 colonnes (sidebar + liste **ou** liste + détail), avec un mécanisme simple pour changer de vue (ex. bouton ou onglet « Dossiers » / « Détail »). |
| **Mobile (< 768px)** | **Sidebar** : drawer overlay (ouvrable par bouton menu). **Liste** : plein écran par défaut. **Détail** : s’ouvre sur une route / vue séparée (ex. `/messages/[id]`) avec bouton « Retour » pour revenir à la liste. |

La stratégie responsive est documentée dans le code (commentaires TS en tête de `OutlookLikeLayout`) et dans ce README. La **page** qui utilise le layout gère : drawer pour la sidebar sur mobile/tablette, route ou modal pour le détail sur mobile.

---

## 2. Responsive (détail technique)

- **Desktop (lg: 1024px+)** : `OutlookLikeLayout` affiche 3 colonnes (sidebar, liste, détail).
- **Tablette (md: 768px – 1023px)** : 2 colonnes. Par défaut : liste + détail ; la page peut fournir un moyen d’afficher sidebar + liste (ex. drawer ou `tabletView="sidebar-list"`). Sidebar peut être en drawer overlay.
- **Mobile (< 768px)** : liste pleine page ; détail masqué dans le layout. La page doit : ouvrir la sidebar en **drawer overlay** (bouton menu), ouvrir le détail en **route séparée** (`/messages/[id]`) ou en modal, avec retour à la liste.

---

## 3. Contrat d’API des composants (point 10)

Chaque composant est **pure UI / présentation** :

- **Pas de fetch** ni d’appel API directement dedans.
- **Pas de logique métier cachée** : règles de tri, filtrage ou mapping métier restent dans la page ou les hooks.

Pour chaque composant : **props TypeScript claires et typées**, documentées en JSDoc ; et indication explicite de ce qui est sous la **responsabilité de la page** (données, callbacks, état sélection/filtres). Voir les blocs « Contrat » en tête de chaque fichier (OutlookLikeLayout, QuickActionsBar, FilterBar, SidebarFolders, MessageList, MessageDetailPanel).

---

## 11. Organisation des fichiers et nommage

Structure à respecter (adapter à l’existant) :

| Rôle | Emplacement |
|------|-------------|
| **Layout** | `components/bmo/layout/OutlookLikeLayout.tsx`. Stratégie responsive : JSDoc en tête du fichier + `layout/README_OUTLOOK_LIKE.md`. |
| **Messagerie / messages** | `components/bmo/messages/MessageList.tsx`, `MessageListRow.tsx`, `MessageDetailPanel.tsx`. Types : `messages/types.ts` (BmoMessage, BmoFolder, BmoMessageAddress). |
| **UI génériques** | `components/bmo/ui/QuickActionsBar.tsx`, `FilterBar.tsx`, `SidebarFolders.tsx`. |

Règles :

- Pas de doublons inutiles avec les composants existants (ex. ne pas créer un deuxième Button ou Avatar).
- Si tu factorises un composant existant, expliquer clairement dans le diff / commentaire ce qui change.

---

## 12. Sécurité HTML (sanitization)

- Tout contenu riche (HTML) affiché dans le panneau de détail doit être **sanitisé systématiquement** avec DOMPurify (ou solution équivalente déjà utilisée), comme dans l’exemple EmailViewer.
- **Aucune** interpolation directe de HTML non filtré dans `dangerouslySetInnerHTML`.
- `MessageDetailPanel` accepte soit `bodyHtml` (brut → le composant sanitisé avec DOMPurify), soit **`bodyHtmlSanitized`** : dans ce cas le **parent doit obligatoirement** passer du HTML déjà sanitisé (DOMPurify côté page/hook). Ne jamais passer de HTML non sanitisé dans `bodyHtmlSanitized`.
- En cas de doute sur les règles de sanitization (tags/attributs autorisés), poser la question avant d’assouplir la configuration.

---

## 13. Stratégie d’itération et revue

Travailler par **petits blocs** faciles à relire :

- **Un commit / MR par grande brique** : Layout Outlook-like → QuickActionsBar → FilterBar → SidebarFolders → ItemList + ItemDetailPanel (ou MessageList + MessageDetailPanel) → Page pilote avec données mockées.
- Pour chaque bloc : fournir un **résumé « avant / après »** (fichiers créés ou modifiés, impact sur l’existant).
- Rester sur des **données mockées** tant que les endpoints BMO ne sont pas fournis ; proposer ensuite un plan clair pour brancher les vraies API.

### Template résumé avant/après (par commit / MR)

```markdown
## Bloc : [nom du bloc]

**Avant :** [ce qui existait ou état précédent]
**Fichiers touchés :** [liste des fichiers]
**Après :** [comportement attendu / ce que l’on peut tester]
**Régressions :** aucune (ou liste si besoin)
```

---

## Référence rapide

- **Contexte métier** : ERP BTP MOA ; layout Outlook = pattern pour messages internes, alertes chantier, dossiers, tickets ; pas un client mail générique (voir section « Contexte métier » ci-dessus).
- **Fidélité** : structure Outlook, style BMO (détail en §8).
- **Logique visuelle Outlook + BMO** : même organisation et mêmes comportements UX qu’Outlook ; design system et vocabulaire métier BMO — §8bis.
- **Guide d’adaptation Outlook → BMO** : 4 étapes (équivalent Outlook, gabarit A/B/C, mapping des zones, libellés/icônes) ; exemples concrets QuickActionsBar, FilterBar, SidebarFolders, liste/détail BTP ; orientation ERP BTP et doc dans PLAN_MIGRATION — §8ter.
- **Spécification fine (micro‑comportements)** : chargement (skeleton + placeholder), état vide, erreurs ; QuickActionsBar sticky, états boutons ; FilterBar onglets + toggles ; liste hover/sélection/non lu/contextuel ; détail skeleton/header/corps/pièces jointes ; transitions 150–200 ms, toast, accessibilité — §8quater.
- **Nommage** : types `BmoMessage`, `BmoFolder` ; pas de préfixe `Bmo` sur les noms de composants (détail en §11).
- **Sanitization** : DOMPurify obligatoire pour le HTML du panneau détail (détail en §12).
- **Itération** : un commit/MR par brique, résumé avant/après (détail en §13).
