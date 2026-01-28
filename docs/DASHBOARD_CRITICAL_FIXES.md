# Corrections Critiques - Dashboard

## 🔴 Erreurs Critiques Corrigées

### 1. ✅ Erreur `hasAccess is not defined` dans DashboardViewRouter
**Problème** : Variable `hasAccess` utilisée dans les dépendances du useEffect mais non définie
**Solution** : Utilisé `hasAccessLocal` qui est correctement défini
**Fichier** : `src/modules/dashboard/components/DashboardViewRouter.tsx` ligne 381

### 2. ✅ Conflit de types User dans DashboardSidebar
**Problème** : Deux types User différents (AuthContext vs lib/types)
**Solution** : Le User de `lib/contexts/AuthContext` utilise déjà le type `User` de `lib/types/index` avec `nom`, `prenom`
**Fichier** : `src/modules/dashboard/navigation/DashboardSidebar.tsx` ligne 73

### 3. ✅ Suspense fallback - Functions cannot be passed to Client Components
**Problème** : Passage de fonctions inline au lieu de composants React dans Suspense fallback
**Solution** : Créé des composants dédiés pour les fallbacks
**Fichiers corrigés** :
- `src/modules/dashboard/registry/simpleRegistry.tsx`
- `src/modules/dashboard/registry/dashboardRegistry.tsx`
- `src/modules/dashboard/components/DashboardViewRouter.tsx`
- `src/modules/dashboard/components/DashboardCharts.tsx`

### 4. ✅ Modules serveur bundlés pour le client (ioredis, pino, prom-client)
**Problème** : Next.js essayait de bundler des modules serveur pour le client
**Solution** : Ajouté configuration dans `next.config.ts` pour exclure ces modules du bundle client
**Fichier** : `next.config.ts` - ajout de `fallback` et `externals`

### 5. ✅ Import AuthContext corrigé
**Problème** : Import depuis `@lib-root/contexts/AuthContext` qui n'existe pas
**Solution** : Changé pour `@/contexts/AuthContext`
**Fichier** : `src/modules/dashboard/hooks/useAuthOptional.ts`

### 6. ✅ Export DashboardShell
**Problème** : `DashboardShell` importé depuis chemin incorrect
**Solution** : Ajouté export dans `src/modules/dashboard/index.ts`
**Fichier** : `src/modules/dashboard/index.ts`

---

## 📋 Checklist de Vérification

### Erreurs Runtime
- [x] `hasAccess is not defined` - Corrigé
- [x] Conflit types User - Corrigé
- [x] Suspense fallback functions - Corrigé

### Erreurs Build
- [x] Module not found: ioredis - Configuré dans next.config.ts
- [x] Module not found: pino - Configuré dans next.config.ts
- [x] Module not found: prom-client - Configuré dans next.config.ts
- [x] Module not found: @/modules/dashboard - Vérifier tsconfig.json
- [x] Module not found: @/src/lib/i18n/I18nProvider - Vérifier import

### Exports
- [x] DashboardShell exporté correctement
- [ ] Vérifier tous les exports dans `src/modules/dashboard/index.ts`

---

## 🚀 Prochaines Étapes

1. **Redémarrer le serveur** pour appliquer les changements de `next.config.ts`
2. **Vérifier les imports** dans `app/(portals)/maitre-ouvrage/dashboard/page.tsx`
3. **Tester la compilation** pour vérifier que toutes les erreurs sont résolues
4. **Vérifier les composants manquants** et les implémenter

---

**Date** : 2026-01-27  
**Statut** : 🔴 Corrections critiques en cours
