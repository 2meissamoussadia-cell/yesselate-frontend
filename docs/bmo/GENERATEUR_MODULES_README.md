# 📖 Documentation Générateur de Modules BMO

## Vue d'ensemble

Le générateur de modules est un outil CLI qui crée automatiquement la structure de base d'un nouveau module BMO, en suivant l'architecture Outlook-like (layout 3 colonnes).

## Installation

```bash
npm install
```

## Utilisation

### Commande de base

```bash
npm run generate:module
```

### Mode interactif

Le générateur pose les questions suivantes :

1. **ID du module** (kebab-case)
   - Format : `mes-demandes`, `validation-bc`, `suivi-chantiers`
   - Utilisé pour les noms de fichiers et routes

2. **Nom du module** (singulier)
   - Ex : "demande", "validation BC", "suivi chantier"
   - Utilisé dans l'interface utilisateur

### Mode non-interactif

```bash
node scripts/generate-module.js --id=maintenance --name="maintenance"
```

## Fichiers générés

### Structure actuelle (scripts/generate-module.js)

```
app/(portals)/maitre-ouvrage/[module-id]/
└── outlook/
    ├── page.tsx              ✅ Page Outlook-like avec BmoModulePage
    ├── loading.tsx           ✅ Skeleton de chargement
    └── error.tsx             ✅ Error boundary

src/
├── lib/
│   ├── types/
│   │   └── [module-id].types.ts     ✅ Types TypeScript de base
│   │
│   ├── config/
│   │   └── modules/
│   │       └── [module-id].config.ts ✅ Configuration ModuleConfig
│   │
│   └── api/
│       └── [module-id].ts           ✅ Client API basique
│
├── hooks/
│   └── [module-id]/
│       └── use[Module]s.ts          ✅ Hooks React Query
│
└── components/
    └── bmo/
        └── [module-id]/
            ├── [Module]ListRow.tsx      ⚠️ Template vide
            ├── [Module]DetailPanel.tsx  ⚠️ Template vide
            └── Create[Module]Dialog.tsx ⚠️ Template vide
```

### Légende

- ✅ Fichier complet et fonctionnel
- ⚠️ Template vide à implémenter

### Fichiers à créer manuellement

- `__tests__/modules/[module-id]/` — Tests unitaires
- `e2e/[module-id]/workflow.spec.ts` — Tests E2E

## Personnalisation après génération

### 1. Configuration (priorité haute)

Éditez `src/lib/config/modules/[module-id].config.ts` :

```typescript
export const demandesModuleConfig: ModuleConfig = {
  id: 'demandes',
  name: 'Demandes',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'MES DOSSIERS',
        items: [
          { id: 'toutes', label: 'Toutes', icon: 'Inbox', badge: 0 },
          { id: 'en-attente', label: 'En attente', icon: 'Clock', badge: 5 },
          // ➕ Ajouter vos items spécifiques
        ],
      },
    ],
  },

  quickActions: {
    primary: {
      label: 'Nouvelle demande',
      icon: 'Plus',
      dropdown: [
        { id: 'travaux', label: 'Demande travaux', icon: 'Hammer' },
        // ✏️ Personnaliser les options
      ],
    },
    secondary: [
      { id: 'valider', label: 'Valider', icon: 'Check', disabledWithoutSelection: true },
      // ➕ Ajouter actions secondaires
    ],
  },

  filterBar: {
    views: [
      { id: 'en-attente', label: 'En attente', badge: 0, color: 'orange' },
      { id: 'toutes', label: 'Toutes', badge: 0 },
    ],
    quickFilters: [
      { id: 'urgentes', icon: 'AlertCircle', label: 'Urgentes' },
    ],
    sort: [
      { id: 'date', label: 'Date création', icon: 'Calendar' },
      { id: 'deadline', label: 'Date limite', icon: 'Clock' },
    ],
  },
};
```

### 2. Types (priorité haute)

Éditez `src/lib/types/[module-id].types.ts` :

```typescript
export type TypeDemande = 'travaux' | 'budget' | 'fourniture' | 'personnel' | 'modification';
export type StatutDemande = 'brouillon' | 'soumise' | 'en-validation' | 'approuvee' | 'rejetee';

export interface Demande {
  id: string;
  numero: string;
  titre: string;
  description: string;
  type: TypeDemande;
  statut: StatutDemande;
  priorite: PrioriteDemande;
  // ➕ Ajouter vos champs spécifiques
}

export interface DemandeFilters {
  types?: TypeDemande[];
  statuts?: StatutDemande[];
  // ➕ Filtres spécifiques
}
```

### 3. Composants (priorité moyenne)

#### ListRow

```typescript
// src/components/bmo/[module-id]/[Module]ListRow.tsx

export function DemandeListRow({ item, selected, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item.id)}
      className={cn('px-4 py-3', selected && 'bg-sky-50')}
    >
      <div className="font-medium">{item.titre}</div>
      <Badge>{item.statut}</Badge>
    </div>
  );
}
```

