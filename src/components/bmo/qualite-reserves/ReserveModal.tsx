'use client';

/**
 * ReserveModal — Fiche réserve / punch list : identité, détail, gestion, photos, commentaires.
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { rowToFormData, formDataToRow } from './reserveFormUtils';
import type { ReserveRow, ReserveFormData } from './types';
import { Pencil } from 'lucide-react';

const inputClass = 'mt-1 bg-slate-900 border-slate-700 text-slate-100';
const labelClass = 'text-[0.7rem] text-slate-400';

export interface ReserveModalProps {
  open: boolean;
  onClose: () => void;
  /** null = mode création (nouvelle réserve) */
  reserve: ReserveRow | null;
  onSave?: (row: ReserveRow) => void;
}

export function ReserveModal({
  open,
  onClose,
  reserve,
  onSave,
}: ReserveModalProps) {
  const [editing, setEditing] = useState(!reserve);
  const [formData, setFormData] = useState<ReserveFormData>(() => reserve ? rowToFormData(reserve) : {});

  React.useEffect(() => {
    if (reserve) {
      setFormData(rowToFormData(reserve));
      setEditing(false);
    } else if (open) {
      setFormData({});
      setEditing(true);
    }
  }, [reserve, open]);

  const update = useCallback(
    (field: keyof ReserveFormData, value: unknown) => {
      setFormData((d) => ({ ...d, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    const row = formDataToRow(formData, reserve?.id);
    onSave?.(row);
    setEditing(false);
    onClose();
  }, [reserve?.id, formData, onSave, onClose]);

  const handleCancelEdit = useCallback(() => {
    if (reserve) setFormData(rowToFormData(reserve));
    else setFormData({});
    setEditing(false);
    if (!reserve) onClose();
  }, [reserve, onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader className="flex flex-row items-center justify-between gap-2 shrink-0">
          <DialogTitle className="text-sm font-semibold text-slate-100">
            {reserve ? `Réserve ${reserve.code} — ${reserve.chantier}` : 'Nouvelle réserve (punch list)'}
          </DialogTitle>
          {reserve && !editing && onSave && (
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" aria-hidden /> Modifier
            </Button>
          )}
        </DialogHeader>

        <div className="overflow-y-auto min-h-0 flex-1 mt-4 space-y-4 pr-1 -mr-1">
          {/* Identité */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-[0.7rem] font-medium text-slate-300 mb-3">Identité</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className={labelClass}>Code réserve</Label>
                <Input value={formData.code ?? ''} onChange={(e) => update('code', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Chantier</Label>
                <Input value={formData.chantier ?? ''} onChange={(e) => update('chantier', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Zone (bâtiment / niveau / pièce)</Label>
                <Input value={formData.zone ?? ''} onChange={(e) => update('zone', e.target.value)} placeholder="Bât A, R+2, pièce 204" className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Lot</Label>
                <Input value={formData.lot ?? ''} onChange={(e) => update('lot', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
            </div>
          </div>

          {/* Détail */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-[0.7rem] font-medium text-slate-300 mb-3">Détail</p>
            <div className="space-y-3">
              <div>
                <Label className={labelClass}>Description du défaut</Label>
                <Textarea rows={3} value={formData.description ?? ''} onChange={(e) => update('description', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className={labelClass}>Type</Label>
                  <Select value={formData.typeReserve ?? ''} onValueChange={(v) => update('typeReserve', v as ReserveFormData['typeReserve'])} disabled={!editing}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent>
                      {['structure', 'second œuvre', 'technique', 'finition', 'défaut qualité', 'sécurité', 'manque', 'essai KO'].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Priorité</Label>
                  <Select value={formData.priorite ?? ''} onValueChange={(v) => update('priorite', v as ReserveFormData['priorite'])} disabled={!editing}>
                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Critique', 'Haute', 'Moyenne', 'Basse'].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Gestion */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-[0.7rem] font-medium text-slate-300 mb-3">Gestion</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <Label className={labelClass}>Responsable (entreprise)</Label>
                <Input value={formData.responsable ?? ''} onChange={(e) => update('responsable', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Date détection</Label>
                <Input type="date" value={formData.dateDetection ?? ''} onChange={(e) => update('dateDetection', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Date cible levée</Label>
                <Input type="date" value={formData.dateCible ?? ''} onChange={(e) => update('dateCible', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Date levée réelle</Label>
                <Input type="date" value={formData.dateLeveeReelle ?? ''} onChange={(e) => update('dateLeveeReelle', e.target.value)} className={inputClass} readOnly={!editing} />
              </div>
              <div>
                <Label className={labelClass}>Statut</Label>
                <Select value={formData.statut ?? ''} onValueChange={(v) => update('statut', v as ReserveFormData['statut'])} disabled={!editing}>
                  <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Ouverte', 'En cours', 'Levée', 'Refusée'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Photos avant / après */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-[0.7rem] font-medium text-slate-300 mb-3">Photos avant / après</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Photos avant (lien ou référence)</Label>
                <Input
                  value={formData.photosAvant ?? formData.photosAvantApres ?? ''}
                  onChange={(e) => update('photosAvant', e.target.value)}
                  placeholder="Lien, fichier ou référence photo défaut"
                  className={inputClass}
                  readOnly={!editing}
                />
              </div>
              <div>
                <Label className={labelClass}>Photos après levée (lien ou référence)</Label>
                <Input
                  value={formData.photosApres ?? ''}
                  onChange={(e) => update('photosApres', e.target.value)}
                  placeholder="Lien, fichier ou référence après correction"
                  className={inputClass}
                  readOnly={!editing}
                />
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-[0.7rem] font-medium text-slate-300 mb-3">Commentaires MOE / MOA / entreprise</p>
            <Textarea
              rows={2}
              value={formData.commentairesMoe ?? ''}
              onChange={(e) => update('commentairesMoe', e.target.value)}
              placeholder="Commentaires MOE, MOA ou entreprise…"
              className={inputClass}
              readOnly={!editing}
            />
          </div>

          {/* Historique des actions (log structuré) */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className="text-[0.7rem] font-medium text-slate-300 mb-3">Historique des actions</p>
            <p className="text-[0.65rem] text-slate-400 mb-2">
              Une ligne par entrée : date — auteur — action (ex. 28/01/2026 — MOE — Contrôle effectué)
            </p>
            <Textarea
              rows={4}
              value={formData.historique ?? ''}
              onChange={(e) => update('historique', e.target.value)}
              placeholder={'28/01/2026 — MOE — Réserve ouverte\n29/01/2026 — Entreprise — Correction effectuée\n30/01/2026 — MOE — Contrôle OK, réserve levée'}
              className={`${inputClass} font-mono text-[0.75rem]`}
              readOnly={!editing}
            />
          </div>

          {editing && (
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>Annuler</Button>
              <Button type="button" size="sm" onClick={handleSave}>Enregistrer</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
