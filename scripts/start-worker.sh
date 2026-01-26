#!/bin/bash
# Script de démarrage du worker Event-Driven Refresh (Production)
# Usage: ./scripts/start-worker.sh

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL non défini"
  exit 1
fi

# Utiliser tsx si disponible, sinon ts-node
if command -v tsx &> /dev/null; then
  echo "🚀 Démarrage du worker avec tsx..."
  NODE_ENV=${NODE_ENV:-production} npx tsx scripts/start-refresh-worker.ts
elif command -v ts-node &> /dev/null; then
  echo "🚀 Démarrage du worker avec ts-node..."
  NODE_ENV=${NODE_ENV:-production} node -r ts-node/register scripts/start-refresh-worker.ts
else
  echo "❌ tsx ou ts-node requis. Installez avec: npm install -D tsx ts-node"
  exit 1
fi
