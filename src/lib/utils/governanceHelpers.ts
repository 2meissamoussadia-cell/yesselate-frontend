/**
 * Utilitaires et helpers pour le module de gouvernance
 */

import type { Project, Risk, Alert } from '@/lib/services/governanceService';

// ═══════════════════════════════════════════════════════════════════════════
// CALCULS DE STATUT ET SANTÉ
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcule le statut de santé d'un projet basé sur divers critères
 */
export function calculateProjectHealth(project: Project): Project['healthStatus'] {
  let score = 0;

  // Budget
  const budgetRatio = project.budgetConsumed / project.budget;
  const progressRatio = project.progress / 100;
  
  if (budgetRatio > progressRatio + 0.15) score += 3; // Dépassement significatif
  else if (budgetRatio > progressRatio + 0.05) score += 1; // Léger dépassement

  // Alertes
  if (project.alerts > 5) score += 3;
  else if (project.alerts > 2) score += 1;

  // Retard estimé
  const today = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();
  const expectedProgress = (elapsed / totalDuration) * 100;

  if (project.progress < expectedProgress - 15) score += 3;
  else if (project.progress < expectedProgress - 5) score += 1;

  // Détermination du statut
  if (score >= 5) return 'late';
  if (score >= 2) return 'at-risk';
  return 'on-track';
}

/**
 * Calcule le niveau de criticité d'un risque
 */
export function calculateRiskCriticality(risk: Risk): number {
  const probabilityScores: Record<string, number> = { low: 1, medium: 2, high: 3, 'very-high': 4 };
  const impactScores: Record<string, number> = { minor: 1, moderate: 2, major: 3, critical: 4, 'very-high': 4, low: 1, medium: 2, high: 3 };

  const probScore = probabilityScores[risk.probability as string] ?? 1;
  const impactScore = impactScores[risk.impact as string] ?? 2;

  return probScore * impactScore;
}

/**
 * Détermine si une alerte nécessite une action immédiate
 */
export function isAlertUrgent(alert: Alert): boolean {
  if (alert.type === 'critical') return true;
  const category = alert.category as string;
  if (category === 'safety' || category === 'quality') return true;
  
  const hoursSinceCreation = (Date.now() - new Date(alert.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24 && !alert.isRead) return true;

  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMATAGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formate une date relative (il y a X jours/heures)
 */
export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  
  return targetDate.toLocaleDateString('fr-FR');
}

/**
 * Formate une date courte (JJ/MM/AAAA)
 */
export function formatShortDate(date: string | Date): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return targetDate.toLocaleDateString('fr-FR');
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTRAGE ET TRI
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Filtre les projets selon plusieurs critères
 */
export function filterProjects(
  projects: Project[],
  filters: {
    status?: Project['status'][];
    healthStatus?: Project['healthStatus'][];
    manager?: string;
    search?: string;
  }
): Project[] {
  return projects.filter(project => {
    if (filters.status && !filters.status.includes(project.status)) return false;
    if (filters.healthStatus && !filters.healthStatus.includes(project.healthStatus)) return false;
    if (filters.manager && project.manager !== filters.manager) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        project.name.toLowerCase().includes(searchLower) ||
        project.reference.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });
}

/**
 * Trie les projets selon un critère
 */
export function sortProjects(
  projects: Project[],
  sortBy: 'name' | 'progress' | 'budget' | 'endDate' | 'healthStatus',
  order: 'asc' | 'desc' = 'asc'
): Project[] {
  const sorted = [...projects].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
      case 'budget':
        comparison = (a.budgetConsumed / a.budget) - (b.budgetConsumed / b.budget);
        break;
      case 'endDate':
        comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        break;
      case 'healthStatus': {
        const healthOrder: Record<string, number> = { 'on-track': 0, 'at-risk': 1, late: 2, blocked: 3 };
        comparison = (healthOrder[a.healthStatus] ?? 0) - (healthOrder[b.healthStatus] ?? 0);
        break;
      }
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valide qu'une date d'échéance n'est pas dépassée
 */
export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

/**
 * Calcule le nombre de jours avant l'échéance
 */
export function daysUntilDue(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Détermine si une action est urgente (échéance < 3 jours)
 */
export function isUrgent(dueDate: string): boolean {
  return daysUntilDue(dueDate) <= 3;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGRÉGATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcule des statistiques agrégées sur un portfolio de projets
 */
export function calculatePortfolioStats(projects: Project[]) {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalConsumed = projects.reduce((sum, p) => sum + p.budgetConsumed, 0);
  const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;

  const byHealthStatus = {
    'on-track': projects.filter(p => p.healthStatus === 'on-track').length,
    'at-risk': projects.filter(p => p.healthStatus === 'at-risk').length,
    'late': projects.filter(p => p.healthStatus === 'late').length,
  };

  const totalAlerts = projects.reduce((sum, p) => sum + p.alerts, 0);

  return {
    totalProjects: projects.length,
    totalBudget,
    totalConsumed,
    budgetConsumptionRate: (totalConsumed / totalBudget) * 100,
    avgProgress,
    byHealthStatus,
    totalAlerts,
  };
}

/**
 * Groupe les risques par niveau de criticité
 */
export function groupRisksByCriticality(risks: Risk[]) {
  return {
    critical: risks.filter(r => calculateRiskCriticality(r) >= 9),
    high: risks.filter(r => {
      const crit = calculateRiskCriticality(r);
      return crit >= 6 && crit < 9;
    }),
    medium: risks.filter(r => {
      const crit = calculateRiskCriticality(r);
      return crit >= 3 && crit < 6;
    }),
    low: risks.filter(r => calculateRiskCriticality(r) < 3),
  };
}

