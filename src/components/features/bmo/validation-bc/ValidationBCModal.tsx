'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, FileText, AlertTriangle, CheckSquare, Signature } from 'lucide-react';
import type { PurchaseOrder } from '@/lib/types/bmo.types';

interface ValidationBCModalProps {
  isOpen: boolean;
  onClose: () => void;
  bc: PurchaseOrder | null;
  onValidate: (bc: PurchaseOrder) => void;
}

export function ValidationBCModal({ isOpen, onClose, bc, onValidate }: ValidationBCModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [checklist, setChecklist] = useState({
    documents: false,
    conformity: false,
    budget: false,
    raci: false,
  });
  const [signature, setSignature] = useState('');

  if (!isOpen || !bc) return null;

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
      `Voulez-vous vraiment valider définitivement le BC ${bc.id} ?\n\nCette action est irréversible et générera un hash SHA3-256.`
    );

    if (confirmValidate) {
      onValidate(bc);
      addToast(`BC ${bc.id} validé avec succès`, 'success');
      onClose();
    }
  };

  // Vérifications automatiques simulées
  const autoChecks = {
    documents: Math.random() > 0.3, // 70% de chance d'avoir les documents
    conformity: Math.random() > 0.2, // 80% de conformité
    budget: Math.random() > 0.15, // 85% dans le budget
    raci: true, // Toujours conforme RACI pour BMO
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
          'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          darkMode ? 'bg-slate-900' : 'bg-white',
          'rounded-lg shadow-2xl border border-slate-700/30'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Validation du Bon de Commande</h2>
              <div className="flex items-center gap-2">
                <Badge variant="info" className="font-mono">{bc.id}</Badge>
                <Badge variant={bc.priority === 'urgent' ? 'urgent' : bc.priority === 'high' ? 'warning' : 'default'}>
                  {bc.priority}
                </Badge>
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Résumé */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Résumé du BC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Objet:</span>
                <span className="font-medium">{bc.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fournisseur:</span>
                <span className="font-medium">{bc.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Montant:</span>
                <span className="font-bold text-amber-400">{bc.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projet:</span>
                <span className="font-medium text-orange-400">{bc.project}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-medium">{bc.date}</span>
              </div>
            </CardContent>
          </Card>

          {/* Documents obligatoires */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents obligatoires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Devis', 'Catalogue fournisseur', 'Justificatif projet', 'Approbation budget'].map((doc, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between p-2 rounded',
                      autoChecks.documents ? 'bg-emerald-500/10' : 'bg-slate-700/30'
                    )}
                  >
                    <span className="text-sm">{doc}</span>
                    {autoChecks.documents ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Checklist de conformité */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Checklist de conformité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                  checklist.documents ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                  darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                )}
                onClick={() => toggleCheck('documents')}
              >
                <input
                  type="checkbox"
                  checked={checklist.documents}
                  onChange={() => toggleCheck('documents')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">Documents vérifiés et conformes</p>
                  <p className="text-xs text-slate-400">Tous les documents obligatoires sont présents</p>
                </div>
                {autoChecks.documents && (
                  <Badge variant="success" className="text-xs">✓ Auto-vérifié</Badge>
                )}
              </label>

              <label
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                  checklist.conformity ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                  darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                )}
                onClick={() => toggleCheck('conformity')}
              >
                <input
                  type="checkbox"
                  checked={checklist.conformity}
                  onChange={() => toggleCheck('conformity')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">Conformité réglementaire</p>
                  <p className="text-xs text-slate-400">Respect des règles d'achat public</p>
                </div>
                {autoChecks.conformity && (
                  <Badge variant="success" className="text-xs">✓ Auto-vérifié</Badge>
                )}
              </label>

              <label
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                  checklist.budget ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                  darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                )}
                onClick={() => toggleCheck('budget')}
              >
                <input
                  type="checkbox"
                  checked={checklist.budget}
                  onChange={() => toggleCheck('budget')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">Budget disponible</p>
                  <p className="text-xs text-slate-400">Le montant est couvert par le budget projet</p>
                </div>
                {autoChecks.budget && (
                  <Badge variant="success" className="text-xs">✓ Auto-vérifié</Badge>
                )}
              </label>

              <label
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                  checklist.raci ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                  darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                )}
                onClick={() => toggleCheck('raci')}
              >
                <input
                  type="checkbox"
                  checked={checklist.raci}
                  onChange={() => toggleCheck('raci')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">Autorisation RACI</p>
                  <p className="text-xs text-slate-400">BMO a le rôle Accountable (A)</p>
                </div>
                {autoChecks.raci && (
                  <Badge variant="success" className="text-xs">✓ Auto-vérifié</Badge>
                )}
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
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onClick={handleValidate}
              disabled={!allChecked}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Valider définitivement
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

