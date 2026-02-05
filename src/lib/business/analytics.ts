/**
 * Système d'analytics et de rapports métier pour les délégations
 * Fournit des insights et des métriques business
 */

export interface DelegationMetrics {
  period: { start: Date; end: Date };
  overview: {
    total: number;
    active: number;
    expired: number;
    revoked: number;
    suspended: number;
    created: number;
    modified: number;
  };
  usage: {
    totalUsages: number;
    avgUsagesPerDelegation: number;
    mostUsedDelegations: Array<{ id: string; count: number; agent: string }>;
    leastUsedDelegations: Array<{ id: string; count: number; agent: string }>;
  };
  distribution: {
    byBureau: Record<string, number>;
    byType: Record<string, number>;
    byAmount: {
      '<10k': number;
      '10k-50k': number;
      '50k-100k': number;
      '>100k': number;
    };
  };
  compliance: {
    withBackup: number;
    withoutBackup: number;
    expiringSoon: number;
    overdue: number;
    complianceScore: number; // 0-100
  };
  risks: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    riskScore: number; // 0-100
  };
  trends: {
    creationTrend: 'increasing' | 'decreasing' | 'stable';
    usageTrend: 'increasing' | 'decreasing' | 'stable';
    expirationRate: number;
    renewalRate: number;
  };
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  activeDelegations: number;
  totalUsages: number;
  avgResponseTime: number; // en heures
  complianceScore: number;
  delegationsWithIssues: number;
  successRate: number; // %
}

