'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { BmoModal } from '@/components/ui/BmoModal';

interface IncidentDetailModalProps {
  open: boolean;
  onClose: () => void;
  incidentId?: string | null;
}

export function IncidentDetailModal({ open, onClose, incidentId }: IncidentDetailModalProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [open, incidentId]);

  return (
    <BmoModal
      open={open}
      onClose={onClose}
      title="Détail incident"
      subtitle={incidentId ?? undefined}
      size="md"
    >
      <div className="flex items-center gap-2 mb-4 text-amber-400">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span className="text-sm text-slate-400">Incident à traiter</span>
      </div>
      {loading ? (
        <div className="h-20 bg-slate-800/50 rounded-lg animate-pulse" />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">
            Incident : <span className="font-medium text-slate-200">{incidentId || '—'}</span>
          </p>
          <p className="text-xs text-slate-400">
            Détails à charger depuis l’API (timeline, impact, résolution).
          </p>
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </BmoModal>
  );
}
