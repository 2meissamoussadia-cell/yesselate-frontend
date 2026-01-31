/**
 * Hook Prévisionnel Trésorerie 90j — Phase 2 audit ERP BTP 2026.
 * Appelle GET /api/dashboard/cash-flow-previsions?days=90 avec repli sur mock.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CashFlowPrevision } from '../types/tresoreriePrevisionnelle';
import { getTresoreriePrevisionnelleMock, getTensionsTresorerie } from '../data/tresoreriePrevisionnelleMock';

export interface UseTresoreriePrevisionnelleOptions {
  /** Nombre de jours de prévision (défaut 90) */
  days?: number;
  /** Seuil minimal trésorerie (XOF) pour les tensions */
  seuilMinimal?: number;
  /** Désactiver l'appel API (utiliser uniquement le mock) */
  skip?: boolean;
}

export interface UseTresoreriePrevisionnelleResult {
  previsions: CashFlowPrevision[];
  tensions: CashFlowPrevision[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const SEUIL_DEFAULT = 5_000_000;

/**
 * Charge les prévisions de trésorerie via GET /api/dashboard/cash-flow-previsions?days=90.
 * En cas d'erreur ou si skip=true, utilise le mock local.
 */
export function useTresoreriePrevisionnelle(
  options: UseTresoreriePrevisionnelleOptions = {}
): UseTresoreriePrevisionnelleResult {
  const { days = 90, seuilMinimal = SEUIL_DEFAULT, skip = false } = options;

  const [previsions, setPrevisions] = useState<CashFlowPrevision[]>(() => getTresoreriePrevisionnelleMock());
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrevisions = useCallback(async () => {
    if (skip) {
      setPrevisions(getTresoreriePrevisionnelleMock());
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/cash-flow-previsions?days=${days}`);
      if (!res.ok) throw new Error(res.statusText || 'Erreur API');
      const data = await res.json();
      setPrevisions(data.previsions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setPrevisions(getTresoreriePrevisionnelleMock());
    } finally {
      setIsLoading(false);
    }
  }, [days, skip]);

  useEffect(() => {
    fetchPrevisions();
  }, [fetchPrevisions]);

  const tensions = getTensionsTresorerie(previsions, seuilMinimal);

  return {
    previsions,
    tensions,
    isLoading,
    error,
    refetch: fetchPrevisions,
  };
}
