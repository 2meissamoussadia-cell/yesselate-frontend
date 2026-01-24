# 📦 Composants Dashboard - Vue d'ensemble

**Date**: 2026-01-23  
**Version**: 4.0

---

## 📋 Liste des Composants Réutilisables

### 1. **KPICard** ✅
**Fichier** : `src/components/features/bmo/dashboard/components/KPICard.tsx`

**Fonctionnalités** :
- Affichage uniforme des KPIs
- Support de 3 tailles : `sm`, `md`, `lg`
- 6 couleurs : `blue`, `emerald`, `amber`, `purple`, `rose`, `cyan`
- Indicateur de tendance (↑, ↓, —) avec pourcentage
- Tooltip optionnel avec description
- Clic pour ouvrir modal de détail

**Props** :
```typescript
interface KPICardProps {
  kpi: KPICardData;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  trend?: number;
  trendType?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';
  description?: string;
  onClick?: () => void;
}
```

**Utilisé dans** :
- OverviewView (Indicateurs en temps réel)
- RealtimeView
- PerformanceView

---

### 2. **SectionTitle** ✅
**Fichier** : `src/components/features/bmo/dashboard/components/SectionTitle.tsx`

**Fonctionnalités** :
- Titre de section harmonisé
- Support d'icône optionnelle
- Sous-titre optionnel
- Action optionnelle (bouton "Voir tout")
- 3 tailles : `sm`, `md`, `lg`

**Props** :
```typescript
interface SectionTitleProps {
  icon?: React.ComponentType;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Utilisé dans** :
- Toutes les vues (OverviewView, PerformanceView, ActionsView, etc.)

---

### 3. **DataCard** ✅
**Fichier** : `src/components/features/bmo/dashboard/components/DataCard.tsx`

**Fonctionnalités** :
- Carte de données structurée
- Support de valeur (string, number, ReactNode)
- Badge optionnel avec variants (default, warning, critical, success)
- Icône optionnelle
- Clic pour action
- Support de children pour contenu additionnel

**Props** :
```typescript
interface DataCardProps {
  title?: string;
  value: string | number | React.ReactNode;
  label?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'warning' | 'critical' | 'success';
  icon?: React.ComponentType;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}
```

**Utilisé dans** :
- PerformanceView (Métriques clés)
- RisksView (Statistiques)
- DecisionsView (Statistiques)

---

### 4. **RiskScoreCard** ✅
**Fichier** : `src/components/features/bmo/dashboard/components/RiskScoreCard.tsx`

**Fonctionnalités** :
- Carte de score de risque
- Score 0-100 avec couleur dynamique
- Impact (Critique, Majeur, Moyen, Mineur)
- Probabilité (Certaine, Élevée, Moyenne, Faible)
- Icônes selon impact
- Fallbacks pour données manquantes

**Props** :
```typescript
interface RiskScoreCardProps {
  risk: RiskScoreCardData;
  onClick?: () => void;
  className?: string;
}

interface RiskScoreCardData {
  id: string;
  titre: string;
  description: string;
  score: number; // 0-100
  impact: 'mineur' | 'moyen' | 'majeur' | 'critique';
  probabilite: 'faible' | 'moyenne' | 'elevee' | 'certaine';
  age?: number; // en jours
  source?: string;
  projet?: { id: string; nom: string };
}
```

**Utilisé dans** :
- OverviewView (Risk Radar)
- RisksView

---

### 5. **ActionItem** ✅
**Fichier** : `src/components/features/bmo/dashboard/components/ActionItem.tsx`

**Fonctionnalités** :
- Élément d'action prioritaire
- Support de 4 types : `contrat`, `bc`, `paiement`, `arbitrage`
- 3 priorités : `critique`, `haute`, `moyenne`
- Affichage montant formaté (M FCFA, K FCFA)
- Deadline et responsable
- Fallbacks pour données manquantes

**Props** :
```typescript
interface ActionItemProps {
  action: ActionItemData;
  onClick?: () => void;
  className?: string;
}

interface ActionItemData {
  id: string;
  titre: string;
  type: 'contrat' | 'bc' | 'paiement' | 'arbitrage';
  priorite: 'critique' | 'haute' | 'moyenne';
  bureau?: string;
  code?: string;
  projet?: { id: string; nom: string };
  montant?: number; // en FCFA
  deadline: string;
  responsable?: { nom: string; id: string };
  contexte?: string;
  impact?: string;
}
```

**Utilisé dans** :
- OverviewView (Actions prioritaires)
- ActionsView

---

### 6. **AgendaItem** ✅
**Fichier** : `src/components/features/bmo/dashboard/components/AgendaItem.tsx`

**Fonctionnalités** :
- Élément d'agenda exécutif
- Support de 5 types : `deadline`, `meeting`, `visite`, `audience`, `livraison`
- 3 priorités : `critique`, `urgent`, `normal`
- Affichage date formatée (jour, numéro, mois)
- Participants et projet
- Clic pour voir détails

**Props** :
```typescript
interface AgendaItemProps {
  event: AgendaItemData;
  onClick?: () => void;
  className?: string;
}

