import { pgPool } from '@lib-root/server/db/pool';
import type { RequestContext } from '../context';

export class SqlReadModelsRepoCompliance {
  private tenantWhere = `tenant_id = $1`;

  async loadOverview(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `select ratio_completude_procedure, delai_visa_moy_j, lots_non_attribues,
                avenants_en_visa, contrats_pieces_incompletes
         from rm_compliance_overview
         where ${this.tenantWhere} limit 1`, [ctx.tenantId]
      );
      const r = rows[0] ?? { ratio_completude_procedure:0, delai_visa_moy_j:0, lots_non_attribues:0, avenants_en_visa:0, contrats_pieces_incompletes:0 };
      return r;
    } finally { client.release(); }
  }

  async loadBacklog(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `select ref_objet, etape_en_cours, chaine_visa, nb_etapes_restantes
         from rm_compliance_visas_backlog
         where ${this.tenantWhere}
         order by nb_etapes_restantes desc limit 200`, [ctx.tenantId]
      );
      return rows;
    } finally { client.release(); }
  }

  async loadMissingDocs(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `select contrat_id, manquant_ccap, manquant_ccag, manquant_pv
         from rm_compliance_missing_docs
         where ${this.tenantWhere} order by contrat_id asc`, [ctx.tenantId]
      );
      return rows;
    } finally { client.release(); }
  }

  async loadLotsOpen(ctx: RequestContext) {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `select count(*) as lots_ouverts
         from lots_mp where ${this.tenantWhere} and statut='ouvert'`, [ctx.tenantId]
      );
      return { lots_ouverts: Number(rows[0]?.lots_ouverts ?? 0) };
    } finally { client.release(); }
  }
}
