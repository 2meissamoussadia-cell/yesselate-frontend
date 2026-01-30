'use client';

/**
 * TenderModal — Fiche AO / Lot : DCE → Entreprises invitées → Offres → Analyse & attribution.
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import { rowToFormData, formDataToRow } from './tenderFormUtils';
import type { TenderRow, TenderFormData, TenderOfferRow } from './types';
import { Pencil } from 'lucide-react';
import { ErpDataTable } from '@/components/erp/ErpDataTable';
import type { ErpColumnDef } from '@/components/erp/types';

const inputClass = 'mt-1 bg-slate-900 border-slate-700 text-slate-100';
const labelClass = 'text-[0.7rem] text-slate-400';

const SAMPLE_INVITES = [
  { id: '1', raisonSociale: 'Entreprise NDIAYE', contact: 'M. Ndiaye', statut: 'Offre déposée' as const },
  { id: '2', raisonSociale: 'Sénégal BTP', contact: 'M. Fall', statut: 'Offre déposée' as const },
  { id: '3', raisonSociale: 'BTP Dakar', contact: 'M. Diop', statut: 'Intéressé' as const },
  { id: '4', raisonSociale: 'Construction SA', contact: '', statut: 'Invité' as const },
];

const SAMPLE_OFFERS: TenderOfferRow[] = [
  { id: '1', entreprise: 'Entreprise NDIAYE', prix: 1_480_000_000, delai: 14, techScore: 32, prixScore: 48, scoreTotal: 80, rang: 1 },
  { id: '2', entreprise: 'Sénégal BTP', prix: 1_520_000_000, delai: 13, techScore: 35, prixScore: 42, scoreTotal: 77, rang: 2 },
];

function formatBudgetFCFA(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.', ',')} Md FCFA`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} M FCFA`;
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' FCFA';
}

const offerColumns: ErpColumnDef<TenderOfferRow>[] = [
  { id: 'entreprise', header: 'Entreprise', accessorKey: 'entreprise', width: 180 },
  {
    id: 'prix',
    header: 'Prix (FCFA)',
    width: 140,
    align: 'right',
    cell: (row) => <span className="tabular-nums text-slate-200 text-[0.75rem]">{formatBudgetFCFA(row.prix)}</span>,
  },
  { id: 'delai', header: 'Délai (mois)', width: 100, align: 'right', cell: (row) => row.delai },
  { id: 'techScore', header: 'Score technique', width: 120, align: 'right', cell: (row) => row.techScore ?? '—' },
  { id: 'prixScore', header: 'Score prix', width: 100, align: 'right', cell: (row) => row.prixScore ?? '—' },
  { id: 'scoreTotal', header: 'Score total', width: 100, align: 'right', cell: (row) => row.scoreTotal ?? '—' },
  { id: 'rang', header: 'Rang', width: 70, align: 'right', cell: (row) => row.rang ?? '—' },
];

export interface TenderModalProps {
  open: boolean;
  onClose: () => void;
  tender: TenderRow | null;
  onSave?: (row: TenderRow) => void;
}

export function TenderModal({
  open,
  onClose,
  tender,
  onSave,
}: TenderModalProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<TenderFormData>({});

  React.useEffect(() => {
    if (tender) {
      setFormData(rowToFormData(tender));
      setEditing(false);
    }
  }, [tender]);

  const update = useCallback(
    (field: keyof TenderFormData, value: unknown) => {
      setFormData((d) => ({ ...d, [field]: value }));
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!tender) return;
    const row = formDataToRow(formData, tender.id);
    onSave?.(row);
    setEditing(false);
    onClose();
  }, [tender, formData, onSave, onClose]);

  const handleCancelEdit = useCallback(() => {
    if (tender) setFormData(rowToFormData(tender));
    setEditing(false);
  }, [tender]);

  const offers = useMemo(() => SAMPLE_OFFERS, []);

  if (!tender) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader className="flex flex-row items-center justify-between gap-2 shrink-0">
          <DialogTitle className="text-sm font-semibold text-slate-100">
            {tender.code} — {tender.projet} ({tender.lot})
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

        <Tabs defaultValue="dce" className="mt-2 flex-1 min-h-0 flex flex-col">
          <TabsList className="grid grid-cols-4 w-full text-[0.7rem] bg-slate-900/80 border border-slate-800 p-1 rounded-lg shrink-0">
            <TabsTrigger value="dce" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              DCE & paramètres
            </TabsTrigger>
            <TabsTrigger value="invites" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              Entreprises invitées
            </TabsTrigger>
            <TabsTrigger value="offres" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              Offres reçues
            </TabsTrigger>
            <TabsTrigger value="analyse" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
              Analyse & attribution
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto min-h-0 flex-1 mt-4 pr-1 -mr-1">
            <TabsContent value="dce" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>Type consultation</Label>
                  <Select
                    value={formData.type ?? 'AO'}
                    onValueChange={(v) => update('type', v as TenderFormData['type'])}
                    disabled={!editing}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AO">Appel d'offres</SelectItem>
                      <SelectItem value="RFQ">RFQ</SelectItem>
                      <SelectItem value="GG">Gré à gré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Type de prix</Label>
                  <Select
                    value={formData.typePrix ?? 'forfait'}
                    onValueChange={(v) => update('typePrix', v as TenderFormData['typePrix'])}
                    disabled={!editing}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forfait">Forfait</SelectItem>
                      <SelectItem value="unitaires">Unitaires</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Mode consultation</Label>
                  <Select
                    value={formData.modeConsultation ?? 'AO'}
                    onValueChange={(v) => update('modeConsultation', v as TenderFormData['modeConsultation'])}
                    disabled={!editing}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AO">AO</SelectItem>
                      <SelectItem value="Consultation restreinte">Consultation restreinte</SelectItem>
                      <SelectItem value="RFQ">RFQ</SelectItem>
                      <SelectItem value="Gré à gré">Gré à gré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>Date lancement AO</Label>
                  <Input
                    type="date"
                    value={formData.dateLancement ?? ''}
                    onChange={(e) => update('dateLancement', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Date visite obligatoire</Label>
                  <Input
                    type="date"
                    value={formData.dateVisite ?? ''}
                    onChange={(e) => update('dateVisite', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Date limite questions</Label>
                  <Input
                    type="date"
                    value={formData.dateLimiteQuestions ?? ''}
                    onChange={(e) => update('dateLimiteQuestions', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Date limite offres</Label>
                  <Input
                    type="date"
                    value={formData.dateLimiteOffres ?? formData.deadline ?? ''}
                    onChange={(e) => {
                      update('dateLimiteOffres', e.target.value);
                      update('deadline', e.target.value);
                    }}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Documents DCE (CCTP, CCAP, BPU/DPGF, plans)</Label>
                <Textarea
                  rows={3}
                  value={formData.documentsDce ?? ''}
                  onChange={(e) => update('documentsDce', e.target.value)}
                  placeholder="Liens ou références : CCTP, CCAP, BPU/DPGF, plans, annexes…"
                  className={inputClass}
                  readOnly={!editing}
                />
              </div>
            </TabsContent>

            <TabsContent value="invites" className="mt-0 space-y-4">
              <p className="text-[0.75rem] text-slate-400">
                Liste des entreprises invitées avec statut (invité, intéressé, offre déposée…).
              </p>
              <div className="rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-[0.75rem]">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 text-left">
                      <th className="px-3 py-2 font-medium">Raison sociale</th>
                      <th className="px-3 py-2 font-medium">Contact</th>
                      <th className="px-3 py-2 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_INVITES.map((inv) => (
                      <tr key={inv.id} className="border-t border-slate-800 text-slate-200">
                        <td className="px-3 py-2">{inv.raisonSociale}</td>
                        <td className="px-3 py-2">{inv.contact || '—'}</td>
                        <td className="px-3 py-2">
                          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[0.65rem]">
                            {inv.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="offres" className="mt-0 space-y-4">
              <p className="text-[0.75rem] text-slate-400">
                Offres reçues : prix, délai, scores technique/prix, classement.
              </p>
              <div className="min-h-[240px]">
                <ErpDataTable<TenderOfferRow>
                  data={offers}
                  columns={offerColumns}
                  getRowId={(row) => row.id}
                  maxHeight="260px"
                />
              </div>
            </TabsContent>

            <TabsContent value="analyse" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className={labelClass}>Entreprise retenue</Label>
                  <Input
                    value={formData.entrepriseRetenue ?? ''}
                    onChange={(e) => update('entrepriseRetenue', e.target.value)}
                    placeholder="Entreprise NDIAYE"
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Montant attribué (FCFA)</Label>
                  <Input
                    type="number"
                    value={formData.montantAttribue ?? formData.bestPrice ?? ''}
                    onChange={(e) => update('montantAttribue', e.target.value ? Number(e.target.value) : undefined)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
                <div>
                  <Label className={labelClass}>Décision MOA</Label>
                  <Select
                    value={formData.decisionStatut ?? 'Soumis'}
                    onValueChange={(v) => update('decisionStatut', v as TenderFormData['decisionStatut'])}
                    disabled={!editing}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soumis">Soumis à validation</SelectItem>
                      <SelectItem value="Validé">Validé</SelectItem>
                      <SelectItem value="Notifié">Notifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className={labelClass}>Date attribution</Label>
                  <Input
                    type="date"
                    value={formData.dateAttribution ?? ''}
                    onChange={(e) => update('dateAttribution', e.target.value)}
                    className={inputClass}
                    readOnly={!editing}
                  />
                </div>
              </div>
              <div>
                <Label className={labelClass}>Motif et commentaires</Label>
                <Textarea
                  rows={3}
                  value={formData.motifCommentaires ?? ''}
                  onChange={(e) => update('motifCommentaires', e.target.value)}
                  placeholder="Résumé analyse prix/technique, justification du choix…"
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
