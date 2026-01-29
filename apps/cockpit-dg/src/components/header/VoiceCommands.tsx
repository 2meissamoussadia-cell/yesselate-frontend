'use client';

import { useCallback, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function VoiceCommands() {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleListening = useCallback(() => {
    if (typeof window === 'undefined' || (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window))) {
      setError('Reconnaissance vocale non supportée');
      return;
    }
    setError(null);

    if (listening) {
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as unknown as { webkitSpeechRecognition?: typeof globalThis.SpeechRecognition; SpeechRecognition?: typeof globalThis.SpeechRecognition }).webkitSpeechRecognition ?? (window as unknown as { SpeechRecognition?: typeof globalThis.SpeechRecognition }).SpeechRecognition;
    if (!SpeechRecognition) {
      setError('API non disponible');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError('Erreur micro');
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ');
      if (transcript) {
        // Exemple: "ouvrir chantiers" → navigation
        const lower = transcript.toLowerCase();
        if (lower.includes('chantier')) window.location.href = '/chantiers';
        else if (lower.includes('workflow')) window.location.href = '/workflow';
        else if (lower.includes('tableau') || lower.includes('dashboard')) window.location.href = '/';
      }
    };

    recognition.start();
  }, [listening]);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleListening}
        aria-label={listening ? 'Arrêter la reconnaissance vocale' : 'Démarrer la reconnaissance vocale'}
        className={cn(listening && 'bg-danger/10 text-danger')}
      >
        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      {error && (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
