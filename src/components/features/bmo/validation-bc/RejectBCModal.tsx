'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, AlertTriangle, FileText } from 'lucide-react';
import type { PurchaseOrder } from '@/lib/types/bmo.types';

interface RejectBCModalProps {
  isOpen: boolean;
  onClose: () => void;
  bc: PurchaseOrder | null;
  onReject: (bc: PurchaseOrder, reason: string) => void;
}

export function RejectBCModal({ isOpen, onClose, bc, onReject }: RejectBCModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  if (!isOpen || !bc) return null;

  const predefinedReasons = [
    'Non conforme aux spécifications',
    'Budget insuffisant',
    'Fournisseur non qualifié',
    'Documents manquants',
    'Doublon avec autre BC',
    'Projet suspendu',
    'Autre (préciser)',
  ];

  const handleReject = () => {
    const finalReason = selectedReason === 'Autre (préciser)' ? reason : selectedReason;
    
    if (!finalReason.trim()) {
      addToast('Veuillez sélectionner ou saisir un motif de refus', 'warning');
      return;
    }

    const confirmReject = window.confirm(
      `Voulez-vous vraiment rejeter le BC ${bc.id} ?\n\nMotif: ${finalReason}\n\nCette action sera notifiée au bureau demandeur.`
    );

    if (confirmReject) {
      onReject(bc, finalReason);
      addToast(`BC ${bc.id} rejeté`, 'warning');
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
        'w-full max-w-lg',
        darkMode ? 'bg-slate-900' : 'bg-white',
        'rounded-lg shadow-2xl border border-slate-700/30'
      )}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Refus du Bon de Commande
              </h2>
              <Badge variant="info" className="font-mono">{bc.id}</Badge>
            </div>
            <button onClick={onClose} className={cn('p-2 rounded-lg transition-colors', darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Informations du BC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Objet:</span>
                <span className="font-medium">{bc.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Montant:</span>
                <span className="font-bold text-amber-400">{bc.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Projet:</span>
                <span className="font-medium text-orange-400">{bc.project}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Motif de refus <span className="text-red-400">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {predefinedReasons.map((r) => (
                  <label key={r} className={cn(
                    'flex items-center gap-2 p-2 rounded cursor-pointer transition-colors',
                    selectedReason === r ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-700/30',
                    darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  )}>
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{r}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Autre (préciser)' && (
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Précisez le motif de refus..."
                  className={cn(
                    'w-full px-3 py-2 rounded border text-sm',
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-300'
                  )}
                  rows={3}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={!selectedReason || (selectedReason === 'Autre (préciser)' && !reason.trim())}>
              Refuser le BC
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

