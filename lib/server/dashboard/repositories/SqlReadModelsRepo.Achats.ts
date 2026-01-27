// lib/server/dashboard/repositories/SqlReadModelsRepo.Achats.ts
import { pgPool } from '@lib-root/server/db/pool';
import type { RequestContext } from '../context';

export interface AchatsOverviewData {
  lead_time_j: number | null;
  conformite_ratio: number;
  price_variance_ratio: number;
  spend_30d_ht: number;
}

export interface AchatsTrendsData {
  date: string;
  bc_emis: number;
  bl_recus: number;
  spend_ht: number;
}

export interface AchatsFournisseurKPI {
  fournisseur_code: string;
  fournisseur_nom: string;
  nb_bl: number;
  otif_ratio: number;
  price_var_ratio: number;
}

export interface AchatsOpenOrder {
  bc_ref: string;
  emis_le: string;
  fournisseur_code: string;
  qte_commande: number;
  qte_recue: number;
  qte_restante: number;
  statut: string;
}

export class SqlReadModelsRepoAchats {
  private tenantWhere(ctx: RequestContext): string {
    return `tenant_id = $1`;
  }

  async loadOverview(ctx: RequestContext): Promise<AchatsOverviewData> {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `SELECT lead_time_j, conformite_ratio, price_variance_ratio, spend_30d_ht
         FROM rm_achats_overview
         WHERE ${this.tenantWhere(ctx)}
         LIMIT 1`,
        [ctx.tenantId]
      );
      const r = rows[0] ?? {
        lead_time_j: null,
        conformite_ratio: 0,
        price_variance_ratio: 0,
        spend_30d_ht: 0,
      };
      return { ...r };
    } finally {
      client.release();
    }
  }

  async loadTrends(ctx: RequestContext): Promise<AchatsTrendsData[]> {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `SELECT date::text AS date, bc_emis, bl_recus, spend_ht
         FROM rm_achats_trends
         WHERE ${this.tenantWhere(ctx)}
         ORDER BY date ASC`,
        [ctx.tenantId]
      );
      return rows.map((r) => ({
        date: r.date,
        bc_emis: Number(r.bc_emis),
        bl_recus: Number(r.bl_recus),
        spend_ht: Number(r.spend_ht),
      }));
    } finally {
      client.release();
    }
  }

  async loadFournisseurs(ctx: RequestContext): Promise<AchatsFournisseurKPI[]> {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `SELECT fournisseur_code, fournisseur_nom, nb_bl, otif_ratio, price_var_ratio
         FROM rm_achats_fournisseurs
         WHERE ${this.tenantWhere(ctx)}
         ORDER BY fournisseur_nom ASC`,
        [ctx.tenantId]
      );
      return rows.map((r) => ({
        fournisseur_code: r.fournisseur_code,
        fournisseur_nom: r.fournisseur_nom,
        nb_bl: Number(r.nb_bl),
        otif_ratio: Number(r.otif_ratio),
        price_var_ratio: Number(r.price_var_ratio),
      }));
    } finally {
      client.release();
    }
  }

  async loadOpenOrders(ctx: RequestContext): Promise<AchatsOpenOrder[]> {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `SELECT bc_ref, emis_le::text AS emis_le, fournisseur_code, qte_commande::float, qte_recue::float, qte_restante::float, statut
         FROM rm_achats_open_orders
         WHERE ${this.tenantWhere(ctx)}
         ORDER BY emis_le DESC
         LIMIT 200`,
        [ctx.tenantId]
      );
      return rows.map((r) => ({
        ...r,
        qte_commande: Number(r.qte_commande),
        qte_recue: Number(r.qte_recue),
        qte_restante: Number(r.qte_restante),
      }));
    } finally {
      client.release();
    }
  }
}
