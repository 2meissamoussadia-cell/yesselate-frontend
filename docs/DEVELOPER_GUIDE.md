# 👨‍💻 Guide Développeur BMO

## Démarrage

### Installation environnement

```bash
# Prerequisites
node -v  # >= 18.0.0
npm -v   # >= 9.0.0
psql --version  # >= 14

# Clone & install
git clone https://github.com/yessalate/bmo.git
cd bmo
npm install

# Setup database
createdb bmo_dev
npm run db:migrate
npm run db:seed

# Start dev server
npm run dev
```

Le serveur de développement écoute par défaut sur **http://localhost:4001**.

### Structure recommandée VSCode

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"]
  ]
}
```

### Extensions VSCode recommandées

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Error Translator
- Error Lens
- GitLens

## Conventions de code

### Naming

```typescript
// Files: kebab-case
alerts-page.tsx
use-alertes.ts
alerts.types.ts

// Components: PascalCase
function AlertListRow() {}
export default AlertsPage;

// Functions/Variables: camelCase
const fetchAlertes = () => {};
const selectedId = 123;

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api...';
const MAX_RETRY = 3;

// Types/Interfaces: PascalCase
interface AlerteBTP {}
type StatutAlerte = 'open' | 'closed';
```

### Imports

```typescript
// Order: React → Next → External → Internal → Relative
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAlertes } from '../hooks/useAlertes';
```

### TypeScript

```typescript
// Toujours typer explicitement les props
interface AlertListRowProps {
  alerte: AlerteBTP;
  selected: boolean;
  onClick: () => void;
}

// Éviter 'any'
const data: AlerteBTP[] = []; // ✅
const data: any = []; // ❌

// Utiliser types génériques
function formatData<T>(data: T[]): T[] {
  return data;
}

// Return types explicites pour fonctions complexes
function processAlerte(id: string): Promise<AlerteBTP> {
  // ...
}
```

### React

```typescript
// Functional components
export function MyComponent({ prop }: Props) {
  // Hooks en premier
  const [state, setState] = useState();
  const data = useQuery();

  // Handlers ensuite
  const handleClick = () => {};

  // Render
  return <div>{/* ... */}</div>;
}

// Memo pour optimisation
export const ExpensiveComponent = memo(function ExpensiveComponent() {
  // ...
});

// Custom hooks préfixés 'use'
export function useMyHook() {
  // ...
}
```

### CSS/Tailwind

```typescript
import { cn } from '@/lib/utils';

// Utiliser cn() pour classes conditionnelles
<div className={cn('base-class', isActive && 'active-class')} />

// Éviter inline styles sauf dynamique
<div className="w-full h-10" /> // ✅
// ❌ Utiliser Tailwind plutôt que style={{ }}

// Grouper classes logiquement
<div
  className={cn(
    // Layout
    'flex items-center gap-2',
    // Sizing
    'w-full h-10',
    // Colors
    'bg-white text-gray-900',
    // States
    'hover:bg-gray-50 active:bg-gray-100'
  )}
/>
```

## Créer un nouveau module

### Méthode 1 : Générateur (recommandé)

```bash
npm run generate:module

# Répondre aux questions interactives
# ID: mon-module
# Nom singulier: ma ressource
# Nom pluriel: mes ressources
# Catégorie: execution
# Layout: triple-pane
# ...
```

### Méthode 2 : Manuel

```bash
# 1. Créer structure (chemins alignés avec le projet BMO)
mkdir -p app/\(portals\)/maitre-ouvrage/mon-module
mkdir -p src/components/bmo/mon-module
mkdir -p src/lib/types src/lib/config/modules src/lib/api src/lib/hooks/mon-module

# 2. Créer fichiers
touch app/\(portals\)/maitre-ouvrage/mon-module/page.tsx
touch src/components/bmo/mon-module/MonModuleListRow.tsx
touch src/lib/types/mon-module.types.ts
touch src/lib/config/modules/mon-module.config.ts
touch src/lib/api/mon-module.ts
touch src/lib/hooks/mon-module/useMonModules.ts

