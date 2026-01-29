import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

interface KpiCacheEntry {
  value: unknown;
  expiresAt: number;
}

@Injectable()
export class AnalyticsService {
  private cache = new Map<string, KpiCacheEntry>();

  constructor(private readonly prisma: PrismaService) {}

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.value as T;
  }

  private setCache(key: string, value: unknown, ttlMs = CACHE_TTL_MS) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async getHealth() {
    const dbOk = await this.prisma.healthCheck();
    const chantiersCount = dbOk
      ? await this.prisma.chantier.count()
      : 0;
    return {
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbOk,
      chantiersCount,
    };
  }

  async getKpis() {
    const cacheKey = 'kpis';
    const cached = this.getCached<Awaited<ReturnType<AnalyticsService['computeKpis']>>>(cacheKey);
    if (cached) return cached;
    const kpis = await this.computeKpis();
    this.setCache(cacheKey, kpis);
    return kpis;
  }

  private async computeKpis() {
    const [totalChantiers, actifs, totalBudget, alertesCritiques] =
      await Promise.all([
        this.prisma.chantier.count(),
        this.prisma.chantier.count({ where: { statut: 'ACTIF' } }),
        this.prisma.chantier.aggregate({
          _sum: { budget: true },
          where: { statut: 'ACTIF' },
        }),
        this.prisma.alerte.count({
          where: { severity: 'CRITICAL', resolved: false },
        }),
      ]);
    return {
      totalChantiers,
      chantiersActifs: actifs,
      budgetTotal: totalBudget._sum.budget ?? 0,
      alertesCritiques: alertesCritiques,
      updatedAt: new Date().toISOString(),
    };
  }

  async getSegments() {
    const cacheKey = 'segments';
    const cached = this.getCached<Awaited<ReturnType<AnalyticsService['computeSegments']>>>(cacheKey);
    if (cached) return cached;
    const segments = await this.computeSegments();
    this.setCache(cacheKey, segments);
    return segments;
  }

  private async computeSegments() {
    const bySegment = await this.prisma.chantier.groupBy({
      by: ['segment'],
      _count: { id: true },
      _sum: { budget: true },
      where: { statut: 'ACTIF' },
    });
    return bySegment.map((s) => ({
      segment: s.segment,
      nbChantiers: s._count.id,
      budgetTotal: s._sum.budget ?? 0,
    }));
  }
}
