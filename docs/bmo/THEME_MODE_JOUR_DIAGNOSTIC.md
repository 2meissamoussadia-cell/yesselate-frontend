# Diagnostic mode jour / nuit — Problèmes identifiés

## Résumé

Le mode jour ne s'applique pas correctement à cause de **problèmes au niveau des layouts et composants UI** qui utilisent des styles sombres figés, et du **Toaster** configuré en thème sombre uniquement.

---

## 1. Toaster (Sonner) — BmoPortalLayout

**Fichier :** `src/components/bmo/layout/BmoPortalLayout.tsx` (ligne 59)

**Problème :** `<Toaster theme="dark" ... />` — les notifications toast restent toujours sombres, même en mode jour.

**Correction :** Rendre le thème dynamique selon `useAppStore().darkMode` :
```tsx
theme={darkMode ? "dark" : "light"}
```

---

## 2. DashboardLayoutFallback — Écran de chargement

**Fichier :** `app/(portals)/maitre-ouvrage/dashboard/DashboardLayoutClient.tsx`

**Problème :** `bg-slate-950` et `text-slate-400` figés. L'écran de chargement du dashboard reste sombre en mode jour.

**Correction :** Ajouter variantes `bg-white dark:bg-slate-950`, `text-slate-500 dark:text-slate-400`.

---

## 3. DashboardLayoutError — Écran d'erreur

**Fichier :** `app/(portals)/maitre-ouvrage/dashboard/DashboardLayoutClient.tsx`

**Problème :** `bg-slate-950`, `bg-slate-900/50`, `text-slate-300` figés. Même problème en cas d'erreur.

**Correction :** Ajouter variantes light/dark pour fond et textes.

---

## 4. PageTemplate header (pages non full-page)

**Fichier :** `src/components/navigation/PageTemplate.tsx`

**Problème :** Quand `useFullPage=false` (ex. certaines pages maître-ouvrage), le header utilise `text-slate-50`, `text-slate-200`, `border-slate-700/60` — illisibles sur fond clair.

**Impact :** Le dashboard utilise `useFullPage=true` donc le header est masqué. Pas bloquant pour le dashboard, mais à corriger pour les autres pages.

---

## 5. Flux du thème (vérifié ✅)

| Élément | Statut |
|---------|--------|
| Script initial (layout) | Lit `nice-renovation-app-storage` et applique `dark`/`light` sur `<html>` avant hydration |
| ThemeSync | Applique `dark`/`light` selon `useAppStore().darkMode` après montage |
| globals.css | `.light` et `.dark` définissent les variables CSS correctement |
| Tailwind `dark:` | `@custom-variant dark (&:is(.dark *))` — s'applique quand ancêtre a `.dark` |
| BmoLayoutShell | `bg-gray-50 dark:bg-slate-950` — OK |
| PageTemplate content | `bg-gray-50/80 dark:bg-slate-950/30` — OK |

---

## 6. Viewport themeColor (mineur)

**Fichier :** `app/layout.tsx` — `themeColor: "#0f172a"` (sombre) statique.

**Impact :** Sur mobile, la barre d'adresse du navigateur reste sombre. Non critique pour le contenu de la page.

---

## Actions recommandées

1. ✅ **Corrigé :** Toaster dynamique (BmoPortalLayout)
2. ✅ **Corrigé :** DashboardLayoutFallback et DashboardLayoutError
3. ✅ **Corrigé :** PageTemplate header pour pages non-dashboard
4. **Priorité basse :** themeColor dynamique (nécessite approche spécifique)
