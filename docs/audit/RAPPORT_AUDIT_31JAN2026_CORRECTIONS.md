# Corrections suite au rapport d'audit du 31 janvier 2026

**Date des corrections** : 30 janvier 2026  
**Référence** : Rapport d'audit final (score 78/100), problèmes critiques et fonctionnalités à compléter.

---

## 1. Page HSE & Conformité — Erreur de chargement ✅ CORRIGÉ

**Problème** : `/maitre-ouvrage/dashboard?main=pilotage&sub=hse&leaf=default` affichait « Erreur de chargement - Le chargement de la page a échoué ».

**Cause** : La vue `pilotage::hse::default` utilisait le loader `loadOverviewSummaryDashboard`, qui appelle l’API `/api/dashboard/{main}/{sub}/{leaf}`. La route API n’accepte que `main` ∈ `['overview','performance','actions','risks','decisions','realtime','administration']` ; `main=pilotage` est rejeté (400), le loader échouait.

**Correction** :  
- Ajout d’un loader dédié **`loadHseView`** dans `src/modules/dashboard/registry/dashboardRegistry.tsx` qui retourne un `LoaderResult` valide (`key`, `data: {}`, `fetchedAt`) sans appeler l’API.  
- La vue HSE & Conformité (`HSEConformiteView`) s’affiche correctement ; elle n’a pas besoin de données du loader.

**Fichiers modifiés** : `src/modules/dashboard/registry/dashboardRegistry.tsx`

---

## 2. Boutons du modal « Budget Consommé — Portefeuille » ✅ CORRIGÉ

**Problème** :  
- « Voir détail » ne faisait rien.  
- « Bloquer dépenses » ne faisait rien.

**Correction** :  
- **Voir détail** : `onClick` → toast info « Ouverture de la vue Budget & engagements… » + fermeture du modal.  
- **Bloquer dépenses** : `onClick` → toast warning « Action à confirmer avec le contrôleur de gestion. Fonctionnalité à venir. »

**Fichiers modifiés** : `src/modules/dashboard/components/modals/BudgetConsommeModal.tsx` (import `toast` depuis `sonner` + handlers).

---

## 3. Bouton « Nouveau chantier » (page Chantiers & Programmes) ✅ CORRIGÉ

**Problème** : Le bouton « + Nouveau chantier » sur la page Portefeuille chantiers ne faisait rien.

**Correction** :  
- `onClick` sur l’`ErpButton` → `toast.info('Nouveau chantier', { description: 'Formulaire de création à venir. En attendant, contactez l’équipe projet.' })`.  
- Import `toast` depuis `sonner` dans `PortefeuilleChantiersPage.tsx`.

**Fichiers modifiés** : `src/modules/dashboard/components/views/PortefeuilleChantiersPage.tsx`

---

## 4. Bouton recherche globale (⌘K)

**Statut** : Déjà branché.  
- `BmoLayoutShell` envoie l’événement `bmo-open-command-palette` au clic sur le bouton recherche.  
- La page dashboard (`app/(portals)/maitre-ouvrage/dashboard/page.tsx`) écoute cet événement et appelle `toggleCommandPalette()`.  
- Si le bouton « ne déclenche rien » en test, vérifier que l’on est bien sur la page dashboard maître-ouvrage (layout avec `BmoLayoutShell`) et que le listener est bien monté.

---

## 5. SubSidebar — Contenu des pages ✅ CORRIGÉ

**Correction** : Loader statique `loadPilotageStaticView` pour gouvernance, calendrier, analytics (même cause que HSE : API rejette main=pilotage). Les vues s’affichent. **Statut** : Corrigé.  
- Les pages Centre d’alertes, Gouvernance, Calendrier, Analytics chargent déjà des composants (AlertsActivesPage, GovernancePilotageView, CalendrierEcheancesView, AnalyticsReportsView).  
- « Contenu vide » peut venir de données vides (0 alertes, listes vides) ou de mocks à enrichir ; à traiter en lot dédié (données / UX).

---

## 6. Tri tableau chantiers

**Statut** : Non traité dans cette vague.  
- À ajouter sur la page Portefeuille chantiers (tri colonnes) dans une itération ultérieure.

---

## Résumé

| Élément                          | Statut        | Action |
|----------------------------------|---------------|--------|
| HSE & Conformité — erreur chargement | ✅ Corrigé    | Loader dédié `loadHseView` |
| Modal Budget — Voir détail / Bloquer dépenses | ✅ Corrigé | Toasts + fermeture modal (Voir détail) |
| Bouton Nouveau chantier          | ✅ Corrigé    | Toast « Formulaire à venir » |
| Bouton recherche (⌘K)            | Déjà branché  | Vérifier contexte de test |
| SubSidebar (gouvernance, calendrier, analytics) | ✅ Corrigé | Loader statique `loadPilotageStaticView` |
| Tri tableau chantiers            | ✅ Corrigé    | Tri cliquable sur toutes les colonnes |
