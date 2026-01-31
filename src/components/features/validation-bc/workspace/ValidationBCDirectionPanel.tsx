'use client';

import React, { useState, useEffect } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { ListChecks, TrendingUp, Calculator, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getValidationStats } from '@/lib/services/validation-bc-api';
import type { ValidationStats } from '@/lib/services/validation-bc-api';

export function ValidationBCDirectionPanel() {
  const [activeSection, setActiveSection] = useState<'decision' | 'risks' | 'simulator'>('decision');
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getValidationStats('auto');
        setStats(data);
      } catch (error) {
        console.error('Failed to load direction panel data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Panneau Direction</h3>
        <div className="flex gap-2">
          <FluentButton
            size="sm"
            variant={activeSection === 'decision' ? 'primary' : 'secondary'}
            onClick={() => setActiveSection('decision')}
          >
            <ListChecks className="w-4 h-4 mr-2" />
            À décider
          </FluentButton>
          <FluentButton
            size="sm"
            variant={activeSection === 'risks' ? 'warning' : 'secondary'}
            onClick={() => setActiveSection('risks')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Risques
          </FluentButton>
          <FluentButton
            size="sm"
            variant={activeSection === 'simulator' ? 'success' : 'secondary'}
            onClick={() => setActiveSection('simulator')}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Simulateur
          </FluentButton>
        </div>
      </div>

      {activeSection === 'decision' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-amber-900 dark:text-amber-200">
                      {stats?.pending ?? 0} documents nécessitent une décision
                    </div>
                    <p className="text-sm text-amber-800/90 dark:text-amber-200/90 mt-1">
                      {stats?.urgent ?? 0} urgents • {stats?.anomalies ?? 0} anomalies détectées
                    </p>
                  </div>
                  <FluentButton size="sm" variant="warning">
                    Ouvrir le centre
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </FluentButton>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-rose-200/50 bg-rose-50/50 dark:border-rose-800/30 dark:bg-rose-900/20">
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats?.urgent ?? 0}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Urgents (&lt;24h)</div>
                </div>
                <div className="p-3 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-900/20">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.anomalies ?? 0}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Anomalies</div>
                </div>
                <div className="p-3 rounded-lg border border-orange-200/50 bg-orange-50/50 dark:border-orange-800/30 dark:bg-orange-900/20">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.rejected ?? 0}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Rejetés</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeSection === 'risks' && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : (
            <>
              {(stats?.anomalies ?? 0) > 0 && (
                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-none mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-900 dark:text-rose-200">
                        {stats?.anomalies} anomalie{(stats?.anomalies ?? 0) > 1 ? 's' : ''} détectée{(stats?.anomalies ?? 0) > 1 ? 's' : ''}
                      </div>
                      <p className="text-sm text-rose-800/90 dark:text-rose-200/90 mt-1">
                        Documents avec incohérences, pièces manquantes ou doublons potentiels
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(stats?.urgent ?? 0) > 0 && (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-none mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-900 dark:text-amber-200">
                        Délais critiques
                      </div>
                      <p className="text-sm text-amber-800/90 dark:text-amber-200/90 mt-1">
                        {stats?.urgent} document{(stats?.urgent ?? 0) > 1 ? 's' : ''} approche{(stats?.urgent ?? 0) > 1 ? 'nt' : ''} de la date limite
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(stats?.rejected ?? 0) > 0 && (
                <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-none mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-900 dark:text-orange-200">
                        Documents rejetés
                      </div>
                      <p className="text-sm text-orange-800/90 dark:text-orange-200/90 mt-1">
                        {stats?.rejected} document{(stats?.rejected ?? 0) > 1 ? 's' : ''} rejeté{(stats?.rejected ?? 0) > 1 ? 's' : ''} nécessitant correction
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(stats?.anomalies ?? 0) === 0 && (stats?.urgent ?? 0) === 0 && (stats?.rejected ?? 0) === 0 && (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                    ✓ Aucun risque critique détecté
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeSection === 'simulator' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-200">
                  Simulateur budgétaire
                </div>
                <p className="text-sm text-blue-800/90 dark:text-blue-200/90 mt-1">
                  Impact de la validation sur les budgets
                </p>
              </div>
              <Calculator className="w-6 h-6 text-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Si validation totale</div>
                <div className="text-xl font-bold text-emerald-600">+45.2M FCFA</div>
                <div className="text-xs text-slate-400">Engagement total</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Budget restant après</div>
                <div className="text-xl font-bold text-amber-600">12.8M FCFA</div>
                <div className="text-xs text-slate-400">Marge disponible</div>
              </div>
            </div>
          </div>

          <FluentButton className="w-full" variant="primary">
            <TrendingUp className="w-4 h-4 mr-2" />
            Voir simulation détaillée
          </FluentButton>
        </div>
      )}
    </div>
  );
}

