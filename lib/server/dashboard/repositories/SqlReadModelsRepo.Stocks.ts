// lib/server/dashboard/repositories/SqlReadModelsRepo.Stocks.ts

import { pgPool } from '@/lib/server/db/pool';
import type { RequestContext } from '../context';

export class SqlReadModelsRepoStocks {
  private tenantWhere = `tenant_id = $1`;

  async loadStocksOverview(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `select nb_articles, ruptures, rupture_ratio, valeur_stock_ht
         from rm_stocks_overview where ${this.tenantWhere} limit 1`,
        [ctx.tenantId]
      );
      return rows[0] ?? { nb_articles:0, ruptures:0, rupture_ratio:0, valeur_stock_ht:0 };
    } finally { client.release(); }
  }

  async loadMaterielOverview(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `select nb_materiel, maintenance_ouverte, backlog_curatif, taux_dispo
         from rm_materiel_overview where ${this.tenantWhere} limit 1`,
        [ctx.tenantId]
      );
      return rows[0] ?? { nb_materiel:0, maintenance_ouverte:0, backlog_curatif:0, taux_dispo:0 };
    } finally { client.release(); }
  }

  async loadStocksTrends(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `select date::text as date, entree_qte, sortie_qte
         from rm_stocks_trends where ${this.tenantWhere} order by date asc`,
        [ctx.tenantId]
      );
      return rows.map(r => ({
        date: r.date,
        entree_qte: Number(r.entree_qte),
        sortie_qte: Number(r.sortie_qte)
      }));
    } finally { client.release(); }
  }
}
