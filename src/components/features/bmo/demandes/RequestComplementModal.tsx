'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Send, Paperclip, Clock } from 'lucide-react';
import type { Demand } from '@/lib/types/bmo.types';

interface RequestComplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  demand: Demand | null;
  onSend: (message: string, attachments?: File[]) => void;
}

export function RequestComplementModal({
  isOpen,
  onClose,
  demand,
  onSend,
}: RequestComplementModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  if (!isOpen || !demand) return null;

  // Message prérempli par défaut
  const defaultMessage = `Bonjour,\n\nJe vous contacte concernant la demande ${demand.id}.\n\nPourriez-vous fournir les compléments suivants :\n\n- \n- \n\nMerci de votre collaboration.\n\nCordialement.`;

  const handleSend = () => {
    const finalMessage = message || defaultMessage;
    if (!finalMessage.trim()) {
      addToast('Veuillez saisir un message', 'warning');
      return;
    }
    onSend(finalMessage, attachments);
    setMessage('');
    setAttachments([]);
    addToast('Demande de complément envoyée avec succès', 'success');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <Card className={cn(
          'w-full max-w-2xl',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              📎 Demander un complément
              <Badge variant="info">{demand.id}</Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Informations demande */}
            <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
              <p className="font-semibold text-sm mb-1">{demand.subject}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Type: {demand.type}</span>
                <span>•</span>
                <span>Bureau: {demand.bureau}</span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-medium mb-2 block">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={defaultMessage}
                className={cn(
                  'w-full p-3 rounded-lg text-sm',
                  darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                )}
                rows={8}
              />
            </div>

            {/* Pièces jointes */}
            <div>
              <label className="text-xs font-medium mb-2 block flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                Pièces jointes (optionnel)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className={cn(
                  'w-full p-2 rounded-lg text-xs',
                  darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                )}
              />
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {attachments.map((file, idx) => (
                    <Badge key={idx} variant="default" className="text-xs">
                      {file.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Historique des relances */}
            <div>
              <label className="text-xs font-medium mb-2 block flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Historique des relances
              </label>
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <p className="text-xs text-slate-400">Aucune relance précédente</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-700/50">
              <Button
                variant="default"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSend}
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

