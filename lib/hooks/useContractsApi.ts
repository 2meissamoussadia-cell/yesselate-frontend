// API hooks for Contrats validation
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBMOStore } from '@/lib/stores';
import type { Contract } from '@/lib/types/bmo.types';

// ================================
// Types
// ================================
export interface ContractWithMetadata extends Contract {
  // Métadonnées enrichies
  riskScore: number;
  riskSignals: string[];
  priority: 'NOW' | 'WATCH' | 'OK';
  daysToExpiry: number | null;
  amountValue: number;
  
  // Workflow
  workflowState: 'PENDING_BJ' | 'PENDING_BMO' | 'SIGNED' | 'REJECTED' | 'ARCHIVED';
  bjApproval?: {
    approvedById: string;
    approvedByName: string;
    approvedAtISO: string;
    approvalHash: string;
  };
  bmoSignature?: {
    signedById: string;
    signedByName: string;
    signedAtISO: string;
    signatureHash: string;
    bjApprovalHashRef: string;
  };
}

export interface ContractsStats {
  total: number;
  pendingBJ: number;
  pendingBMO: number;
  signed: number;
  rejected: number;
  urgent: number;
  expired: number;
  highRisk: number;
  totalAmount: number;
  avgAmount: number;
  byType: Record<string, number>;
  byBureau: Record<string, number>;
  byStatus: Record<string, number>;
  ts: string;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

interface ContractsFilters {
  types?: string[];
  bureaux?: string[];
  statuses?: string[];
  riskMin?: number;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

// ================================
// useContractsData - Hook principal
// ================================
export function useContractsData(filters?: ContractsFilters) {
  const abortRef = useRef<AbortController | null>(null);
  const { addActionLog } = useBMOStore();

  const [state, setState] = useState<ApiState<ContractWithMetadata[]>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });

  const fetchContracts = useCallback(async (signal?: AbortSignal) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch('/api/bmo/contracts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ filters }),
      //   signal,
      // });
      
      // Simuler appel API
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (signal?.aborted) return;

      // Import dynamique des données mock
      const { contractsToSign } = await import('@/lib/data');
      
      // Enrichir les contrats avec métadonnées
      const enriched = (contractsToSign as Contract[]).map((c) => enrichContractWithMetadata(c));

      // Appliquer les filtres
      let filtered = enriched;
      if (filters) {
        if (filters.types?.length) {
          filtered = filtered.filter((c) => filters.types!.includes((c as any).type));
        }
        if (filters.bureaux?.length) {
          filtered = filtered.filter((c) => filters.bureaux!.includes((c as any).bureau));
        }
        if (filters.statuses?.length) {
          filtered = filtered.filter((c) => filters.statuses!.includes(c.status || ''));
        }
        if (filters.riskMin !== undefined) {
          filtered = filtered.filter((c) => c.riskScore >= filters.riskMin!);
        }
        if (filters.amountMin !== undefined) {
          filtered = filtered.filter((c) => c.amountValue >= filters.amountMin!);
        }
        if (filters.amountMax !== undefined) {
          filtered = filtered.filter((c) => c.amountValue <= filters.amountMax!);
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter((c) =>
            [c.id, c.subject, (c as any).partner, (c as any).bureau]
              .join(' ')
              .toLowerCase()
              .includes(q)
          );
        }
      }

      setState({
        data: filtered,
        loading: false,
        error: null,
        lastFetch: Date.now(),
      });

      // Log action
      addActionLog({
        userId: 'current-user',
        userName: 'Utilisateur',
        userRole: 'Direction',
        action: 'view',
        module: 'validation-contrats',
        targetId: 'contracts-list',
        targetType: 'API',
        targetLabel: 'Chargement contrats',
        details: `${filtered.length} contrats chargés`,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      setState({
        data: null,
        loading: false,
        error: error.message || 'Erreur lors du chargement des contrats',
        lastFetch: Date.now(),
      });
    }
  }, [filters, addActionLog]);

  const refresh = useCallback(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    fetchContracts(ac.signal);
  }, [fetchContracts]);

