'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, FileText, CheckSquare, Signature, AlertTriangle } from 'lucide-react';
import type { Invoice } from '@/lib/types/bmo.types';

interface ValidationFactureModalProps {
  isOpen: boolean;
  onClose: () => void;
  facture: Invoice | null;
  onValidate: (facture: Invoice) => void;
}

export function ValidationFactureModal({ isOpen, onClose, facture, onValidate }: ValidationFactureModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [checklist, setChecklist] = useState({
    facture: false,
    bonCommande: false,
    livraison: false,
    conformite: false,
  });
  const [signature, setSignature] = useState('');

  if (!isOpen || !facture) return null;

  const allChecked = Object.values(checklist).every(v => v === true) && signature.trim() !== '';

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const handleValidate = () => {
    if (!allChecked) {
      addToast('Veuillez compléter tous les éléments de vérification', 'warning');
      return;
    }

    const confirmValidate = window.confirm(
      `Voulez-vous vraiment valider définitivement la facture ${facture.id} ?\n\nCette action est irréversible et générera un hash SHA3-256.`
    );

    if (confirmValidate) {
      onValidate(facture);
      addToast(`Facture ${facture.id} validée avec succès`, 'success');
      onClose();
    }
  };

  // Vérifier si la facture est échue
  const [day, month, year] = facture.dateEcheance.split('/').map(Number);
  const dueDate = new Date(year, month - 1, day);
  const isOverdue = dueDate < new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
        'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
        darkMode ? 'bg-slate-900' : 'bg-white',
        'rounded-lg shadow-2xl border border-slate-700/30'
      )}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Validation de la Facture</h2>
              <div className="flex items-center gap-2">
                <Badge variant="info" className="font-mono">{facture.id}</Badge>
                {isOverdue && (
                  <Badge variant="urgent">Échue</Badge>
                )}
                {!isOverdue && daysUntilDue <= 7 && (
                  <Badge variant="warning">À échéance ({daysUntilDue}j)</Badge>
                )}
              </div>
            </div>
            <button onClick={onClose} className={cn('p-2 rounded-lg transition-colors', darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerte si échue */}
          {isOverdue && (
            <Card className="mb-4 border-red-500/30 bg-red-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Facture échue depuis {Math.abs(daysUntilDue)} jour(s)</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résumé */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Résumé de la facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Objet:</span>
                <span className="font-medium">{facture.objet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fournisseur:</span>
                <span className="font-medium">{facture.fournisseur}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Montant:</span>
                <span className="font-bold text-blue-400">{facture.montant} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projet:</span>
                <span className="font-medium text-orange-400">{facture.projet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date facture:</span>
                <span className="font-medium">{facture.dateFacture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Échéance:</span>
                <span className={cn('font-medium', isOverdue ? 'text-red-400' : daysUntilDue <= 7 ? 'text-orange-400' : 'text-slate-300')}>
                  {facture.dateEcheance}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Checklist de conformité */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Checklist de vérification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                checklist.facture ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              )} onClick={() => toggleCheck('facture')}>
                <input type="checkbox" checked={checklist.facture} onChange={() => toggleCheck('facture')} className="w-4 h-4" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Facture originale reçue</p>
                  <p className="text-xs text-slate-400">La facture est conforme et signée</p>
                </div>
              </label>

              <label className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                checklist.bonCommande ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              )} onClick={() => toggleCheck('bonCommande')}>
                <input type="checkbox" checked={checklist.bonCommande} onChange={() => toggleCheck('bonCommande')} className="w-4 h-4" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Bon de commande correspondant</p>
                  <p className="text-xs text-slate-400">Le BC est validé et correspond</p>
                </div>
              </label>

              <label className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                checklist.livraison ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              )} onClick={() => toggleCheck('livraison')}>
                <input type="checkbox" checked={checklist.livraison} onChange={() => toggleCheck('livraison')} className="w-4 h-4" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Livraison/bon de réception</p>
                  <p className="text-xs text-slate-400">Les biens/services ont été livrés</p>
                </div>
              </label>

              <label className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                checklist.conformite ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              )} onClick={() => toggleCheck('conformite')}>
                <input type="checkbox" checked={checklist.conformite} onChange={() => toggleCheck('conformite')} className="w-4 h-4" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Conformité et montant</p>
                  <p className="text-xs text-slate-400">Montant et références conformes</p>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Signature électronique */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Signature className="w-4 h-4" />
                Signature électronique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Tapez votre nom pour signer électroniquement"
                className={cn(
                  'w-full px-4 py-2 rounded border',
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-300'
                )}
              />
              <p className="text-xs text-slate-400 mt-2">
                En signant, vous certifiez avoir vérifié tous les éléments ci-dessus
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="success" className="flex-1" onClick={handleValidate} disabled={!allChecked}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Valider définitivement
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

