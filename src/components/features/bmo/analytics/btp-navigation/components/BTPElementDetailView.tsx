/**
 * Vue de Détail d'Élément
 * Affiche la fiche complète d'un élément (chantier, facture, ressource, etc.)
 * avec toutes les sections : général, financier, planning, ressources, QSE, documents
 */

'use client';

import React, { useState } from 'react';
import { BTPKPIModal } from './BTPKPIModal';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import {
  Building2,
  DollarSign,
  Calendar,
  Users,
  Shield,
  FileText,
  TrendingUp,
  AlertTriangle,
  Link as LinkIcon,
  Edit,
  Copy,
  Archive,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BTPKPIWidget } from './BTPKPIWidget';
import { BTPVisualization } from './BTPVisualization';
import { BTPElementEditForm } from './BTPElementEditForm';
import { Clock } from 'lucide-react';

interface BTPElementDetailViewProps {
  elementId: string;
  elementType: 'chantier' | 'facture' | 'ressource' | 'contrat' | 'lot' | 'equipement';
  onClose?: () => void;
  onNavigateToRelated?: (type: string, id: string) => void;
}

interface ElementData {
  id: string;
  nom: string;
  statut: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  actualEndDate?: string;
  responsable?: string;
  localisation?: string;
  tags?: string[];
  kpis?: Array<{
    id: string;
    label: string;
    value: number;
    target?: number;
    unit?: string;
    status: 'good' | 'warning' | 'critical';
  }>;
  financial?: {
    budget: number;
    realise: number;
    marge: number;
    depenses: Array<{ category: string; amount: number }>;
  };
  planning?: {
    avancement: number;
    delai: number;
    jalons: Array<{ id: string; nom: string; date: string; statut: string }>;
  };
  resources?: Array<{ id: string; nom: string; role: string; charge: number }>;
  qse?: {
    incidents: number;
    nonConformites: number;
    certifications: string[];
  };
  documents?: Array<{ id: string; nom: string; type: string; date: string }>;
  relations?: Array<{ type: string; id: string; nom: string }>;
  timeline?: Array<{ date: string; event: string; user: string }>;
}

