# Layout Outlook-like (3 colonnes)

**Stratégie responsive** : documentée en JSDoc en tête de `OutlookLikeLayout.tsx` et dans `docs/bmo/OUTLOOK_LIKE_INTEGRATION.md`.

- **Desktop (> 1024px)** : 3 colonnes (sidebar, liste, détail).
- **Tablette (768–1024px)** : 2 colonnes (liste + détail) ; sidebar masquée (drawer si la page le fournit).
- **Mobile (< 768px)** : liste pleine page ; détail masqué — la page gère drawer sidebar et route/modal pour le détail.

**Fichiers** : `OutlookLikeLayout.tsx` (layout seul). Composants liste/détail/UI : `../messages/` et `../ui/`.
