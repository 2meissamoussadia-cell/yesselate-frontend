'use client';

/**
 * Conflits - Détection et résolution des conflits
 */

import React, { useState } from 'react';
import { AlertTriangle, Move, Merge, UserMinus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import { logger } from '@/lib/utils/logger';
import type { Conflit } from '@/lib/types/calendrier.types';
import { ResoudreConflitModal } from '../modals/ResoudreConflitModal';

export function ConflitsView() {
  const { conflits } = useCalendrierStore();
  const [selectedConflit, setSelectedConflit] = useState<Conflit | null>(null);
  const [showResoudreModal, setShowResoudreModal] = useState(false);

  // Données mockées
  const conflitsData = conflits.length > 0 ? conflits : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPIs conflits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Conflits actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">{conflitsData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Conflits critiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {conflitsData.filter(c => c.impact === 'critique').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Délai moyen résolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-200">2.5 j</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des conflits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Conflits détectés</CardTitle>
        </CardHeader>
        <CardContent>
          {conflitsData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucun conflit détecté</p>
          ) : (
            <div className="space-y-4">
              {conflitsData.map((conflit) => (
                <div
                  key={conflit.id}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                      <span className="text-sm font-medium text-slate-200">Conflit {conflit.type}</span>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{conflit.impact}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {conflit.elements.map((el, idx) => (
                      <div key={idx} className="text-sm text-slate-300">
                        • {el.label} ({el.moduleSource}) - {new Date(el.date).toLocaleString('fr-FR')}
                      </div>
                    ))}
                  </div>
                  {conflit.suggestions && conflit.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="text-xs text-slate-400 mb-2">Suggestions de résolution:</div>
                      <div className="flex gap-2">
                        {conflit.suggestions.map((suggestion) => (
                          <Button
                            key={suggestion.id}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedConflit(conflit);
                              setShowResoudreModal(true);
                            }}
                          >
                            {suggestion.type === 'deplacer' && <Move className="h-4 w-4 mr-2" />}
                            {suggestion.type === 'fusionner' && <Merge className="h-4 w-4 mr-2" />}
                            {suggestion.type === 'desassigner' && <UserMinus className="h-4 w-4 mr-2" />}
                            {suggestion.description}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="default"
                    className="mt-2"
                    onClick={() => {
                      setSelectedConflit(conflit);
                      setShowResoudreModal(true);
                    }}
                  >
                    Résoudre le conflit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale résolution conflit */}
      {selectedConflit && (
        <ResoudreConflitModal
          isOpen={showResoudreModal}
          onClose={() => {
            setShowResoudreModal(false);
            setSelectedConflit(null);
          }}
          conflit={selectedConflit}
          onSave={(data) => {
            // TODO: Appeler API pour résoudre le conflit
            logger.debug('Résolution conflit', { component: 'ConflitsView', data });
            setShowResoudreModal(false);
            setSelectedConflit(null);
          }}
        />
      )}
    </div>
  );
}

