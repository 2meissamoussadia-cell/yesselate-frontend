'use client';

/**
 * PhaseModal — Modal workflow phases 0→10 avec checklists et validation de gate.
 * Chaque module peut l’ouvrir pour afficher le fil conducteur du projet.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhaseChecklist } from './PhaseChecklist';
import { GateValidationButton } from './GateValidationButton';
import { cn } from '@/lib/cn';

const PHASE_LABELS: Record<number, string> = {
  0: 'Pré‑projet',
  1: 'Foncier',
  2: 'Programme',
  3: 'Conception',
  4: 'Autorisations',
  5: 'Consultation',
  6: 'Préparation chantier',
  7: 'Gros œuvre',
  8: 'Second œuvre',
  9: 'Réceptions',
  10: 'Exploitation',
};

const PHASE_1_ITEMS = [
  { id: 'tf', label: 'Titre foncier / bail vérifié', checked: true },
  { id: 'g1', label: 'Étude géotechnique G1', checked: false },
  { id: 'bornage', label: 'PV bornage / limites', checked: true },
  { id: 'diag', label: 'Diagnostics structure (si rénovation)', checked: false },
];

const PHASE_0_ITEMS = [
  { id: 'besoin', label: 'Besoin & objectifs définis', checked: true },
  { id: 'opportunite', label: 'Étude d’opportunité', checked: true },
  { id: 'strategie', label: 'Stratégie de réalisation', checked: false },
];

const PHASE_2_ITEMS = [
  { id: 'prog-fonc', label: 'Programme fonctionnel', checked: false },
  { id: 'prog-tech', label: 'Programme technique', checked: false },
  { id: 'cibles', label: 'Cibles performance', checked: false },
];

const PHASE_3_ITEMS = [
  { id: 'esq', label: 'ESQ / APS / APD', checked: false },
  { id: 'etudes', label: 'Études techniques (structure, CVC, VRD)', checked: false },
  { id: 'bpu', label: 'DPGF / BPU', checked: false },
];

export interface PhaseModalProps {
  open: boolean;
  onClose: () => void;
  project?: { id: string; name: string; currentPhase?: number };
}

export function PhaseModal({ open, onClose, project }: PhaseModalProps) {
  const currentPhase = project?.currentPhase ?? 1;
  const defaultTab = `phase-${currentPhase}`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-3xl bg-slate-950 border-slate-800 text-slate-100"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-slate-100">
            {project?.name ?? 'Projet'} — Workflow phases
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="mt-2">
          <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg text-[0.7rem]">
            {[0, 1, 2, 3, 4, 5].map((p) => (
              <TabsTrigger
                key={p}
                value={`phase-${p}`}
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
              >
                {p} - {PHASE_LABELS[p] ?? `Phase ${p}`}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-2 max-h-64 overflow-y-auto">
            <TabsContent value="phase-0" className="mt-3">
              <PhaseChecklist items={PHASE_0_ITEMS} readOnly />
              <div className="mt-4">
                <GateValidationButton phase={0} onValidate={() => {}} />
              </div>
            </TabsContent>
            <TabsContent value="phase-1" className="mt-3">
              <PhaseChecklist items={PHASE_1_ITEMS} readOnly />
              <div className="mt-4">
                <GateValidationButton phase={1} label="Valider Gate #1 — OK foncier" onValidate={() => {}} />
              </div>
            </TabsContent>
            <TabsContent value="phase-2" className="mt-3">
              <PhaseChecklist items={PHASE_2_ITEMS} readOnly />
              <div className="mt-4">
                <GateValidationButton phase={2} onValidate={() => {}} />
              </div>
            </TabsContent>
            <TabsContent value="phase-3" className="mt-3">
              <PhaseChecklist items={PHASE_3_ITEMS} readOnly />
              <div className="mt-4">
                <GateValidationButton phase={3} onValidate={() => {}} />
              </div>
            </TabsContent>
            <TabsContent value="phase-4" className="mt-3">
              <PhaseChecklist
                items={[
                  { id: 'pc', label: 'Permis de construire déposé/obtenu', checked: false },
                  { id: 'deec', label: 'Avis DEEC si nécessaire', checked: false },
                  { id: 'assurances', label: 'Assurances & garanties', checked: false },
                ]}
                readOnly
              />
              <div className="mt-4">
                <GateValidationButton phase={4} onValidate={() => {}} />
              </div>
            </TabsContent>
            <TabsContent value="phase-5" className="mt-3">
              <PhaseChecklist
                items={[
                  { id: 'dce', label: 'DCE / CCTP-CCAP', checked: false },
                  { id: 'consultation', label: 'Consultation entreprises', checked: false },
                  { id: 'contrat', label: 'Contrat / Marché signé', checked: false },
                ]}
                readOnly
              />
              <div className="mt-4">
                <GateValidationButton phase={5} onValidate={() => {}} />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <p className="text-[10px] text-slate-400 mt-2">
          Phases 6–10 : préparation chantier, gros œuvre, second œuvre, réceptions, exploitation.
        </p>
      </DialogContent>
    </Dialog>
  );
}
