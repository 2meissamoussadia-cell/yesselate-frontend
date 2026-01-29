/**
 * WhatsApp Business — Envoyer message client.
 * Templates : "Chantier avance bien", "Besoin validation", message personnalisé.
 */

'use client';

import React, { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChantierMock } from '../../data/chantiersMock';

const WHATSAPP_TEMPLATES = [
  {
    id: 'chantier_avance_bien',
    label: 'Chantier avance bien',
    text: (c: ChantierMock) =>
      `Bonjour,\n\nLe chantier ${c.id} (${c.prestation} - Phase ${c.phase}) avance bien. Nous vous tiendrons informé.`,
  },
  {
    id: 'besoin_validation',
    label: 'Besoin validation',
    text: (c: ChantierMock) =>
      `Bonjour,\n\nChantier ${c.id} : nous avons besoin d'une validation de votre part pour la suite des travaux (Phase ${c.phase}). Merci de nous contacter.`,
  },
  {
    id: 'point_avancement',
    label: 'Point avancement',
    text: (c: ChantierMock) =>
      `Point d'avancement - ${c.id} : Phase ${c.phase}, santé projet ${(c.sante * 100).toFixed(0)}%. Bureau contrôle ${c.bureauControle}.`,
  },
] as const;

export interface ChantierWhatsAppModalProps {
  chantier: ChantierMock;
  onClose: () => void;
}

/** Numéro WhatsApp Business (demo : sans préfixe pays si vide) */
const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE || '221771234567';

export function ChantierWhatsAppModal({ chantier, onClose }: ChantierWhatsAppModalProps) {
  const [customMessage, setCustomMessage] = useState('');

  const openWhatsApp = (text: string) => {
    const cleanPhone = WHATSAPP_PHONE.replace(/\D/g, '');
    const num = cleanPhone.startsWith('221') ? cleanPhone : `221${cleanPhone}`;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleTemplate = (templateId: string) => {
    const t = WHATSAPP_TEMPLATES.find((x) => x.id === templateId);
    if (t) openWhatsApp(t.text(chantier));
  };

  const handleCustom = () => {
    const text = customMessage.trim() || `Chantier ${chantier.id} - ${chantier.prestation}`;
    openWhatsApp(text);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div
        className={cn(
          'w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <MessageCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h2 id="whatsapp-modal-title" className="text-base font-semibold text-slate-100 truncate">
                Envoyer message WhatsApp
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {chantier.id} • Client / Chef chantier
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-400">
            Choisissez un modèle ou écrivez votre message. L&apos;application WhatsApp s&apos;ouvrira avec le texte pré-rempli.
          </p>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Modèles</p>
            <div className="space-y-2">
              {WHATSAPP_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplate(t.id)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-sm rounded-xl border transition-colors',
                    'border-slate-700/60 bg-slate-800/50 text-slate-200 hover:bg-slate-800/80 hover:border-emerald-500/30'
                  )}
                >
                  <span className="font-medium">{t.label}</span>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.text(chantier).slice(0, 80)}…</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Message personnalisé</p>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Écrire un message client…"
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
            <Button
              size="sm"
              onClick={handleCustom}
              className="mt-2 gap-2 w-full sm:w-auto border-emerald-500/30 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            >
              <Send className="h-4 w-4" />
              Envoyer message client
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
