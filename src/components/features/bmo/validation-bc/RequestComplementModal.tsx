'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Paperclip, Send, MessageSquare, Calendar } from 'lucide-react';
import type { DocumentType, CorrectionRequest, DocumentAnomaly } from '@/lib/types/document-validation.types';

interface RequestComplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: DocumentType;
  documentLabel: string;
  anomalies?: DocumentAnomaly[];
  onRequest: (request: Omit<CorrectionRequest, 'id' | 'requestedAt' | 'status'>) => void;
}

export function RequestComplementModal({
  isOpen,
  onClose,
  documentId,
  documentType,
  documentLabel,
  anomalies = [],
  onRequest,
}: RequestComplementModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [message, setMessage] = useState('');
  const [selectedAnomalies, setSelectedAnomalies] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  // Message pré-rempli
  const defaultMessage = `Bonjour,

Nous avons relevé des éléments à corriger concernant le document ${documentId}.

${anomalies.length > 0 
  ? `Anomalies détectées :\n${anomalies.map(a => `- ${a.message}`).join('\n')}`
  : 'Merci de bien vouloir apporter les corrections nécessaires.'
}

Merci de nous faire parvenir les documents complémentaires dans les plus brefs délais.

Cordialement,
BMO`;

  const handleSend = () => {
    if (!message.trim()) {
      addToast('Le message est obligatoire', 'warning');
      return;
    }

    onRequest({
      documentId,
      documentType,
      message,
      anomalies: selectedAnomalies.length > 0 ? selectedAnomalies : anomalies.map(a => a.id),
      deadline: deadline || undefined,
      requestedBy: 'BMO-USER', // Normalement depuis auth
    });

    addToast('Demande de complément envoyée', 'success');
    onClose();
    setMessage('');
    setSelectedAnomalies([]);
    setDeadline('');
  };

  const handlePreFill = () => {
    setMessage(defaultMessage);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
        'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
        darkMode ? 'bg-slate-900' : 'bg-white',
        'rounded-lg shadow-2xl border border-blue-500/30'
      )}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Demander un complément
              </h2>
              <p className="text-sm text-slate-400">
                Document: <span className="font-mono font-semibold">{documentId}</span> - {documentLabel}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className={cn('p-2 rounded-lg transition-colors', darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Anomalies détectées */}
          {anomalies.length > 0 && (
            <Card className="mb-4 border-orange-500/30 bg-orange-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Anomalies détectées ({anomalies.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {anomalies.map((anomaly) => (
                  <label
                    key={anomaly.id}
                    className={cn(
                      'flex items-start gap-2 p-2 rounded-lg cursor-pointer',
                      darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAnomalies.includes(anomaly.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAnomalies([...selectedAnomalies, anomaly.id]);
                        } else {
                          setSelectedAnomalies(selectedAnomalies.filter(id => id !== anomaly.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            anomaly.severity === 'critical' || anomaly.severity === 'error' ? 'urgent' :
                            anomaly.severity === 'warning' ? 'warning' :
                            'info'
                          }
                          className="text-[10px]"
                        >
                          {anomaly.severity}
                        </Badge>
                        <span className="text-xs text-slate-400">{anomaly.field}</span>
                      </div>
                      <p className="text-sm">{anomaly.message}</p>
                    </div>
                  </label>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-700/30">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedAnomalies(anomalies.map(a => a.id));
                    }}
                  >
                    Tout sélectionner
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedAnomalies([])}
                    className="ml-2"
                  >
                    Tout désélectionner
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulaire */}
          <div className="space-y-4">
            {/* Message */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">Message *</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePreFill}
                >
                  Pré-remplir
                </Button>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className={cn(
                  'w-full px-4 py-3 rounded-lg text-sm border',
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300' 
                    : 'bg-white border-gray-300 text-gray-900'
                )}
                placeholder="Saisir votre message de demande de complément..."
              />
            </div>

            {/* Date limite */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date limite (optionnel)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={cn(
                  'w-full px-4 py-2 rounded-lg text-sm border',
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300' 
                    : 'bg-white border-gray-300 text-gray-900'
                )}
              />
            </div>

            {/* Pièces jointes (simulation) */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Pièces jointes (optionnel)
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addToast('Fonctionnalité de pièces jointes à venir', 'info')}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Ajouter un fichier
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700/30">
            <Button
              variant="success"
              className="flex-1"
              onClick={handleSend}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer la demande
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

