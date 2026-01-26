#!/bin/bash
# Script de rafraîchissement de toutes les vues matérialisées
# Phase P3 + P4 + P5: Toutes les MViews du dashboard

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL non défini"
  exit 1
fi

echo "🔄 Rafraîchissement des vues matérialisées..."

# Phase P2-C: Vues core dashboard
echo "📊 Vues core dashboard..."
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_trends_daily;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_projets;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_demandes;"

# Phase P3: Vues Finance
echo "💰 Vues Finance..."
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_trends;"

# Phase P5: Vues Achats/Contrats
echo "🛒 Vues Achats/Contrats..."
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_trends;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_fournisseurs;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_commandes_ouvertes;"

# Phase P4: Vues Stocks & Matériel
echo "📦 Vues Stocks & Matériel..."
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_overview;"

echo "✅ Toutes les vues ont été rafraîchies"
