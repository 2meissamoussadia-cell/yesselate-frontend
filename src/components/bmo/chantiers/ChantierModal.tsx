'use client';

/**
 * ChantierModal — Fiche chantier (Phases 6–8) : Général, Planning, Coûts, Points de suivi.
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { rowToFormData, formDataToRow } from './chantierFormUtils';
import type { ChantierRow, ChantierFormData } from './types';
import { Pencil } from 'lucide-react';

const inputClass = 'mt-1 bg-slate-900 border-slate-700 text-slate-100';
const labelClass = 'text-[0.7rem] text-slate-400';

export interface ChantierModalProps {
  open: boolean;
  onClose: () => void;
  chantier: ChantierRow | null;
  onSave?: (row: ChantierRow) => void;
}

export function ChantierModal({
  open,
  onClose,
  chantier,
  onSave,
}: ChantierModalProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ChantierFormData>({});

  React.useEffect(() => {
    if (chantier) {
      setFormData(rowToFormData(chantier));
      setEditing(false);
    }
  }, [chantier]);

  const update = useCallback(
    (field: keyof ChantierFormData, value: unknown) => {
      setFormData((d) => ({ ...d, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!chantier) return;
    const row = formDataToRow(formData, chantier.id);
    onSave?.(row);
    setEditing(false);
    onClose();
  }, [chantier, formData, onSave, onClose]);

  const handleCancelEdit = useCallback(() => {
    if (chantier) setFormData(rowToFormData(chantier));
    setEditing(false);
  }, [chantier]);

  if (!chantier) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader className="flex flex-row items-center justify-between gap-2 shrink-0">
          <DialogTitle className="text-sm font-semibold text-slate-100">
            {chantier.code} — {chantier.projet} ({chantier.lot})
          </DialogTitle>
          {!editing && onSave && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Modifier
            </Button>
          )}
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-2 flex-1 min-h-0 flex flex-col">
          <TabsList className="grid grid-cols-4 w-full text-[0.7rem] bg-slate-900/80 border border-slate-800 p-1 rounded-lg shrink-0">
            <TabsTrigger value="general" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              Général
            </TabsTrigger>
            <TabsTrigger value="planning" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              Planning
            </TabsTrigger>
            <TabsTrigger value="couts" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              Coûts
            </TabsTrigger>
            <TabsTrigger value="suivi" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              Points de suivi
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto min-h-0 flex-1 mt-4 pr-1 -mr-1">
            <TabsContent value="general" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>Maître d'ouvrage</Label>
                  <Input value={formData.maitreOuvrage ?? ''} onChange={(e) => update('maitreOuvrage', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Maître d'œuvre</Label>
                  <Input value={formData.maitreOeuvre ?? ''} onChange={(e) => update('maitreOeuvre', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Entreprise (titulaire)</Label>
                  <Input value={formData.entreprise ?? ''} onChange={(e) => update('entreprise', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Coordinateur BMO</Label>
                  <Input value={formData.coordinateur ?? ''} onChange={(e) => update('coordinateur', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Statut chantier</Label>
                  <Select value={formData.statut ?? ''} onValueChange={(v) => update('statut', v as ChantierFormData['statut'])} disabled={!editing}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {['Préparation', 'En cours', 'En retard', 'Suspendu', 'Clôturé'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Avancement (%)</Label>
                  <Input type="number" min={0} max={100} value={formData.avancement ?? ''} onChange={(e) => update('avancement', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={!editing} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="planning" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>Date début</Label>
                  <Input type="date" value={formData.dateDebut ?? ''} onChange={(e) => update('dateDebut', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Date fin prévue</Label>
                  <Input type="date" value={formData.dateFinPrevue ?? ''} onChange={(e) => update('dateFinPrevue', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Retard (jours)</Label>
                  <Input type="number" value={formData.retardJours ?? ''} onChange={(e) => update('retardJours', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={!editing} />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Jalons / planning</Label>
                <Textarea rows={3} value={formData.jalons ?? ''} onChange={(e) => update('jalons', e.target.value)} placeholder="Jalons clés, dates…" className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Pointage semaine</Label>
                <Input value={formData.pointageSemaine ?? ''} onChange={(e) => update('pointageSemaine', e.target.value)} placeholder="Dernier pointage" className={inputClass} readOnly={!editing} />
              </div>
            </TabsContent>

            <TabsContent value="couts" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>Budget lot (FCFA)</Label>
                  <Input type="number" value={formData.budgetLot ?? ''} onChange={(e) => update('budgetLot', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Réalisé (FCFA)</Label>
                  <Input type="number" value={formData.realise ?? ''} onChange={(e) => update('realise', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Écart budget</Label>
                  <Input
                    type="number"
                    value={((formData.realise ?? 0) - (formData.budgetLot ?? 0)) || ''}
                    readOnly
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Commentaire coûts</Label>
                <Textarea rows={2} value={formData.commentaireCouts ?? ''} onChange={(e) => update('commentaireCouts', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
            </TabsContent>

            <TabsContent value="suivi" className="mt-0 space-y-4">
              <div>
                <Label className={labelClass}>Réserves ouvertes</Label>
                <Input type="number" value={formData.reservesOuvertes ?? ''} onChange={(e) => update('reservesOuvertes', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Points de suivi / remarques</Label>
                <Textarea rows={4} value={formData.pointsSuivi ?? ''} onChange={(e) => update('pointsSuivi', e.target.value)} placeholder="Réunions de chantier, incidents, actions…" className={inputClass} readOnly={!editing} />
              </div>
            </TabsContent>
          </div>

          {editing && (
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>Annuler</Button>
              <Button type="button" size="sm" onClick={handleSave}>Enregistrer</Button>
            </div>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
