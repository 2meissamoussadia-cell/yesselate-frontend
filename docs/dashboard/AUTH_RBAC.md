# Authentification et RBAC — Dashboard BMO

## Résumé

- **Authentification** : Connexion requise pour accéder au dashboard. Page `/login`, garde `DashboardAuthGuard` sur le layout dashboard.
- **Contexte unifié** : Le dashboard utilise le même `AuthContext` que le reste de l’app (`lib/contexts/AuthContext`), via `useAuthOptional` qui lit `@lib-root/contexts/AuthContext`.
- **Rôles BMO** : DG, Chef Chantier, Ouvrier, Client (définis en DB dans `18b_rbac_bmo_roles.sql`).
- **Permissions granulaires** : `paiement:validate`, `chantier:archive`, `budget:update` (et existantes `dashboard:read`, `export:read`, etc.).
- **Scopes** : Les chantiers sont filtrés par scope (DG voit tout, les autres voient uniquement leurs chantiers assignés).

---

## 1. Authentification

- **Page login** : `app/login/page.tsx` — formulaire email / mot de passe, redirection vers `?redirect=` ou `/maitre-ouvrage/dashboard`.
- **Provider** : `lib/providers/Providers.tsx` utilise `AuthProvider` de `lib/contexts/AuthContext.tsx`. Plus d’utilisateur par défaut en localStorage : connexion obligatoire.
- **Garde dashboard** : `src/modules/dashboard/components/DashboardAuthGuard.tsx` — si non connecté, redirection vers `/login` avec `?redirect=`.

---

## 2. Rôles RBAC

| Rôle            | Vue chantiers              | Permissions typiques                                      |
|-----------------|----------------------------|-----------------------------------------------------------|
| **DG**          | Tous                       | Tout (équivalent admin)                                   |
| **Chef Chantier** | Ses chantiers (scopes)   | dashboard:read, export:read, chantier:read/write/archive |
| **Ouvrier**     | Sa mission (scope chantier)| dashboard:read, chantier:read                             |
| **Client**      | Son chantier (scope)      | dashboard:read, chantier:read                            |

Les rôles et scopes sont chargés depuis la DB (`rbac_user_assignments` + `rbac_roles`) dans `lib/server/dashboard/context_ext.ts` et exposés par `/api/rbac/permissions` et `/api/me/policy`.

---

## 3. Permissions granulaires (UI)

- **Valider paiement** : `useDashboardPermissions().canValidatePaiement` — bouton « Confirmer la validation » désactivé dans `PaiementValidationModal` si `false`.
- **Archiver chantier** : `useDashboardPermissions().canArchiveChantier` — entrée « Archiver » du menu contextuel chantier masquée si `false`.
- **Modifier budget** : `useDashboardPermissions().canUpdateBudget` — prêt pour un futur bouton / formulaire d’édition budget (permission en DB et dans le hook).

---

## 4. Filtrage des chantiers (scope)

- **API** : `GET /api/cockpit/chantiers` lit les headers `x-user-id`, `x-tenant-id`, enrichit le contexte via `enrichContextWithRbac` et filtre les chantiers :
  - DG ou admin : tous les chantiers.
  - Autres rôles : uniquement les chantiers dont l’id/code est dans `ctx.scopes` (ex. `chantier:RENOV-042`).
- **Front** : `useCockpitChantiers` envoie les headers d’auth (`useAuthHeaders`) au fetch pour que le filtrage s’applique.

---

## 5. Fichiers modifiés / ajoutés

| Fichier | Rôle |
|--------|------|
| `app/login/page.tsx` | Page de connexion |
| `src/modules/dashboard/components/DashboardAuthGuard.tsx` | Garde auth dashboard |
| `src/modules/dashboard/hooks/useAuthOptional.ts` | Utilise `@lib-root/contexts/AuthContext` |
| `lib/contexts/AuthContext.tsx` | Plus d’utilisateur par défaut si pas de session |
| `app/(portals)/maitre-ouvrage/dashboard/layout.tsx` | Intègre `DashboardAuthGuard` |
| `lib/server/dashboard/sql/18b_rbac_bmo_roles.sql` | Rôles BMO + permissions (paiement, chantier, budget) |
| `lib/server/dashboard/context_ext.ts` | Chargement des rôles depuis DB |
| `lib/server/dashboard/context.ts` | Propagation des rôles enrichis + types BMO |
| `app/api/cockpit/chantiers/route.ts` | Filtrage chantiers par scope RBAC |
| `src/modules/dashboard/hooks/useCockpitChantiers.ts` | Envoi des headers d’auth à l’API cockpit |
| `src/modules/dashboard/hooks/useDashboardPermissions.ts` | `canValidatePaiement`, `canArchiveChantier`, `canUpdateBudget`, `canSeeChantier`, `hasRole` |
| `src/modules/dashboard/components/cockpit/ChantierContextMenu.tsx` | Masquage « Archiver » si `!canArchiveChantier` |
| `src/components/features/bmo/workspace/paiements/modals/PaiementValidationModal.tsx` | Désactivation validation si `!canValidatePaiement` |

---

## 6. Suite possible (Clerk / Supabase)

- Remplacer le mock login dans `lib/contexts/AuthContext.tsx` par un appel Clerk ou Supabase Auth.
- Garder le même flux : après login, `user` dans le contexte + `x-user-id` / `x-tenant-id` / `x-roles` pour les APIs ; RBAC et scopes restent gérés côté DB et `context_ext` comme aujourd’hui.