export function BTPElementDetailView({
  elementId,
  elementType,
  onClose,
  onNavigateToRelated,
}: BTPElementDetailViewProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Données mockées (à remplacer par les vraies données)
  const elementData: ElementData = {
    id: elementId,
    nom: `Élément ${elementId}`,
    statut: 'En cours',
    createdAt: '2025-01-01',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    responsable: 'Jean Dupont',
    localisation: 'Paris, France',
    tags: ['Urgent', 'Important'],
    kpis: [
      { id: 'kpi1', label: 'Avancement', value: 65, target: 100, unit: '%', status: 'good' },
      { id: 'kpi2', label: 'Budget', value: 850000, target: 1000000, unit: 'FCFA', status: 'warning' },
      { id: 'kpi3', label: 'Marge', value: 15, target: 20, unit: '%', status: 'warning' },
    ],
    financial: {
      budget: 1000000,
      realise: 850000,
      marge: 15,
      depenses: [
        { category: 'Main d\'œuvre', amount: 400000 },
        { category: 'Matériel', amount: 300000 },
        { category: 'Sous-traitance', amount: 150000 },
      ],
    },
    planning: {
      avancement: 65,
      delai: 5,
      jalons: [
        { id: 'j1', nom: 'Démarrage', date: '2025-01-15', statut: 'Terminé' },
        { id: 'j2', nom: 'Milieu', date: '2025-04-15', statut: 'En cours' },
        { id: 'j3', nom: 'Fin', date: '2025-06-30', statut: 'À venir' },
      ],
    },
    resources: [
      { id: 'r1', nom: 'Équipe A', role: 'Ouvriers', charge: 80 },
      { id: 'r2', nom: 'Équipe B', role: 'Techniciens', charge: 60 },
    ],
    qse: {
      incidents: 2,
      nonConformites: 1,
      certifications: ['ISO 9001', 'ISO 14001'],
    },
    documents: [
      { id: 'd1', nom: 'Devis.pdf', type: 'PDF', date: '2025-01-01' },
      { id: 'd2', nom: 'Plan.pdf', type: 'PDF', date: '2025-01-05' },
    ],
    relations: [
      { type: 'chantier', id: 'c1', nom: 'Chantier Parent' },
      { type: 'facture', id: 'f1', nom: 'Facture 001' },
    ],
    timeline: [
      { date: '2025-01-01', event: 'Création', user: 'Admin' },
      { date: '2025-01-15', event: 'Démarrage', user: 'Jean Dupont' },
      { date: '2025-02-01', event: 'Premier jalon atteint', user: 'Jean Dupont' },
    ],
  };

  const getElementIcon = () => {
    switch (elementType) {
      case 'chantier':
        return Building2;
      case 'facture':
        return DollarSign;
      case 'ressource':
        return Users;
      case 'contrat':
        return FileText;
      case 'lot':
        return Building2;
      case 'equipement':
        return Building2;
      default:
        return Building2;
    }
  };

  const ElementIcon = getElementIcon();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-slate-700 bg-slate-900/50">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <ElementIcon className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-semibold text-slate-200">{elementData.nom}</h1>
            <Badge variant="default" className="text-xs">
              {elementData.statut}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            {elementData.responsable && (
              <span>Responsable: {elementData.responsable}</span>
            )}
            {elementData.localisation && (
              <span>📍 {elementData.localisation}</span>
            )}
            {elementData.tags && elementData.tags.length > 0 && (
              <div className="flex items-center gap-2">
                {elementData.tags.map((tag) => (
                  <Badge key={tag} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Fermer
            </Button>
          )}
          <Button variant="default" size="sm" onClick={() => setIsEditModalOpen(true)} className="text-xs">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="default" size="sm" className="text-xs">
            <Copy className="h-4 w-4 mr-2" />
            Dupliquer
          </Button>
          <Button variant="default" size="sm" className="text-xs">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="financial">Financier</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
            <TabsTrigger value="qse">QSE</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Section Générale */}
          <TabsContent value="general" className="space-y-6 mt-6">
            {/* KPIs Individuels */}
            {elementData.kpis && elementData.kpis.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {elementData.kpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    onClick={() => setSelectedKPI(kpi.id)}
                    className="cursor-pointer"
                  >
                    <BTPKPIWidget
                      label={kpi.label}
                      value={kpi.value}
                      target={kpi.target}
                      unit={kpi.unit}
                      status={kpi.status === 'critical' ? 'error' : kpi.status === 'good' ? 'success' : kpi.status === 'warning' ? 'warning' : 'info'}
                      description={kpi.label}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Informations Générales */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Informations Générales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Date de création</p>
                  <p className="text-sm text-slate-300">{elementData.createdAt}</p>
                </div>
                {elementData.startDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Date de début</p>
                    <p className="text-sm text-slate-300">{elementData.startDate}</p>
                  </div>
                )}
                {elementData.endDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Date de fin prévue</p>
                    <p className="text-sm text-slate-300">{elementData.endDate}</p>
                  </div>
                )}
                {elementData.actualEndDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Date de fin réelle</p>
                    <p className="text-sm text-slate-300">{elementData.actualEndDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Relations */}
            {elementData.relations && elementData.relations.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Éléments Liés</h3>
                <div className="space-y-2">
                  {elementData.relations.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex items-center justify-between p-2 bg-slate-900/50 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                      onClick={() => onNavigateToRelated?.(rel.type, rel.id)}
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{rel.nom}</span>
                        <Badge variant="default" className="text-xs">
                          {rel.type}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Voir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {elementData.timeline && elementData.timeline.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-300">Timeline</h3>
                </div>
                <div className="space-y-3">
                  {elementData.timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">{event.event}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{event.date}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">{event.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Section Financière */}
          <TabsContent value="financial" className="space-y-6 mt-6">
            {elementData.financial && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Budget</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {elementData.financial.budget.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Réalisé</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {elementData.financial.realise.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Marge</p>
                    <p className="text-2xl font-bold text-slate-200">
                      {elementData.financial.marge}%
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Répartition des Dépenses</h3>
                  <BTPVisualization
                    visualization={{
                      id: 'financial-distribution',
                      type: 'donut',
                      dataSource: 'financial-depenses',
                      config: {
                        valueKey: 'amount',
                        labelKey: 'category',
                      },
                      interactions: { click: 'filter' },
                    }}
                    data={elementData.financial.depenses}
                    height={300}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Section Planning */}
          <TabsContent value="planning" className="space-y-6 mt-6">
            {elementData.planning && (
              <>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-300">Avancement</h3>
                    <span className="text-2xl font-bold text-slate-200">
                      {elementData.planning.avancement}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${elementData.planning.avancement}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Jalons</h3>
                  <div className="space-y-3">
                    {elementData.planning.jalons.map((jalon) => (
                      <div
                        key={jalon.id}
                        className="flex items-center justify-between p-3 bg-slate-900/50 rounded"
                      >
                        <div>
                          <p className="text-sm text-slate-300">{jalon.nom}</p>
                          <p className="text-xs text-slate-500">{jalon.date}</p>
                        </div>
                        <Badge
                          variant={
                            jalon.statut === 'Terminé'
                              ? 'success'
                              : jalon.statut === 'En cours'
                              ? 'default'
                              : 'gray'
                          }
                          className="text-xs"
                        >
                          {jalon.statut}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Section Ressources */}
          <TabsContent value="resources" className="space-y-6 mt-6">
            {elementData.resources && elementData.resources.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Ressources Allouées</h3>
                <div className="space-y-3">
                  {elementData.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded"
                    >
                      <div>
                        <p className="text-sm text-slate-300">{resource.nom}</p>
                        <p className="text-xs text-slate-500">{resource.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">{resource.charge}%</span>
                        <div className="w-24 bg-slate-900 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${resource.charge}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Section QSE */}
          <TabsContent value="qse" className="space-y-6 mt-6">
            {elementData.qse && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Incidents</p>
                  <p className="text-2xl font-bold text-slate-200">{elementData.qse.incidents}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Non-conformités</p>
                  <p className="text-2xl font-bold text-slate-200">
                    {elementData.qse.nonConformites}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Certifications</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {elementData.qse.certifications.map((cert) => (
                      <Badge key={cert} variant="default" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Section Documents */}
          <TabsContent value="documents" className="space-y-6 mt-6">
            {elementData.documents && elementData.documents.length > 0 ? (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Documents Associés</h3>
                <div className="space-y-2">
                  {elementData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-slate-900/50 rounded hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-300">{doc.nom}</p>
                          <p className="text-xs text-slate-500">{doc.type} • {doc.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400">Aucun document associé</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modale KPI */}
      {selectedKPI && elementData.kpis && (
        <BTPKPIModal
          isOpen={!!selectedKPI}
          onClose={() => setSelectedKPI(null)}
          kpi={{
            id: selectedKPI,
            label: elementData.kpis.find((k) => k.id === selectedKPI)?.label || '',
            unit: elementData.kpis.find((k) => k.id === selectedKPI)?.unit,
            target: elementData.kpis.find((k) => k.id === selectedKPI)?.target,
            apiEndpoint: `/api/analytics/kpis/${selectedKPI}`,
          }}
          currentValue={elementData.kpis.find((k) => k.id === selectedKPI)?.value}
          target={elementData.kpis.find((k) => k.id === selectedKPI)?.target}
        />
      )}

      {/* Modale Édition */}
      {isEditModalOpen && (
        <BTPIntelligentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Modifier l'élément"
          description="Modification des informations de l'élément"
          size="lg"
        >
          <BTPElementEditForm
            elementId={elementId}
            elementType={elementType}
            initialData={{
              nom: elementData.nom,
              statut: elementData.statut,
              responsable: elementData.responsable,
              localisation: elementData.localisation,
              startDate: elementData.startDate,
              endDate: elementData.endDate,
              tags: elementData.tags,
            }}
            onSave={async (data) => {
              try {
                const response = await fetch(`/api/analytics/elements/${elementId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });

                if (response.ok) {
                  // Recharger les données ou mettre à jour l'état
                  setIsEditModalOpen(false);
                  // TODO: Recharger les données de l'élément
                } else {
                  throw new Error('Erreur lors de la sauvegarde');
                }
              } catch (error) {
                console.error('Error saving element:', error);
                throw error;
              }
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </BTPIntelligentModal>
      )}
    </div>
  );
}

