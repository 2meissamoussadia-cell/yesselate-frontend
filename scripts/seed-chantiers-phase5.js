/**
 * Phase 5 — Seed chantiers NICE RÉNOVATION
 * Crée des chantiers réalistes (100 par défaut). Pour 42k : augmenter COUNT + PostgreSQL.
 *
 * Usage:
 *   node scripts/seed-chantiers-phase5.js
 *   COUNT=1000 node scripts/seed-chantiers-phase5.js
 *
 * Prérequis: prisma migrate deploy ou prisma db push
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SEGMENTS = ['DIASPORA', 'COMMERCANTS', 'COMMERCE_INFORMEL', 'ETABLISSEMENTS', 'PARTICULIERS'];
const PRESTATIONS = ['Rénovation', 'Réparations', 'Neuf'];
const PHASES = Array.from({ length: 26 }, (_, i) => i + 1);

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function calculateSante(c) {
  let score = 1.0;
  if (c.phase >= 16 && c.phase <= 21) score *= 0.7;
  if ((c.stockPeinture ?? 1) < 0.05) score *= 0.3;
  const bc = c.bureauControle ?? '';
  if (bc.includes('✗') || bc.startsWith('0/') || bc.startsWith('1/3')) score *= 0.6;
  if ((c.photosManquantes ?? 0) > 3) score *= 0.5;
  return Math.max(0.1, score);
}

async function main() {
  const count = Math.min(parseInt(process.env.COUNT || '100', 10) || 100, 50_000);

  console.log('🌱 Phase 5 — Seed chantiers NICE RÉNOVATION');
  console.log(`   Création de ${count} chantiers…`);

  try {
    await prisma.chantier.deleteMany();
  } catch (e) {
    console.error('❌ Table chantiers absente. Exécutez: npx prisma migrate deploy ou npx prisma db push');
    process.exit(1);
  }

  const created = [];
  for (let i = 0; i < count; i++) {
    const numero = `RENOV-${String(i + 1).padStart(5, '0')}`;
    const segment = randomItem(SEGMENTS);
    const prestation = randomItem(PRESTATIONS);
    const phase = randomItem(PHASES);
    const ca = 500_000 + Math.random() * 2_500_000;
    const marge = 0.15 + Math.random() * 0.25;
    const stockPeinture = Math.random();
    const bureauControle = Math.random() > 0.3 ? '2/3 ✓' : '1/3 ✗';
    const photosManquantes = Math.floor(Math.random() * 10);
    const sante = calculateSante({ phase, stockPeinture, bureauControle, photosManquantes });

    const c = await prisma.chantier.create({
      data: {
        numero,
        segment,
        prestation,
        phase,
        ca,
        marge,
        sante,
        stockPeinture,
        bureauControle,
        photosManquantes,
      },
    });
    created.push(c.id);
    if ((i + 1) % 500 === 0) console.log(`   ${i + 1}/${count} chantiers créés`);
  }

  console.log(`✅ ${created.length} chantiers créés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