#### DetailPanel

```typescript
// src/components/bmo/[module-id]/[Module]DetailPanel.tsx

export function DemandeDetailPanel({ item }) {
  return (
    <div className="p-6">
      <h2>{item.titre}</h2>
      <p>{item.description}</p>
      {/* Sections métadonnées, commentaires, historique */}
    </div>
  );
}
```

#### Dialog de création

```typescript
// src/components/bmo/[module-id]/Create[Module]Dialog.tsx

export function CreateDemandeDialog({ open, onOpenChange }) {
  const mutation = useCreateDemande();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={...}>
        {/* Champs du formulaire */}
      </form>
    </Dialog>
  );
}
```

### 4. Tests (priorité basse)

```typescript
// __tests__/modules/[module-id]/[Module]Page.test.tsx

describe('[Module]Page', () => {
  it('renders correctly', () => {
    render(<ModulePage />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
});
```

```typescript
// e2e/[module-id]/workflow.spec.ts

test('complete workflow', async ({ page }) => {
  await page.goto('/maitre-ouvrage/[module-id]/outlook');
  // ...
});
```

## Checklist post-génération

### Phase 1 : Configuration (jour 1)

- [ ] Éditer `[module-id].config.ts`
  - [ ] Sections sidebar
  - [ ] Actions rapides (primary + secondary)
  - [ ] Filtres et vues
  - [ ] Options de tri

- [ ] Éditer `[module-id].types.ts`
  - [ ] Interface principale
  - [ ] Filtres
  - [ ] Champs de tri

### Phase 2 : Composants (jours 2–3)

- [ ] Implémenter `[Module]ListRow.tsx`
- [ ] Implémenter `[Module]DetailPanel.tsx`
- [ ] Implémenter `Create[Module]Dialog.tsx`

### Phase 3 : API & Hooks (jour 4)

- [ ] Adapter `[module-id].ts` (client API)
- [ ] Créer `use[Module]s.ts` et mutations

### Phase 4 : Tests (jour 5)

- [ ] Tests unitaires
- [ ] Tests E2E

## Catégories et layouts

### Catégories suggérées

- **pilotage** : alertes, demandes, gouvernance
- **execution** : chantiers, planning, qualité
- **support** : achats, foncier, documents
- **communication** : messages, conférences

### Layouts (ModuleConfig)

- `triple-pane` : layout 3 colonnes Outlook-like (par défaut)
- `dashboard` : tableau de bord avec widgets
- `calendar` : calendrier
- `kanban` : kanban/tableau

## Exemples

### Module simple

```bash
npm run generate:module

# Réponses:
ID: maintenance
Nom singulier: maintenance
```

### Module avec nom composé

```bash
npm run generate:module

# Réponses:
ID: validation-bc
Nom singulier: validation BC
```

## Dépannage

### Erreur : "ID invalide"

L'ID doit être en kebab-case : lettres minuscules, chiffres, tirets uniquement.

### Module déjà existant

Supprimer les fichiers existants avant de régénérer :

```bash
# Exemple pour le module "demandes"
rm -rf app/\(portals\)/maitre-ouvrage/demandes
rm -f src/lib/types/demandes.types.ts
rm -f src/lib/config/modules/demandes.config.ts
rm -f src/lib/api/demandes.ts
rm -rf src/components/bmo/demandes
```

### Route non trouvée

La page générée est accessible à :

```
/maitre-ouvrage/[module-id]/outlook
```

### Vérifier la configuration TypeScript

```bash
npm run type-check
```

## Bonnes pratiques

1. **Toujours partir du générateur** — Ne pas créer les fichiers manuellement
2. **Convention de nommage** — IDs en kebab-case, types en PascalCase
3. **Réutiliser les composants génériques** — `ItemList`, `FilterBar`, `QuickActionsBar`, `ModuleSubSidebar`
4. **Documenter les personnalisations** — Commentaires et README du module

## Composants génériques réutilisables

| Composant              | Usage                        |
|------------------------|------------------------------|
| `BmoModulePage`        | Page complète Outlook-like   |
| `OutlookLikeLayout`    | Layout 3 colonnes            |
| `ModuleSubSidebar`     | Navigation secondaire        |
| `ItemList`             | Liste d’éléments             |
| `QuickActionsBar`      | Barre d’actions              |
| `FilterBar`            | Filtres et tri               |

## Références

- Module pilote : **Centre d’alertes** (`app/(portals)/maitre-ouvrage/alerts/page.tsx`)
- Types `ModuleConfig` : `src/lib/types/module.types.ts`
- Documentation Outlook-like : `docs/bmo/OUTLOOK_LIKE_INTEGRATION.md`

---

**Évolutions prévues du générateur :**

- [ ] Questions étendues (catégorie, layout, options)
- [ ] Templates de composants avancés
- [ ] Support layouts spéciaux (calendar, kanban)
