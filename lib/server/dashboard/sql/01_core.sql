-- 01_core.sql
create table if not exists tenants (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text not null
);

create table if not exists bureaux (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  code        text not null,
  label       text not null,
  unique (tenant_id, code)
);

create table if not exists chantiers (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  code        text not null,
  label       text not null,
  bureau_id   uuid references bureaux(id),
  unique (tenant_id, code)
);

create table if not exists projets (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  chantier_id uuid references chantiers(id),
  nom         text not null,
  statut      text not null check (statut in ('En cours','En attente','Terminé')),
  progression int  not null check (progression between 0 and 100),
  budget      numeric(18,2) not null default 0,
  consomme    numeric(18,2) not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists demandes (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  bureau_id   uuid references bureaux(id),
  type        text not null,          -- 'Demande RH', 'Validation BC', etc.
  statut      text not null,          -- 'En attente', 'Validé', 'Rejeté', 'En cours'
  priorite    text not null,          -- 'Critique','Haute','Moyenne','Basse'
  created_at  timestamptz not null default now()
);

create table if not exists validations (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  bureau_id   uuid references bureaux(id),
  kind        text not null,          -- 'bc','facture','avenant'
  statut      text not null,          -- 'en_attente','validee','rejetee'
  delai_h     int  not null default 0, -- délai (heures) pour calcul SLA
  created_at  timestamptz not null default now()
);

create table if not exists risques (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  criticite   text not null,          -- 'high','medium','low'
  actif       boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists blocages (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  actif       boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists decisions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  statut      text not null,          -- 'en_attente','executee'
  created_at  timestamptz not null default now()
);

-- Index minimaux pour les filtres tenant/scopes
create index if not exists idx_projets_tenant on projets(tenant_id);
create index if not exists idx_demandes_tenant on demandes(tenant_id);
create index if not exists idx_validations_tenant on validations(tenant_id);
create index if not exists idx_risques_tenant on risques(tenant_id);
create index if not exists idx_blocages_tenant on blocages(tenant_id);
create index if not exists idx_decisions_tenant on decisions(tenant_id);
