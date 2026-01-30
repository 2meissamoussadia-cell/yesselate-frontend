'use client';

/**
 * DailyReportForm — Formulaire rapport journalier chantier (DPR / Site diary).
 * En-tête, météo, main-d'œuvre, équipement, matériaux, travaux réalisés, incidents, pièces jointes.
 */

import React from 'react';
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
import type { DailyReportFormData } from './types';

const inputClass = 'mt-1 bg-slate-900 border-slate-700 text-slate-100';
const labelClass = 'text-[0.7rem] text-slate-400';

export interface DailyReportFormProps {
  data: DailyReportFormData;
  onChange: (data: DailyReportFormData) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function DailyReportForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  readOnly = false,
}: DailyReportFormProps) {
  const update = (field: keyof DailyReportFormData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {/* En-tête */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <p className="text-[0.7rem] font-medium text-slate-300 mb-3">En-tête</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <Label className={labelClass}>Chantier</Label>
            <Input
              value={data.chantierNom ?? ''}
              onChange={(e) => update('chantierNom', e.target.value)}
              placeholder="Immeuble Almadies"
              className={inputClass}
              readOnly={readOnly}
            />
          </div>
          <div>
            <Label className={labelClass}>Code chantier</Label>
            <Input
              value={data.chantierCode ?? ''}
              onChange={(e) => update('chantierCode', e.target.value)}
              placeholder="CH-2026-001"
              className={inputClass}
              readOnly={readOnly}
            />
          </div>
          <div>
            <Label className={labelClass}>Date du rapport</Label>
            <Input
              type="date"
              value={data.date ?? ''}
              onChange={(e) => update('date', e.target.value)}
              className={inputClass}
              readOnly={readOnly}
            />
          </div>
          <div>
            <Label className={labelClass}>N° rapport</Label>
            <Input
              value={data.numeroRapport ?? ''}
              onChange={(e) => update('numeroRapport', e.target.value)}
              placeholder="DPR-2026-001-015"
              className={inputClass}
              readOnly={readOnly}
            />
          </div>
          <div>
            <Label className={labelClass}>Chef de chantier / conducteur</Label>
            <Input
              value={data.chefChantier ?? ''}
              onChange={(e) => update('chefChantier', e.target.value)}
              placeholder="M. Ndiaye"
              className={inputClass}
              readOnly={readOnly}
            />
          </div>
          <div>
            <Label className={labelClass}>Entreprise principale</Label>
            <Input
              value={data.entreprisePrincipale ?? ''}
              onChange={(e) => update('entreprisePrincipale', e.target.value)}
              placeholder="Entreprise NDIAYE"
              className={inputClass}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Météo */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <p className="text-[0.7rem] font-medium text-slate-300 mb-3">Météo</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <Label className={labelClass}>Météo matin</Label>
            <Input
              value={data.meteoMatin ?? ''}
              onChange={(e) => update('meteoMatin', e.target.value)}
              placeholder="Soleil, 28°C"
              className={inputClass}
              readOnly={readOnly}
            />
          </div>
          <div>
            <Label className={labelClass}>Météo après-midi</Label>
            <Input
              value={data.meteoApresMidi ?? ''}
              onChange={(e) => update('meteoApresMidi', e.target.value)}
              placeholder="Nuageux, 31°C"
              className={inputClass}
              readOnly={readOnly}
            />
          </div>
          <div>
            <Label className={labelClass}>Impact météo</Label>
            <Select
              value={data.impactMeteo ?? ''}
              onValueChange={(v) => update('impactMeteo', v as DailyReportFormData['impactMeteo'])}
              disabled={readOnly}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Aucun / léger / fort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aucun">Aucun</SelectItem>
                <SelectItem value="Léger">Léger</SelectItem>
                <SelectItem value="Fort">Fort</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Travaux réalisés */}
      <div>
        <Label className={labelClass}>Travaux réalisés / avancement</Label>
        <Textarea
          rows={3}
          value={data.travauxRealises ?? ''}
          onChange={(e) => update('travauxRealises', e.target.value)}
          placeholder="Ex : Dalle R+3 coulée à 70 %, murs de refend niveau 2 terminés…"
          className={inputClass}
          readOnly={readOnly}
        />
      </div>

      {/* Main-d'œuvre */}
      <div>
        <Label className={labelClass}>Main-d'œuvre (par entreprise / corps d'état)</Label>
        <Textarea
          rows={3}
          value={data.mainOeuvre ?? ''}
          onChange={(e) => update('mainOeuvre', e.target.value)}
          placeholder="Entreprise GO : 15 ouvriers, 8 h ; Entreprise élec : 4 électriciens, 6 h…"
          className={inputClass}
          readOnly={readOnly}
        />
      </div>

      {/* Équipement & Matériaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className={labelClass}>Équipement (engins, état, heures)</Label>
          <Textarea
            rows={3}
            value={data.equipement ?? ''}
            onChange={(e) => update('equipement', e.target.value)}
            placeholder="Grue 1 : 8 h en service ; Bétonnière : en panne 2 h…"
            className={inputClass}
            readOnly={readOnly}
          />
        </div>
        <div>
          <Label className={labelClass}>Matériaux livrés / utilisés / manquants</Label>
          <Textarea
            rows={3}
            value={data.materiauxLivresUtilises ?? ''}
            onChange={(e) => update('materiauxLivresUtilises', e.target.value)}
            placeholder="Ciment 32,5 : 50 sacs livrés ; Acier HA12 : 3 t utilisées…"
            className={inputClass}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Qualité / HSE / incidents */}
      <div>
        <Label className={labelClass}>Observations qualité / Incidents HSE / Remarques</Label>
        <Textarea
          rows={3}
          value={data.incidentsSecurite ?? ''}
          onChange={(e) => update('incidentsSecurite', e.target.value)}
          placeholder="Aucun accident ; 1 presque accident sur échafaudage corrigé…"
          className={inputClass}
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label className={labelClass}>Observations qualité</Label>
        <Textarea
          rows={2}
          value={data.observationsQualite ?? ''}
          onChange={(e) => update('observationsQualite', e.target.value)}
          className={inputClass}
          readOnly={readOnly}
        />
      </div>

      {/* Pièces jointes */}
      <div>
        <Label className={labelClass}>Pièces jointes (photos, croquis, docs)</Label>
        <Input
          value={data.piecesJointes ?? ''}
          onChange={(e) => update('piecesJointes', e.target.value)}
          placeholder="Références ou liens des pièces jointes"
          className={inputClass}
          readOnly={readOnly}
        />
      </div>

      {!readOnly && (onSubmit || onCancel) && (
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" size="sm">
            Enregistrer
          </Button>
        </div>
      )}
    </form>
  );
}
