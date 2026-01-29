# Avertissements console en développement — Dashboard

Ce document décrit les messages courants en console en dev et leur signification.

---

## Résolus ou atténués

### 1. `[resolveLocaleContext] Database connection failed, using defaults`
- **Cause** : Connexion DB indisponible (ex. `DATABASE_URL` non défini ou serveur arrêté).
- **Comportement** : La fonction retourne des valeurs par défaut (locale, devise, timezone) ; l’app fonctionne.
- **Éviter l’erreur RSC** : Les logs n’envoient plus l’objet `Error` brut au client (sérialisation en string dans `lib/server/i18n/locale.server.ts`).

### 2. `/api/ai/briefing` 503
- **Cause** : `OPENAI_API_KEY` non configuré.
- **Comportement** : L’API renvoie désormais **200** avec un briefing de secours (message invitant à configurer la clé). Le cockpit affiche le texte et le badge « IA non configurée ».

### 3. Images `picsum.photos` 503
- **Cause** : Service externe indisponible ou bloqué (réseau, CORS).
- **Comportement** : Les mocks Photos GPS utilisent un placeholder local (`/images/placeholder-photo.svg`) ; plus d’appel à picsum. Les composants (ex. CockpitPhotosGpsPanel) ont aussi un fallback `onError` si une image échoue.

---

## Avertissements connus (sans correction côté app)

### 4. CSS preload — « resource was preloaded but not used within a few seconds »
- **Message** : `The resource .../_next/static/chunks/[root-of-the-server]__...._.css was preloaded using link preload but not used...`
- **Cause** : Comportement interne Next.js/Turbopack (chunks RSC/CSS préchargés dont l’utilisation est différée).
- **Impact** : Aucun sur le fonctionnement ; warning de performance du navigateur en dev.
- **Référence** : [Next.js #16932](https://github.com/vercel/next.js/issues/16932), [Next.js #51524](https://github.com/vercel/next.js/issues/51524).

### 5. PWA — « beforeinstallpromptevent.preventDefault() called... »
- **Message** : `Banner not shown: beforeinstallpromptevent.preventDefault() called. The page must call beforeinstallpromptevent.prompt() to show the banner.`
- **Cause** : Le SW ou la page intercepte l’événement d’installation PWA sans afficher le bandeau.
- **Impact** : Informatif ; le bandeau d’installation n’apparaît pas tant que `prompt()` n’est pas appelé (par design si l’app gère l’install manuellement).

### 6. React DevTools
- **Message** : « Download the React DevTools for a better development experience »
- **Impact** : Aucun ; suggestion d’installer l’extension React DevTools.

---

## Résumé

| Message / URL              | Statut        | Action recommandée                    |
|---------------------------|---------------|--------------------------------------|
| resolveLocaleContext + DB | Atténué       | Aucune (fallback OK)                 |
| /api/ai/briefing 503      | Corrigé (200) | Configurer OPENAI_API_KEY si besoin  |
| picsum.photos 503         | Corrigé       | Placeholder local utilisé            |
| CSS preload               | Connu         | Aucune (limitation Next.js)          |
| beforeinstallprompt       | Connu         | Gérer `prompt()` si bandeau souhaité |
| React DevTools            | Info          | Optionnel                            |
