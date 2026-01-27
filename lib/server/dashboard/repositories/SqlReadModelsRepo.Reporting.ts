// lib/server/dashboard/repositories/SqlReadModelsRepo.Reporting.ts
import { pgPool } from '@lib-root/server/db/pool';
import type { RequestContext } from '../context';

export class SqlReadModelsRepoReporting {
  private tenantWhere = `tenant_id = $1`;

  async loadOverview(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const monthly = await client.query(
        `select to_char(mois, 'YYYY-MM') as mois, production_ht, facture_ht, encaisse_ht, rap_ht, raf_ht
         from rm_reporting_overview where ${this.tenantWhere} order by mois asc`,
        [ctx.tenantId]
      );
      const dso = await client.query(
        `select to_char(mois, 'YYYY-MM') as mois, dso_jours
         from rm_reporting_dso where ${this.tenantWhere} order by mois asc`,
        [ctx.tenantId]
      );
      return { monthly: monthly.rows.map(r => ({
        mois: r.mois, production_ht: Number(r.production_ht), facture_ht: Number(r.facture_ht),
        encaisse_ht: Number(r.encaisse_ht), rap_ht: Number(r.rap_ht), raf_ht: Number(r.raf_ht)
      })), dso: dso.rows.map(r => ({ mois: r.mois, dso_jours: Number(r.dso_jours) })) };
    } finally { client.release(); }
  }

  async loadTrends(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const rs = await client.query(
        `select to_char(mois, 'YYYY-MM') as mois, production_ht, facture_ht, encaisse_ht
         from rm_reporting_overview where ${this.tenantWhere} order by mois asc`,
        [ctx.tenantId]
      );
      return rs.rows.map(r => ({
        mois: r.mois, production_ht: Number(r.production_ht),
        facture_ht: Number(r.facture_ht), encaisse_ht: Number(r.encaisse_ht)
      }));
    } finally { client.release(); }
  }

  async loadByBureau(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const rs = await client.query(
        `select bureau_code, to_char(mois,'YYYY-MM') as mois, production_ht
         from rm_reporting_bureau where ${this.tenantWhere} order by bureau_code asc, mois asc`,
        [ctx.tenantId]
      );
      return rs.rows.map(r => ({ bureau_code: r.bureau_code, mois: r.mois, production_ht: Number(r.production_ht) }));
    } finally { client.release(); }
  }

  async loadByChantier(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const rs = await client.query(
        `select chantier_code, to_char(mois,'YYYY-MM') as mois, production_ht
         from rm_reporting_chantier where ${this.tenantWhere} order by chantier_code asc, mois asc`,
        [ctx.tenantId]
      );
      return rs.rows.map(r => ({ chantier_code: r.chantier_code, mois: r.mois, production_ht: Number(r.production_ht) }));
    } finally { client.release(); }
  }
}