export interface BusinessReport {
  id: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  title: string;
  period: { start: Date; end: Date };
  metrics: DelegationMetrics;
  insights: ReportInsight[];
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportInsight {
  category: 'positive' | 'warning' | 'critical' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

/**
 * Moteur d'analytics
 */
export class DelegationAnalytics {
  /**
   * Calculer les métriques globales
   */
  public calculateMetrics(
    delegations: any[],
    startDate: Date,
    endDate: Date
  ): DelegationMetrics {
    const period = { start: startDate, end: endDate };

    // Filtrer les délégations de la période
    const periodDelegations = delegations.filter(
      d => new Date(d.createdAt) >= startDate && new Date(d.createdAt) <= endDate
    );

    // Overview
    const overview = {
      total: delegations.length,
      active: delegations.filter(d => d.status === 'active').length,
      expired: delegations.filter(d => d.status === 'expired').length,
      revoked: delegations.filter(d => d.status === 'revoked').length,
      suspended: delegations.filter(d => d.status === 'suspended').length,
      created: periodDelegations.length,
      modified: delegations.filter(
        d => new Date(d.updatedAt) >= startDate && new Date(d.updatedAt) <= endDate
      ).length,
    };

    // Usage
    const totalUsages = delegations.reduce((sum, d) => sum + (d.usageCount || 0), 0);
    const activeDelegations = delegations.filter(d => d.status === 'active');

    const usage = {
      totalUsages,
      avgUsagesPerDelegation:
        activeDelegations.length > 0 ? totalUsages / activeDelegations.length : 0,
      mostUsedDelegations: this.getMostUsed(delegations, 5),
      leastUsedDelegations: this.getLeastUsed(delegations, 5),
    };

    // Distribution
    const distribution = {
      byBureau: this.groupBy(delegations, 'bureau'),
      byType: this.groupBy(delegations, 'type'),
      byAmount: this.getAmountDistribution(delegations),
    };

    // Compliance
    const withBackup = delegations.filter(d => d.hasBackup && d.status === 'active').length;
    const withoutBackup = delegations.filter(d => !d.hasBackup && d.status === 'active').length;
    const expiringSoon = delegations.filter(
      d => this.getDaysUntilExpiry(d.endDate) <= 7 && d.status === 'active'
    ).length;
    const overdue = delegations.filter(
      d => this.getDaysUntilExpiry(d.endDate) < 0 && d.status === 'active'
    ).length;

    const compliance = {
      withBackup,
      withoutBackup,
      expiringSoon,
      overdue,
      complianceScore: this.calculateComplianceScore(delegations),
    };

    // Risks
    const risks = this.calculateRisks(delegations);

    // Trends
    const trends = this.calculateTrends(delegations, startDate, endDate);

    return {
      period,
      overview,
      usage,
      distribution,
      compliance,
      risks,
      trends,
    };
  }

  /**
   * Générer un rapport métier
   */
  public generateReport(
    type: BusinessReport['type'],
    delegations: any[],
    startDate: Date,
    endDate: Date,
    generatedBy: string
  ): BusinessReport {
    const metrics = this.calculateMetrics(delegations, startDate, endDate);
    const insights = this.generateInsights(metrics, delegations);
    const recommendations = this.generateRecommendations(metrics, insights);

    return {
      id: `report-${Date.now()}`,
      type,
      title: `Rapport ${type} - Délégations`,
      period: { start: startDate, end: endDate },
      metrics,
      insights,
      recommendations,
      generatedAt: new Date(),
      generatedBy,
    };
  }

  /**
   * Analyser la performance des agents
   */
  public analyzeAgentPerformance(delegations: any[]): AgentPerformance[] {
    const agentMap = new Map<string, any[]>();

    // Grouper par agent
    for (const del of delegations) {
      if (!agentMap.has(del.agentId)) {
        agentMap.set(del.agentId, []);
      }
      agentMap.get(del.agentId)!.push(del);
    }

    const performances: AgentPerformance[] = [];

    for (const [agentId, agentDelegations] of agentMap) {
      const active = agentDelegations.filter(d => d.status === 'active').length;
      const totalUsages = agentDelegations.reduce((sum, d) => sum + (d.usageCount || 0), 0);

      // Calculer le temps de réponse moyen (exemple)
      const avgResponseTime = this.calculateAvgResponseTime(agentDelegations);

      // Score de conformité
      const complianceScore = this.calculateAgentComplianceScore(agentDelegations);

      // Délégations avec problèmes
      const withIssues = agentDelegations.filter(
        d => !d.hasBackup || this.getDaysUntilExpiry(d.endDate) <= 7
      ).length;

      // Taux de succès (exemple: % de délégations sans incident)
      const successRate =
        agentDelegations.length > 0
          ? ((agentDelegations.length - withIssues) / agentDelegations.length) * 100
          : 100;

      performances.push({
        agentId,
        agentName: agentDelegations[0]?.agentName || 'Unknown',
        activeDelegations: active,
        totalUsages,
        avgResponseTime,
        complianceScore,
        delegationsWithIssues: withIssues,
        successRate,
      });
    }

    return performances.sort((a, b) => b.complianceScore - a.complianceScore);
  }

  /**
   * Générer des insights à partir des métriques
   */
  private generateInsights(metrics: DelegationMetrics, delegations: any[]): ReportInsight[] {
    const insights: ReportInsight[] = [];

    // Insight positif: taux de création
    if (metrics.trends.creationTrend === 'increasing') {
      insights.push({
        category: 'positive',
        title: 'Croissance des délégations',
        description: `Augmentation de ${metrics.overview.created} nouvelles délégations créées sur la période`,
        impact: 'medium',
        data: { count: metrics.overview.created },
      });
    }

    // Warning: délégations expirant bientôt
    if (metrics.compliance.expiringSoon > 5) {
      insights.push({
        category: 'warning',
        title: 'Expirations imminentes',
        description: `${metrics.compliance.expiringSoon} délégations expirent dans moins de 7 jours`,
        impact: 'high',
        data: { count: metrics.compliance.expiringSoon },
      });
    }

    // Critical: délégations sans backup
    if (metrics.compliance.withoutBackup > 3) {
      insights.push({
        category: 'critical',
        title: 'Risque de continuité',
        description: `${metrics.compliance.withoutBackup} délégations critiques sans remplaçant désigné`,
        impact: 'high',
        data: { count: metrics.compliance.withoutBackup },
      });
    }

    // Opportunity: consolidation possible
    const consolidationOpportunities = this.findConsolidationOpportunities(delegations);
    if (consolidationOpportunities.length > 0) {
      insights.push({
        category: 'opportunity',
        title: 'Opportunité de consolidation',
        description: `${consolidationOpportunities.length} groupes de délégations similaires pourraient être consolidés`,
        impact: 'medium',
        data: { opportunities: consolidationOpportunities },
      });
    }

    return insights;
  }

  /**
   * Générer des recommandations
   */
  private generateRecommendations(
    metrics: DelegationMetrics,
    insights: ReportInsight[]
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.compliance.complianceScore < 70) {
      recommendations.push(
        'Améliorer le taux de conformité en désignant des remplaçants pour toutes les délégations critiques'
      );
    }

    if (metrics.compliance.expiringSoon > 0) {
      recommendations.push(
        `Planifier le renouvellement ou remplacement de ${metrics.compliance.expiringSoon} délégations expirant prochainement`
      );
    }

    if (metrics.risks.riskScore > 70) {
      recommendations.push(
        'Mettre en place un plan de mitigation des risques pour les délégations à haut risque'
      );
    }

    const lowUsage = metrics.usage.leastUsedDelegations.filter(d => d.count < 2);
    if (lowUsage.length > 3) {
      recommendations.push(
        `Réévaluer la nécessité de ${lowUsage.length} délégations très peu utilisées`
      );
    }

    return recommendations;
  }

  // Méthodes utilitaires
  private getMostUsed(delegations: any[], limit: number) {
    return delegations
      .filter(d => d.status === 'active')
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit)
      .map(d => ({
        id: d.id,
        count: d.usageCount || 0,
        agent: d.agentName,
      }));
  }

