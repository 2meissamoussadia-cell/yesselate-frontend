/**
 * ====================================================================
 * MODAL: Export de Données
 * Modal pour exporter les substitutions dans différents formats
 * ====================================================================
 */

'use client';

import { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, FileJson, Calendar, Filter, Loader2, CheckCircle } from 'lucide-react';
import { logger } from '@/lib/utils/logger';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter?: any;
}

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: FileText, description: 'Rapport formaté pour impression', color: 'text-red-400' },
  { value: 'excel', label: 'Excel (XLSX)', icon: FileSpreadsheet, description: 'Feuille de calcul complète', color: 'text-green-400' },
  { value: 'csv', label: 'CSV', icon: FileText, description: 'Données tabulaires simples', color: 'text-blue-400' },
  { value: 'json', label: 'JSON', icon: FileJson, description: 'Format technique pour API', color: 'text-purple-400' },
];

const EXPORT_SCOPES = [
  { value: 'current', label: 'Vue actuelle', description: 'Exporter les éléments actuellement visibles' },
  { value: 'filtered', label: 'Résultats filtrés', description: 'Tous les éléments correspondant aux filtres' },
  { value: 'all', label: 'Toutes les données', description: 'Export complet sans filtres' },
  { value: 'selection', label: 'Sélection', description: 'Uniquement les éléments sélectionnés' },
];

export function ExportModal({ isOpen, onClose, currentFilter }: ExportModalProps) {
  const [format, setFormat] = useState('excel');
  const [scope, setScope] = useState('filtered');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeComments, setIncludeComments] = useState(false);
  const [includeTimeline, setIncludeTimeline] = useState(false);
  const [includeDocuments, setIncludeDocuments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const exportData = {
        format,
        scope,
        dateRange: dateRange.start && dateRange.end ? dateRange : undefined,
        options: {
          includeDetails,
          includeComments,
          includeTimeline,
          includeDocuments,
        },
        filter: currentFilter,
        timestamp: new Date().toISOString(),
      };

      logger.debug('Export', { component: 'ExportModal', exportData });
      
      // Simulate file download
      const filename = `substitutions_export_${new Date().toISOString().split('T')[0]}.${format}`;
      logger.debug('Export file generated', { component: 'ExportModal', filename });
      
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      logger.error('Export error', error instanceof Error ? error : undefined, { component: 'ExportModal' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                Exporter les données
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Choisissez le format et les options d'export
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Export réussi !</h3>
              <p className="text-slate-400 text-center">
                Votre fichier a été généré et téléchargé avec succès.
              </p>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Format d'export
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {EXPORT_FORMATS.map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.value}
                        onClick={() => setFormat(fmt.value)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          format === fmt.value
                            ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50'
                            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 ${fmt.color} flex-shrink-0 mt-0.5`} />
                          <div>
                            <div className="font-medium text-white">{fmt.label}</div>
                            <div className="text-xs text-slate-400 mt-1">{fmt.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Portée de l'export
                </label>
                <div className="space-y-2">
                  {EXPORT_SCOPES.map((sc) => (
                    <button
                      key={sc.value}
                      onClick={() => setScope(sc.value)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        scope === sc.value
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-white">{sc.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{sc.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Période (optionnel)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      min={dateRange.start}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Options supplémentaires
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeDetails}
                      onChange={(e) => setIncludeDetails(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">Inclure les détails complets</div>
                      <div className="text-xs text-slate-400">Toutes les informations de chaque substitution</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeComments}
                      onChange={(e) => setIncludeComments(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">Inclure les commentaires</div>
                      <div className="text-xs text-slate-400">Historique des discussions</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeTimeline}
                      onChange={(e) => setIncludeTimeline(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">Inclure la timeline</div>
                      <div className="text-xs text-slate-400">Historique des événements</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={includeDocuments}
                      onChange={(e) => setIncludeDocuments(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">Inclure la liste des documents</div>
                      <div className="text-xs text-slate-400">Noms et métadonnées des documents attachés</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex gap-3">
                  <Download className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">Téléchargement automatique</p>
                    <p className="text-blue-300/80">
                      Le fichier sera généré et téléchargé automatiquement. Selon le volume de données, cela peut prendre quelques secondes.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exporter
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

