'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, FileText, CheckSquare, Signature, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import type { Amendment } from '@/lib/types/bmo.types';

interface ValidationAvenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  avenant: Amendment | null;
  onValidate: (avenant: Amendment) => void;
}

export function ValidationAvenantModal({ isOpen, onClose, avenant, onValidate }: ValidationAvenantModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [checklist, setChecklist] = useState({
    justification: false,
    impact: false,
    budget: false,
    autorisation: false,
  });
  const [signature, setSignature] = useState('');

  if (!isOpen || !avenant) return null;

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
      `Voulez-vous vraiment approuver l'avenant ${avenant.id} ?\n\nCette action est irréversible et générera un hash SHA3-256.`
    );

    if (confirmValidate) {
      onValidate(avenant);
      addToast(`Avenant ${avenant.id} approuvé avec succès`, 'success');
      onClose();
    }
  };

  const impactColors = {
    Financier: 'orange',
    Délai: 'blue',
    Technique: 'purple',
  };

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
              <h2 className="text-xl font-bold mb-2">Approbation de l'Avenant</h2>
              <div className="flex items-center gap-2">
                <Badge variant="info" className="font-mono">{avenant.id}</Badge>
                <Badge variant={avenant.impact === 'Financier' ? 'warning' : avenant.impact === 'Délai' ? 'info' : 'default'}>
                  {avenant.impact}
                </Badge>
              </div>
            </div>
            <button onClick={onClose} className={cn('p-2 rounded-lg transition-colors', darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Résumé */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Résumé de l'avenant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Objet:</span>
                <span className="font-medium">{avenant.objet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contrat:</span>
                <span className="font-mono text-orange-400">{avenant.contratRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Partenaire:</span>
                <span className="font-medium">{avenant.partenaire}</span>
              </div>
              {avenant.montant && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Impact financier:</span>
                  <span className="font-bold text-orange-400">{avenant.montant} FCFA</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Justification:</span>
                <span className="font-medium">{avenant.justification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-medium">{avenant.date}</span>
              </div>
            </CardContent>
          </Card>

          {/* Alerte selon l'impact */}
          {avenant.impact === 'Financier' && avenant.montant && (
            <Card className="mb-4 border-orange-500/30 bg-orange-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">Impact financier : {avenant.montant} FCFA</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Vérifiez que le budget projet peut couvrir cette augmentation
                </p>
              </CardContent>
            </Card>
          )}

          {avenant.impact === 'Délai' && (
            <Card className="mb-4 border-blue-500/30 bg-blue-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Extension de délai demandée</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Vérifiez l'impact sur les autres activités du projet
                </p>
              </CardContent>
            </Card>
          )}

          {/* Checklist de vérification */}
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
                checklist.justification ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              )} onClick={() => toggleCheck('justification')}>
                <input type="checkbox" checked={checklist.justification} onChange={() => toggleCheck('justification')} className="w-4 h-4" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Justification valide et documentée</p>
                  <p className="text-xs text-slate-400">La justification est acceptable et bien documentée</p>
                </div>
              </label>

              <label className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                checklist.impact ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              )} onClick={() => toggleCheck('impact')}>
                <input type="checkbox" checked={checklist.impact} onChange={() => toggleCheck('impact')} className="w-4 h-4" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Impact évalué et acceptable</p>
                  <p className="text-xs text-slate-400">L'impact sur le projet a été analysé</p>
                </div>
              </label>

              {avenant.impact === 'Financier' && (
                <label className={cn(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                  checklist.budget ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                  darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                )} onClick={() => toggleCheck('budget')}>
                  <input type="checkbox" checked={checklist.budget} onChange={() => toggleCheck('budget')} className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Budget disponible</p>
                    <p className="text-xs text-slate-400">Le budget projet peut couvrir l'impact financier</p>
                  </div>
                </label>
              )}

              <label className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                checklist.autorisation ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30',
                darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
              )} onClick={() => toggleCheck('autorisation')}>
                <input type="checkbox" checked={checklist.autorisation} onChange={() => toggleCheck('autorisation')} className="w-4 h-4" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Autorisation RACI</p>
                  <p className="text-xs text-slate-400">BMO a le rôle Accountable (A) pour valider</p>
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
            <Button 
              variant="success" 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500" 
              onClick={handleValidate} 
              disabled={!allChecked}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approuver l'avenant
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

