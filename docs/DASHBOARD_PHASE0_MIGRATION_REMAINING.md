# 🔄 Phase 0 - Migrations Restantes

## 📋 Résumé

Ce document liste les migrations restantes pour compléter la Phase 0. Certains fichiers utilisent encore les anciens helpers depuis `colorMapping.ts` au lieu des nouveaux helpers centralisés de `lib/dashboard/kpi.ts`.

---

## 🔍 Fichiers à Migrer

### 1. DemandesKpiPage.tsx
**Fichier** : `src/modules/dashboard/components/views/DemandesKpiPage.tsx`

**Lignes à modifier** :
- Ligne 33 : `import { mapColorToTone, parseTrendPercent } from '../../utils/colorMapping';`
- Ligne 81 : Parser inline `parseFloat(kpi.trend.replace(/[^\d.-]/g, ''))`
- Ligne 329 : `mapColorToTone(kpi.color)`

**Actions** :
```typescript
// Avant
import { mapColorToTone, parseTrendPercent } from '../../utils/colorMapping';
const trend = typeof kpi.trend === 'string' ? parseFloat(kpi.trend.replace(/[^\d.-]/g, '')) || 0 : 0;
const color = mapColorToTone(kpi.color) as KPICardData['color'];

// Après
import { parseTrendPercent } from '@/lib/dashboard/kpi';
import { mapColorToTone } from '../../utils/colorMapping'; // Garder si nécessaire pour conversion couleur -> ton
const trend = parseTrendPercent(kpi.trend);
const color = mapColorToTone(kpi.color) as KPICardData['color']; // OK si kpi.color est une couleur, pas un ton
```

**Note** : `mapColorToTone` peut être conservé si `kpi.color` est une couleur (ex: 'red', 'amber') et non un ton (ex: 'ok', 'warn'). Vérifier le type de `kpi.color`.

---

### 2. ProjetKpiPage.tsx
**Fichier** : `src/modules/dashboard/components/views/ProjetKpiPage.tsx`

**Lignes à modifier** :
- Ligne 33 : `import { mapColorToTone, parseTrendPercent, formatMoneyXOF } from '../../utils/colorMapping';`
- Ligne 88 : Parser inline `parseFloat(kpi.trend.replace(/[^\d.-]/g, ''))`
- Ligne 461 : `mapColorToTone(kpi.color)`

**Actions** :
```typescript
// Avant
import { mapColorToTone, parseTrendPercent, formatMoneyXOF } from '../../utils/colorMapping';
const trend = typeof kpi.trend === 'string' ? parseFloat(kpi.trend.replace(/[^\d.-]/g, '')) || 0 : 0;
const color = mapColorToTone(kpi.color) as KPICardData['color'];

// Après
import { parseTrendPercent, formatCurrency } from '@/lib/dashboard/kpi';
import { mapColorToTone } from '../../utils/colorMapping'; // Garder si nécessaire
const trend = parseTrendPercent(kpi.trend);
const color = mapColorToTone(kpi.color) as KPICardData['color'];
// Remplacer formatMoneyXOF par formatCurrency(value, 'XOF')
```

---

### 3. ValidationsGlobalPage.tsx
**Fichier** : `src/modules/dashboard/components/views/ValidationsGlobalPage.tsx`

**Lignes à modifier** :
- Ligne 35 : `import { mapColorToTone, parseTrendPercent, formatMoneyCompact } from '../../utils/colorMapping';`
- Ligne 279 : `mapColorToTone(k.color)`

**Actions** :
```typescript
// Avant
import { mapColorToTone, parseTrendPercent, formatMoneyCompact } from '../../utils/colorMapping';
const color = mapColorToTone(k.color) as KPICardData['color'];

// Après
import { parseTrendPercent, formatCurrency } from '@/lib/dashboard/kpi';
import { mapColorToTone } from '../../utils/colorMapping'; // Garder si nécessaire
const color = mapColorToTone(k.color) as KPICardData['color'];
// formatMoneyCompact peut rester dans colorMapping si spécifique, ou migrer vers formatCurrency
```

---