# 3. Implémenter selon les templates (voir docs/bmo, docs/ARCHITECTURE.md)
```

## Tests

### Tests unitaires (Jest)

BMO utilise **Jest** pour les tests unitaires (voir `jest.config.js`, `jest.setup.js`).

```typescript
// __tests__/components/MyComponent.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<MyComponent onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Tests E2E (Playwright)

```typescript
// e2e/my-feature.spec.ts

import { test, expect } from '@playwright/test';

test('complete workflow', async ({ page }) => {
  await page.goto('/maitre-ouvrage/mon-module');

  // Actions
  await page.click('button:has-text("Créer")');
  await page.fill('[name="titre"]', 'Test');
  await page.click('button[type="submit"]');

  // Assertions
  await expect(page.getByText('Créé avec succès')).toBeVisible();
});
```

```bash
npm run test:e2e
npm run test:e2e:ui
```

### Coverage

```bash
npm run test:coverage

# Objectifs (définis dans jest.config.js) :
# - Statements: >= 70%
# - Branches: >= 70%
# - Functions: >= 70%
# - Lines: >= 70%
```

## Debugging

### Server-side

```typescript
// app/api/route.ts

export async function POST(request: Request) {
  console.log('📥 Request:', await request.json());

  try {
    const result = await doSomething();
    console.log('✅ Success:', result);
    return Response.json(result);
  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
```

### Client-side

```typescript
// React DevTools
// - Components tree
// - Props inspection
// - Hooks state

// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />

// Zustand DevTools
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools((set) => ({ /* ... */ }))
);
```

### Network

```bash
# Chrome DevTools
# Network tab → Filter → Fetch/XHR

# Voir payload
# Preview / Response tabs

# Throttling
# Network conditions → Slow 3G
```

## Git Workflow

### Branches

```bash
# main: Production
# develop: Development
# feature/*: Nouvelles fonctionnalités
# fix/*: Corrections bugs
# hotfix/*: Corrections urgentes production

# Créer feature branch
git checkout -b feature/ma-fonctionnalite develop
```

### Commits

```bash
# Format: <type>(<scope>): <description>

# Types:
# feat: Nouvelle fonctionnalité
# fix: Correction bug
# docs: Documentation
# style: Formatting
# refactor: Refactoring
# test: Tests
# chore: Maintenance

# Exemples:
git commit -m "feat(alerts): add filter by status"
git commit -m "fix(planning): correct date calculation"
git commit -m "docs(api): update endpoint documentation"
```

### Pull Requests

```markdown
## Description
Brief description of changes

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors
- [ ] Accessibility checked
- [ ] Performance verified

## Screenshots
(if applicable)
```

## Performance

### Métriques à surveiller

```bash
# Lighthouse CI
npm run lighthouse

# Bundle analysis
npm run analyze

# Objectifs:
# - FCP: < 1.5s
# - LCP: < 2.5s
# - TTI: < 3.5s
# - CLS: < 0.1
```

### Optimisations communes

```typescript
// 1. Dynamic imports
import dynamic from 'next/dynamic';
const Heavy = dynamic(() => import('./Heavy'), {
  loading: () => <Loading />,
});

// 2. Image optimization
import Image from 'next/image';
<Image src="/img.png" alt="..." width={400} height={300} />

// 3. Virtualisation (listes longues)
// @tanstack/react-virtual ou react-window

// 4. Debouncing
const debouncedSearch = useDebouncedValue(searchQuery, 300);

// 5. Memoization
const expensiveValue = useMemo(
  () => computeExpensive(data),
  [data]
);
```

## Dépannage courant

### "Cannot find module"

```bash
# Vérifier imports paths
# tsconfig.json → paths
npm run type-check
```

### "Hydration failed"

```typescript
// Éviter mismatches server/client
// Utiliser useEffect pour client-only code
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

### "Module not found: Can't resolve"

```bash
# Clear cache
rm -rf .next
npm run build
```

### Performance lente

```bash
# Profiler React
# React DevTools → Profiler tab

# Identifier re-renders inutiles
# Utiliser React.memo, useMemo, useCallback
```

## Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Playwright Docs](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Architecture BMO](./ARCHITECTURE.md)
- [Intégration Outlook-like](./bmo/OUTLOOK_LIKE_INTEGRATION.md)
