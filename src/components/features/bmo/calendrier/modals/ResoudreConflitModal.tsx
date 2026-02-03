'use client';

/**
 * Modale de résolution de conflit
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Conflit, SuggestionResolution } from '@/lib/types/calendrier.types';

interface ResoudreConflitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    action: 'deplacer' | 'fusionner' | 'desassigner' | 'arbitrer';
    elementId?: string;
    nouveauCreneau?: { start: string; end: string };
    commentaire?: string;
  }) => void;
  conflit: Conflit;
}

export function ResoudreConflitModal({
  isOpen,
  onClose,
  onSave,
  conflit,
}: ResoudreConflitModalProps) {
  const [action, setAction] = useState<'deplacer' | 'fusionner' | 'desassigner' | 'arbitrer'>('deplacer');
  const [elementId, setElementId] = useState('');
  const [nouvelleDate, setNouvelleDate] = useState('');
  const [nouvelleHeure, setNouvelleHeure] = useState('');
  const [commentaire, setCommentaire] = useState('');

  const handleSave = () => {
    const nouveauCreneau = action === 'deplacer' && nouvelleDate && nouvelleHeure
      ? {
          start: `${nouvelleDate}T${nouvelleHeure}:00`,
          end: `${nouvelleDate}T${nouvelleHeure}:00`,
        }
      : undefined;

    onSave({
      action,
      elementId: action !== 'arbitrer' ? elementId : undefined,
      nouveauCreneau,
      commentaire: commentaire.trim() || undefined,
    });
    // Reset
    setAction('deplacer');
    setElementId('');
    setNouvelleDate('');
    setNouvelleHeure('');
    setCommentaire('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-200">Résoudre le conflit</DialogTitle>
          <DialogDescription className="text-slate-400">
            Conflit de type: {conflit.type}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Éléments en conflit */}
          <div>
            <Label className="text-slate-300">Éléments en conflit</Label>
            <div className="mt-2 space-y-2">
              {conflit.elements.map((el, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-800/50 border border-slate-700 rounded text-sm"
                >
                  <div className="font-medium text-slate-200">{el.label}</div>
                  <div className="text-xs text-slate-400">
                    {el.moduleSource} • {new Date(el.date).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions IA */}
          {conflit.suggestions && conflit.suggestions.length > 0 && (
            <div>
              <Label className="text-slate-300">Suggestions IA</Label>
              <div className="mt-2 space-y-2">
                {conflit.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm"
                  >
                    <div className="font-medium text-blue-400">{suggestion.description}</div>
                    {suggestion.nouveauCreneau && (
                      <div className="text-xs text-slate-400 mt-1">
                        Créneau suggéré: {new Date(suggestion.nouveauCreneau.start).toLocaleString('fr-FR')}
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setAction(suggestion.type);
                        if (suggestion.elementId) setElementId(suggestion.elementId);
                        if (suggestion.nouveauCreneau) {
                          const date = new Date(suggestion.nouveauCreneau.start);
                          setNouvelleDate(date.toISOString().split('T')[0]);
                          setNouvelleHeure(date.toTimeString().slice(0, 5));
                        }
                      }}
                    >
                      Utiliser cette suggestion
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          <div>
            <Label htmlFor="action" className="text-slate-300">Action *</Label>
            <Select value={action} onValueChange={(v: any) => setAction(v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="deplacer">Déplacer</SelectItem>
                <SelectItem value="fusionner">Fusionner</SelectItem>
                <SelectItem value="desassigner">Désassigner</SelectItem>
                <SelectItem value="arbitrer">Arbitrer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Élément à modifier (si pas arbitrer) */}
          {action !== 'arbitrer' && (
            <div>
              <Label htmlFor="elementId" className="text-slate-300">Élément à modifier *</Label>
              <Select value={elementId} onValueChange={setElementId}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                  <SelectValue placeholder="Sélectionner un élément" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {conflit.elements.map((el, idx) => (
                    <SelectItem key={idx} value={el.id}>
                      {el.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nouveau créneau (si déplacer) */}
          {action === 'deplacer' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nouvelleDate" className="text-slate-300">Nouvelle date *</Label>
                <Input
                  id="nouvelleDate"
                  type="date"
                  value={nouvelleDate}
                  onChange={(e) => setNouvelleDate(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nouvelleHeure" className="text-slate-300">Nouvelle heure *</Label>
                <Input
                  id="nouvelleHeure"
                  type="time"
                  value={nouvelleHeure}
                  onChange={(e) => setNouvelleHeure(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                />
              </div>
            </div>
          )}

          {/* Commentaire */}
          <div>
            <Label htmlFor="commentaire" className="text-slate-300">Commentaire</Label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaire sur la résolution"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              (action !== 'arbitrer' && !elementId) ||
              (action === 'deplacer' && (!nouvelleDate || !nouvelleHeure))
            }
          >
            Résoudre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