interface AgendaItemData {
  id: string;
  date: string; // ISO date
  time: string;
  titre: string;
  description: string;
  type: 'deadline' | 'meeting' | 'visite' | 'audience' | 'livraison';
  priorite: 'critique' | 'urgent' | 'normal';
  bureau?: string;
  projet?: string;
  participants?: string[];
}
```

**Utilisé dans** :
- OverviewView (Agenda exécutif)

---

### 7. **CircuitValidation** ✅
**Fichier** : `src/components/features/bmo/dashboard/components/CircuitValidation.tsx`

**Fonctionnalités** :
- Flow de validation horizontal
- Affichage des étapes avec connexions
- Détection de goulots d'étranglement
- Métriques de temps (moyen, objectif, écart)
- 4 couleurs : `blue`, `purple`, `green`, `orange`
- Badge "Goulot" pour étapes problématiques

**Props** :
```typescript
interface CircuitValidationProps {
  stages: WorkflowStage[];
  className?: string;
}

interface WorkflowStage {
  id: string;
  label: string;
  count: number;
  color: 'blue' | 'purple' | 'green' | 'orange';
  bureau?: string;
  avgTime: number; // en jours
  targetTime: number; // en jours
  isBottleneck: boolean;
}
```

**Utilisé dans** :
- OverviewView (Circuit de validation)

---

### 8. **TrendIndicator** ✅
**Fichier** : `src/components/features/bmo/dashboard/components/TrendIndicator.tsx`

**Fonctionnalités** :
- Indicateur de tendance (↑, ↓, —)
- Support de 3 tailles : `sm`, `md`, `lg`
- Affichage pourcentage avec signe
- Icône ou flèche optionnelle
- Couleurs selon direction (vert pour ↑, rouge pour ↓)

**Props** :
```typescript
interface TrendIndicatorProps {
  value: number; // Pourcentage (-100 à 100)
  type?: 'up' | 'down' | 'neutral';
  showIcon?: boolean;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Utilisé dans** :
- KPICard (intégré)
- Autres composants nécessitant des tendances

---

## 📊 Structure des Fichiers

```
src/components/features/bmo/dashboard/components/
├── index.ts                    # Exports centralisés
├── KPICard.tsx                 # ✅ Carte KPI
├── SectionTitle.tsx            # ✅ Titre de section
├── DataCard.tsx                # ✅ Carte de données
├── RiskScoreCard.tsx           # ✅ Carte de risque
├── ActionItem.tsx              # ✅ Élément d'action
├── AgendaItem.tsx              # ✅ Élément d'agenda
├── CircuitValidation.tsx       # ✅ Circuit de validation
└── TrendIndicator.tsx          # ✅ Indicateur de tendance
```

---

## 🎨 Caractéristiques Communes

### Design System
- ✅ Thème sombre cohérent (slate-800/900)
- ✅ Bordures harmonisées (`border-slate-700/50`)
- ✅ Radius uniformes (`rounded-xl`, `rounded-lg`)
- ✅ Transitions fluides (`transition-all duration-200`)
- ✅ Hover states cohérents

### Accessibilité
- ✅ Support clavier (onClick)
- ✅ ARIA labels implicites
- ✅ Tooltips pour informations additionnelles
- ✅ Contraste de couleurs respecté

### Performance
- ✅ Composants mémorisés (`memo`)
- ✅ Fallbacks pour données manquantes
- ✅ Validation des props avec TypeScript

---

## 🔧 Utilisation

### Import
```typescript
import {
  KPICard,
  SectionTitle,
  DataCard,
  RiskScoreCard,
  ActionItem,
  AgendaItem,
  CircuitValidation,
  TrendIndicator,
} from '@/components/features/bmo/dashboard/components';
```

### Exemple KPICard
```typescript
<KPICard
  kpi={{
    id: 'demandes',
    label: 'Demandes',
    value: 247,
    trend: 12,
    icon: FileCheck,
    color: 'blue',
    description: 'Nombre total de demandes en cours',
    onClick: () => openModal('kpi-drilldown', { kpiId: 'demandes' }),
  }}
  size="md"
/>
```

### Exemple SectionTitle
```typescript
<SectionTitle
  icon={Activity}
  title="Indicateurs en temps réel"
  subtitle="Vue d'ensemble des KPIs principaux"
  size="lg"
  actionLabel="Voir tout"
  onAction={() => navigate('performance')}
/>
```

---

## ✅ Statut

**Tous les composants sont** :
- ✅ Implémentés et fonctionnels
- ✅ Typés avec TypeScript
- ✅ Harmonisés visuellement
- ✅ Documentés
- ✅ Réutilisables

---

**Version** : 4.0  
**Date** : 2026-01-23
