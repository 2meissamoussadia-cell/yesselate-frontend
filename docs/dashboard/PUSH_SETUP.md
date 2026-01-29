# Web Push — Configuration Cockpit DG V5

## Variables d’environnement

Ajoutez dans `.env` (ou `.env.local`) :

```env
# Clé publique VAPID (exposée au client via GET /api/push/vapid-public)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_cle_publique_base64

# Clé privée VAPID (serveur uniquement, pour envoyer les notifications)
VAPID_PRIVATE_KEY=votre_cle_privee_base64
```

## Générer les clés VAPID

```bash
npx web-push generate-vapid-keys
```

Ou avec le CLI global :

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Copiez la clé publique dans `NEXT_PUBLIC_VAPID_PUBLIC_KEY` et la clé privée dans `VAPID_PRIVATE_KEY`.

## APIs

- **GET /api/push/vapid-public** — Retourne la clé publique (pour l’abonnement côté client).
- **POST /api/push/subscribe** — Enregistre un abonnement (body : `PushSubscription` JSON).
- **POST /api/push/unsubscribe** — Supprime un abonnement (body : `{ endpoint }`).
- **POST /api/push/send** — Envoie une notification à tous les abonnés (body : `{ title?, body? }`). Nécessite `web-push` et les clés VAPID.

## Consentement

La bannière **PushConsentBanner** s’affiche sur la page Cockpit DG tant que l’utilisateur n’a pas accepté ou fermé. Le choix est mémorisé en `localStorage` (`cockpit-push-consent`).

## En production

Remplacer le store en mémoire (`app/api/push/subscriptions-store.ts`) par une persistance en base (table `push_subscriptions` par utilisateur/session).
