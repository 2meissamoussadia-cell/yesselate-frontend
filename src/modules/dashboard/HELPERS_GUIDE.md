# Guide des Helpers KPI - Dashboard

## 📍 Sources de vérité

### 1. Helpers généraux : `@lib-root/dashboard/kpi`

**Emplacement** : `lib/dashboard/kpi.ts`

**Utilisation** : Pour tous les helpers généraux de formatage, parsing et conversion de couleurs.

**Fonctions disponibles** :

```typescript
// Parsing
parseTrendPercent(s: string | number | undefined): number

// Conversion couleurs/tonalités
toneToColor(t: Tone): 'emerald' | 'amber' | 'rose' | 'blue'
colorToTone(color: string): Tone
normalizeKPIColor(color: string): KpiStatCardTone

// Formatage
formatCurrency(value: number | null | undefined, currency: 'XOF' | 'EUR'): string
formatMoneyCompact(amount: number | null | undefined, currency: string): string
formatKPIPercentage(value: number | null | undefined, asDecimal: boolean): string
formatKPIValue(value: number | null | undefined, unit?: string, decimals: number): string
```

**Exemple d'utilisation** :
```typescript
import { 
  parseTrendPercent, 
  formatCurrency, 
  normalizeKPIColor,
  formatMoneyCompact 
} from '@lib-root/dashboard/kpi';

// Parsing de tendance
const trend = parseTrendPercent('+12%'); // => 12

// Formatage monétaire
const amount = formatCurrency(1000000, 'XOF'); // => "1 000 000 FCFA"
const compact = formatMoneyCompact(1500000, 'FCFA'); // => "1.5M FCFA"

// Normalisation couleur
const color = normalizeKPIColor('red'); // => 'rose'
```

### 2. Helpers spécifiques dashboard : `src/modules/dashboard/utils/kpi.ts`

**Emplacement** : `src/modules/dashboard/utils/kpi.ts`

**Utilisation** : Pour les helpers spécifiques au domaine métier BTP (calculs, transformations).

**Fonctions disponibles** :

```typescript
// Formatage (wrappers)
formatKPICurrency(amount: number, currency: 'XOF' | 'EUR' | 'FCFA'): string

// Calculs métier BTP
calculateAvancementMoyen(projets: Array<{ avancement: number }>): number
calculateBudgetConsomme(consomme: number, alloue: number): number
calculateResteAEngager(alloue: number, consomme: number, engage: number): number
calculateMargePrevisionnelle(budget: number, coutPrevu: number): number
calculateDSO(creances: number, chiffreAffaires: number, periode: number): number
```

**Exemple d'utilisation** :
```typescript
import { 
  calculateAvancementMoyen,
  calculateBudgetConsomme,
  formatKPICurrency 
} from '../../utils/kpi';

const avancement = calculateAvancementMoyen(projets);
const budgetPct = calculateBudgetConsomme(consomme, alloue);
const formatted = formatKPICurrency(amount, 'XOF');
```

### 3. Helpers de mapping : `src/modules/dashboard/utils/colorMapping.ts`

**Emplacement** : `src/modules/dashboard/utils/colorMapping.ts`

**Utilisation** : Pour les conversions spécifiques au dashboard (couleur → ton KpiStatCard).

**Fonctions disponibles** :

```typescript
mapColorToTone(color?: KPICardColor): KpiStatCardTone
mapToneToColor(tone?: KPITone): KpiStatCardTone
getTrendDirection(value: number): TrendDirection
formatMoneyXOF(amount: number | null | undefined): string
formatMoneyEUR(amount: number | null | undefined): string
formatMoneyCompact(amount: number | null | undefined, currency: string): string
```

**Note** : `formatMoneyXOF`, `formatMoneyEUR`, `formatMoneyCompact` sont conservés pour compatibilité ascendante, mais il est recommandé d'utiliser `formatCurrency` et `formatMoneyCompact` depuis `@lib-root/dashboard/kpi`.

## 🎯 Règles d'utilisation

### ✅ À faire

1. **Pour les helpers généraux** : Utiliser `@lib-root/dashboard/kpi`
   ```typescript
   import { parseTrendPercent, formatCurrency } from '@lib-root/dashboard/kpi';
   ```

2. **Pour les calculs métier BTP** : Utiliser `utils/kpi.ts`
   ```typescript
   import { calculateAvancementMoyen } from '../../utils/kpi';
   ```

