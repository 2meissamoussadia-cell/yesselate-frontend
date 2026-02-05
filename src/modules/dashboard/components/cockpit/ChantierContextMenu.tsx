/**
 * Menu contextuel (clic-droit) sur un chantier
 * Actions : Chat chef chantier, Appeler, WhatsApp (templates), Voir photos, Marquer urgence, Archiver
 */

'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { Phone, MessageCircle, Image, AlertTriangle, Archive, X, MessageSquare, Wallet } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ChantierMock } from '../../data/chantiersMock';
import { useDashboardPermissions } from '../../hooks/useDashboardPermissions';

export interface ChantierContextMenuProps {
  chantier: ChantierMock;
  x: number;
  y: number;
  onClose: () => void;
  onAction?: (action: string, chantier: ChantierMock) => void;
}

/** Téléphone chef chantier : chantier.chefChantierPhone ou numéro demo */
function getChefChantierPhone(c: ChantierMock): string {
  if (c.chefChantierPhone?.replace(/\D/g, '').length) return c.chefChantierPhone!;
  return '+221771234567';
}

const ACTIONS = [
  { id: 'chat', label: 'Chat chef chantier', icon: MessageSquare },
  { id: 'call', label: 'Appeler', icon: Phone },
  { id: 'whatsapp', label: 'WhatsApp (templates)', icon: MessageCircle },
  { id: 'pay', label: 'Payer Orange Money (PAY NOW)', icon: Wallet },
  { id: 'photos', label: 'Voir photos récentes', icon: Image },
  { id: 'urgent', label: 'Marquer urgence', icon: AlertTriangle },
  { id: 'archive', label: 'Archiver', icon: Archive },
] as const;

export function ChantierContextMenu({
  chantier,
  x,
  y,
  onClose,
  onAction,
}: ChantierContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { canArchiveChantier } = useDashboardPermissions();

  const visibleActions = useMemo(() => {
    return ACTIONS.filter((a) => (a.id === 'archive' ? canArchiveChantier : true));
  }, [canArchiveChantier]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAction = (id: string) => {
    if (id === 'chat') {
      onAction?.('chat', chantier);
      onClose();
      return;
    }
    if (id === 'call') {
      window.open(`tel:${getChefChantierPhone(chantier)}`, '_self');
    }
    if (id === 'whatsapp') {
      onAction?.('whatsapp', chantier);
      onClose();
      return;
    }
    if (id === 'pay') {
      onAction?.('pay', chantier);
    }
    if (id === 'photos') {
      onAction?.('photos', chantier);
    }
    if (id === 'urgent') {
      onAction?.('urgent', chantier);
    }
    if (id === 'archive') {
      onAction?.('archive', chantier);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[220px] rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150"
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Actions chantier"
    >
      <div className="px-3 py-2 border-b border-slate-700/50 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-200 truncate">{chantier.id}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {visibleActions.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="menuitem"
          onClick={() => handleAction(id)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-200',
            'hover:bg-slate-800/70 transition-colors'
          )}
        >
          <Icon className="h-4 w-4 text-slate-400 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );
}