### 4. BudgetKpiPage.tsx
**Fichier** : `src/modules/dashboard/components/views/BudgetKpiPage.tsx`

**Lignes à modifier** :
- Lignes 29-33 : Imports multiples depuis `colorMapping`
- Ligne 287 : `mapColorToTone(kpi.color)`

**Actions** :
```typescript
// Avant
import { 
  mapColorToTone, 
  parseTrendPercent,
  mapToneToColor,
} from '../../utils/colorMapping';

// Après
import { parseTrendPercent, toneToColor } from '@/lib/dashboard/kpi';
import { mapColorToTone } from '../../utils/colorMapping'; // Garder si nécessaire
// Remplacer mapToneToColor par toneToColor
```

---

### 5. SummaryPointsPage.tsx
**Fichier** : `src/modules/dashboard/components/views/SummaryPointsPage.tsx`

**Lignes à modifier** :
- Ligne 16 : `import { mapColorToTone, parseTrendPercent } from '../../utils/colorMapping';`
- Lignes 210, 241 : `mapColorToTone(...)`

**Actions** :
```typescript
// Avant
import { mapColorToTone, parseTrendPercent } from '../../utils/colorMapping';
const color = mapColorToTone(indicator.color) as KPICardData['color'];

// Après
import { parseTrendPercent } from '@/lib/dashboard/kpi';
import { mapColorToTone } from '../../utils/colorMapping'; // Garder si nécessaire
const color = mapColorToTone(indicator.color) as KPICardData['color'];
```

---

### 6. TendancesPage.tsx
**Fichier** : `src/modules/dashboard/components/views/TendancesPage.tsx`

**Lignes à modifier** :
- Ligne 15 : `import { mapColorToTone } from '../../utils/colorMapping';`
- Ligne 191 : `mapColorToTone(indicator.color)`

**Actions** :
```typescript
// Avant
import { mapColorToTone } from '../../utils/colorMapping';
const color = mapColorToTone(indicator.color) as KPICardData['color'];

// Après
import { mapColorToTone } from '../../utils/colorMapping'; // OK si conversion couleur -> ton
// Ou si indicator.color est un ton, utiliser toneToColor depuis @/lib/dashboard/kpi
```

---

### 7. DirecteurTravauxPage.tsx
**Fichier** : `src/modules/dashboard/components/views/DirecteurTravauxPage.tsx`

**Lignes à modifier** :
- Ligne 35 : `import { parseTrendPercent, mapColorToTone } from '../../utils/colorMapping';`
- Lignes 102, 112, 122, 132 : `mapColorToTone('red')`, `mapColorToTone('amber')`, etc.

**Actions** :
```typescript
// Avant
import { parseTrendPercent, mapColorToTone } from '../../utils/colorMapping';
color: mapColorToTone('red'),

// Après
import { parseTrendPercent } from '@/lib/dashboard/kpi';
// Si on passe directement des couleurs ('red', 'amber'), garder mapColorToTone
// Si on veut passer des tons ('ok', 'warn'), utiliser toneToColor
```

---

### 8. HighlightsKpiPage.tsx
**Fichier** : `src/modules/dashboard/components/views/HighlightsKpiPage.tsx`

**Ligne à modifier** :
- Ligne 79 : Parser inline `parseFloat(kpi.trend.replace(/[^\d.-]/g, ''))`

**Actions** :
```typescript
// Avant
trend: typeof kpi.trend === 'string' ? parseFloat(kpi.trend.replace(/[^\d.-]/g, '')) || 0 : 0,

// Après
import { parseTrendPercent } from '@/lib/dashboard/kpi';
trend: parseTrendPercent(kpi.trend),
```

**Note** : Ce fichier a déjà été migré pour `toneToColor`, il reste juste le parser inline.

---

## ⚠️ Distinction Importante

### `mapColorToTone` vs `toneToColor`

- **`mapColorToTone(color: KPICardColor)`** : Convertit une **couleur** (ex: 'red', 'amber', 'emerald') → **ton** (ex: 'rose', 'amber', 'emerald')
  - Utilisé quand on a une couleur et qu'on veut un ton
  - Peut rester dans `colorMapping.ts` si nécessaire