  // Initial fetch
  useEffect(() => {
    refresh();
    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}

// ================================
// useContractsStats - Statistiques
// ================================
export function useContractsStats() {
  const [state, setState] = useState<ApiState<ContractsStats>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // TODO: API réelle
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      if (signal?.aborted) return;

      const { contractsToSign } = await import('@/lib/data');
      const contracts = (contractsToSign as Contract[]).map(enrichContractWithMetadata);

      const stats: ContractsStats = {
        total: contracts.length,
        pendingBJ: contracts.filter((c) => c.workflowState === 'PENDING_BJ').length,
        pendingBMO: contracts.filter((c) => c.workflowState === 'PENDING_BMO').length,
        signed: contracts.filter((c) => c.workflowState === 'SIGNED').length,
        rejected: contracts.filter((c) => c.workflowState === 'REJECTED').length,
        urgent: contracts.filter((c) => c.priority === 'NOW').length,
        expired: contracts.filter((c) => c.daysToExpiry !== null && c.daysToExpiry < 0).length,
        highRisk: contracts.filter((c) => c.riskScore >= 70).length,
        totalAmount: contracts.reduce((sum, c) => sum + c.amountValue, 0),
        avgAmount: contracts.length > 0 ? contracts.reduce((sum, c) => sum + c.amountValue, 0) / contracts.length : 0,
        byType: countBy(contracts, (c) => (c as any).type || 'Autre'),
        byBureau: countBy(contracts, (c) => (c as any).bureau || 'Autre'),
        byStatus: countBy(contracts, (c) => c.workflowState),
        ts: new Date().toISOString(),
      };

      setState({
        data: stats,
        loading: false,
        error: null,
        lastFetch: Date.now(),
      });
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      setState({
        data: null,
        loading: false,
        error: error.message || 'Erreur lors du chargement des statistiques',
        lastFetch: Date.now(),
      });
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchStats(ac.signal);
    return () => ac.abort();
  }, [fetchStats]);

  return {
    ...state,
    refresh: () => fetchStats(),
  };
}

