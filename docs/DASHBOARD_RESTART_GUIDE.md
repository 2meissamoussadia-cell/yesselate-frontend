# Guide de Redémarrage - Dashboard

## 🔄 Comment Redémarrer le Serveur

### Option 1 : Via Terminal (Recommandé)

```bash
# Arrêter le serveur actuel (Ctrl+C dans le terminal où il tourne)

# Puis redémarrer
npm run dev
# ou
yarn dev
```

### Option 2 : Via VS Code / Cursor

1. Ouvrir le terminal intégré (Ctrl+`)
2. Arrêter le processus en cours (Ctrl+C)
3. Relancer : `npm run dev` ou `yarn dev`

### Option 3 : Redémarrage Complet (si problèmes persistants)

```bash
# 1. Arrêter le serveur
# Ctrl+C dans le terminal

# 2. Nettoyer le cache Next.js
rm -rf .next
# Sur Windows PowerShell:
Remove-Item -Recurse -Force .next

# 3. Redémarrer
npm run dev
```

---

## ⚠️ Après Modification de `next.config.ts`

**IMPORTANT** : Après modification de `next.config.ts`, vous **DEVEZ** redémarrer le serveur pour que les changements soient pris en compte.

Les changements suivants nécessitent un redémarrage :
- Modification de `webpack` config
- Modification de `resolve.fallback`
- Modification de `externals`
- Modification de `turbopack` config

---

## ✅ Corrections Appliquées (Nécessitent Redémarrage)

1. **next.config.ts** : Exclusion de `ioredis`, `pino`, `prom-client` du bundle client
2. **DashboardViewRouter.tsx** : Correction Suspense fallback
3. **DashboardSidebar.tsx** : Correction types User
4. **useAuthOptional.ts** : Correction import AuthContext

---

## 🧪 Vérification Après Redémarrage

1. **Vérifier les erreurs de build** :
   - Plus d'erreur "Module not found: ioredis"
   - Plus d'erreur "Module not found: pino"
   - Plus d'erreur "Module not found: prom-client"

2. **Vérifier les erreurs runtime** :
   - Plus d'erreur "hasAccess is not defined"
   - Plus d'erreur "Functions cannot be passed to Client Components"
   - Plus d'erreur de type User

3. **Tester la navigation** :
   - Navigation entre les vues fonctionne
   - Swipe gestures fonctionnent
   - Modals s'ouvrent correctement

---

**Date** : 2026-01-27
