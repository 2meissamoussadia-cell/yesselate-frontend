/**
 * V5 Ultimate — Executive Controls
 * 12 boutons 1-clic + raccourcis clavier + commandes vocales FR/EN/Wolof (fuzzy match).
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import {
  EXECUTIVE_COMMANDS_V5,
  getCommandByShortcut,
  matchShortcut,
  type ExecutiveCommandV5,
} from './executiveCommandsV5';
import {
  detectVoiceCommand,
  getVoiceSuggestions,
  VOICE_LANG_CODES,
  type VoiceLang,
} from './voiceCommandsV5';

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

/** Sons courts pour feedback vocal (accept = succès, error = non reconnu) */
function playBeep(type: 'accept' | 'error') {
  if (typeof window === 'undefined' || !window.AudioContext && !(window as any).webkitAudioContext) return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'accept' ? 880 : 440;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (type === 'accept' ? 0.15 : 0.25));
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (type === 'accept' ? 0.15 : 0.25));
  } catch {
    // ignore
  }
}

export function ExecutiveControls() {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [voiceConfidence, setVoiceConfidence] = useState(0);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLang>('fr');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const suggestions = getVoiceSuggestions();

  const executeCommand = useCallback((command: ExecutiveCommandV5) => {
    setActiveCommand(command.id);
    setLastCommand(command.label);

    switch (command.id) {
      case 'pay-orange':
        fetch('/api/payments/orange-money', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 0, currency: 'XOF', reference: 'cockpit-dg' }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success) setLastCommand(`Orange Money: ${data.transactionId ?? 'OK'}`);
          })
          .catch(() => setActiveCommand(null));
        break;
      case 'pay-wave':
        fetch('/api/payments/wave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 0, currency: 'XOF', reference: 'cockpit-dg' }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success) setLastCommand(`Wave: ${data.transactionId ?? 'OK'}`);
          })
          .catch(() => setActiveCommand(null));
        break;
      case 'huissier':
        fetch('/api/huissier/certify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'certification' }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success) setLastCommand(`Huissier: ${data.pdfUrl ?? data.message ?? 'OK'}`);
          })
          .catch(() => setActiveCommand(null));
        break;
      case 'contract':
        fetch('/api/cockpit/contract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'chantier' }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success) setLastCommand(`Contrat: ${data.contractId ?? data.message ?? 'OK'}`);
          })
          .catch(() => setActiveCommand(null));
        break;
      case 'broadcast':
        fetch('/api/cockpit/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Annonce Cockpit DG', scope: 'all', priority: 'normal' }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success) setLastCommand(`Broadcast: ${data.broadcastId ?? data.message ?? 'OK'}`);
          })
          .catch(() => setActiveCommand(null));
        break;
      default:
        break;
    }

    setTimeout(() => {
      setActiveCommand(null);
    }, 2000);
  }, []);

  const executeAndCloseActions = useCallback(
    (command: ExecutiveCommandV5) => {
      executeCommand(command);
      setShowActionsPanel(false);
    },
    [executeCommand]
  );

  const startVoice = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
      setVoiceActive(false);
      setLastTranscript(null);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = VOICE_LANG_CODES[voiceLang];
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = (event.results[last]?.[0]?.transcript ?? '').trim();
      const confidence = event.results[last]?.[0]?.confidence ?? 0;
      setLastTranscript(transcript);
      setVoiceConfidence(confidence);

      if (!transcript) return;

      const detected = detectVoiceCommand(transcript);
      if (detected) {
        playBeep('accept');
        executeCommand(detected.command);
      } else if (transcript.toLowerCase().includes('phase 4') || transcript.toLowerCase().includes('phase4')) {
        playBeep('accept');
      } else if (transcript.length > 2) {
        playBeep('error');
      }
    };

    recognition.onerror = () => {
      setVoiceActive(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setVoiceActive(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setVoiceActive(true);
    setLastTranscript(null);
    recognition.start();
  }, [executeCommand, voiceLang]);

  // Raccourcis clavier V5 (? aide, Ctrl+Shift+V voix, shortcuts commandes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShowShortcutsHelp((prev) => !prev);
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        setShowShortcutsHelp(false);
        return;
      }
      if ((e.key === 'V' || e.key === 'v') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        startVoice();
        return;
      }
      const shortcut = matchShortcut(e);
      if (!shortcut) return;
      const cmd = getCommandByShortcut(shortcut);
      if (cmd) {
        e.preventDefault();
        executeCommand(cmd);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeCommand, startVoice]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 w-full min-w-0 max-w-[100vw] min-h-[72px] overflow-x-hidden overflow-y-auto bg-gradient-to-r from-slate-950/98 to-gray-950/98 backdrop-blur-2xl border-t-2 border-slate-700/50 shadow-2xl px-2 sm:px-4 py-2 flex flex-wrap items-center justify-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      role="toolbar"
      aria-label="Commandes exécutives V5"
    >
      {/* Aide raccourcis — touch 44px min */}
      <button
        type="button"
        onClick={() => setShowShortcutsHelp((prev) => !prev)}
        title="Aide raccourcis (?)"
        aria-label="Afficher les raccourcis clavier. Appuyez sur ? pour ouvrir ou fermer."
        aria-expanded={showShortcutsHelp}
        className="shrink-0 min-h-[44px] min-w-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg font-bold text-slate-400 bg-slate-800/60 border border-slate-600/50 hover:bg-slate-700/60 hover:text-slate-200 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 touch-manipulation"
      >
        ?
      </button>

      {/* Langue vocale FR | EN | WO — touch 44px min */}
      <div className="shrink-0 flex rounded-xl overflow-hidden border border-slate-600/50 bg-slate-800/60 min-h-[44px]">
        {(['fr', 'en', 'wo'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setVoiceLang(lang)}
            title={
              lang === 'fr'
                ? 'Reconnaissance en français'
                : lang === 'en'
                  ? 'Speech recognition in English'
                  : 'Reconnaissance Wolof (patterns fr-FR)'
            }
            aria-pressed={voiceLang === lang}
            className={`min-h-[44px] min-w-[44px] px-2 sm:px-3 py-2 text-[10px] font-bold uppercase transition-colors touch-manipulation ${
              voiceLang === lang ? 'bg-blue-500/30 text-blue-300' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {lang === 'fr' ? 'FR' : lang === 'en' ? 'EN' : 'WO'}
          </button>
        ))}
      </div>
      {/* Voice control — touch 44px min */}
      <button
        type="button"
        onClick={startVoice}
        title="Commandes vocales (FR/EN/Wolof)"
        aria-label={voiceActive ? 'Arrêter l\'écoute vocale' : 'Activer les commandes vocales (FR/EN/Wolof)'}
        aria-pressed={voiceActive}
        className={`shrink-0 min-h-[44px] min-w-[44px] w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 touch-manipulation ${
          voiceActive
            ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse shadow-red-500/50'
            : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-blue-500 hover:to-purple-500'
        }`}
      >
        {voiceActive ? '🎙️' : '🎤'}
      </button>

      {/* Bouton Actions — touch 44px min (pattern Odoo : tout dans un menu) */}
      <div className="shrink-0 relative">
        <button
          type="button"
          onClick={() => setShowActionsPanel((prev) => !prev)}
          title="Actions rapides (Urgence, Paiements, Huissier, etc.)"
          aria-label="Ouvrir le panneau d’actions rapides"
          aria-expanded={showActionsPanel}
          className="min-h-[44px] min-w-[44px] h-12 sm:h-14 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-slate-600 to-slate-700 border-2 border-slate-500/50 hover:border-white/50 hover:from-slate-500 hover:to-slate-600 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 flex items-center gap-2 touch-manipulation"
        >
          <span>Actions</span>
          <span className={showActionsPanel ? 'rotate-180' : ''}>▼</span>
        </button>
      </div>

      {/* Panneau Actions (style Odoo : modal avec grille, pas de scroll horizontal) */}
      {showActionsPanel && (
        <div
          className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="actions-panel-title"
          onClick={() => setShowActionsPanel(false)}
        >
          <div
            className="w-full max-w-[min(100vw,36rem)] max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-slate-700/60 bg-slate-900/98 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-900/98 z-10">
              <h2 id="actions-panel-title" className="text-base font-semibold text-slate-100">
                Actions rapides
              </h2>
              <button
                type="button"
                onClick={() => setShowActionsPanel(false)}
                aria-label="Fermer"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EXECUTIVE_COMMANDS_V5.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  onClick={() => executeAndCloseActions(command)}
                  title={command.shortcut ? `${command.label} — ${command.shortcut}` : command.label}
                  aria-label={`${command.label}, ${command.action}`}
                  className={`group relative rounded-xl font-bold text-xs sm:text-sm min-h-[44px] py-3 px-3 border-2 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 touch-manipulation ${
                    activeCommand === command.id
                      ? `bg-gradient-to-r ${command.color} border-white/50 animate-pulse`
                      : `bg-gradient-to-r ${command.color} bg-opacity-20 border-slate-600/50 hover:border-white/50 hover:bg-opacity-30`
                  } ${lastCommand === command.label ? 'ring-2 ring-green-500/50' : ''}`}
                >
                  <span className="block truncate text-left">{command.label}</span>
                  {command.shortcut && (
                    <span className="absolute bottom-1 right-2 text-[9px] opacity-50 font-mono">
                      {command.shortcut.replace('Ctrl+Shift+', '⌘')}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live transcript + suggestions (quand micro actif) */}
      {voiceActive && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 min-w-[280px] max-w-[90vw] rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">En écoute…</span>
          </div>
          <p className="text-sm font-medium text-white truncate">{lastTranscript || 'Parlez…'}</p>
          {voiceConfidence > 0 && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                style={{ width: `${Math.round(voiceConfidence * 100)}%` }}
              />
            </div>
          )}
          <p className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">Ex: {suggestions.slice(0, 3).join(', ')}</p>
        </div>
      )}

      {/* Dernière commande exécutée (feedback) */}
      {!voiceActive && lastCommand && !showShortcutsHelp && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/40 text-xs font-medium text-green-400">
          Dernière: {lastCommand}
        </div>
      )}

      {/* Aide raccourcis (touche ? ou bouton) */}
      {showShortcutsHelp && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-help-title"
          onClick={() => setShowShortcutsHelp(false)}
        >
          <div
            className="rounded-2xl border border-slate-700/60 bg-slate-900/98 shadow-2xl max-w-md w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
              <h2 id="shortcuts-help-title" className="text-base font-semibold text-slate-100">
                Raccourcis Cockpit V5
              </h2>
              <button
                type="button"
                onClick={() => setShowShortcutsHelp(false)}
                aria-label="Fermer l’aide"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Échap
              </button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {EXECUTIVE_COMMANDS_V5.filter((c) => c.shortcut).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-200">{c.label}</span>
                  <kbd className="shrink-0 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs">
                    {c.shortcut?.replace('Ctrl', 'Ctrl')}
                  </kbd>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-800/60 text-xs text-slate-400 space-y-1">
              <p><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400">?</kbd> Afficher cette aide</p>
              <p><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400">Échap</kbd> Fermer</p>
              <p><kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400">Ctrl+Shift+V</kbd> Activer / arrêter la voix</p>
              <p className="mt-2 text-slate-400">Voix (FR / EN / WO) : « urgence », « huissier », « call team », « orange money », « wave », « forecast »…</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