- **`toneToColor(tone: Tone)`** : Convertit un **ton** (ex: 'ok', 'warn', 'crit') → **couleur** (ex: 'emerald', 'amber', 'rose')
  - Utilisé quand on a un ton et qu'on veut une couleur
  - Disponible dans `lib/dashboard/kpi.ts`

**Recommandation** :
- Si le code utilise des **couleurs** (`'red'`, `'amber'`, etc.) → garder `mapColorToTone` depuis `colorMapping.ts`
- Si le code utilise des **tons** (`'ok'`, `'warn'`, `'crit'`) → utiliser `toneToColor` depuis `@/lib/dashboard/kpi`

---

## ✅ Checklist Migration

### Parsers de Tendance
- [x] HighlightsKpiPage.tsx - `parseTrendPercent` utilisé
- [x] DashboardKPIBar.tsx - `parseTrendPercent` utilisé
- [x] DemandesKpiPage.tsx - `parseTrendPercent` utilisé
- [x] ProjetKpiPage.tsx - `parseTrendPercent` utilisé
- [x] HighlightsKpiPage.tsx - Parser inline dans `handleKPIClick` remplacé
- [x] SummaryPointsPage.tsx - `parseTrendPercent` utilisé
- [x] DirecteurTravauxPage.tsx - `parseTrendPercent` utilisé
- [x] KPILine.tsx - `parseTrendPercent` utilisé

### Mapping Ton → Couleur
- [x] HighlightsKpiPage.tsx - `toneToColor` utilisé
- [x] DashboardKPIBar.tsx - `toneToColor` utilisé
- [x] BudgetKpiPage.tsx - `toneToColor` et `normalizeKPIColor` utilisés
- [x] KPILine.tsx - `toneToColor` utilisé

### Formatage Monétaire
- [x] ProjetKpiPage.tsx - `formatCurrency(value, 'XOF')` utilisé
- [x] BudgetKpiPage.tsx - `formatCurrency(value, 'XOF')` utilisé
- [ ] ValidationsGlobalPage.tsx - `formatMoneyCompact` conservé (spécifique)

---

## 🎯 Priorités

### Priorité Haute
1. **Parsers inline** : Remplacer tous les `parseFloat(...replace...)` par `parseTrendPercent()`
   - DemandesKpiPage.tsx (ligne 81)
   - ProjetKpiPage.tsx (ligne 88)
   - HighlightsKpiPage.tsx (ligne 79)

### Priorité Moyenne
2. **Mapping ton → couleur** : Remplacer `mapToneToColor` par `toneToColor`
   - BudgetKpiPage.tsx

### Priorité Basse
3. **Formatage monétaire** : Migrer vers `formatCurrency` si cohérent
   - ProjetKpiPage.tsx
   - ValidationsGlobalPage.tsx (si `formatMoneyCompact` peut être remplacé)

---

## 📝 Notes

- **`mapColorToTone`** peut être conservé dans `colorMapping.ts` si nécessaire pour la conversion couleur → ton
- **`parseTrendPercent`** doit être utilisé partout pour la cohérence
- **`toneToColor`** doit être utilisé pour la conversion ton → couleur
- Les parsers inline doivent être **tous** remplacés pour éviter les divergences

---

**Date** : 2026-01-25  
**Statut** : ✅ Migrations Complètes

## ✅ Migrations Finales Complétées

### Fichiers Migrés (Dernière Session)
- [x] **KPILine.tsx** - `@/lib/dashboard/kpi` → `@lib-root/dashboard/kpi`
- [x] **SummaryPointsPage.tsx** - `parseTrendPercent` depuis `@lib-root/dashboard/kpi`
- [x] **DirecteurTravauxPage.tsx** - `parseTrendPercent` depuis `@lib-root/dashboard/kpi`

### Note sur `mapColorToTone`
La fonction `mapColorToTone` est conservée dans `colorMapping.ts` car elle convertit des **couleurs** (ex: 'red', 'amber') vers des **tons** (ex: 'crit', 'warn'), ce qui est différent de `toneToColor` qui convertit des **tons** vers des **couleurs**. Les deux fonctions servent des besoins complémentaires.
