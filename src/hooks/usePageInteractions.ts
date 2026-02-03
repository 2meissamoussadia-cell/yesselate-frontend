// ============================================
// Hook pour automatiser toutes les interactions entre pages
// Gère les modales, navigation, filtres, et synchronisation
// ============================================

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/stores';
import { useBMOStore } from '@/lib/stores';
import { createCrossPageLink, routeMapping } from '@/lib/services/navigation.service';
import type { PurchaseOrder, Invoice, Amendment, Demand } from '@/lib/types/bmo.types';
import { usePageNavigation } from '@/hooks/usePageNavigation';

/**
 * Hook principal pour automatiser toutes les interactions d'une page
 */
export function usePageInteractions(pageId: string) {
  const router = useRouter();
  const { navigateTo, updateFilters, getFilters } = usePageNavigation(pageId);
  const { addToast, addActionLog } = useBMOStore();
  const { setPageLoading } = useNavigationStore();

  /**
   * Ouvrir les détails d'un document depuis n'importe quelle page
   */
  const openDocumentDetails = useCallback((
    documentType: 'bc' | 'facture' | 'avenant' | 'demande',
    documentId: string,
    options?: { tab?: string; modal?: boolean }
  ) => {
    setPageLoading(pageId, true);
    
    const targetPage = documentType === 'bc' || documentType === 'facture' || documentType === 'avenant'
      ? 'validation-bc'
      : 'demandes';

    const context: Record<string, any> = {
      id: documentId,
      type: documentType,
    };

    if (options?.tab) {
      context.tab = options.tab;
    }

    if (options?.modal) {
      // Ouvrir dans une modale (à implémenter selon votre système de modales)
      addToast(`Ouverture des détails de ${documentId}`, 'info');
    } else {
      // Naviguer vers la page
      const link = createCrossPageLink({
        fromPage: pageId,
        toPage: targetPage,
        context,
      });
      router.push(link);
    }

    setTimeout(() => setPageLoading(pageId, false), 500);
  }, [pageId, router, setPageLoading, addToast]);

  /**
   * Naviguer vers un projet depuis n'importe quelle page
   */
  const goToProject = useCallback((projectId: string, view?: string) => {
    const link = createCrossPageLink({
      fromPage: pageId,
      toPage: 'projets-en-cours',
      context: {
        projet: projectId,
        view,
      },
    });
    router.push(link);
    addToast(`Navigation vers le projet ${projectId}`, 'info');
  }, [pageId, router, addToast]);

  /**
   * Naviguer vers un bureau depuis n'importe quelle page
   */
  const goToBureau = useCallback((bureauCode: string, view?: string) => {
    const link = createCrossPageLink({
      fromPage: pageId,
      toPage: 'arbitrages-vivants',
      context: {
        bureau: bureauCode,
        tab: 'bureaux',
        view,
      },
    });
    router.push(link);
    addToast(`Navigation vers le bureau ${bureauCode}`, 'info');
  }, [pageId, router, addToast]);

  /**
   * Créer une action et naviguer automatiquement
   */
  const createActionAndNavigate = useCallback((
    action: string,
    targetPage: string,
    context?: Record<string, any>
  ) => {
    // Logger l'action
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: action as any,
      module: `${pageId}-action`,
      targetId: context?.id || 'N/A',
      targetType: context?.type || 'Action',
      targetLabel: action,
      details: `Action ${action} depuis ${pageId}`,
      bureau: 'BMO',
    });

    // Naviguer
    if (targetPage) {
      const link = createCrossPageLink({
        fromPage: pageId,
        toPage: targetPage,
        context,
      });
      router.push(link);
    }

    addToast(`Action ${action} effectuée`, 'success');
  }, [pageId, router, addToast, addActionLog]);

  return {
    // Navigation
    navigateTo,
    updateFilters,
    getFilters,
    
    // Actions spécifiques
    openDocumentDetails,
    goToProject,
    goToBureau,
    createActionAndNavigate,
  };
}

// Réexport pour faciliter l'import
export { usePageNavigation, useCrossPageLinks } from './usePageNavigation';

