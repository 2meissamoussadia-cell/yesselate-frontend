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
  Receipt, Building2, TrendingUp, MessageSquare, Shield
} from 'lucide-react';
import type { Invoice } from '@/lib/types/bmo.types';
import { useState } from 'react';
import { BMOValidatorPanel } from './BMOValidatorPanel';

interface FactureDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  facture: Invoice | null;
  onValidate?: () => void;
  onReject?: () => void;
  onContest?: () => void;
}

export function FactureDetailsPanel({
  isOpen,
  onClose,
  facture,
  onValidate,
  onReject,
  onContest,
}: FactureDetailsPanelProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history' | 'payment' | 'bmo'>('bmo');

  if (!isOpen || !facture) return null;

  // Calculer le statut d'échéance
  const [day, month, year] = facture.dateEcheance.split('/').map(Number);
  const dueDate = new Date(year, month - 1, day);
  const isOverdue = dueDate < new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Données fictives
  const documents = [
    { id: '1', name: 'Facture_originale.pdf', type: 'pdf', size: '1.2 MB', date: facture.dateFacture, uploadedBy: facture.bureau },
    { id: '2', name: 'Bon_de_livraison.pdf', type: 'pdf', size: '856 KB', date: facture.dateFacture, uploadedBy: facture.bureau },
    { id: '3', name: 'Bon_de_commande.pdf', type: 'pdf', size: '2.1 MB', date: '15/12/2025', uploadedBy: 'BA' },
  ];

  const history = [
    { id: '1', action: 'Facture reçue', author: facture.bureau, date: facture.dateFacture, icon: '📥' },
    { id: '2', action: 'Soumission validation', author: facture.bureau, date: facture.dateFacture, icon: '⬆️' },
    { id: '3', action: 'Document vérifié', author: 'BA', date: facture.dateFacture, icon: '✓' },
  ];

  const paymentInfo = {
    montant: facture.montant,
    echeance: facture.dateEcheance,
    joursRestants: daysUntilDue,
    compte: 'BCEAO - 1234567890',
    banque: 'Société Générale',
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
            isOverdue ? 'bg-gradient-to-r from-red-500/20 to-red-500/5 border-red-500/30' :
            daysUntilDue <= 7 ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 border-orange-500/30' :
            'bg-gradient-to-r from-blue-500/20 to-blue-500/5 border-blue-500/30'
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="info" className="font-mono">{facture.id}</Badge>
                  <BureauTag bureau={facture.bureau} />
                  <Badge variant={facture.status === 'validated' ? 'success' : facture.status === 'rejected' ? 'destructive' : 'info'}>
                    {facture.status || 'En attente'}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="urgent">
                      <Clock className="w-3 h-3 mr-1" />
                      Échue
                    </Badge>
                  )}
                  {!isOverdue && daysUntilDue <= 7 && (
                    <Badge variant="warning">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      À échéance ({daysUntilDue}j)
                    </Badge>
                  )}
                </div>
                <h2 className="font-bold text-xl mb-2">{facture.objet}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {facture.fournisseur}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    {facture.montant} FCFA
                  </span>
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
              { id: 'payment', label: 'Paiement', icon: Receipt },
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
                    <CardTitle className="text-sm">Informations facture</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Projet</span>
                      <span className="font-mono text-orange-400 font-semibold">{facture.projet}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Fournisseur</span>
                      <span className="font-medium">{facture.fournisseur}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Date facture</span>
                      <span className="font-medium">{facture.dateFacture}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Date échéance</span>
                      <span className={cn('font-medium', isOverdue ? 'text-red-400' : daysUntilDue <= 7 ? 'text-orange-400' : 'text-slate-300')}>
                        {facture.dateEcheance}
                        {isOverdue && ` (Échue depuis ${Math.abs(daysUntilDue)}j)`}
                        {!isOverdue && daysUntilDue <= 7 && ` (${daysUntilDue}j restants)`}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Montant</span>
                      <span className="font-bold text-blue-400">{facture.montant} FCFA</span>
                    </div>
                  </CardContent>
                </Card>

                {isOverdue && (
                  <Card className="border-red-500/30 bg-red-500/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">Facture échue - Paiement urgent requis</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:border-blue-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-red-400" />
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
                  <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-500/10">
                    <span className="text-2xl">{entry.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{entry.action}</p>
                      <p className="text-xs text-slate-400">Par {entry.author} • {entry.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Informations de paiement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Montant à payer</span>
                      <span className="font-bold text-blue-400">{paymentInfo.montant} FCFA</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Date échéance</span>
                      <span className="font-medium">{paymentInfo.echeance}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Compte bancaire</span>
                      <span className="font-mono text-xs">{paymentInfo.compte}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Banque</span>
                      <span className="font-medium">{paymentInfo.banque}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ordre de paiement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 mb-3">
                      Une fois validée, cette facture générera automatiquement un ordre de paiement.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => addToast('Ouverture de la page de génération d\'ordre de paiement', 'info')}>
                      Générer l'ordre de paiement
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-700/30 space-y-3 bg-slate-900/50">
            <div className="flex gap-3">
              {onValidate && (
                <Button variant="success" className="flex-1" onClick={onValidate}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valider
                </Button>
              )}
              {onReject && (
                <Button variant="destructive" className="flex-1" onClick={onReject}>
                  <X className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
              )}
            </div>
            {onContest && (
              <Button variant="warning" className="w-full" onClick={onContest}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Contester la facture
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

