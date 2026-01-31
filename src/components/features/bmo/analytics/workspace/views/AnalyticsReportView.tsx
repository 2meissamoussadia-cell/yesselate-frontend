/**
 * AnalyticsReportView.tsx
 * ========================
 * 
 * Vue génération et export de rapports
 */

'use client';

import { useState } from 'react';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Download, Calendar, Filter, CheckCircle2,
  FileSpreadsheet, FileType, FileJson, Printer
} from 'lucide-react';
import { calculateKPIs, calculateBureauPerformance } from '@/lib/data/analytics';
import { bureaux } from '@/lib/data';

type ReportType = 'executive' | 'detailed' | 'bureau' | 'trend';
type ExportFormat = 'pdf' | 'excel' | 'json' | 'csv';

export function AnalyticsReportView() {
  const [selectedType, setSelectedType] = useState<ReportType>('executive');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedBureau, setSelectedBureau] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulation génération
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    
    // Simulation téléchargement
    alert(`Rapport ${selectedType} (${selectedFormat}) généré avec succès !`);
  };

  const reportTypes = [
    {
      id: 'executive' as const,
      title: 'Rapport Exécutif',
      icon: '👔',
      description: 'Synthèse pour direction générale avec KPIs clés',
      includes: ['KPIs principaux', 'Tendances', 'Alertes critiques', 'Recommandations'],
    },
    {
      id: 'detailed' as const,
      title: 'Rapport Détaillé',
      icon: '📊',
      description: 'Analyse complète avec toutes les métriques',
      includes: ['Tous les KPIs', 'Graphiques détaillés', 'Analyse bureaux', 'Données financières'],
    },
    {
      id: 'bureau' as const,
      title: 'Rapport Bureau',
      icon: '🏢',
      description: 'Performance spécifique d\'un bureau',
      includes: ['Score bureau', 'Comparaison inter-bureaux', 'Évolution temporelle', 'Recommandations'],
    },
    {
      id: 'trend' as const,
      title: 'Analyse Tendances',
      icon: '📈',
      description: 'Évolution et prédictions',
      includes: ['Tendances historiques', 'Projections', 'Anomalies', 'Insights'],
    },
  ];

  const exportFormats = [
    { id: 'pdf' as const, icon: <FileType className="w-5 h-5" />, label: 'PDF', description: 'Document imprimable' },
    { id: 'excel' as const, icon: <FileSpreadsheet className="w-5 h-5" />, label: 'Excel', description: 'Tableur éditable' },
    { id: 'json' as const, icon: <FileJson className="w-5 h-5" />, label: 'JSON', description: 'Données structurées' },
    { id: 'csv' as const, icon: <FileText className="w-5 h-5" />, label: 'CSV', description: 'Import externe' },
  ];

  const kpis = calculateKPIs();
  const bureauPerf = calculateBureauPerformance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Génération de Rapports</h2>
          <p className="text-slate-400 text-sm">
            Créez des rapports personnalisés et exportez-les dans différents formats
          </p>
        </div>
        <Badge variant="info" className="text-xs">
          {kpis.length} KPIs disponibles
        </Badge>
      </div>

      {/* Types de rapports */}
      <FluentCard>
        <FluentCardHeader>
          <FluentCardTitle className="text-sm">1️⃣ Type de rapport</FluentCardTitle>
        </FluentCardHeader>
        <FluentCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedType === type.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <h3 className="font-semibold mb-1">{type.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{type.description}</p>
                <div className="space-y-1">
                  {type.includes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </FluentCardContent>
      </FluentCard>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Période */}
        <FluentCard>
          <FluentCardHeader>
            <FluentCardTitle className="text-sm">
              <Calendar className="w-4 h-4 inline mr-2" />
              2️⃣ Période
            </FluentCardTitle>
          </FluentCardHeader>
          <FluentCardContent>
            <div className="grid grid-cols-2 gap-3">
              {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`p-3 rounded-lg border transition-all text-center ${
                    selectedPeriod === period
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                  }`}
                >
                  {period === 'week' ? '7 jours' :
                   period === 'month' ? '30 jours' :
                   period === 'quarter' ? 'Trimestre' :
                   'Année'}
                </button>
              ))}
            </div>
          </FluentCardContent>
        </FluentCard>

        {/* Bureau (si applicable) */}
        {selectedType === 'bureau' && (
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                <Filter className="w-4 h-4 inline mr-2" />
                3️⃣ Bureau
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <select
                value={selectedBureau}
                onChange={(e) => setSelectedBureau(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 
                         outline-none focus:ring-2 focus:ring-orange-500/30
                         dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">Tous les bureaux</option>
                {bureaux.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
              
              {selectedBureau !== 'ALL' && (
                <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-semibold mb-1">
                    {bureaux.find(b => b.code === selectedBureau)?.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Score: {bureauPerf.find(b => b.bureauCode === selectedBureau)?.score || 'N/A'}/100
                  </div>
                </div>
              )}
            </FluentCardContent>
          </FluentCard>
        )}
      </div>

      {/* Format d'export */}
      <FluentCard>
        <FluentCardHeader>
          <FluentCardTitle className="text-sm">4️⃣ Format d'export</FluentCardTitle>
        </FluentCardHeader>
        <FluentCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedFormat === format.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                }`}
              >
                <div className="flex justify-center mb-2 text-orange-500">
                  {format.icon}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm mb-1">{format.label}</div>
                  <div className="text-xs text-slate-400">{format.description}</div>
                </div>
              </button>
            ))}
          </div>
        </FluentCardContent>
      </FluentCard>

      {/* Récapitulatif et génération */}
      <FluentCard className="border-2 border-orange-500/30">
        <FluentCardHeader>
          <FluentCardTitle className="text-sm">📋 Récapitulatif</FluentCardTitle>
        </FluentCardHeader>
        <FluentCardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-400 mb-1">Type</div>
                <div className="font-semibold">
                  {reportTypes.find(t => t.id === selectedType)?.title}
                </div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Période</div>
                <div className="font-semibold capitalize">{selectedPeriod}</div>
              </div>
              {selectedType === 'bureau' && (
                <div>
                  <div className="text-slate-400 mb-1">Bureau</div>
                  <div className="font-semibold">
                    {selectedBureau === 'ALL' ? 'Tous' : selectedBureau}
                  </div>
                </div>
              )}
              <div>
                <div className="text-slate-400 mb-1">Format</div>
                <div className="font-semibold uppercase">{selectedFormat}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <FluentButton
                variant="primary"
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Générer et Télécharger
                  </>
                )}
              </FluentButton>
              
              <FluentButton
                variant="secondary"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" />
              </FluentButton>
            </div>

            <div className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              💡 <strong>Astuce:</strong> Les rapports générés incluent tous les graphiques, 
              tableaux et données de la période sélectionnée. Les formats Excel et CSV permettent 
              une manipulation ultérieure des données.
            </div>
          </div>
        </FluentCardContent>
      </FluentCard>
    </div>
  );
}