  private getLeastUsed(delegations: any[], limit: number) {
    return delegations
      .filter(d => d.status === 'active' && (d.usageCount || 0) > 0)
      .sort((a, b) => (a.usageCount || 0) - (b.usageCount || 0))
      .slice(0, limit)
      .map(d => ({
        id: d.id,
        count: d.usageCount || 0,
        agent: d.agentName,
      }));
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    const result: Record<string, number> = {};
    for (const item of items) {
      const value = item[key] || 'Non spécifié';
      result[value] = (result[value] || 0) + 1;
    }
    return result;
  }

  private getAmountDistribution(delegations: any[]) {
    const dist = {
      '<10k': 0,
      '10k-50k': 0,
      '50k-100k': 0,
      '>100k': 0,
    };

    for (const del of delegations) {
      const amount = del.maxAmount || 0;
      if (amount < 10000) dist['<10k']++;
      else if (amount < 50000) dist['10k-50k']++;
      else if (amount < 100000) dist['50k-100k']++;
      else dist['>100k']++;
    }

    return dist;
  }

  private getDaysUntilExpiry(endDate: string | Date): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateComplianceScore(delegations: any[]): number {
    const active = delegations.filter(d => d.status === 'active');
    if (active.length === 0) return 100;

    const withBackup = active.filter(d => d.hasBackup).length;
    const notExpiring = active.filter(d => this.getDaysUntilExpiry(d.endDate) > 7).length;

    const backupScore = (withBackup / active.length) * 50;
    const expiryScore = (notExpiring / active.length) * 50;

    return Math.round(backupScore + expiryScore);
  }

  private calculateRisks(delegations: any[]) {
    const highRisk = delegations.filter(
      d =>
        d.status === 'active' &&
        (!d.hasBackup || this.getDaysUntilExpiry(d.endDate) <= 3 || (d.maxAmount || 0) > 100000)
    ).length;

    const mediumRisk = delegations.filter(
      d =>
        d.status === 'active' &&
        (this.getDaysUntilExpiry(d.endDate) <= 7 || (d.maxAmount || 0) > 50000)
    ).length - highRisk;

    const lowRisk = delegations.filter(d => d.status === 'active').length - highRisk - mediumRisk;

    const totalActive = delegations.filter(d => d.status === 'active').length;
    const riskScore = totalActive > 0 ? Math.round((highRisk * 100 + mediumRisk * 50) / totalActive) : 0;

    return {
      highRisk,
      mediumRisk,
      lowRisk,
      riskScore,
    };
  }

  private calculateTrends(delegations: any[], startDate: Date, endDate: Date) {
    // Logique simplifiée pour les tendances
    const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2);

    const firstHalf = delegations.filter(
      d => new Date(d.createdAt) >= startDate && new Date(d.createdAt) < midPoint
    ).length;

    const secondHalf = delegations.filter(
      d => new Date(d.createdAt) >= midPoint && new Date(d.createdAt) <= endDate
    ).length;

    const creationTrend: 'increasing' | 'decreasing' | 'stable' =
      secondHalf > firstHalf * 1.1
        ? 'increasing'
        : secondHalf < firstHalf * 0.9
        ? 'decreasing'
        : 'stable';

    return {
      creationTrend,
      usageTrend: 'stable' as const, // À implémenter
      expirationRate: 0, // À implémenter
      renewalRate: 0, // À implémenter
    };
  }

  private calculateAvgResponseTime(delegations: any[]): number {
    // Logique simplifiée
    return 24; // heures
  }

  private calculateAgentComplianceScore(delegations: any[]): number {
    if (delegations.length === 0) return 100;

    const compliant = delegations.filter(d => {
      const daysUntilExpiry = this.getDaysUntilExpiry(d.endDate);
      return d.hasBackup && (daysUntilExpiry > 7 || d.status !== 'active');
    }).length;

    return Math.round((compliant / delegations.length) * 100);
  }

  private findConsolidationOpportunities(delegations: any[]): any[] {
    // Logique simplifiée pour trouver des opportunités de consolidation
    const opportunities: any[] = [];
    return opportunities;
  }

  /**
   * Exporter les métriques au format CSV
   */
  public exportMetricsToCSV(metrics: DelegationMetrics): string {
    // Génération CSV simplifiée
    let csv = 'Métrique,Valeur\n';
    csv += `Total délégations,${metrics.overview.total}\n`;
    csv += `Actives,${metrics.overview.active}\n`;
    csv += `Expirées,${metrics.overview.expired}\n`;
    csv += `Score de conformité,${metrics.compliance.complianceScore}%\n`;
    csv += `Score de risque,${metrics.risks.riskScore}\n`;
    return csv;
  }
}

/**
 * Instance singleton des analytics
 */
export const delegationAnalytics = new DelegationAnalytics();

