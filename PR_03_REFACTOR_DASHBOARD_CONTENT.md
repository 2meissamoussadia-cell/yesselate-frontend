# PR #03: Découper DashboardContent & Optimiser Performance

**Branch**: `refactor/dashboard-content-split`  
**Priorité**: 🟡 HAUTE  
**Estimation**: 16 J/H (2 jours)  
**Statut**: ⏳ À FAIRE

---

## 🎯 Objectif

Découper le composant monolithique DashboardContent (1978 lignes) en composants plus petits et testables.

---

## 🔍 Problèmes Identifiés

### 1. ❌ Composant Monolithique
- **Fichier**: `app/(portals)/maitre-ouvrage/dashboard/page.tsx`
- **Taille**: 1978 lignes
- **Problème**: Difficile à maintenir, tester, et optimiser
- **Impact**: Performance, maintenabilité

### 2. ❌ Logique Métier Mélangée
- **Problème**: Logique métier (refresh, filtres) mélangée avec UI
- **Impact**: Difficile à tester, réutiliser

### 3. ❌ Trop de Responsabilités
- **Problème**: Un seul composant gère KPIs, navigation, modals, refresh, etc.
- **Impact**: Couplage fort, difficile à modifier

---

## 📋 Plan de Découpage

### 1. Extraire DashboardKPIBar (4 J/H)

**Fichier**: `src/modules/dashboard/components/DashboardKPIBar.tsx`

**Responsabilités**:
- Affichage des KPIs
- Filtre de recherche
- Boutons refresh/export
- Notifications de changements

**Code à extraire**: Lignes ~400-800 de page.tsx

### 2. Extraire DashboardFooter (2 J/H)

**Fichier**: `src/modules/dashboard/components/DashboardFooter.tsx`

**Responsabilités**:
- Footer avec métriques
- Raccourcis clavier
- Statut de connexion

**Code à extraire**: Lignes ~1800-1978 de page.tsx

### 3. Extraire Hooks (4 J/H)

**Fichiers**:
- `src/modules/dashboard/hooks/useDashboardRefresh.ts`
- `src/modules/dashboard/hooks/useKPIFilter.ts`
- `src/modules/dashboard/hooks/useKPINotifications.ts`

**Responsabilités**:
- Logique de refresh avec retry
- Logique de filtre KPI
- Gestion des notifications

### 4. Simplifier DashboardContent (4 J/H)

**Fichier**: `src/modules/dashboard/components/DashboardContent.tsx`

**Nouveau code**:
```typescript
const DashboardContent = memo(function DashboardContent() {
  const { main, sub, leaf } = useDashboardNavigationState();
  
  return (
    <div className="h-full w-full flex min-h-0">
      <DashboardSidebar />
      <section className="flex-1 min-w-0 flex flex-col">
        <DashboardSubNavigation />
        <DashboardKPIBar />
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ErrorBoundary>
            <DashboardViewRouter />
          </ErrorBoundary>
        </div>
        <DashboardFooter />
      </section>
    </div>
  );
});
```

### 5. Tests E2E Playwright (2 J/H)

**Fichier**: `tests/e2e/dashboard-navigation.spec.ts`

```typescript
test('should navigate between KPIs pages', async ({ page }) => {
  await page.goto('/maitre-ouvrage/dashboard?main=overview&sub=kpis&leaf=highlights');
  await expect(page.locator('h1')).toContainText('Synthèse stratégique');
  
  // Naviguer vers projets
  await page.click('text=Projets');
  await expect(page.locator('h1')).toContainText('KPIs Chantiers');
});
```

---

## ✅ Checklist

- [ ] DashboardKPIBar extrait
- [ ] DashboardFooter extrait
- [ ] Hooks extraits
- [ ] DashboardContent simplifié
- [ ] Tests unitaires ajoutés
- [ ] Tests E2E ajoutés
- [ ] Documentation mise à jour

---

## 📊 Métriques Attendues

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Lignes par composant | 1978 | ~200 | **-90%** |
| Temps de rendu | ~500ms | ~100ms | **-80%** |
| Testabilité | Faible | Élevée | **+100%** |
