# Script PowerShell de rafraîchissement de toutes les vues matérialisées
# Phase P3 + P4 + P5: Toutes les MViews du dashboard

if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL non défini" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Rafraîchissement des vues matérialisées..." -ForegroundColor Cyan

# Phase P2-C: Vues core dashboard
Write-Host "📊 Vues core dashboard..." -ForegroundColor Yellow
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_overview;"
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_trends_daily;"
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_projets;"
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_demandes;"

# Phase P3: Vues Finance
Write-Host "💰 Vues Finance..." -ForegroundColor Yellow
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_overview;"
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_trends;"

# Phase P5: Vues Achats/Contrats
Write-Host "🛒 Vues Achats/Contrats..." -ForegroundColor Yellow
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_overview;"
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_trends;"
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_fournisseurs;"
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_commandes_ouvertes;"

# Phase P4: Vues Stocks & Matériel
Write-Host "📦 Vues Stocks & Matériel..." -ForegroundColor Yellow
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_overview;"
psql $env:DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_overview;"

Write-Host "✅ Toutes les vues ont été rafraîchies" -ForegroundColor Green
