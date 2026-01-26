-- 02_views_dashboard.sql

-- Vue agrégée KPIs (par tenant)
create materialized view if not exists rm_kpis_overview as
select
  t.id as tenant_id,
  -- demandes : total
  (select count(*) from demandes d where d.tenant_id = t.id) as demandes_total,
  -- validations : ratio validées / (validées + rejetées)
  coalesce((
    select count(*) filter (where v.statut = 'validee')::float
    / nullif(count(*),0)
    from validations v where v.tenant_id = t.id
  ), 0) as validations_ratio,
  -- budget : consomme / budget (projets)
  coalesce((
    select sum(p.consomme)::float / nullif(sum(p.budget),0)
    from projets p where p.tenant_id = t.id
  ), 0) as budget_ratio,
  -- blocages actifs
  (select count(*) from blocages b where b.tenant_id = t.id and b.actif) as blocages_actifs,
  -- risques critiques actifs
  (select count(*) from risques r where r.tenant_id = t.id and r.criticite = 'high' and r.actif) as risques_critiques,
  -- décisions en attente
  (select count(*) from decisions d where d.tenant_id = t.id and d.statut = 'en_attente') as decisions_en_attente,
  -- conformité SLA (proxy) : part validations avec delai < 48h
  coalesce((
    select count(*) filter (where v.statut = 'validee' and v.delai_h <= 48)::float
    / nullif(count(*) filter (where v.statut = 'validee'),0)
    from validations v where v.tenant_id = t.id
  ), 0) as conformite_ratio
from tenants t;

create unique index if not exists pk_rm_kpis_overview on rm_kpis_overview(tenant_id);

-- Vue daily trends (30 jours) : demandes / validations / budget (proxy cumul)
create materialized view if not exists rm_trends_daily as
with dates as (
  select generate_series((now() - interval '29 day')::date, now()::date, interval '1 day')::date as day
)
select
  t.id as tenant_id,
  d.day as date,
  -- demandes créées ce jour
  coalesce((
    select count(*) from demandes dm where dm.tenant_id = t.id and dm.created_at::date = d.day
  ), 0) as demandes,
  -- validations (validees) ce jour (ratio/100 → on peut normaliser côté front)
  coalesce((
    select count(*) filter (where v.statut = 'validee')::float
    / nullif(count(*),0)
    from validations v where v.tenant_id = t.id and v.created_at::date = d.day
  ), 0) as validations,
  -- budget (proxy) : part consommé / budget cumulée à date
  coalesce((
    select sum(p.consomme)::float / nullif(sum(p.budget),0)
    from projets p where p.tenant_id = t.id and p.created_at::date <= d.day
  ), 0) as budget
from tenants t cross join dates d;

create index if not exists idx_rm_trends_daily_tenant_date on rm_trends_daily(tenant_id, date);

-- Vue KPIs Projets (liste)
create materialized view if not exists rm_kpis_projets as
select
  p.tenant_id,
  p.id, p.nom, p.statut, p.progression,
  p.budget, p.consomme,
  (p.consomme / nullif(p.budget,0)) as budget_ratio
from projets p;

create index if not exists idx_rm_kpis_projets_tenant on rm_kpis_projets(tenant_id);

-- Vue KPIs Demandes (liste + compteurs)
create materialized view if not exists rm_kpis_demandes as
select
  d.tenant_id, d.id,
  d.type, d.statut, d.priorite, d.created_at,
  d.bureau_id
from demandes d;

create index if not exists idx_rm_kpis_demandes_tenant on rm_kpis_demandes(tenant_id);