3. **Pour les conversions couleur → ton KpiStatCard** : Utiliser `utils/colorMapping.ts`
   ```typescript
   import { mapColorToTone } from '../../utils/colorMapping';
   ```

### ❌ À éviter

1. **Ne pas créer de helpers locaux** pour le formatage/parsing
   ```typescript
   // ❌ Mauvais
   const formatCurrency = (value: number) => 
     new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
   
   // ✅ Bon
   import { formatCurrency } from '@lib-root/dashboard/kpi';
   ```

2. **Ne pas utiliser de parsers inline** pour les tendances
   ```typescript
   // ❌ Mauvais
   const trend = parseFloat(trendString.replace(/[^\d.-]/g, '')) || 0;
   
   // ✅ Bon
   import { parseTrendPercent } from '@lib-root/dashboard/kpi';
   const trend = parseTrendPercent(trendString);
   ```

3. **Ne pas dupliquer les helpers** dans plusieurs fichiers

## 📊 Migration depuis les anciens helpers

### Depuis `utils/colorMapping.ts`

| Ancien | Nouveau | Emplacement |
|--------|---------|-------------|
| `formatMoneyXOF()` | `formatCurrency(value, 'XOF')` | `@lib-root/dashboard/kpi` |
| `formatMoneyEUR()` | `formatCurrency(value, 'EUR')` | `@lib-root/dashboard/kpi` |
| `formatMoneyCompact()` | `formatMoneyCompact()` | `@lib-root/dashboard/kpi` |
| `parseTrendPercent()` | `parseTrendPercent()` | `@lib-root/dashboard/kpi` |
| `mapToneToColor()` | `toneToColor()` | `@lib-root/dashboard/kpi` |
| `mapColorToTone()` | `mapColorToTone()` | `utils/colorMapping.ts` (gardé) |

### Depuis `utils/kpi.ts`

| Ancien | Nouveau | Emplacement |
|--------|---------|-------------|
| `formatKPICurrency()` | `formatCurrency()` | `@lib-root/dashboard/kpi` |
| `formatKPIPercentage()` | `formatKPIPercentage()` | `@lib-root/dashboard/kpi` |
| `formatKPIValue()` | `formatKPIValue()` | `@lib-root/dashboard/kpi` |

**Note** : Les calculs métier (`calculateAvancementMoyen`, etc.) restent dans `utils/kpi.ts`.

## 🔍 Vérification

Pour vérifier que vous utilisez les bons helpers :

1. **Imports généraux** : Doivent venir de `@lib-root/dashboard/kpi`
2. **Calculs métier** : Doivent venir de `utils/kpi.ts`
3. **Mapping couleur → ton** : Peuvent venir de `utils/colorMapping.ts`

## 📝 Exemples complets

### Exemple 1 : Formatage d'un KPI

```typescript
import { formatCurrency, parseTrendPercent, normalizeKPIColor } from '@lib-root/dashboard/kpi';

const kpi = {
  value: 1000000,
  trend: '+12%',
  color: 'red',
};

// Formatage
const formattedValue = formatCurrency(kpi.value, 'XOF'); // "1 000 000 FCFA"
const trend = parseTrendPercent(kpi.trend); // 12
const normalizedColor = normalizeKPIColor(kpi.color); // 'rose'
```

### Exemple 2 : Calculs métier BTP

```typescript
import { calculateAvancementMoyen, calculateBudgetConsomme } from '../../utils/kpi';
import { formatKPIPercentage } from '@lib-root/dashboard/kpi';

const projets = [
  { avancement: 75 },
  { avancement: 80 },
  { avancement: 65 },
];

const avancementMoyen = calculateAvancementMoyen(projets); // 73.33
const formatted = formatKPIPercentage(avancementMoyen); // "73.3%"
```

### Exemple 3 : Conversion couleur → ton

```typescript
import { mapColorToTone } from '../../utils/colorMapping';
import { normalizeKPIColor } from '@lib-root/dashboard/kpi';

// Pour KpiStatCard (utilise mapColorToTone)
const tone = mapColorToTone('red'); // 'rose'

// Pour KPICardData (utilise normalizeKPIColor)
const color = normalizeKPIColor('red'); // 'rose'
```

---

**Date de mise à jour** : Janvier 2026  
**Statut** : ✅ Phase 0-2 terminées, helpers unifiés
