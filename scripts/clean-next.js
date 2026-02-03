/**
 * Supprime le dossier .next (cache Next.js) pour un redémarrage propre.
 * Utilisé par: yarn dev:clean / pnpm dev:clean
 */
const fs = require('fs');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('Cache .next supprimé.');
} else {
  console.log('Pas de dossier .next.');
}
