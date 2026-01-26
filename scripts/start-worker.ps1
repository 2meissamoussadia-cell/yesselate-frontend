# Script PowerShell de démarrage du worker Event-Driven Refresh (Production)
# Usage: powershell scripts/start-worker.ps1

if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL non défini" -ForegroundColor Red
    exit 1
}

$env:NODE_ENV = if ($env:NODE_ENV) { $env:NODE_ENV } else { "production" }

# Utiliser tsx si disponible, sinon ts-node
if (Get-Command tsx -ErrorAction SilentlyContinue) {
    Write-Host "🚀 Démarrage du worker avec tsx..." -ForegroundColor Cyan
    npx tsx scripts/start-refresh-worker.ts
} elseif (Get-Command ts-node -ErrorAction SilentlyContinue) {
    Write-Host "🚀 Démarrage du worker avec ts-node..." -ForegroundColor Cyan
    node -r ts-node/register scripts/start-refresh-worker.ts
} else {
    Write-Host "❌ tsx ou ts-node requis. Installez avec: npm install -D tsx ts-node" -ForegroundColor Red
    exit 1
}
