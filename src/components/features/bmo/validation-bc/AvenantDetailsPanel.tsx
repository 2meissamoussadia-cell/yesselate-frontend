'use client';

import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { 
  X, FileText, AlertTriangle, History, CheckCircle, 
  Clock, DollarSign, Calendar, FileCheck, Download,
  Link2, TrendingUp, MessageSquare, Building2, Shield
} from 'lucide-react';
import type { Amendment } from '@/lib/types/bmo.types';
import { useState } from 'react';
import { BMOValidatorPanel } from './BMOValidatorPanel';

interface AvenantDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  avenant: Amendment | null;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestModification?: () => void;
}

export function AvenantDetailsPanel({
  isOpen,
  onClose,
  avenant,
  onApprove,
  onReject,
  onRequestModification,
}: AvenantDetailsPanelProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history' | 'impact' | 'bmo'>('bmo');

  if (!isOpen || !avenant) return null;

  // Données fictives
  const documents = [
    { id: '1', name: 'Avenant_signe.pdf', type: 'pdf', size: '1.5 MB', date: avenant.date, uploadedBy: avenant.bureau },
    { id: '2', name: 'Justificatif_avenant.pdf', type: 'pdf', size: '856 KB', date: avenant.date, uploadedBy: avenant.bureau },
    { id: '3', name: 'Contrat_original.pdf', type: 'pdf', size: '2.8 MB', date: '15/12/2024', uploadedBy: 'BA' },
  ];

  const history = [
    { id: '1', action: 'Avenant créé', author: avenant.preparedBy, date: avenant.date, icon: '📝' },
    { id: '2', action: 'Soumission au BMO', author: avenant.bureau, date: avenant.date, icon: '⬆️' },
    { id: '3', action: 'Document ajouté', author: avenant.bureau, date: avenant.date, icon: '📎' },
  ];

  const impactDetails = {
    financier: avenant.impact === 'Financier' ? {
      montant: avenant.montant || '0',
      budgetInitial: '25,000,000 FCFA',
      budgetApres: avenant.montant ? (parseFloat(avenant.montant.replace(/[^\d.]/g, '')) + 25000000).toLocaleString('fr-FR') + ' FCFA' : '25,000,000 FCFA',
      impactPourcentage: avenant.montant ? ((parseFloat(avenant.montant.replace(/[^\d.]/g, '')) / 25000000) * 100).toFixed(1) : '0',
    } : null,
    delai: avenant.impact === 'Délai' ? {
      delaiInitial: '90 jours',
      extension: '45 jours',
      nouveauDelai: '135 jours',
      dateFin: '15/04/2026',
    } : null,
  };

  const impactColors = {
    Financier: 'orange',
    Délai: 'blue',
    Technique: 'purple',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className={cn(
        'fixed top-0 right-0 h-full w-full max-w-2xl z-50',
        'transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        darkMode ? 'bg-slate-900' : 'bg-white',
        'shadow-2xl border-l border-slate-700/30'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            'p-6 border-b',
            avenant.impact === 'Financier' ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 border-orange-500/30' :
            avenant.impact === 'Délai' ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/5 border-blue-500/30' :
            'bg-gradient-to-r from-purple-500/20 to-purple-500/5 border-purple-500/30'
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="info" className="font-mono">{avenant.id}</Badge>
                  <Badge variant={avenant.impact === 'Financier' ? 'warning' : avenant.impact === 'Délai' ? 'info' : 'default'}>
                    {avenant.impact}
                  </Badge>
                  <BureauTag bureau={avenant.bureau} />
                  <Badge variant={avenant.status === 'validated' ? 'success' : avenant.status === 'rejected' ? 'destructive' : 'info'}>
                    {avenant.status || 'En attente'}
                  </Badge>
                </div>
                <h2 className="font-bold text-xl mb-2">{avenant.objet}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Link2 className="w-4 h-4" />
                    {avenant.contratRef}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {avenant.partenaire}
                  </span>
                  {avenant.montant && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      +{avenant.montant}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className={cn('p-2 rounded-lg transition-colors ml-2', darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700/30 overflow-x-auto">
            {[
              { id: 'bmo', label: 'Analyse BMO', icon: Shield },
              { id: 'details', label: 'Détails', icon: FileText },
              { id: 'documents', label: 'Documents', icon: FileCheck, badge: documents.length },
              { id: 'history', label: 'Historique', icon: History, badge: history.length },
              { id: 'impact', label: 'Impact', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-300',
                    darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Informations avenant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Contrat</span>
                      <span className="font-mono text-orange-400 font-semibold">{avenant.contratRef}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Partenaire</span>
                      <span className="font-medium">{avenant.partenaire}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Type d'impact</span>
                      <Badge variant={avenant.impact === 'Financier' ? 'warning' : avenant.impact === 'Délai' ? 'info' : 'default'}>
                        {avenant.impact}
                      </Badge>
                    </div>
                    {avenant.montant && (
                      <div className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-slate-400">Montant</span>
                        <span className="font-bold text-orange-400">+{avenant.montant} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Préparé par</span>
                      <span className="font-medium">{avenant.preparedBy}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Statut</span>
                      <Badge variant={avenant.status === 'validated' ? 'success' : avenant.status === 'rejected' ? 'destructive' : 'info'}>
                        {avenant.status || 'En attente'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Justification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300">{avenant.justification}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:border-blue-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-slate-400">{doc.size} • {doc.uploadedBy} • {doc.date}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => addToast(`Téléchargement de ${doc.name}`, 'info')}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg border-l-4 border-l-purple-500 bg-purple-500/10">
                    <span className="text-2xl">{entry.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.action}</p>
                      <p className="text-xs text-slate-400">Par {entry.author} • {entry.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'impact' && (
              <div className="space-y-4">
                {avenant.impact === 'Financier' && impactDetails.financier && (
                  <Card className="border-orange-500/30 bg-orange-500/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Impact financier
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-slate-400">Budget initial</span>
                        <span className="font-medium">{impactDetails.financier.budgetInitial}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-slate-400">Augmentation</span>
                        <span className="font-bold text-orange-400">+{impactDetails.financier.montant} FCFA</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-slate-400">Impact</span>
                        <span className="font-medium text-orange-400">+{impactDetails.financier.impactPourcentage}%</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Nouveau budget</span>
                        <span className="font-bold text-emerald-400">{impactDetails.financier.budgetApres}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {avenant.impact === 'Délai' && impactDetails.delai && (
                  <Card className="border-blue-500/30 bg-blue-500/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Impact délai
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-slate-400">Délai initial</span>
                        <span className="font-medium">{impactDetails.delai.delaiInitial}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-slate-400">Extension</span>
                        <span className="font-bold text-blue-400">+{impactDetails.delai.extension}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-700/30">
                        <span className="text-slate-400">Nouveau délai</span>
                        <span className="font-bold text-emerald-400">{impactDetails.delai.nouveauDelai}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Date de fin prévue</span>
                        <span className="font-medium text-orange-400">{impactDetails.delai.dateFin}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {avenant.impact === 'Technique' && (
                  <Card className="border-purple-500/30 bg-purple-500/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Impact technique
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300">
                        Modification technique des spécifications ou du périmètre du contrat.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-700/30 space-y-3 bg-slate-900/50">
            <div className="flex gap-3">
              {onApprove && (
                <Button variant="success" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500" onClick={onApprove}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
              )}
              {onReject && (
                <Button variant="destructive" className="flex-1" onClick={onReject}>
                  <X className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
              )}
            </div>
            {onRequestModification && (
              <Button variant="warning" className="w-full" onClick={onRequestModification}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Demander modification
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

