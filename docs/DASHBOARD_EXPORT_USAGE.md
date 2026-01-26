# Dashboard Export - Guide d'utilisation

## Phase P9: Export & Scellement/Signature

Ce guide explique comment utiliser la fonctionnalité d'export du dashboard dans vos pages.

## Architecture

L'export utilise la même source de données que l'API dashboard (`/api/dashboard/:main/:sub/:leaf`) via le service `DashboardReadService`, garantissant :
- ✅ **Aucune rupture UX** : mêmes read-models, mêmes droits ABAC
- ✅ **Sécurité** : protection CSV injection, hash SHA-256 pour vérification
- ✅ **Évolutif** : facilement remplaçable par une lib dédiée (exceljs, pdf-lib) si besoin

## Utilisation automatique (recommandé)

### Option 1 : Utiliser `DashboardKPIBarWithExport`

Le composant `DashboardKPIBarWithExport` intègre automatiquement l'export via le hook `useDashboardExport` :

```tsx
import { DashboardKPIBarWithExport } from '@/modules/dashboard/components/DashboardKPIBarWithExport';

export function MyDashboardPage() {
  return (
    <div>
      <DashboardKPIBarWithExport 
        kpis={myKPIs}
        onKPIClick={handleKPIClick}
        // onExport est automatiquement connecté
      />
      {/* ... reste du contenu ... */}
    </div>
  );
}
```

**Avantages** :
- ✅ Export automatiquement connecté
- ✅ Lit la navigation actuelle depuis le store
- ✅ Aucune configuration supplémentaire

## Utilisation manuelle

### Option 2 : Utiliser le hook `useDashboardExport` directement

Si vous utilisez `DashboardKPIBar` directement, vous pouvez brancher l'export manuellement :

```tsx
'use client';

import { DashboardKPIBar } from '@/modules/dashboard/components/DashboardKPIBar';
import { useDashboardExport } from '@/modules/dashboard/hooks/useDashboardExport';

export function MyDashboardPage() {
  const { exportData } = useDashboardExport();

  return (
    <div>
      <DashboardKPIBar 
        kpis={myKPIs}
        onExport={exportData} // Brancher le hook
        onKPIClick={handleKPIClick}
      />
      {/* ... reste du contenu ... */}
    </div>
  );
}
```

### Option 2bis : Export manuel avec contrôle total

Si vous voulez un contrôle total sur les paramètres d'export (route, nom de fichier), vous pouvez définir votre propre callback :

```tsx
'use client';

import { DashboardKPIBar } from '@/modules/dashboard/components/DashboardKPIBar';

export default function CommandCenterPage() {
  const onExport = async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    const params = new URLSearchParams({
      main: 'overview',
      sub: 'summary',
      leaf: 'dashboard',
      format,
      filename: 'synthese_dashboard'
    });
    
    const res = await fetch(`/api/export/dashboard?${params.toString()}`, {
      headers: {
        'x-tenant-id': 'default', // TODO: récupérer depuis le contexte auth
        'x-user-id': 'anonymous', // TODO: récupérer depuis le contexte auth
      },
    });
    
    if (!res.ok) throw new Error('Export failed');
    
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Lire le nom depuis le header si présent
    const cd = res.headers.get('Content-Disposition') ?? '';
    const match = /filename="([^"]+)"/.exec(cd);
    a.download = match?.[1] ?? `export.${format === 'excel' ? 'xls' : format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <DashboardKPIBar onExport={onExport} />
      {/* ... reste du contenu */}
    </div>
  );
}
```

**Avantages de cette approche** :
- ✅ Contrôle total sur les paramètres (main, sub, leaf, filename)
- ✅ Possibilité de personnaliser les headers (auth, tenant, etc.)
- ✅ Gestion d'erreur personnalisée

### Option 3 : Export personnalisé depuis n'importe quel composant

Vous pouvez utiliser le hook `useDashboardExport` dans n'importe quel composant pour déclencher un export :

```tsx
'use client';

import { useDashboardExport } from '@/modules/dashboard/hooks/useDashboardExport';
import { Button } from '@/components/ui/button';

export function CustomExportButton() {
  const { exportData } = useDashboardExport();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      await exportData(format);
      // Le fichier se télécharge automatiquement
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleExport('csv')} disabled={isExporting}>
        {isExporting ? 'Export...' : 'Export CSV'}
      </Button>
      <Button onClick={() => handleExport('json')} disabled={isExporting}>
        Export JSON
      </Button>
      <Button onClick={() => handleExport('excel')} disabled={isExporting}>
        Export Excel
      </Button>
      <Button onClick={() => handleExport('pdf')} disabled={isExporting}>
        Export PDF
      </Button>
    </div>
  );
}
```

## Formats disponibles

- **CSV** : Format texte avec protection contre l'injection CSV
- **JSON** : Format JSON indenté
- **Excel** : CSV compatible Excel (peut être remplacé par exceljs pour un vrai format XLSX)
- **PDF** : JSON formaté en texte (peut être remplacé par pdf-lib ou puppeteer pour un rendu riche)

## Sécurité

### Protection CSV Injection

Les exports CSV sont automatiquement protégés contre l'injection :
- Les cellules commençant par `=`, `+`, `-`, `@` sont préfixées par `'`
- Les guillemets sont échappés (`"` → `""`)

### Hash de vérification

Chaque export inclut un hash SHA-256 dans le header `X-Content-Hash` pour vérifier l'intégrité du fichier :

```typescript
const hash = response.headers.get('X-Content-Hash');
// Format: "sha256:abc123..."
```

## API Backend

L'endpoint `/api/export/dashboard` accepte les paramètres suivants :

```
GET /api/export/dashboard?main=overview&sub=kpis&leaf=projets&format=csv&filename=custom-name
```

- `main` : Catégorie principale (overview, performance, actions, risks, decisions, realtime)
- `sub` : Sous-catégorie (optionnel)
- `leaf` : Feuille (optionnel)
- `format` : Format d'export (csv, json, excel, pdf)
- `filename` : Nom de fichier personnalisé (optionnel, sera sanitized)

## Exemple complet

```tsx
'use client';

import { DashboardKPIBarWithExport } from '@/modules/dashboard/components/DashboardKPIBarWithExport';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

export function DashboardPage() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  
  // Les KPIs sont chargés automatiquement via le registry
  // L'export utilise la navigation actuelle (nav.mainCategory, nav.subCategory, nav.subSubCategory)

  return (
    <div>
      <DashboardKPIBarWithExport />
      {/* Le bouton Export dans la KPI Bar est automatiquement fonctionnel */}
    </div>
  );
}
```

## Migration depuis l'ancien système

Si vous utilisiez `DashboardKPIBar` sans export, remplacez simplement :

```tsx
// Avant
import { DashboardKPIBar } from '@/modules/dashboard/components/DashboardKPIBar';

// Après
import { DashboardKPIBarWithExport } from '@/modules/dashboard/components/DashboardKPIBarWithExport';
```

Tous les autres props restent identiques.
