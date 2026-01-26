-- sql/13_reporting_views.sql

-- Calendrier mensuel minimal (24 mois de rétention, ajustable)
create table if not exists cal_mois (mois date primary key);
insert into cal_mois(mois)
select d::date
from generate_series(date_trunc('month', now() - interval '24 month'),
                     date_trunc('month', now()),
                     interval '1 month') as g(d)
on conflict do nothing;

-- 1) Reporting overview mensuel (tenant): production, factures, encaissements, RAP, RàF
drop materialized view if exists rm_reporting_overview;
create materialized view rm_reporting_overview as
select
  t.id as tenant_id,
  cm.mois,
  coalesce((select sum(s.realise_ht)
            from situations_travaux s
            where s.tenant_id = t.id and date_trunc('month', s.periode) = cm.mois), 0) as production_ht,
  coalesce((select sum(f.montant_ht)
            from factures f
            where f.tenant_id = t.id and date_trunc('month', f.emise_le) = cm.mois), 0) as facture_ht,
  coalesce((select sum(e.montant_ht)
            from encaissements e
            join factures f on f.id = e.facture_id
            where e.tenant_id = t.id and date_trunc('month', e.regle_le) = cm.mois), 0) as encaisse_ht,
  coalesce((select sum(s.prevu_ht) - sum(s.realise_ht)
            from situations_travaux s
            where s.tenant_id = t.id and date_trunc('month', s.periode) = cm.mois), 0) as rap_ht,
  coalesce((select sum(s.realise_ht)
            from situations_travaux s
            where s.tenant_id = t.id and date_trunc('month', s.periode) = cm.mois), 0)
  -
  coalesce((select sum(f.montant_ht)
            from factures f
            where f.tenant_id = t.id and date_trunc('month', f.emise_le) = cm.mois), 0) as raf_ht
from tenants t
cross join cal_mois cm
with no data;

create index idx_rm_reporting_overview_tenant_mois on rm_reporting_overview(tenant_id, mois);

-- 2) DSO mensuel (approx) : créances / CA_journalier_moyen(30j)
drop materialized view if exists rm_reporting_dso;
create materialized view rm_reporting_dso as
select
  t.id as tenant_id,
  cm.mois,
  coalesce((select sum(f.montant_ht)
            from factures f
            left join encaissements e on e.facture_id = f.id
            where f.tenant_id = t.id
              and date_trunc('month', f.emise_le) <= cm.mois
              and (e.id is null or e.regle_le > (cm.mois + interval '1 month - 1 day')::date)), 0)
  / nullif(
      coalesce((select sum(s.realise_ht)
                from situations_travaux s
                where s.tenant_id = t.id
                  and s.periode between (cm.mois - interval '30 day') and (cm.mois + interval '1 month - 1 day')), 0) / 30
    , 0) as dso_jours
from tenants t
cross join cal_mois cm
with no data;

create index idx_rm_reporting_dso_tenant_mois on rm_reporting_dso(tenant_id, mois);

-- 3) Par bureau (production mensuelle) — étendable avec autres indicateurs
drop materialized view if exists rm_reporting_bureau;
create materialized view rm_reporting_bureau as
select
  b.tenant_id,
  b.code as bureau_code,
  cm.mois,
  coalesce((select sum(s.realise_ht)
            from situations_travaux s
            join chantiers c on c.id = s.chantier_id
            where s.tenant_id = b.tenant_id and c.bureau_id = b.id
              and date_trunc('month', s.periode) = cm.mois), 0) as production_ht
from bureaux b
cross join cal_mois cm
with no data;

create index idx_rm_reporting_bureau on rm_reporting_bureau(tenant_id, bureau_code, mois);

-- 4) Par chantier (production mensuelle)
drop materialized view if exists rm_reporting_chantier;
create materialized view rm_reporting_chantier as
select
  c.tenant_id,
  c.code as chantier_code,
  cm.mois,
  coalesce((select sum(s.realise_ht)
            from situations_travaux s
            where s.tenant_id = c.tenant_id and s.chantier_id = c.id
              and date_trunc('month', s.periode) = cm.mois), 0) as production_ht
from chantiers c
cross join cal_mois cm
with no data;

create index idx_rm_reporting_chantier on rm_reporting_chantier(tenant_id, chantier_code, mois);
