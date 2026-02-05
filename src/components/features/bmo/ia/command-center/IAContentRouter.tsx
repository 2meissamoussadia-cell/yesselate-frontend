/**
 * ContentRouter pour IA
 * Router le contenu en fonction de la catégorie active
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { aiModules, aiHistory } from '@/lib/data';
import { Brain } from 'lucide-react';
import type { AIModule, AIAnalysisRequest } from '@/lib/types/bmo.types';

interface IAContentRouterProps {
  category: string;
  searchQuery?: string;
  onModuleSelect?: (moduleId: string | null) => void;
  selectedModuleId?: string | null;
  onRunAnalysis?: (module: AIModule) => void;
  onRetrain?: (module: AIModule) => void;
  onVerifyHash?: (id: string, hash: string) => Promise<boolean>;
}

// Normalisation pour recherche
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const IAContentRouter = React.memo(function IAContentRouter({
  category,
  searchQuery = '',
  onModuleSelect,
  selectedModuleId,
  onRunAnalysis,
  onRetrain,
  onVerifyHash,
}: IAContentRouterProps) {
  // Filtrage des modules selon la catégorie
  const filteredModules = useMemo(() => {
    let result = [...aiModules];

    // Filtre par catégorie
    if (category === 'active') {
      result = result.filter(m => m.status === 'active');
    } else if (category === 'training') {
      result = result.filter(m => m.status === 'training');
    } else if (category === 'disabled') {
      result = result.filter(m => m.status === 'disabled');
    } else if (category === 'error') {
      result = result.filter(m => m.status === 'error');
    } else if (category === 'analysis') {
      result = result.filter(m => m.type === 'analysis');
    } else if (category === 'prediction') {
      result = result.filter(m => m.type === 'prediction');
    } else if (category === 'anomaly') {
      result = result.filter(m => m.type === 'anomaly');
    } else if (category === 'reports') {
      result = result.filter(m => m.type === 'report');
    } else if (category === 'recommendations') {
      result = result.filter(m => m.type === 'recommendation');
    }

    // Recherche
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      result = result.filter(m =>
        normalize(m.id).includes(q) ||
        normalize(m.name).includes(q) ||
        normalize(m.description).includes(q) ||
        normalize(m.type).includes(q)
      );
    }

    return result;
  }, [category, searchQuery]);

  // Filtrage de l'historique
  const filteredHistory = useMemo(() => {
    if (category !== 'history') return [];
    
    if (!searchQuery.trim()) return aiHistory;
    const q = normalize(searchQuery);
    return aiHistory.filter(h =>
      normalize(h.id).includes(q) ||
      normalize(h.moduleId).includes(q) ||
      normalize(h.requestedBy).includes(q) ||
      normalize(h.target).includes(q)
    );
  }, [category, searchQuery]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      analysis: '📊',
      prediction: '🔮',
      anomaly: '🚨',
      report: '📝',
      recommendation: '💡',
    };
    return icons[type] || '🤖';
  };

  const getStatusBorderClass = (status: string) => {
    const borders: Record<string, string> = {
      active: 'border-l-emerald-500',
      training: 'border-l-amber-500',
      disabled: 'border-l-slate-500',
      error: 'border-l-red-500',
    };
    return borders[status] || 'border-l-slate-500';
  };

  // Vue historique
  if (category === 'history') {
    return (
      <div className="p-6 space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <span className="text-4xl mb-4 block">📜</span>
              <p className="text-slate-400">Aucune analyse ne correspond aux critères</p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((analysis) => (
            <Card
              key={analysis.id}
              className={cn(
                'border-l-4',
                analysis.status === 'completed'
                  ? 'border-l-emerald-500'
                  : analysis.status === 'processing'
                  ? 'border-l-blue-500'
                  : 'border-l-red-500'
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-purple-400">{analysis.id}</span>
                      <Badge
                        variant={
                          analysis.status === 'completed'
                            ? 'success'
                            : analysis.status === 'processing'
                            ? 'info'
                            : 'urgent'
                        }
                      >
                        {analysis.status}
                      </Badge>
                      <Badge variant="default">{analysis.target}</Badge>
                    </div>
                    <h3 className="font-bold mt-1">{analysis.moduleId}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{analysis.requestedAt}</p>
                    <p className="text-xs text-slate-400">Par: {analysis.requestedBy}</p>
                  </div>
                </div>

                {analysis.result && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 mb-3">
                    <p className="text-xs text-emerald-400 mb-1">Résultat</p>
                    <p className="text-sm">{analysis.result.summary}</p>
                    {analysis.result.findings && analysis.result.findings.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.result.findings.slice(0, 3).map((f, idx) => (
                          <Badge key={idx} variant="default">
                            {f.title}
                          </Badge>
                        ))}
                        {analysis.result.findings.length > 3 && (
                          <Badge variant="info">+{analysis.result.findings.length - 3}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {analysis.inputs && analysis.inputs.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">
                      📥 Inputs ({analysis.inputs.length} sources)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.inputs.map((input, idx) => (
                        <Badge key={idx} variant="default">
                          {input}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.hash && (
                  <div className="p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash résultat</p>
                    <p className="font-mono text-[10px] truncate">{analysis.hash}</p>
                    {onVerifyHash && (
                      <Button
                        size="xs"
                        variant="ghost"
                        className="mt-1 text-[10px]"
                        onClick={async () => {
                          const isValid = await onVerifyHash(analysis.id, analysis.hash);
                          // Toast géré par le parent
                        }}
                      >
                        🔍 Vérifier
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // Vue paramètres (placeholder)
  if (category === 'settings') {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Paramètres IA</h3>
            <p className="text-slate-400">Paramètres en cours de développement</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue modules (par défaut)
  const selectedModule = selectedModuleId
    ? aiModules.find(m => m.id === selectedModuleId)
    : null;

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {filteredModules.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-slate-400">Aucun module ne correspond aux filtres</p>
              </CardContent>
            </Card>
          ) : (
            filteredModules.map((module) => {
              const isSelected = selectedModuleId === module.id;
              const statusBorderClass = getStatusBorderClass(module.status);

              return (
                <Card
                  key={module.id}
                  className={cn(
                    'cursor-pointer transition-all border-l-4',
                    isSelected ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/50',
                    statusBorderClass
                  )}
                  onClick={() => onModuleSelect?.(module.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getTypeIcon(module.type)}</span>
                          <Badge
                            variant={
                              module.status === 'active'
                                ? 'success'
                                : module.status === 'training'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {module.status}
                          </Badge>
                          <Badge variant="default">{module.type}</Badge>
                        </div>
                        <h3 className="font-bold mt-1">{module.name}</h3>
                        <p className="text-sm text-slate-400">{module.description}</p>
                      </div>
                      {module.accuracy && (
                        <div className="text-right">
                          <p
                            className={cn(
                              'text-3xl font-bold',
                              module.accuracy >= 90
                                ? 'text-emerald-400'
                                : module.accuracy >= 75
                                ? 'text-amber-400'
                                : 'text-red-400'
                            )}
                          >
                            {module.accuracy}%
                          </p>
                          <p className="text-xs text-slate-400">Précision</p>
                        </div>
                      )}
                    </div>

                    {module.accuracy && (
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                          className={cn(
                            'h-full transition-all',
                            module.accuracy >= 90
                              ? 'bg-emerald-500'
                              : module.accuracy >= 75
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${module.accuracy}%` }}
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>Sources: {module.dataSourcesCount}</span>
                      <span>Version: {module.version}</span>
                      {module.lastRun && <span>Dernière exécution: {module.lastRun}</span>}
                    </div>

                    {module.status === 'active' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRunAnalysis?.(module);
                          }}
                        >
                          ▶️ Exécuter
                        </Button>
                        <Button
                          size="sm"
                          variant="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetrain?.(module);
                          }}
                        >
                          🔄 Ré-entraîner
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedModule ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTypeIcon(selectedModule.type)}</span>
                    <Badge variant={selectedModule.status === 'active' ? 'success' : 'warning'}>
                      {selectedModule.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold">{selectedModule.name}</h3>
                  <p className="text-sm text-slate-400">{selectedModule.description}</p>
                </div>

                <div className="space-y-3 text-sm">
                  {selectedModule.accuracy && (
                    <div
                      className={cn(
                        'p-3 rounded text-center',
                        selectedModule.accuracy >= 90
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-amber-500/10 border border-amber-500/30'
                      )}
                    >
                      <p
                        className={cn(
                          'text-4xl font-bold',
                          selectedModule.accuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'
                        )}
                      >
                        {selectedModule.accuracy}%
                      </p>
                      <p className="text-xs text-slate-400">Précision</p>
                    </div>
                  )}

                  <div className="p-3 rounded bg-slate-700/30">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-slate-400">Type</p>
                        <p className="capitalize">{selectedModule.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Version</p>
                        <p>{selectedModule.version}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Sources</p>
                        <p>{selectedModule.dataSourcesCount}</p>
                      </div>
                      {selectedModule.lastRun && (
                        <div>
                          <p className="text-xs text-slate-400">Dernière exéc.</p>
                          <p className="text-xs">{selectedModule.lastRun}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedModule.status === 'active' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onRunAnalysis?.(selectedModule)}
                    >
                      ▶️ Lancer analyse
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => onRetrain?.(selectedModule)}
                    >
                      🔄 Ré-entraîner
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">🧠</span>
                <p className="text-slate-400">Sélectionnez un module</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
});

