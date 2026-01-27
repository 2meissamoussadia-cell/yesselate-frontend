# Phase P18 : SBOM et Signatures - Guide d'Implémentation

## 🎯 Objectif

Générer et vérifier des Software Bill of Materials (SBOM) et signer les artefacts (images Docker, packages npm) pour garantir l'intégrité de la chaîne d'approvisionnement.

---

## 📦 SBOM (Software Bill of Materials)

### Génération

**Fichier** : `lib/server/security/sbom.ts`

**Formats supportés** :
- **CycloneDX** : Format standard OWASP (recommandé)
- **SPDX** : Format Linux Foundation

**Outils recommandés** :
```bash
# Installer cyclonedx-npm
npm install -g @cyclonedx/cyclonedx-npm

# Générer SBOM
npx @cyclonedx/cyclonedx-npm --output-file sbom.json
```

**Intégration CI/CD** :
```yaml
# .github/workflows/sbom.yml
name: Generate SBOM
on:
  push:
    branches: [main]
  release:
    types: [created]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json
      - uses: actions/upload-artifact@v3
        with:
          name: sbom
          path: sbom.json
```

### Vérification des Vulnérabilités

```typescript
import { verifySBOM } from '@/lib/server/security/sbom';

const counts = await verifySBOM('sbom.json');
console.log(`Vulnérabilités: ${counts.vulnerabilities}`);
console.log(`Critiques: ${counts.critical}`);
```

---

## 🔐 Signatures d'Artefacts

### Signer les Images Docker

**Outils** : Docker Content Trust, Cosign (Sigstore)

**Avec Cosign** :
```bash
# Installer cosign
brew install cosign

# Générer une paire de clés
cosign generate-key-pair

# Signer une image
cosign sign --key cosign.key your-registry/image:tag

# Vérifier une signature
cosign verify --key cosign.pub your-registry/image:tag
```

**Intégration CI/CD** :
```yaml
# .github/workflows/docker-sign.yml
name: Sign Docker Image
on:
  push:
    tags:
      - 'v*'

jobs:
  sign:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: sigstore/cosign-installer@v2
      - name: Sign image
        env:
          COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
          COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
        run: |
          cosign sign --key env://COSIGN_PRIVATE_KEY \
            --yes \
            your-registry/image:${{ github.ref_name }}
```

### Signer les Packages npm

**Avec npm** :
```bash
# Générer une clé GPG
gpg --generate-key

# Configurer npm pour signer
npm config set sign-git-tag true

# Publier avec signature
npm publish --access public
```

**Vérification** :
```bash
# Vérifier la signature d'un package
npm view @your-scope/package dist.tarball | xargs curl | tar -xz
gpg --verify package.tgz.asc package.tgz
```

---

## 🔍 Vérification Automatique

### Script de Vérification

```typescript
// scripts/verify-artifacts.ts
import { verifySBOM } from '@/lib/server/security/sbom';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function verifyAll() {
  // Vérifier SBOM
  const sbomCounts = await verifySBOM('sbom.json');
  if (sbomCounts.critical > 0) {
    throw new Error(`Critical vulnerabilities found: ${sbomCounts.critical}`);
  }

  // Vérifier signature Docker (si applicable)
  if (process.env.DOCKER_IMAGE) {
    const { stdout } = await execAsync(
      `cosign verify --key cosign.pub ${process.env.DOCKER_IMAGE}`
    );
    console.log('Docker image signature verified:', stdout);
  }

  console.log('All artifacts verified ✅');
}

verifyAll().catch(console.error);
```

---

## 📋 Checklist de Déploiement

- [ ] Installer outils SBOM (`@cyclonedx/cyclonedx-npm`)
- [ ] Générer SBOM initial (`generateSBOM()`)
- [ ] Configurer CI/CD pour génération automatique SBOM
- [ ] Configurer Cosign pour signatures Docker
- [ ] Configurer GPG pour signatures npm
- [ ] Ajouter vérification SBOM dans pipeline CI/CD
- [ ] Ajouter vérification signatures dans pipeline CI/CD
- [ ] Documenter processus de vérification pour équipe

---

## 🔒 Bonnes Pratiques

1. **SBOM** : Générer à chaque release et stocker avec les artefacts
2. **Signatures** : Signer toutes les images Docker et packages npm publiés
3. **Vérification** : Vérifier automatiquement dans CI/CD avant déploiement
4. **Rotation** : Roter les clés de signature périodiquement (tous les 90 jours)
5. **Audit** : Logger toutes les vérifications dans `security_audit_log`

---

**Note** : L'implémentation complète nécessite la configuration de votre CI/CD spécifique (GitHub Actions, GitLab CI, Jenkins, etc.).
