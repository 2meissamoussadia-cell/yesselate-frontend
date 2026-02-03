'use client';

/**
 * DesignModal — Fiche projet Études & Conception (ESQ, APS, APD, Coûts & surfaces).
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
import { rowToFormData, formDataToRow } from './designFormUtils';
import type { DesignProjectRow, DesignFormData } from './types';
import { Pencil } from 'lucide-react';

const inputClass = 'mt-1 bg-slate-900 border-slate-700 text-slate-100';
const labelClass = 'text-[0.7rem] text-slate-400';

export interface DesignModalProps {
  open: boolean;
  onClose: () => void;
  project: DesignProjectRow | null;
  onSave?: (row: DesignProjectRow) => void;
}

export function DesignModal({
  open,
  onClose,
  project,
  onSave,
}: DesignModalProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<DesignFormData>({});

  React.useEffect(() => {
    if (project) {
      setFormData(rowToFormData(project));
      setEditing(false);
    }
  }, [project]);

  const update = useCallback(
    (field: keyof DesignFormData, value: unknown) => {
      setFormData((d) => ({ ...d, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!project) return;
    const row = formDataToRow(formData, project.id);
    onSave?.(row);
    setEditing(false);
    onClose();
  }, [project, formData, onSave, onClose]);

  const handleCancelEdit = useCallback(() => {
    if (project) setFormData(rowToFormData(project));
    setEditing(false);
  }, [project]);

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader className="flex flex-row items-center justify-between gap-2 shrink-0">
          <DialogTitle className="text-sm font-semibold text-slate-100">
            {project.code} — {project.name} (Études & Conception)
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

        <Tabs defaultValue="esq" className="mt-2 flex-1 min-h-0 flex flex-col">
          <TabsList className="grid grid-cols-4 w-full text-[0.7rem] bg-slate-900/80 border border-slate-800 p-1 rounded-lg shrink-0">
            <TabsTrigger value="esq" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              ESQ
            </TabsTrigger>
            <TabsTrigger value="aps" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              APS
            </TabsTrigger>
            <TabsTrigger value="apd" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              APD
            </TabsTrigger>
            <TabsTrigger value="couts" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              Coûts & surfaces
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto min-h-0 flex-1 mt-4 pr-1 -mr-1">
            <TabsContent value="esq" className="mt-0 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className={labelClass}>Date début ESQ</Label>
                  <Input
                    type="date"
                    value={formData.esqDateDebut ?? ''}
                    onChange={(e) => update('esqDateDebut', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Date fin ESQ</Label>
                  <Input
                    type="date"
                    value={formData.esqDateFin ?? ''}
                    onChange={(e) => update('esqDateFin', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Gate ESQ</Label>
                  <Select
                    value={formData.gateESQ ?? ''}
                    onValueChange={(v) => update('gateESQ', v as DesignFormData['gateESQ'])}
                    disabled={!editing}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="En cours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="En cours">En cours</SelectItem>
                      <SelectItem value="Validé">Validé</SelectItem>
                      <SelectItem value="À revoir">À revoir</SelectItem>
                      <SelectItem value="Refusé">Refusé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className={labelClass}>Variantes (A/B/C)</Label>
                <Textarea
                  rows={3}
                  value={formData.esqVariantes ?? ''}
                  onChange={(e) => update('esqVariantes', e.target.value)}
                  placeholder="Résumé des variantes étudiées"
                  className={inputClass}
                  readOnly={!editing}
                />
              </div>
              <div>
                <Label className={labelClass}>Variante retenue (choix MOA)</Label>
                <Input
                  value={formData.esqVarianteRetenue ?? ''}
                  onChange={(e) => update('esqVarianteRetenue', e.target.value)}
                  placeholder="Variante B - façade ventilée"
                  className={inputClass}
                  readOnly={!editing}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className={labelClass}>Date validation Gate ESQ</Label>
                  <Input
                    type="date"
                    value={formData.gateESQDate ?? ''}
                    onChange={(e) => update('gateESQDate', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Validé par</Label>
                  <Input
                    value={formData.gateESQPar ?? ''}
                    onChange={(e) => update('gateESQPar', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div className="col-span-2">
                  <Label className={labelClass}>Commentaire Gate ESQ</Label>
                  <Textarea
                    rows={2}
                    value={formData.gateESQCommentaire ?? ''}
                    onChange={(e) => update('gateESQCommentaire', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aps" className="mt-0 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className={labelClass}>Montant APS (FCFA)</Label>
                  <Input
                    type="number"
                    value={formData.apsMontant ?? ''}
                    onChange={(e) => update('apsMontant', e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Écart vs budget (%)</Label>
                  <Input
                    type="number"
                    value={formData.apsEcartBudget ?? ''}
                    onChange={(e) => update('apsEcartBudget', e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Gate APS</Label>
                  <Select
                    value={formData.gateAPS ?? ''}
                    onValueChange={(v) => update('gateAPS', v as DesignFormData['gateAPS'])}
                    disabled={!editing}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="En cours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="En cours">En cours</SelectItem>
                      <SelectItem value="Validé">Validé</SelectItem>
                      <SelectItem value="À revoir">À revoir</SelectItem>
                      <SelectItem value="Refusé">Refusé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className={labelClass}>Livrables APS</Label>
                <Textarea
                  rows={4}
                  value={formData.apsLivrables ?? ''}
                  onChange={(e) => update('apsLivrables', e.target.value)}
                  placeholder="Plans niveaux, coupes, façades ; schéma structurel ; principes CVC/élec/plomberie…"
                  className={inputClass}
                  readOnly={!editing}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className={labelClass}>Date validation Gate APS</Label>
                  <Input
                    type="date"
                    value={formData.gateAPSDate ?? ''}
                    onChange={(e) => update('gateAPSDate', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div className="col-span-2">
                  <Label className={labelClass}>Commentaire Gate APS</Label>
                  <Textarea
                    rows={2}
                    value={formData.gateAPSCommentaire ?? ''}
                    onChange={(e) => update('gateAPSCommentaire', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="apd" className="mt-0 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className={labelClass}>Montant APD (FCFA)</Label>
                  <Input
                    type="number"
                    value={formData.apdMontant ?? ''}
                    onChange={(e) => update('apdMontant', e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Gate APD</Label>
                  <Select
                    value={formData.gateAPD ?? ''}
                    onValueChange={(v) => update('gateAPD', v as DesignFormData['gateAPD'])}
                    disabled={!editing}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="En cours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="En cours">En cours</SelectItem>
                      <SelectItem value="APD gelé">APD gelé (OK DCE)</SelectItem>
                      <SelectItem value="À revoir">À revoir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Prêt DCE</Label>
                  <Select
                    value={formData.pretDCE ?? ''}
                    onValueChange={(v) => update('pretDCE', v as DesignFormData['pretDCE'])}
                    disabled={!editing}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Non" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oui">Oui</SelectItem>
                      <SelectItem value="Non">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className={labelClass}>Livrables APD</Label>
                <Textarea
                  rows={4}
                  value={formData.apdLivrables ?? ''}
                  onChange={(e) => update('apdLivrables', e.target.value)}
                  placeholder="Plans détaillés 1/100 - 1/50, descriptif technique (pré‑CCTP), études thermiques, tableaux de surfaces…"
                  className={inputClass}
                  readOnly={!editing}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className={labelClass}>Date Gate APD</Label>
                  <Input
                    type="date"
                    value={formData.gateAPDDate ?? ''}
                    onChange={(e) => update('gateAPDDate', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div className="col-span-2">
                  <Label className={labelClass}>Commentaire Gate APD</Label>
                  <Textarea
                    rows={2}
                    value={formData.gateAPDCommentaire ?? ''}
                    onChange={(e) => update('gateAPDCommentaire', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="couts" className="mt-0 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className={labelClass}>Coût ESQ (FCFA)</Label>
                  <Input
                    type="number"
                    value={formData.coutESQ ?? ''}
                    onChange={(e) => update('coutESQ', e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Coût APS (FCFA)</Label>
                  <Input
                    type="number"
                    value={formData.coutAPS ?? ''}
                    onChange={(e) => update('coutAPS', e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Coût APD (FCFA)</Label>
                  <Input
                    type="number"
                    value={formData.coutAPD ?? ''}
                    onChange={(e) => update('coutAPD', e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Tableau surfaces (résumé)</Label>
                <Textarea
                  rows={3}
                  value={formData.surfacesResume ?? ''}
                  onChange={(e) => update('surfacesResume', e.target.value)}
                  placeholder="Habitation : 3 200 m² ; Commerces : 600 m² ; Parties communes : 800 m²…"
                  className={inputClass}
                  readOnly={!editing}
                />
              </div>
            </TabsContent>
          </div>

          {editing && (
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                Annuler
              </Button>
              <Button type="button" size="sm" onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
