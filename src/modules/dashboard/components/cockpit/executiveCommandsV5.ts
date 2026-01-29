/**
 * V5 Ultimate — 12 commandes exécutives + raccourcis clavier
 * Aligné spec Cockpit DG V5 (Orange Money, Wave, Huissier UCIE, etc.)
 */

export type ExecutiveCommandV5 = {
  id: string;
  label: string;
  color: string;
  action: string;
  shortcut?: string; // e.g. 'Ctrl+Shift+E'
};

export const EXECUTIVE_COMMANDS_V5: ExecutiveCommandV5[] = [
  { id: 'emergency', label: '🚨 URGENCE', color: 'from-red-600 to-red-700', action: 'litige/redémarrage', shortcut: 'Ctrl+Shift+E' },
  { id: 'pay-orange', label: '🍊 Orange Money', color: 'from-orange-500 to-orange-600', action: 'paiement Orange Money', shortcut: 'Ctrl+Shift+O' },
  { id: 'pay-wave', label: '🌊 Wave', color: 'from-blue-500 to-blue-600', action: 'paiement Wave', shortcut: 'Ctrl+Shift+W' },
  { id: 'huissier', label: '📄 Huissier UCIE', color: 'from-purple-600 to-violet-600', action: 'certification UCIE', shortcut: 'Ctrl+Shift+H' },
  { id: 'contract', label: '📝 Contrat Auto', color: 'from-indigo-500 to-purple-500', action: 'génération contrat' },
  { id: 'call', label: '📞 Call Team', color: 'from-sky-500 to-cyan-500', action: 'webrtc équipe', shortcut: 'Ctrl+Shift+C' },
  { id: 'broadcast', label: '📢 Broadcast', color: 'from-teal-500 to-emerald-500', action: 'annonce équipes' },
  { id: 'boost', label: '⚡ BOOST', color: 'from-yellow-500 to-orange-500', action: 'prioriser/ressources' },
  { id: 'relance', label: '🔄 Relance Auto', color: 'from-cyan-500 to-blue-500', action: 'relance fournisseurs/clients' },
  { id: 'forecast', label: '📈 Forecast IA', color: 'from-pink-500 to-rose-600', action: 'prédiction IA', shortcut: 'Ctrl+Shift+F' },
  { id: 'report', label: '📊 Rapport DG', color: 'from-fuchsia-500 to-pink-500', action: 'export rapport PDF' },
  { id: 'archive', label: '🗄️ Archiver', color: 'from-slate-600 to-gray-600', action: 'archiver dossiers terminés' },
];

/** Raccourci clavier → index dans EXECUTIVE_COMMANDS_V5 */
export const SHORTCUT_TO_INDEX: Record<string, number> = {
  'Ctrl+Shift+E': 0,
  'Ctrl+Shift+O': 1,
  'Ctrl+Shift+W': 2,
  'Ctrl+Shift+H': 3,
  'Ctrl+Shift+C': 5,
  'Ctrl+Shift+F': 9,
};

export function getCommandByShortcut(shortcut: string): ExecutiveCommandV5 | undefined {
  const index = SHORTCUT_TO_INDEX[shortcut];
  return index !== undefined ? EXECUTIVE_COMMANDS_V5[index] : undefined;
}

export function matchShortcut(e: KeyboardEvent): string | null {
  if (!e.ctrlKey && !e.metaKey) return null;
  if (!e.shiftKey) return null;
  const key = e.key.toUpperCase();
  if (key.length !== 1) return null;
  const mod = e.metaKey ? 'Cmd' : 'Ctrl';
  const s = `${mod}+Shift+${key}`;
  return SHORTCUT_TO_INDEX[s] !== undefined ? s : null;
}
