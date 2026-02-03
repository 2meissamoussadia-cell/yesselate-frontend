# 📋 Éléments manquants ou à compléter — BMO

Document de suivi des manques identifiés par rapport au README et à la documentation cible.

---

## ✅ Déjà corrigé / aligné

- **README** : port dev 4001 (au lieu de 3000), liens docs pointant vers les fichiers existants.
- **Documentation** : ARCHITECTURE, DEVELOPER_GUIDE, ROADMAP, MIGRATION_CHECKLIST, OUTLOOK_LIKE_INTEGRATION, GUIDE_DEPLOIEMENT_BMO, API_LIST_EXHAUSTIVE en place ou équivalents utilisés.

---

## 📄 Documentation (état actuel)

| Lien dans README | Fichier / équivalent | Statut |
|------------------|----------------------|--------|
| `docs/USER_GUIDE.md` | Guide utilisateur | ✅ Créé |
| `docs/API_REFERENCE.md` | Liste des API | ✅ Lien vers `docs/API_LIST_EXHAUSTIVE.md` |
| `docs/DEPLOYMENT.md` | Guide déploiement | ✅ Lien vers `docs/deployment/GUIDE_DEPLOIEMENT_BMO.md` |
| `CONTRIBUTING.md` | Contribution | ✅ Créé à la racine |
| `CHANGELOG.md` | Changelog | ✅ Créé à la racine |
| `LICENSE` | Licence MIT | ✅ Créé à la racine |

---

## 🔧 Scripts npm référencés dans le README mais absents de `package.json`

| Script | Utilisation suggérée |
|--------|------------------------|
| `type-check` | `npx tsc --noEmit` ou ajout dans `package.json`. |
| `deploy` | Déploiement Vercel (à définir selon l’équipe). |
| `deploy:aws` | Déploiement AWS (à définir). |
| `migrate:all` | Migration des modules (ex. `migration:wizard` existant). |
| `security:audit` | `npm audit` ou script dédié. |
| `analyze` | Analyse de bundle (ex. `@next/bundle-analyzer`). |
| `format` | Prettier (ex. `prettier --write .`). |
| `db:migrate` | Prisma : `npx prisma migrate deploy` (ou `dev`). |
| `db:seed` | Prisma : `npx prisma db seed`. |

À faire : ajouter ces scripts dans `package.json` avec la commande réelle utilisée en interne, ou adapter le README pour indiquer les commandes manuelles.

---

## 📌 Autres points à traiter

1. **Tests** : le README indique "Vitest" dans la stack ; le projet utilise **Jest** pour les tests unitaires. À harmoniser dans le README.
2. **`.env.example`** : vérifier qu’il existe et qu’il documente les variables nécessaires (DB, Auth, API, etc.).
3. **Vérifications finales** (voir MIGRATION_CHECKLIST.md) : TypeScript 0 erreurs, ESLint propre, coverage 80 %+, npm audit 0 vulnérabilités — à traiter progressivement.

---

*Dernière mise à jour : 2026-02-03*
