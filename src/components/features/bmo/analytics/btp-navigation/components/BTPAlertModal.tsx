/**
 * Modale de Détail d'Alerte
 * Affiche toutes les informations sur une alerte avec impact, causes, actions recommandées
 */

'use client';

import React, { useState } from 'react';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { AlertTriangle, CheckCircle, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import type { AlertDefinition } from '@/lib/config/analyticsDisplayLogic';

interface BTPAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertDefinition & {
    id: string;
    title: string;
    description: string;
    detectedAt: string;
    impact?: {
      estimated: string;
      elements: string[];
      costs?: number;
      delays?: number;
    };
    causes?: Array<{
      id: string;
      description: string;
      type: 'root' | 'contributing';
    }>;
    recommendations?: Array<{
      id: string;
      title: string;
      description: string;
      impact: string;
      cost?: number;
      duration?: string;
      responsible?: string;
    }>;
  };
}

export function BTPAlertModal({ isOpen, onClose, alert }: BTPAlertModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [resolutionNote, setResolutionNote] = useState('');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'opportunity':
        return 'success';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'budget':
        return '💰';
      case 'delay':
        return '⏱️';
      case 'qse':
        return '🛡️';
      case 'quality':
        return '✅';
      case 'risk':
        return '⚠️';
      case 'opportunity':
        return '🎯';
      default:
        return '📌';
    }
  };

  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title={alert.title}
      description={alert.description}
      size="xl"
      actions={[
        {
          label: 'Marquer en cours',
          onClick: () => {
            logger.debug('Marquer en cours', { component: 'BTPAlertModal', alertId: alert.id });
          },
          variant: 'secondary',
        },
        {
          label: 'Résoudre',
          onClick: () => {
            setActiveTab('resolution');
          },
          variant: 'primary',
        },
      ]}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" aria-label="Détail de l'alerte">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1" aria-label="Sections du détail alerte">
          <TabsTrigger value="info" className="text-xs truncate">Informations</TabsTrigger>
          <TabsTrigger value="impact" className="text-xs truncate">Impact</TabsTrigger>
          <TabsTrigger value="causes" className="text-xs truncate">Causes</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs truncate">Actions</TabsTrigger>
          <TabsTrigger value="resolution" className="text-xs truncate">Résolution</TabsTrigger>
          <TabsTrigger value="history" className="text-xs truncate">Historique</TabsTrigger>
        </TabsList>

        {/* Informations */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-300 mb-1">Type</p>
              <Badge variant={getTypeColor(alert.type)} className="text-xs">
                {alert.type}
              </Badge>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Catégorie</p>
              <div className="flex items-center gap-2">
                <span>{getCategoryIcon(alert.category)}</span>
                <span className="text-sm text-slate-300 capitalize">{alert.category}</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-300 mb-1">Date de détection</p>
              <p className="text-sm text-slate-300">{alert.detectedAt}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Statut</p>
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-300 mb-2">Description</p>
            <p className="text-sm text-slate-300">{alert.description}</p>
          </div>
        </TabsContent>

        {/* Impact */}
        <TabsContent value="impact" className="space-y-4">
          {alert.impact && (
            <>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm font-semibold text-slate-300 mb-3">Impact estimé</p>
                <p className="text-lg font-bold text-slate-200">{alert.impact.estimated}</p>
              </div>

              {alert.impact.elements && alert.impact.elements.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-semibold text-slate-300 mb-3">Éléments affectés</p>
                  <div className="space-y-2">
                    {alert.impact.elements.map((element, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-slate-900/50 rounded"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-slate-300">{element}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alert.impact.costs !== undefined && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-semibold text-slate-300 mb-2">Coûts associés</p>
                  <p className="text-2xl font-bold text-slate-200">
                    {alert.impact.costs.toLocaleString()} FCFA
                  </p>
                </div>
              )}

              {alert.impact.delays !== undefined && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-semibold text-slate-300 mb-2">Délais impactés</p>
                  <p className="text-2xl font-bold text-slate-200">
                    {alert.impact.delays} jour{alert.impact.delays > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Causes */}
        <TabsContent value="causes" className="space-y-4">
          {alert.causes && alert.causes.length > 0 ? (
            <div className="space-y-3">
              {alert.causes.map((cause) => (
                <div
                  key={cause.id}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-2',
                        cause.type === 'root' ? 'bg-red-400' : 'bg-amber-400'
                      )}
                    />
                    <div className="flex-1">
                      <Badge
                        variant={cause.type === 'root' ? 'destructive' : 'default'}
                        className="text-xs mb-2"
                      >
                        {cause.type === 'root' ? 'Cause racine' : 'Facteur contributif'}
                      </Badge>
                      <p className="text-sm text-slate-300">{cause.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-slate-400">Aucune cause identifiée pour le moment</p>
            </div>
          )}
        </TabsContent>

        {/* Actions Recommandées */}
        <TabsContent value="actions" className="space-y-4">
          {alert.recommendations && alert.recommendations.length > 0 ? (
            <div className="space-y-3">
              {alert.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-slate-300 mb-1">{rec.title}</h5>
                      <p className="text-xs text-slate-400 mb-2">{rec.description}</p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {rec.impact}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {rec.cost !== undefined && <span>Coût: {rec.cost.toLocaleString()} FCFA</span>}
                    {rec.duration && <span>Durée: {rec.duration}</span>}
                    {rec.responsible && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {rec.responsible}
                      </span>
                    )}
                  </div>
                  <Button variant="default" size="sm" className="mt-3 text-xs">
                    Planifier cette action
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-slate-400">Aucune action recommandée pour le moment</p>
            </div>
          )}
        </TabsContent>

        {/* Résolution */}
        <TabsContent value="resolution" className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm font-semibold text-slate-300 mb-3">Résoudre l'alerte</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Actions prises</label>
                <Textarea
                  placeholder="Décrivez les actions prises pour résoudre l'alerte..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-300"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Résultats obtenus</label>
                <Textarea
                  placeholder="Décrivez les résultats obtenus..."
                  className="bg-slate-900 border-slate-700 text-slate-300"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Documents justificatifs</label>
                <Button variant="default" size="sm" className="text-xs">
                  <FileText className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    logger.debug('Resolve alert', { component: 'BTPAlertModal' });
                    onClose();
                  }}
                  className="text-xs"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Résoudre l'alerte
                </Button>
                <Button variant="default" size="sm" onClick={onClose} className="text-xs">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {[
              { date: '2025-01-15 10:30', event: 'Alerte détectée', user: 'Système' },
              { date: '2025-01-15 11:00', event: 'Assignée à', user: 'Jean Dupont' },
              { date: '2025-01-15 14:30', event: 'Marquée comme en cours', user: 'Jean Dupont' },
            ].map((event, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-300">{event.event}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{event.date}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {event.user}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </BTPIntelligentModal>
  );
}

