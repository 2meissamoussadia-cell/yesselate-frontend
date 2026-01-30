'use client';

/**
 * ReceptionModal — Fiche réception (Phase 9) : PV réception, Réserves, DOE.
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
import { rowToFormData, formDataToRow } from './receptionFormUtils';
import type { ReceptionRow, ReceptionFormData } from './types';
import { Pencil } from 'lucide-react';

const inputClass = 'mt-1 bg-slate-900 border-slate-700 text-slate-100';
const labelClass = 'text-[0.7rem] text-slate-400';

export interface ReceptionModalProps {
  open: boolean;
  onClose: () => void;
  reception: ReceptionRow | null;
  onSave?: (row: ReceptionRow) => void;
}

export function ReceptionModal({
  open,
  onClose,
  reception,
  onSave,
}: ReceptionModalProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ReceptionFormData>({});

  React.useEffect(() => {
    if (reception) {
      setFormData(rowToFormData(reception));
      setEditing(false);
    }
  }, [reception]);

  const update = useCallback(
    (field: keyof ReceptionFormData, value: unknown) => {
      setFormData((d) => ({ ...d, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!reception) return;
    const row = formDataToRow(formData, reception.id);
    onSave?.(row);
    setEditing(false);
    onClose();
  }, [reception, formData, onSave, onClose]);

  const handleCancelEdit = useCallback(() => {
    if (reception) setFormData(rowToFormData(reception));
    setEditing(false);
  }, [reception]);

  if (!reception) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader className="flex flex-row items-center justify-between gap-2 shrink-0">
          <DialogTitle className="text-sm font-semibold text-slate-100">
            {reception.code} — {reception.projet} ({reception.typeReception})
          </DialogTitle>
          {!editing && onSave && (
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" aria-hidden /> Modifier
            </Button>
          )}
        </DialogHeader>

        <Tabs defaultValue="pv" className="mt-2 flex-1 min-h-0 flex flex-col">
          <TabsList className="grid grid-cols-3 w-full text-[0.7rem] bg-slate-900/80 border border-slate-800 p-1 rounded-lg shrink-0">
            <TabsTrigger value="pv" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">PV réception</TabsTrigger>
            <TabsTrigger value="reserves" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">Réserves</TabsTrigger>
            <TabsTrigger value="doe" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">DOE</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto min-h-0 flex-1 mt-4 pr-1 -mr-1">
            <TabsContent value="pv" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>Type réception</Label>
                  <Select value={formData.typeReception ?? ''} onValueChange={(v) => update('typeReception', v as ReceptionFormData['typeReception'])} disabled={!editing}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Provisoire">Provisoire</SelectItem>
                      <SelectItem value="Définitive">Définitive</SelectItem>
                      <SelectItem value="Lot">Lot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Date réception</Label>
                  <Input type="date" value={formData.dateReception ?? formData.datePV ?? ''} onChange={(e) => { update('dateReception', e.target.value); update('datePV', e.target.value); }} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Lieu</Label>
                  <Input value={formData.lieu ?? ''} onChange={(e) => update('lieu', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Statut</Label>
                  <Select value={formData.statut ?? ''} onValueChange={(v) => update('statut', v as ReceptionFormData['statut'])} disabled={!editing}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['À planifier', 'Planifiée', 'Réalisée', 'Avec réserves', 'Levée'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className={labelClass}>Participants</Label>
                <Input value={formData.participants ?? ''} onChange={(e) => update('participants', e.target.value)} placeholder="MOA, MOE, entreprise…" className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Constats PV</Label>
                <Textarea rows={3} value={formData.constatsPV ?? ''} onChange={(e) => update('constatsPV', e.target.value)} placeholder="Constats, réserves identifiées…" className={inputClass} readOnly={!editing} />
              </div>
            </TabsContent>

            <TabsContent value="reserves" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>Nb réserves</Label>
                  <Input type="number" value={formData.nbReserves ?? ''} onChange={(e) => update('nbReserves', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Réserves levées</Label>
                  <Input type="number" value={formData.reservesLevees ?? ''} onChange={(e) => update('reservesLevees', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Délai levée</Label>
                  <Input value={formData.delaiLevee ?? ''} onChange={(e) => update('delaiLevee', e.target.value)} placeholder="Date ou délai" className={inputClass} readOnly={!editing} />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Liste des réserves</Label>
                <Textarea rows={4} value={formData.listeReserves ?? ''} onChange={(e) => update('listeReserves', e.target.value)} placeholder="Réserves avec statut (ouverte / levée)…" className={inputClass} readOnly={!editing} />
              </div>
            </TabsContent>

            <TabsContent value="doe" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>DOE remis</Label>
                  <Select value={formData.doeRemis ?? ''} onValueChange={(v) => update('doeRemis', v as ReceptionFormData['doeRemis'])} disabled={!editing}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oui">Oui</SelectItem>
                      <SelectItem value="Non">Non</SelectItem>
                      <SelectItem value="Partiel">Partiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Référence DOE</Label>
                  <Input value={formData.doeReference ?? ''} onChange={(e) => update('doeReference', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
                <div>
                  <Label className={labelClass}>Date remise DOE</Label>
                  <Input type="date" value={formData.doeDateRemise ?? ''} onChange={(e) => update('doeDateRemise', e.target.value)} className={inputClass} readOnly={!editing} />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Commentaire DOE</Label>
                <Textarea rows={2} value={formData.commentaireDoe ?? ''} onChange={(e) => update('commentaireDoe', e.target.value)} className={inputClass} readOnly={!editing} />
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
