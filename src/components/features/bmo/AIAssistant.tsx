'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';

export function AIAssistant() {
  const { darkMode } = useAppStore();
  const { showAI, setShowAI, aiMessages, aiInput, setAiInput, addAiMessage, addToast } = useBMOStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Réponses prédéfinies de l'IA
  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('bonjour') || lowerInput.includes('salut')) {
      return 'Bonjour ! Je suis votre assistant BMO. Comment puis-je vous aider aujourd\'hui ?';
    }
    if (lowerInput.includes('demande') && lowerInput.includes('urgent')) {
      return 'Il y a actuellement 2 demandes urgentes en attente de validation. Voulez-vous que je vous les affiche ?';
    }
    if (lowerInput.includes('budget')) {
      return 'Le budget total des projets actifs est de 513.4M FCFA, dont 237.2M déjà dépensés (46%). Le projet le plus coûteux est l\'Extension usine SUNEOR (245M).';
    }
    if (lowerInput.includes('projet') && lowerInput.includes('bloqué')) {
      return 'Le projet PRJ-0014 (Extension usine SUNEOR) est actuellement bloqué depuis le 15/12/2025. Motif : Litige avec le client sur le paiement. Une action de substitution est recommandée.';
    }
    if (lowerInput.includes('validation') || lowerInput.includes('valider')) {
      return 'Vous avez 13 BC/Factures, 3 contrats et 5 paiements en attente de validation. Souhaitez-vous voir les plus urgents ?';
    }
    if (lowerInput.includes('statistique') || lowerInput.includes('stat')) {
      return 'Statistiques du mois : 92 validations effectuées, taux de validation 94.2%, temps de réponse moyen 2.4h, montant traité 45.2M FCFA.';
    }
    if (lowerInput.includes('aide') || lowerInput.includes('help')) {
      return 'Je peux vous aider avec :\n• État des demandes et projets\n• Statistiques et rapports\n• Navigation dans l\'application\n• Alertes et notifications\n• Substitutions et délégations\n\nQue souhaitez-vous savoir ?';
    }
    if (lowerInput.includes('substitution')) {
      return 'Il y a 4 dossiers bloqués nécessitant une substitution. Le plus urgent est PAY-2025-0041 (8.75M FCFA, 7 jours de retard). Voulez-vous intervenir ?';
    }
    if (lowerInput.includes('employé') || lowerInput.includes('effectif')) {
      return 'L\'effectif actuel est de 24 employés répartis sur 8 bureaux. 22 sont actifs, 1 en mission (C. GUEYE), 1 absent (R. SY en congé maladie).';
    }

    return 'Je comprends votre demande. Pour le moment, je peux vous aider avec les demandes, projets, budgets, validations et statistiques. Pouvez-vous préciser votre question ?';
  };

  const handleSend = () => {
    if (!aiInput.trim()) return;

    // Ajouter le message utilisateur
    addAiMessage({ type: 'user', text: aiInput });
    const userMessage = aiInput;
    setAiInput('');

    // Simuler la frappe de l'IA
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addAiMessage({ type: 'bot', text: getAIResponse(userMessage) });
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Suggestions rapides
  const suggestions = [
    'Demandes urgentes',
    'Budget projets',
    'Substitutions',
    'Statistiques',
  ];

  if (!showAI) {
    return (
      <button
        onClick={() => setShowAI(true)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg',
          'bg-gradient-to-r from-orange-500 to-amber-500',
          'flex items-center justify-center text-2xl',
          'hover:scale-110 transition-transform z-50',
          'animate-bounce'
        )}
      >
        🤖
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 w-80 h-[450px] rounded-xl shadow-2xl z-50',
        'flex flex-col overflow-hidden border',
        darkMode
          ? 'bg-slate-800 border-orange-500/30'
          : 'bg-white border-gray-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="font-bold text-white text-sm">Assistant BMO</h3>
            <p className="text-[10px] text-white/70">En ligne</p>
          </div>
        </div>
        <button
          onClick={() => setShowAI(false)}
          className="text-white/70 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiMessages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex',
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] p-2 rounded-lg text-xs',
                msg.type === 'user'
                  ? 'bg-orange-500 text-white rounded-br-none'
                  : darkMode
                  ? 'bg-slate-700 rounded-bl-none'
                  : 'bg-gray-100 rounded-bl-none'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Indicateur de frappe */}
        {isTyping && (
          <div className="flex justify-start">
            <div
              className={cn(
                'p-2 rounded-lg rounded-bl-none',
                darkMode ? 'bg-slate-700' : 'bg-gray-100'
              )}
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <span
                  className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {aiMessages.length <= 2 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-slate-400 mb-1">Suggestions :</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setAiInput(s);
                  setTimeout(handleSend, 100);
                }}
                className={cn(
                  'px-2 py-1 rounded text-[10px]',
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question..."
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-xs outline-none',
              darkMode
                ? 'bg-slate-700 placeholder:text-slate-400'
                : 'bg-gray-100 placeholder:text-gray-400'
            )}
          />
          <Button size="sm" onClick={handleSend} disabled={!aiInput.trim()}>
            ➤
          </Button>
        </div>
      </div>
    </div>
  );
}
