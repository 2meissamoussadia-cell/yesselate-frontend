'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { useBMOStore } from '@/lib/stores/bmo-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

interface NarrativeReportProps {
  yearlyTotals: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  enrichedData: any[];
  monthlyAverages: {
    demandes: number;
    validations: number;
    rejets: number;
    budget: string;
  };
}

export function NarrativeReport({
  yearlyTotals,
  enrichedData,
  monthlyAverages,
}: NarrativeReportProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  const report = useMemo(() => {
    const validationRate = (yearlyTotals.validations / yearlyTotals.demandes) * 100;
    const rejectionRate = (yearlyTotals.rejets / yearlyTotals.demandes) * 100;

    // Calculer les tendances
    const recentMonths = enrichedData.slice(-3);
    const previousMonths = enrichedData.slice(-6, -3);
    
    const recentAvg = {
      demandes: recentMonths.reduce((sum, m) => sum + m.demandes, 0) / recentMonths.length,
      validations: recentMonths.reduce((sum, m) => sum + m.validations, 0) / recentMonths.length,
    };

    const previousAvg = {
      demandes: previousMonths.reduce((sum, m) => sum + m.demandes, 0) / previousMonths.length,
      validations: previousMonths.reduce((sum, m) => sum + m.validations, 0) / previousMonths.length,
    };

    const demandesTrend = ((recentAvg.demandes - previousAvg.demandes) / previousAvg.demandes) * 100;
    const validationsTrend = ((recentAvg.validations - previousAvg.validations) / previousAvg.validations) * 100;

    // Générer le rapport narratif
    const sections = [];

    // Introduction
    sections.push({
      title: 'Résumé exécutif',
      content: `Sur la période analysée, un total de ${yearlyTotals.demandes.toLocaleString()} demandes ont été traitées, avec ${yearlyTotals.validations.toLocaleString()} validations réussies (taux de ${validationRate.toFixed(1)}%) et ${yearlyTotals.rejets.toLocaleString()} rejets (taux de ${rejectionRate.toFixed(1)}%). Le budget total traité s'élève à ${yearlyTotals.budget.toFixed(1)} milliards FCFA, avec une moyenne mensuelle de ${monthlyAverages.budget} milliards.`,
    });

    // Performance
    if (validationRate >= 80) {
      sections.push({
        title: 'Performance opérationnelle',
        content: `L'organisation démontre une performance exceptionnelle avec un taux de validation de ${validationRate.toFixed(1)}%, bien au-dessus des standards de l'industrie. Cette performance témoigne d'un processus de validation efficace et d'une qualité élevée des dossiers soumis.`,
      });
    } else if (validationRate < 60) {
      sections.push({
        title: 'Performance opérationnelle',
        content: `Le taux de validation de ${validationRate.toFixed(1)}% est en dessous des attentes et nécessite une attention particulière. Une analyse approfondie des causes de rejet est recommandée pour identifier les points d'amélioration et optimiser les processus.`,
      });
    } else {
      sections.push({
        title: 'Performance opérationnelle',
        content: `Avec un taux de validation de ${validationRate.toFixed(1)}%, la performance se situe dans la moyenne acceptable. Des efforts peuvent être déployés pour améliorer encore ce taux et réduire le nombre de rejets.`,
      });
    }

    // Tendances
    if (Math.abs(demandesTrend) > 10) {
      sections.push({
        title: 'Analyse des tendances',
        content: `Les trois derniers mois montrent une ${demandesTrend > 0 ? 'croissance' : 'diminution'} significative du volume de demandes (${Math.abs(demandesTrend).toFixed(1)}%). ${validationsTrend > 0 ? 'Les validations suivent cette tendance' : 'Les validations ne suivent pas cette tendance'}, ce qui ${validationsTrend > 0 ? 'indique une bonne adaptation' : 'pourrait indiquer des goulots d\'étranglement'}.`,
      });
    }

    // Risques
    if (rejectionRate > 20) {
      sections.push({
        title: 'Points d\'attention',
        content: `Le taux de rejet de ${rejectionRate.toFixed(1)}% est préoccupant et suggère des dysfonctionnements dans le processus. Il est recommandé de mettre en place un plan d'action correctif pour identifier et résoudre les causes récurrentes de rejet.`,
      });
    }

    // Recommandations
    const recommendations = [];
    if (validationRate < 75) {
      recommendations.push('Améliorer la qualité des dossiers soumis avant validation');
    }
    if (rejectionRate > 15) {
      recommendations.push('Mettre en place un processus de pré-validation pour réduire les rejets');
    }
    if (demandesTrend > 20) {
      recommendations.push('Anticiper l\'augmentation de la charge de travail et renforcer les équipes si nécessaire');
    }
    if (validationsTrend < -10) {
      recommendations.push('Analyser les facteurs de ralentissement et optimiser les processus de validation');
    }

    if (recommendations.length > 0) {
      sections.push({
        title: 'Recommandations stratégiques',
        content: recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n'),
      });
    }

    return sections;
  }, [yearlyTotals, enrichedData, monthlyAverages]);

  const handleExport = () => {
    const reportText = report.map(section => 
      `\n## ${section.title}\n\n${section.content}\n`
    ).join('\n---\n');

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-narratif-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addToast('Rapport narratif exporté avec succès', 'success');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Rapport narratif automatique
          </div>
          <Button size="sm" variant="default" onClick={handleExport}>
            <Download className="w-3 h-3 mr-1" />
            Exporter
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {report.map((section, idx) => (
            <div
              key={idx}
              className={cn(
                'p-4 rounded-lg border-l-4',
                'bg-slate-700/30 border-slate-600'
              )}
            >
              <h3 className="font-bold text-sm mb-2 text-orange-400">{section.title}</h3>
              <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Métadonnées */}
        <div className={cn(
          'mt-4 p-3 rounded-lg text-xs',
          'bg-slate-700/30'
        )}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Généré le:</span>
            <span className="font-medium">{new Date().toLocaleString('fr-FR')}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-400">Période analysée:</span>
            <span className="font-medium">
              {enrichedData[0]?.month} - {enrichedData[enrichedData.length - 1]?.month}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

