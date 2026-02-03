# 🏗️ BMO - Business Management Outlook

> Plateforme de gestion de chantiers BTP avec interface Outlook-like

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Vue d'ensemble

BMO (Business Management Outlook) est une application web moderne de gestion de projets BTP pour YESSALATE BTP / NICE RÉNOVATION SAS, offrant une expérience utilisateur inspirée de Microsoft Outlook avec des fonctionnalités complètes de suivi de chantiers, gestion budgétaire, planification et contrôle qualité.

### ✨ Fonctionnalités principales

- **📊 Tableau de bord** - Vue d'ensemble temps réel avec KPI et widgets personnalisables
- **🚨 Alertes** - Système de gestion d'alertes critiques avec workflow de traitement
- **📝 Demandes** - Gestion des demandes de travaux, budget, fournitures avec validation
- **💰 Validation BC** - Circuit de validation des bons de commande multi-niveaux
- **📈 Gouvernance** - Tableaux de bord et rapports de performance
- **🏗️ Chantiers** - Suivi détaillé des chantiers avec avancement et performance
- **📐 Études** - Gestion des phases d'études (APS, APD, PRO, EXE)
- **📅 Planning** - Planification interactive avec vue calendrier
- **⭐ Qualité** - Contrôles qualité et gestion des non-conformités
- **📦 Livraisons** - Suivi des livraisons et réceptions
- **📄 Documents** - GED centralisée avec versioning
- **💬 Messages** - Communication interne intégrée

## 🚀 Démarrage rapide

### Prérequis

```bash
Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 14
```

### Installation

```bash
# Clone repository
git clone https://github.com/yessalate/bmo.git
cd bmo

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Éditer .env.local avec vos credentials

# Setup database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Ouvrir [http://localhost:4001](http://localhost:4001)

### Identifiants démo

```
Email: demo@yessalate.sn
Password: Demo123!
```

## 📂 Structure du projet

```
bmo/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Routes authentification
│   └── (portals)/
│       └── maitre-ouvrage/    # Routes principales
│           ├── alerts/        # Module Alertes
│           ├── demandes/      # Module Demandes
│           ├── validation-bc/ # Module Validation BC
│           ├── governance/    # Module Gouvernance
│           ├── chantiers/     # Module Chantiers
│           ├── etudes/        # Module Études
│           ├── planning/      # Module Planning
│           ├── qualite/       # Module Qualité
│           └── [20+ autres modules]
│
├── src/
│   ├── components/            # Composants React
│   │   ├── bmo/               # Composants métier BMO
│   │   │   ├── layout/        # OutlookLikeLayout, DashboardLayout, CalendarLayout
│   │   │   ├── QuickActionsBar, FilterBar, ItemList, ModuleSubSidebar
│   │   │   └── [modules]/     # Composants par module
│   │   └── ui/                # shadcn/ui components
│   │
│   └── lib/                   # Logique applicative
│       ├── api/               # Clients API
│       ├── config/            # Configurations (dont modules)
│       ├── hooks/             # React hooks
│       ├── types/             # Types TypeScript
│       ├── utils/             # Utilitaires
│       └── store/             # Zustand stores
│
├── lib/                       # Lib partagée (server, types globaux)
├── components/                # Composants racine (features, ui)
│
├── scripts/                   # Scripts utilitaires
│   ├── generate-module.js     # Générateur modules
│   └── ...
│
├── __tests__/                 # Tests unitaires
├── e2e/                       # Tests E2E Playwright
│
└── public/                    # Assets statiques
```

## 🛠️ Stack technique

### Frontend

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript 5.3
- **UI Library** : React 19
- **Styling** : Tailwind CSS 3.4
- **Components** : shadcn/ui
- **State** : Zustand + React Query
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts
- **Calendar** : react-big-calendar
- **Maps** : Leaflet

### Backend

- **API** : Next.js API Routes
- **Database** : PostgreSQL 14
- **ORM** : Prisma 5
- **Auth** : NextAuth.js
- **Storage** : AWS S3 / Azure Blob
- **Cache** : Redis (optionnel)

### DevOps

- **Hosting** : Vercel / AWS EC2
- **CI/CD** : GitHub Actions
- **Monitoring** : Sentry + Logtail
- **Tests** : Jest + Playwright
- **Linting** : ESLint + Prettier

## 📖 Documentation

- [Architecture détaillée](./docs/ARCHITECTURE.md)
- [Guide développeur](./docs/DEVELOPER_GUIDE.md)
- [Guide utilisateur](./docs/USER_GUIDE.md)
- [Liste des API](./docs/API_LIST_EXHAUSTIVE.md)
- [Guide déploiement](./docs/deployment/GUIDE_DEPLOIEMENT_BMO.md)
- [Intégration Outlook-like](./docs/bmo/OUTLOOK_LIKE_INTEGRATION.md)
- [Roadmap](./docs/ROADMAP.md)
- [Checklist Migration](./docs/MIGRATION_CHECKLIST.md)
- [Éléments manquants / à compléter](./docs/MANQUANTS.md)
- [Composants et fonctionnalités manquants](./docs/COMPOSANTS_ET_FONCTIONNALITES_MANQUANTS.md)

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests unitaires en watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E UI
npm run test:e2e:ui
```

## 📦 Build & Deploy

```bash
# Type check (si script ajouté : npm run type-check)
npx tsc --noEmit

# Lint
npm run lint

# Build production
npm run build

# Start production
npm run start

# Deploy : configurer selon hébergeur (Vercel, AWS, etc.)
```

## 🔧 Scripts utilitaires

```bash
# Générer nouveau module
npm run generate:module

# Migration modules (wizard interactif)
npm run migration:wizard

# Audit de sécurité
npm audit

# Format code (si Prettier configuré)
npx prettier --write .
```

## 🌍 Internationalisation

Actuellement en français (fr-FR). Support multi-langues prévu (ar-MA, en-GB).

## 📊 Performance

- **Lighthouse Score** : 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint** : < 1.5s
- **Time to Interactive** : < 3s
- **Total Bundle Size** : < 500KB (gzipped)

## 🔐 Sécurité

- HTTPS obligatoire en production
- Authentification JWT
- CORS configuré
- Rate limiting API
- Sanitization inputs
- CSP headers
- XSS protection

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md)

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Changelog

Voir [CHANGELOG.md](./CHANGELOG.md)

## 📄 License

MIT License - voir [LICENSE](./LICENSE)

## 👥 Équipe

**YESSALATE BTP / NICE RÉNOVATION SAS**

- Moussa - Lead Developer & Product Owner
- Cheikh MBACKÉ - CTO
- Abdoulaye MBAYE - Technical Advisor

## 📞 Support

- Email : support@yessalate.sn
- Documentation : https://docs.bmo.yessalate.sn
- Issues : https://github.com/yessalate/bmo/issues

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

---

**Fait avec ❤️ au Sénégal 🇸🇳**
