# Module de Télémétrie - Phase P14

## 📋 Vue d'ensemble

Module léger et performant pour tracker les événements utilisateur dans le dashboard avec batching automatique.

## 🗂️ Structure

```
lib/telemetry/
├── schema.ts          # Schémas Zod pour validation
├── client.ts          # Client avec queue et batching
└── index.ts           # Exports centralisés

src/modules/dashboard/telemetry/
├── useTrack.ts        # Hooks React pour tracking
└── index.ts           # Exports centralisés
```

## 🚀 Utilisation

### 1. Tracking automatique des vues

```tsx
import { useTrackView } from '@/src/modules/dashboard/telemetry';

function DashboardPage() {
  // Track automatiquement l'ouverture de la vue
  useTrackView('overview::summary::dashboard');
  
  return <div>...</div>;
}
```

### 2. Tracking des actions utilisateur

```tsx
import { useTrackAction } from '@/src/modules/dashboard/telemetry';

function ExportButton() {
  const trackAction = useTrackAction();
  
  const handleExport = () => {
    trackAction('export_triggered', { 
      format: 'xlsx', 
      routeKey: 'overview::summary::dashboard' 
    });
    // ... logique d'export
  };
  
  return <button onClick={handleExport}>Exporter</button>;
}
```

### 3. Tracking des clics KPI

```tsx
import { useTrackKPIClick } from '@/src/modules/dashboard/telemetry';

function KPIComponent({ kpiId, routeKey }) {
  const trackKPIClick = useTrackKPIClick();
  
  const handleClick = () => {
    trackKPIClick(kpiId, routeKey);
    // ... logique du clic
  };
  
  return <div onClick={handleClick}>KPI</div>;
}
```

### 4. Tracking manuel (sans hooks)

```tsx
import { track } from '@/lib/telemetry';

// Tracking simple
track({ 
  event: 'filter_applied', 
  routeKey: 'overview::summary::dashboard',
  props: { filterType: 'date', value: '2026-01' }
});
```

### 5. Tracking des erreurs

```tsx
import { useTrackError } from '@/src/modules/dashboard/telemetry';

function MyComponent() {
  const trackError = useTrackError();
  
  useEffect(() => {
    try {
      // ... logique
    } catch (error) {
      trackError(error, 'overview::summary::dashboard');
    }
  }, []);
}
```

## ⚙️ Configuration

### Batching automatique

- **Délai** : 1200ms (1.2s) par défaut
- **Taille max batch** : 100 événements
- **Taille max queue** : 500 événements (sécurité)

### Envoi avant fermeture

Le client utilise automatiquement :
- `navigator.sendBeacon()` pour l'envoi final avant fermeture
- `visibilitychange` pour envoyer quand la page passe en arrière-plan

## 📊 Types d'événements

- `view_opened` : Ouverture d'une vue/page
- `kpi_click` : Clic sur un KPI
- `export_triggered` : Déclenchement d'un export
- `filter_applied` : Application d'un filtre
- `error` : Erreur rencontrée
- `perf` : Événement de performance

## 🔧 API

### `track(item: Item)`

Ajoute un événement à la queue.

```tsx
track({ 
  event: 'view_opened', 
  routeKey: 'overview::summary::dashboard',
  props: { custom: 'data' }
});
```

### `flush()`

Force l'envoi immédiat des événements en attente.

```tsx
import { flush } from '@/lib/telemetry';

await flush(); // Envoie immédiatement
```

### `flushImmediate()`

Alias de `flush()` pour la clarté.

### `clearQueue()`

Vide la queue sans envoyer (utile pour les tests).

### `getQueueSize()`

Retourne le nombre d'événements en attente.

## 🧪 Tests

```tsx
import { track, clearQueue, getQueueSize } from '@/lib/telemetry';

// Nettoyer avant le test
clearQueue();

// Tracker un événement
track({ event: 'test', routeKey: 'test::route' });

// Vérifier la queue
expect(getQueueSize()).toBe(1);
```

## 📝 Notes

- **Best effort** : Les erreurs d'envoi sont silencieusement ignorées
- **Non-bloquant** : Le tracking ne bloque jamais l'application
- **Léger** : Impact minimal sur les performances
- **Batching** : Réduit le nombre de requêtes réseau

---

**Dernière mise à jour** : 2026-01-26