// ================================
// useContractActions - Actions métier
// ================================
export function useContractActions() {
  const { addActionLog, addToast } = useBMOStore();

  const approveBJ = useCallback(async (contractId: string) => {
    try {
      // TODO: API réelle
      // await fetch(`/api/bmo/contracts/${contractId}/approve-bj`, { method: 'POST' });
      
      await new Promise((resolve) => setTimeout(resolve, 500));

      const hash = `SHA256:${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      addActionLog({
        userId: 'current-user',
        userName: 'N. FAYE',
        userRole: 'Juriste Senior',
        action: 'validation',
        module: 'validation-contrats',
        targetId: contractId,
        targetType: 'Contrat',
        targetLabel: 'Validation BJ',
        details: `Approuvé BJ | ${hash}`,
        bureau: 'BJ',
      });

      addToast(`✅ Validation BJ enregistrée - ${contractId}`, 'success');
      
      return { success: true, hash };
    } catch (error: any) {
      addToast(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [addActionLog, addToast]);

  const signBMO = useCallback(async (contractId: string, bjApprovalHash: string) => {
    try {
      // TODO: API réelle
      await new Promise((resolve) => setTimeout(resolve, 500));

      const hash = `SHA256:${Math.random().toString(36).substring(7).toUpperCase()}`;
      
      addActionLog({
        userId: 'current-user',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        action: 'signature',
        module: 'validation-contrats',
        targetId: contractId,
        targetType: 'Contrat',
        targetLabel: 'Signature BMO',
        details: `Signé BMO | ${hash} | BJ_REF: ${bjApprovalHash}`,
        bureau: 'BMO',
      });

      addToast(`✍️ Contrat signé - ${contractId}`, 'success');
      
      return { success: true, hash };
    } catch (error: any) {
      addToast(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [addActionLog, addToast]);

  const rejectContract = useCallback(async (contractId: string, reason: string) => {
    try {
      // TODO: API réelle
      await new Promise((resolve) => setTimeout(resolve, 500));

      addActionLog({
        userId: 'current-user',
        userName: 'Direction',
        userRole: 'BMO',
        action: 'reject',
        module: 'validation-contrats',
        targetId: contractId,
        targetType: 'Contrat',
        targetLabel: 'Rejet contrat',
        details: `Motif: ${reason}`,
        bureau: 'BMO',
      });

      addToast(`❌ Contrat rejeté - ${contractId}`, 'warning');
      
      return { success: true };
    } catch (error: any) {
      addToast(`❌ Erreur: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }, [addActionLog, addToast]);

  return {
    approveBJ,
    signBMO,
    rejectContract,
  };
}

// ================================
// Helpers
// ================================
function enrichContractWithMetadata(contract: Contract): ContractWithMetadata {
  const parseMoney = (v: unknown): number => {
    if (typeof v === 'number') return v;
    const raw = String(v ?? '').replace(/\s/g, '').replace(/FCFA|XOF/gi, '').replace(/[^\d,.-]/g, '');
    return Number(raw.replace(/,/g, '')) || 0;
  };

  const parseFRDate = (d?: string | null): Date | null => {
    if (!d || d === '—') return null;
    const parts = d.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yy] = parts.map((x) => Number(x));
    if (!dd || !mm || !yy) return null;
    return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
  };

  const getDaysToExpiry = (expiryStr: string): number | null => {
    const expiryDate = parseFRDate(expiryStr);
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const amountValue = parseMoney((contract as any).amount);
  const daysToExpiry = (contract as any).expiry ? getDaysToExpiry((contract as any).expiry) : null;

  // Calcul du risque
  let riskScore = 0;
  const riskSignals: string[] = [];

  if (daysToExpiry !== null) {
    if (daysToExpiry < 0) { riskScore += 35; riskSignals.push('Contrat expiré'); }
    else if (daysToExpiry <= 3) { riskScore += 25; riskSignals.push('Échéance ≤ 3 jours'); }
    else if (daysToExpiry <= 7) { riskScore += 15; riskSignals.push('Échéance ≤ 7 jours'); }
    else if (daysToExpiry <= 14) { riskScore += 8; riskSignals.push('Échéance ≤ 14 jours'); }
  }

  if (amountValue >= 50_000_000) { riskScore += 22; riskSignals.push('Montant très élevé'); }
  else if (amountValue >= 10_000_000) { riskScore += 14; riskSignals.push('Montant élevé'); }

  if (contract.status === 'pending') { riskScore += 18; riskSignals.push('En attente de validation'); }

  if (!contract.subject?.trim()) { riskScore += 10; riskSignals.push('Objet manquant'); }
  if (!(contract as any).partner?.trim()) { riskScore += 10; riskSignals.push('Partenaire manquant'); }

  riskScore = Math.min(100, riskScore);
  const priority: 'NOW' | 'WATCH' | 'OK' = riskScore >= 70 ? 'NOW' : riskScore >= 40 ? 'WATCH' : 'OK';

  // Workflow state (simplifié pour mock)
  const workflowState: ContractWithMetadata['workflowState'] = 
    contract.status === 'validated' ? 'SIGNED' :
    contract.status === 'rejected' ? 'REJECTED' :
    'PENDING_BJ'; // Simulé

  return {
    ...contract,
    amountValue,
    daysToExpiry,
    riskScore,
    riskSignals,
    priority,
    workflowState,
  };
}

function countBy<T>(array: T[], fn: (item: T) => string): Record<string, number> {
  return array.reduce((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ================================
// useContractReminders - Rappels
// ================================
export function useContractReminders() {
  const [reminders, setReminders] = useState<Array<{
    id: string;
    contractId: string;
    message: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
  }>>([]);

  const addReminder = useCallback((reminder: typeof reminders[0]) => {
    setReminders((prev) => [...prev, reminder]);
  }, []);

  const dismissReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    reminders,
    addReminder,
    dismissReminder,
  };
}

