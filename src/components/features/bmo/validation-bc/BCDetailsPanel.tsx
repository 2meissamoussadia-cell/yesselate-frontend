'use client';

import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { 
  X, FileText, Users, AlertTriangle, History, CheckCircle, 
  Clock, DollarSign, Building2, Calendar, TrendingUp, Link2,
  FileCheck, MessageSquare, Download, Eye, Shield
} from 'lucide-react';
import type { PurchaseOrder } from '@/lib/types/bmo.types';
import { useState } from 'react';
import { BMOValidatorPanel } from './BMOValidatorPanel';

interface BCDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bc: PurchaseOrder | null;
  onValidate?: () => void;
  onReject?: () => void;
  onRequestComplement?: () => void;
  onEscalate?: () => void;
}

export function BCDetailsPanel({
  isOpen,
  onClose,
  bc,
  onValidate,
  onReject,
  onRequestComplement,
  onEscalate,
}: BCDetailsPanelProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history' | 'risks' | 'bmo'>('bmo');

  if (!isOpen || !bc) return null;

  // Données fictives enrichies
  const documents = [
    { id: '1', name: 'Devis_fournisseur.pdf', type: 'pdf', size: '2.4 MB', date: '15/12/2025', uploadedBy: 'BA' },
    { id: '2', name: 'Catalogue_produits.pdf', type: 'pdf', size: '1.8 MB', date: '14/12/2025', uploadedBy: 'BA' },
    { id: '3', name: 'Justificatif_budget.xlsx', type: 'excel', size: '456 KB', date: '13/12/2025', uploadedBy: 'BM' },
  ];

  const history = [
    { id: '1', action: 'BC créé', author: 'A. FALL', date: bc.date, icon: '📝' },
    { id: '2', action: 'Soumission au BMO', author: 'BA', date: bc.date, icon: '⬆️' },
    { id: '3', action: 'Document ajouté', author: 'BA', date: bc.date, icon: '📎' },
  ];

  const risks = [
    { type: 'Montant élevé', severity: 'medium', description: 'Montant supérieur à 10M FCFA' },
    { type: 'Nouveau fournisseur', severity: 'low', description: 'Première commande avec ce fournisseur' },
  ];

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
            bc.priority === 'urgent' ? 'bg-gradient-to-r from-red-500/20 to-red-500/5 border-red-500/30' :
            bc.priority === 'high' ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/30' :
            'bg-gradient-to-r from-blue-500/20 to-blue-500/5 border-blue-500/30'
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="info" className="font-mono">{bc.id}</Badge>
                  <Badge variant={bc.priority === 'urgent' ? 'urgent' : bc.priority === 'high' ? 'warning' : 'default'}>
                    {bc.priority}
                  </Badge>
                  <BureauTag bureau={bc.bureau} />
                  <Badge variant="default">{bc.status || 'pending'}</Badge>
                </div>
                <h2 className="font-bold text-xl mb-2">{bc.subject}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {bc.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    {bc.amount}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {bc.supplier}
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
              { id: 'risks', label: 'Risques', icon: AlertTriangle, badge: risks.length },
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
            {activeTab === 'bmo' && (
              <BMOValidatorPanel
                context="bc"
                item={bc}
                onAction={(action) => {
                  addToast(`Action: ${action}`, 'info');
                  if (action.includes('Approuver')) {
                    onValidate?.();
                  } else if (action.includes('Escalader')) {
                    onEscalate?.();
                  } else if (action.includes('complément')) {
                    onRequestComplement?.();
                  }
                }}
              />
            )}

            {activeTab === 'details' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Projet</span>
                      <span className="font-mono text-orange-400 font-semibold">{bc.project}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Fournisseur</span>
                      <span className="font-medium">{bc.supplier}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-700/30">
                      <span className="text-slate-400">Demandeur</span>
                      <span className="font-medium">{bc.requestedBy}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Statut</span>
                      <Badge variant={bc.status === 'validated' ? 'success' : bc.status === 'rejected' ? 'destructive' : 'info'}>
                        {bc.status || 'En attente'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Responsables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                        <span className="text-sm">Responsable projet</span>
                        <span className="text-sm font-medium">M. DIALLO</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-700/30">
                        <span className="text-sm">Bureau demandeur</span>
                        <BureauTag bureau={bc.bureau} />
                      </div>
                    </div>
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

            {activeTab === 'risks' && (
              <div className="space-y-3">
                {risks.map((risk, i) => (
                  <Card key={i} className={cn(
                    risk.severity === 'high' ? 'border-red-500/30 bg-red-500/5' :
                    risk.severity === 'medium' ? 'border-orange-500/30 bg-orange-500/5' :
                    'border-blue-500/30 bg-blue-500/5'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{risk.type}</span>
                        <Badge variant={risk.severity === 'high' ? 'urgent' : risk.severity === 'medium' ? 'warning' : 'info'}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{risk.description}</p>
                    </CardContent>
                  </Card>
                ))}
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
                  Refuser
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {onRequestComplement && (
                <Button variant="warning" size="sm" className="flex-1" onClick={onRequestComplement}>
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Demander complément
                </Button>
              )}
              {onEscalate && (
                <Button variant="secondary" size="sm" className="flex-1" onClick={onEscalate}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Escalader
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

