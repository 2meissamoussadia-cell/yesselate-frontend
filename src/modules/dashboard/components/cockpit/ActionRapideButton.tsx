/**
 * Bouton d'action rapide (Appeler, Relance, Escalade) avec feedback toast.
 * Affiche un loader pendant l'action puis un toast Sonner (spec audit).
 */

'use client';

import React, { useState } from 'react';
import { Loader2, Phone, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ActionRapideType = 'appeler' | 'relancer' | 'escalader';

export interface ActionRapideButtonProps {
  type: ActionRapideType;
  chantier: string;
  onActionDone?: () => void;
  className?: string;
  /** Si true, n'affiche que le feedback toast (pas d'ouverture de modal) */
  toastOnly?: boolean;
}

const CONFIG: Record<
  ActionRapideType,
  { Icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  appeler: { Icon: Phone, label: 'Appeler entreprise' },
  relancer: { Icon: Mail, label: 'Relance automatique' },
  escalader: { Icon: Send, label: 'Escalade au DG' },
};

export function ActionRapideButton({
  type,
  chantier,
  onActionDone,
  className,
  toastOnly = false,
}: ActionRapideButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!toastOnly) {
      onActionDone?.();
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      if (type === 'appeler') {
        toast.success('Appel préparé', {
          description: `Chef de chantier ${chantier}: +33 6 12 34 56 78`,
          duration: 5000,
        });
      }
      if (type === 'relancer') {
        toast.success('Email de relance envoyé', {
          description: `À: chef.projet@chantier${chantier}.fr · Objet: Relance avancement lot peinture`,
          duration: 4000,
        });
      }
      if (type === 'escalader') {
        toast.success('Escalade créée', {
          description: `Notification envoyée au DG · Priorité: HAUTE - Chantier ${chantier}`,
          duration: 4000,
        });
      }
      onActionDone?.();
    } catch {
      toast.error("Erreur lors de l'action");
    } finally {
      setLoading(false);
    }
  };

  const config = CONFIG[type];
  const Icon = config.Icon;

  return (
    <Button
      size="sm"
      onClick={handleAction}
      disabled={loading}
      className={cn('relative inline-flex items-center gap-2', className)}
      aria-label={config.label}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
      ) : (
        <Icon className="w-4 h-4 shrink-0" aria-hidden />
      )}
      <span>{config.label}</span>
    </Button>
  );
}
