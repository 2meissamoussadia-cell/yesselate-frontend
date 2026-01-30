'use client';

/**
 * OpportunityForm — Fiche opportunité complète en 4 onglets (Général, Business, Foncier, Programme).
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { OpportunityFormData } from './types';

const inputClass = 'mt-1 bg-slate-900 border-slate-700 text-slate-100';
const labelClass = 'text-[0.7rem] text-slate-400';

export interface OpportunityFormProps {
  data: OpportunityFormData;
  onChange: (data: OpportunityFormData) => void;
  onSubmit?: (data: OpportunityFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  readOnly?: boolean;
  className?: string;
}

function updateField(
  prev: OpportunityFormData,
  field: keyof OpportunityFormData,
  value: unknown
): OpportunityFormData {
  return { ...prev, [field]: value };
}

export function OpportunityForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
  readOnly = false,
  className,
}: OpportunityFormProps) {
  const update = (field: keyof OpportunityFormData, value: unknown) => {
    onChange(updateField(data, field, value));
  };

  return (
    <form
      className={`flex flex-col gap-4 ${className ?? ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(data);
      }}
    >
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full text-[0.7rem] bg-slate-900/80 border border-slate-800 p-1 rounded-lg">
          <TabsTrigger value="general" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
            Général
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
            Business & Financier
          </TabsTrigger>
          <TabsTrigger value="foncier" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
            Foncier & Diagnostics
          </TabsTrigger>
          <TabsTrigger value="programme" className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
            Programme & Exigences
          </TabsTrigger>
        </TabsList>

        {/* — Onglet 1 : Général — */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Code opportunité</Label>
              <Input
                value={data.code ?? ''}
                onChange={(e) => update('code', e.target.value)}
                placeholder="OPP-2026-001"
                className={inputClass}
                readOnly={readOnly}
              />
            </div>
            <div>
              <Label className={labelClass}>Nom du projet</Label>
              <Input
                value={data.projet ?? ''}
                onChange={(e) => update('projet', e.target.value)}
                placeholder="Immeuble Almadies"
                className={inputClass}
                readOnly={readOnly}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Type de projet</Label>
              <Select
                value={data.typeProjet ?? ''}
                onValueChange={(v) => update('typeProjet', v as OpportunityFormData['typeProjet'])}
                disabled={readOnly}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {['Neuf', 'Rénovation', 'Extension', 'Maintenance lourde'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Usage principal</Label>
              <Select
                value={data.usage ?? ''}
                onValueChange={(v) => update('usage', v as OpportunityFormData['usage'])}
                disabled={readOnly}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {['Logement individuel', 'Immeuble locatif', 'Bureaux', 'Commerce / mixte', 'Industriel / Data center'].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Pays</Label>
              <Input value={data.pays ?? 'Sénégal'} onChange={(e) => update('pays', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Région</Label>
              <Input value={data.region ?? ''} onChange={(e) => update('region', e.target.value)} placeholder="Dakar" className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Ville / Commune</Label>
              <Input value={data.ville ?? ''} onChange={(e) => update('ville', e.target.value)} placeholder="Dakar" className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Quartier</Label>
              <Input value={data.quartier ?? ''} onChange={(e) => update('quartier', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div className="col-span-2">
              <Label className={labelClass}>Coordonnées GPS (option)</Label>
              <Input value={data.coordonneesGps ?? ''} onChange={(e) => update('coordonneesGps', e.target.value)} placeholder="14.7167, -17.4677" className={inputClass} readOnly={readOnly} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Type client</Label>
              <Select value={data.clientType ?? ''} onValueChange={(v) => update('clientType', v as OpportunityFormData['clientType'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {['Particulier', 'Promoteur', 'Entreprise', 'État', 'Collectivité', 'Bailleur'].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Nom du client</Label>
              <Input value={data.clientNom ?? ''} onChange={(e) => update('clientNom', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Contact principal (nom)</Label>
              <Input value={data.contactNom ?? ''} onChange={(e) => update('contactNom', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Téléphone</Label>
              <Input value={data.contactTel ?? ''} onChange={(e) => update('contactTel', e.target.value)} type="tel" className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Email</Label>
              <Input value={data.contactEmail ?? ''} onChange={(e) => update('contactEmail', e.target.value)} type="email" className={inputClass} readOnly={readOnly} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>Phase actuelle</Label>
              <Select value={String(data.phase ?? 0)} onValueChange={(v) => update('phase', Number(v))} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 — Pré-projet</SelectItem>
                  <SelectItem value="1">1 — Foncier</SelectItem>
                  <SelectItem value="2">2 — Programme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Statut pipeline</Label>
              <Select value={data.statutPipeline ?? ''} onValueChange={(v) => update('statutPipeline', v as OpportunityFormData['statutPipeline'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {['En étude', 'Stand-by', 'Abandonné', 'Converti en programme'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Probabilité de concrétisation (%)</Label>
              <Input type="number" min={0} max={100} value={data.proba ?? ''} onChange={(e) => update('proba', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Score risque global</Label>
              <Select value={data.risque ?? ''} onValueChange={(v) => update('risque', v as OpportunityFormData['risque'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className={labelClass}>Responsable BMO (chef de projet, AMO)</Label>
              <Input value={data.responsableBmo ?? ''} onChange={(e) => update('responsableBmo', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
        </TabsContent>

        {/* — Onglet 2 : Business & Financier — */}
        <TabsContent value="business" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className={labelClass}>Budget enveloppe min (FCFA)</Label>
              <Input type="number" value={data.budgetMin ?? ''} onChange={(e) => update('budgetMin', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Budget enveloppe max (FCFA)</Label>
              <Input type="number" value={data.budgetMax ?? ''} onChange={(e) => update('budgetMax', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Devise</Label>
              <Select value={data.devise ?? 'FCFA'} onValueChange={(v) => update('devise', v as OpportunityFormData['devise'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FCFA">FCFA</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Estimation coût/m²</Label>
              <Input type="number" value={data.coutM2 ?? ''} onChange={(e) => update('coutM2', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Mode de financement</Label>
              <Select value={data.modeFinancement ?? ''} onValueChange={(v) => update('modeFinancement', v as OpportunityFormData['modeFinancement'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {['Fonds propres', 'Banque', 'Bailleur', 'Mixte'].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Banque / bailleur pressenti</Label>
              <Input value={data.banqueBailleur ?? ''} onChange={(e) => update('banqueBailleur', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div className="col-span-2">
              <Label className={labelClass}>Taux cible / conditions (facultatif)</Label>
              <Input value={data.tauxCible ?? ''} onChange={(e) => update('tauxCible', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className={labelClass}>Date cible démarrage études</Label>
              <Input type="date" value={data.dateDebutEtudes ?? ''} onChange={(e) => update('dateDebutEtudes', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Date cible dépôt permis</Label>
              <Input type="date" value={data.dateDepotPermis ?? ''} onChange={(e) => update('dateDepotPermis', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Démarrage travaux souhaité</Label>
              <Input type="date" value={data.dateDebutTravaux ?? ''} onChange={(e) => update('dateDebutTravaux', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Livraison souhaitée</Label>
              <Input type="date" value={data.dateLivraison ?? ''} onChange={(e) => update('dateLivraison', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Objectif de rentabilité (si locatif)</Label>
              <Input value={data.objectifRentabilite ?? ''} onChange={(e) => update('objectifRentabilite', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Horizon d'investissement (années)</Label>
              <Input type="number" value={data.horizonInvestissement ?? ''} onChange={(e) => update('horizonInvestissement', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
        </TabsContent>

        {/* — Onglet 3 : Foncier & Diagnostics — */}
        <TabsContent value="foncier" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Type terrain / bien</Label>
              <Select value={data.typeTerrain ?? ''} onValueChange={(v) => update('typeTerrain', v as OpportunityFormData['typeTerrain'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {['Terrain nu', 'Bâtiment existant', 'Extension'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Référence titre foncier ou bail</Label>
              <Input value={data.titreFoncier ?? ''} onChange={(e) => update('titreFoncier', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Superficie (m²)</Label>
              <Input type="number" value={data.superficie ?? ''} onChange={(e) => update('superficie', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Type de droit</Label>
              <Select value={data.typeDroit ?? ''} onValueChange={(v) => update('typeDroit', v as OpportunityFormData['typeDroit'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {['TF', 'Bail', 'Autre'].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Titre vérifié</Label>
              <Select value={data.titreVerifie ?? ''} onValueChange={(v) => update('titreVerifie', v as OpportunityFormData['titreVerifie'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Non renseigné" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Litige ou charge connue</Label>
              <Select value={data.litigeConnu ?? ''} onValueChange={(v) => update('litigeConnu', v as OpportunityFormData['litigeConnu'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Non renseigné" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className={labelClass}>Commentaire litige</Label>
              <Input value={data.litigeCommentaire ?? ''} onChange={(e) => update('litigeCommentaire', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Servitudes identifiées</Label>
              <Select value={data.servitudesIdentifiees ?? ''} onValueChange={(v) => update('servitudesIdentifiees', v as OpportunityFormData['servitudesIdentifiees'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Non renseigné" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Description servitudes</Label>
              <Input value={data.servitudesDescription ?? ''} onChange={(e) => update('servitudesDescription', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <Label className={labelClass}>Étude géotechnique G1</Label>
              <Select value={data.g1 ?? ''} onValueChange={(v) => update('g1', v as OpportunityFormData['g1'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Non prévue" /></SelectTrigger>
                <SelectContent>
                  {['Non prévue', 'Planifiée', 'Réalisée'].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Date G1</Label>
              <Input type="date" value={data.g1Date ?? ''} onChange={(e) => update('g1Date', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Labo G1</Label>
              <Input value={data.g1Labo ?? ''} onChange={(e) => update('g1Labo', e.target.value)} placeholder="Nom du laboratoire" className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Diagnostics structure (si ancien)</Label>
              <Select value={data.diagStructure ?? ''} onValueChange={(v) => update('diagStructure', v as OpportunityFormData['diagStructure'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Non" /></SelectTrigger>
                <SelectContent>
                  {['Non', 'En cours', 'Terminé'].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Diagnostics élec / plomberie</Label>
              <Select value={data.diagElecPlomberie ?? ''} onValueChange={(v) => update('diagElecPlomberie', v as OpportunityFormData['diagElecPlomberie'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Non" /></SelectTrigger>
                <SelectContent>
                  {['Non', 'En cours', 'Terminé'].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Décision Gate 1</Label>
              <Select value={data.gateFoncier ?? ''} onValueChange={(v) => update('gateFoncier', v as OpportunityFormData['gateFoncier'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="En cours" /></SelectTrigger>
                <SelectContent>
                  {['OK', 'À sécuriser', 'KO'].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Date décision Gate 1</Label>
              <Input type="date" value={data.gateFoncierDate ?? ''} onChange={(e) => update('gateFoncierDate', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
            <div className="col-span-2">
              <Label className={labelClass}>Commentaire décision Gate 1</Label>
              <Textarea rows={2} value={data.gateFoncierCommentaire ?? ''} onChange={(e) => update('gateFoncierCommentaire', e.target.value)} className={inputClass} readOnly={readOnly} />
            </div>
          </div>
        </TabsContent>

        {/* — Onglet 4 : Programme & Exigences — */}
        <TabsContent value="programme" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className={labelClass}>Surface totale cible (m²)</Label>
              <Input type="number" value={data.surfaceTotale ?? ''} onChange={(e) => update('surfaceTotale', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Niveaux prévus (R+…)</Label>
              <Input value={data.niveaux ?? ''} onChange={(e) => update('niveaux', e.target.value)} placeholder="R+3" className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Nombre logements / unités</Label>
              <Input type="number" value={data.nbLogements ?? ''} onChange={(e) => update('nbLogements', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Places parking</Label>
              <Input type="number" value={data.nbParking ?? ''} onChange={(e) => update('nbParking', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Type parking</Label>
              <Input value={data.typeParking ?? ''} onChange={(e) => update('typeParking', e.target.value)} placeholder="Sous-sol, surface…" className={inputClass} readOnly={readOnly} />
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className={labelClass + ' mb-2 font-medium text-slate-300'}>Surfaces détaillées</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className={labelClass}>Surface habitable (m²)</Label>
                <Input type="number" value={data.surfaceHabitable ?? ''} onChange={(e) => update('surfaceHabitable', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
              </div>
              <div>
                <Label className={labelClass}>Surface commerces/bureaux (m²)</Label>
                <Input type="number" value={data.surfaceCommercesBureaux ?? ''} onChange={(e) => update('surfaceCommercesBureaux', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
              </div>
              <div>
                <Label className={labelClass}>Parties communes (m²)</Label>
                <Input type="number" value={data.partiesCommunes ?? ''} onChange={(e) => update('partiesCommunes', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
              </div>
              <div>
                <Label className={labelClass}>Espaces extérieurs (m²)</Label>
                <Input type="number" value={data.espacesExterieurs ?? ''} onChange={(e) => update('espacesExterieurs', e.target.value ? Number(e.target.value) : undefined)} className={inputClass} readOnly={readOnly} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className={labelClass + ' mb-2 font-medium text-slate-300'}>Contraintes de conception</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Hauteur max autorisée</Label>
                <Input value={data.hauteurMaxAutorisee ?? ''} onChange={(e) => update('hauteurMaxAutorisee', e.target.value)} placeholder="m" className={inputClass} readOnly={readOnly} />
              </div>
              <div>
                <Label className={labelClass}>Emprise au sol max</Label>
                <Input value={data.empriseAuSolMax ?? ''} onChange={(e) => update('empriseAuSolMax', e.target.value)} placeholder="m² ou %" className={inputClass} readOnly={readOnly} />
              </div>
              <div className="col-span-2">
                <Label className={labelClass}>COS / règles urbanisme (si connues)</Label>
                <Input value={data.cosReglesUrbanisme ?? ''} onChange={(e) => update('cosReglesUrbanisme', e.target.value)} className={inputClass} readOnly={readOnly} />
              </div>
              <div className="col-span-2">
                <Label className={labelClass}>Contraintes environnementales (zones inondables, bruit…)</Label>
                <Textarea rows={2} value={data.contraintesEnvironnementales ?? ''} onChange={(e) => update('contraintesEnvironnementales', e.target.value)} className={inputClass} readOnly={readOnly} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className={labelClass + ' mb-2 font-medium text-slate-300'}>Priorités MOA</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={!!data.prioriteMinimiserCapex} onCheckedChange={(c) => update('prioriteMinimiserCapex', !!c)} disabled={readOnly} />
                <span className="text-[0.75rem] text-slate-300">Minimiser CAPEX</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={!!data.prioriteMinimiserOpex} onCheckedChange={(c) => update('prioriteMinimiserOpex', !!c)} disabled={readOnly} />
                <span className="text-[0.75rem] text-slate-300">Minimiser OPEX</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={!!data.prioriteImageArchitecturale} onCheckedChange={(c) => update('prioriteImageArchitecturale', !!c)} disabled={readOnly} />
                <span className="text-[0.75rem] text-slate-300">Image architecturale forte</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={!!data.prioriteDelaisCourts} onCheckedChange={(c) => update('prioriteDelaisCourts', !!c)} disabled={readOnly} />
                <span className="text-[0.75rem] text-slate-300">Délais courts</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Structure envisagée</Label>
              <Input value={data.structureEnvisagee ?? ''} onChange={(e) => update('structureEnvisagee', e.target.value)} placeholder="Béton armé, mixte…" className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>Type de façade</Label>
              <Input value={data.typeFacade ?? ''} onChange={(e) => update('typeFacade', e.target.value)} placeholder="Bardage, enduit, mur rideau…" className={inputClass} readOnly={readOnly} />
            </div>
            <div>
              <Label className={labelClass}>CVC</Label>
              <Select value={data.cvc ?? ''} onValueChange={(v) => update('cvc', v as OpportunityFormData['cvc'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {['Splits', 'VRV', 'Centralisé'].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Solaire PV</Label>
              <Select value={data.solairePv ?? ''} onValueChange={(v) => update('solairePv', v as OpportunityFormData['solairePv'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {['Oui', 'Non', 'À étudier'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Groupe électrogène</Label>
              <Select value={data.groupeElectrogene ?? ''} onValueChange={(v) => update('groupeElectrogene', v as OpportunityFormData['groupeElectrogene'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oui">Oui</SelectItem>
                  <SelectItem value="Non">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Priorité confort thermique</Label>
              <Select value={data.prioriteThermique ?? ''} onValueChange={(v) => update('prioriteThermique', v as OpportunityFormData['prioriteThermique'])} disabled={readOnly}>
                <SelectTrigger className={inputClass}><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {['faible', 'moyenne', 'forte'].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className={labelClass}>Priorité maintenance faible / robustesse</Label>
            <Input value={data.prioriteMaintenance ?? ''} onChange={(e) => update('prioriteMaintenance', e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div>
            <Label className={labelClass}>Contraintes spécifiques (bruit, poussière, voisinage)</Label>
            <Textarea rows={2} value={data.contraintesSpecifiques ?? ''} onChange={(e) => update('contraintesSpecifiques', e.target.value)} className={inputClass} readOnly={readOnly} />
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <p className={labelClass + ' mb-2 font-medium text-slate-300'}>Gate programme</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Programme validé</Label>
                <Select value={data.programmeValide ?? ''} onValueChange={(v) => update('programmeValide', v as OpportunityFormData['programmeValide'])} disabled={readOnly}>
                  <SelectTrigger className={inputClass}><SelectValue placeholder="En cours" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Oui">Oui</SelectItem>
                    <SelectItem value="Non">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelClass}>Version programme</Label>
                <Input value={data.versionProgramme ?? ''} onChange={(e) => update('versionProgramme', e.target.value)} placeholder="V1, V2…" className={inputClass} readOnly={readOnly} />
              </div>
              <div>
                <Label className={labelClass}>Date Gate 2</Label>
                <Input type="date" value={data.gate2Date ?? ''} onChange={(e) => update('gate2Date', e.target.value)} className={inputClass} readOnly={readOnly} />
              </div>
              <div className="col-span-2">
                <Label className={labelClass}>Commentaire de validation</Label>
                <Textarea rows={2} value={data.gate2Commentaire ?? ''} onChange={(e) => update('gate2Commentaire', e.target.value)} placeholder="Commentaire de validation Gate 2" className={inputClass} readOnly={readOnly} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {!readOnly && (onSubmit || onCancel) && (
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          {onSubmit && (
            <Button type="submit">{submitLabel}</Button>
          )}
        </div>
      )}
    </form>
  );
}
