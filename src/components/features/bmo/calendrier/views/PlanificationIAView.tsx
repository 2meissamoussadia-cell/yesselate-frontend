'use client';

/**
 * Planification IA - Suggestions intelligentes
 */

import React from 'react';
import { Brain, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';

export function PlanificationIAView() {
  const { suggestionsIA } = useCalendrierStore();

  // Données mockées
  const suggestionsData = suggestionsIA.length > 0 ? suggestionsIA : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">Suggestions en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-200">
              {suggestionsData.filter(s => s.statut === 'en-attente').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400">% suggestions acceptées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {suggestionsData.length > 0
                ? Math.round((suggestionsData.filter(s => s.statut === 'accepte').length / suggestionsData.length) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions IA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Suggestions IA</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestionsData.filter(s => s.statut === 'en-attente').length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aucune suggestion en attente</p>
          ) : (
            <div className="space-y-4">
              {suggestionsData.filter(s => s.statut === 'en-attente').map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-pink-400" />
                      <span className="text-sm font-medium text-slate-200">{suggestion.description}</span>
                      <Badge variant="gray">{suggestion.type}</Badge>
                    </div>
                  </div>
                  {suggestion.benefices && suggestion.benefices.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-slate-400 mb-1">Bénéfices:</div>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                        {suggestion.benefices.map((benefice, idx) => (
                          <li key={idx}>{benefice}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <Check className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                    <Button size="sm" variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                    <Button size="sm" variant="ghost">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Voir justification
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

