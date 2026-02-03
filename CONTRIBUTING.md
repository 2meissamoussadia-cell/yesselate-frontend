# 🤝 Guide de contribution BMO

Les contributions au projet BMO sont les bienvenues.

## Démarrage

1. **Fork** le dépôt sur GitHub.
2. **Clone** votre fork : `git clone https://github.com/VOTRE-USER/yesselate-frontend.git`
3. **Branche** : `git checkout -b feature/ma-fonctionnalite` (ou `fix/...`, `docs/...`).
4. **Install** : `npm install`

## Conventions

- **Commits** : format `type(scope): description`  
  Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Code** : respecter le [Guide développeur](./docs/DEVELOPER_GUIDE.md) et les conventions (ESLint, TypeScript).
- **Tests** : ajouter ou mettre à jour les tests concernés (`npm run test`).

## Workflow

1. Développer sur votre branche.
2. Tester : `npm run test`, `npx tsc --noEmit`, `npm run lint`.
3. Commit : messages clairs en français ou anglais.
4. Push : `git push origin feature/ma-fonctionnalite`
5. **Pull Request** vers la branche cible (ex. `develop` ou `main`) avec description et checklist.

## Checklist PR

- [ ] Tests ajoutés ou mis à jour
- [ ] Pas d’erreurs TypeScript / ESLint
- [ ] Documentation mise à jour si besoin

## Contact

- Issues : https://github.com/yessalate/bmo/issues  
- Équipe : voir [README](./README.md) section Équipe.
