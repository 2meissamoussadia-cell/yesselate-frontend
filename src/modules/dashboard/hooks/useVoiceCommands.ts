/**
 * Phase 3 #23 — Commandes vocales (Web Speech API)
 * Écoute des mots-clés : actualiser, exporter, mode focus, palette, raccourcis
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const KEYWORDS: Record<string, (store: ReturnType<typeof useDashboardCommandCenterStore.getState>) => void> = {
  actualiser: (s) => s.invalidateAllViews?.(),
  rafraîchir: (s) => s.invalidateAllViews?.(),
  exporter: (s) => s.openModal?.('export'),
  export: (s) => s.openModal?.('export'),
  focus: (s) => s.setDisplayConfig?.({ focusMode: true }),
  mode_focus: (s) => s.setDisplayConfig?.({ focusMode: true }),
  palette: (s) => s.toggleCommandPalette?.(),
  raccourcis: (s) => s.openModal?.('shortcuts'),
  aide: (s) => s.openModal?.('shortcuts'),
};

function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  return SR ? new (SR as new () => SpeechRecognition)() : null;
}

export function useVoiceCommands(enabled: boolean) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  const runAction = useCallback((transcript: string) => {
    const normalized = transcript
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    for (const [keyword, action] of Object.entries(KEYWORDS)) {
      const kw = keyword.replace(/_/g, ' ');
      if (normalized.includes(kw)) {
        const state = useDashboardCommandCenterStore.getState();
        action(state);
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const rec = getSpeechRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    setSupported(true);
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'fr-FR';

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      runAction(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [enabled, runAction]);

  const startListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || listening) return;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || !listening) return;
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, [listening]);

  return { supported, listening, startListening, stopListening };
}
