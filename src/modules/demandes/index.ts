/**
 * Module Demandes - Exports principaux
 */

// Types
export * from './types/demandesTypes';

// Navigation
export * from './navigation/demandesNavigationConfig';
export { DemandesSidebar } from './navigation/DemandesSidebar';
export { DemandesSubNavigation } from './navigation/DemandesSubNavigation';

// Components
export { DemandesContentRouter } from './components/DemandesContentRouter';
export { DemandeDetailModal } from './components/DemandeDetailModal';
export { DemandesFiltersModal } from './components/DemandesFiltersModal';
export { DemandesExportModal } from './components/DemandesExportModal';
export { DemandesModals } from './components/Modals';
export { Pagination } from './components/Pagination';
export { TableSortHeader } from './components/TableSortHeader';

// Pages - Overview
export { DashboardPage } from './pages/overview/DashboardPage';
export { StatsPage } from './pages/overview/StatsPage';
export { TrendsPage } from './pages/overview/TrendsPage';

// Pages - Statut
export { EnAttentePage } from './pages/statut/EnAttentePage';
export { UrgentesPage } from './pages/statut/UrgentesPage';
export { ValideesPage } from './pages/statut/ValideesPage';
export { RejeteesPage } from './pages/statut/RejeteesPage';
export { EnRetardPage } from './pages/statut/EnRetardPage';

// Pages - Actions
export { AchatsPage } from './pages/actions/AchatsPage';
export { FinancePage } from './pages/actions/FinancePage';
export { JuridiquePage } from './pages/actions/JuridiquePage';

// Pages - Services
export { AchatsServicePage } from './pages/services/AchatsServicePage';
export { FinanceServicePage } from './pages/services/FinanceServicePage';
export { JuridiqueServicePage } from './pages/services/JuridiqueServicePage';
export { AutresServicesPage } from './pages/services/AutresServicesPage';

// Hooks
export { useDemandesStats } from './hooks/useDemandesStats';
export { useDemandesFilters, useDemandesFilters as useDemandesFiltersStore } from './hooks/useDemandesFilters';
export {
  useDemandesData,
  useDemandesByStatus,
  useDemandesByService,
  useDemandesTrends,
  useServiceStats,
} from './hooks/useDemandesData';
export {
  useCreateDemande,
  useValidateDemande,
  useRejectDemande,
  useRequestComplement,
  useBatchValidateDemandes,
  useBatchRejectDemandes,
} from './hooks/useDemandesMutations';

// API
export * from './api/demandesApi';

// Mock Data (pour développement)
export * from './data/demandesMock';

