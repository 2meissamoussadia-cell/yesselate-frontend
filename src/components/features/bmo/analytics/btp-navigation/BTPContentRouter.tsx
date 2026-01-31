/**
 * Router de Contenu BTP
 * Route vers les vues appropriées selon la navigation BTP
 */

'use client';

import React from 'react';
import { useAnalyticsBTPNavigationStore } from '@/lib/stores/analyticsBTPNavigationStore';
import { findDomain, findModule, findSubModule } from '@/lib/config/analyticsBTPArchitecture';
import { BarChart3 } from 'lucide-react';
import { BTPDrillDown } from './components/BTPDrillDown';
import { BTPModuleView } from './components/BTPModuleView';
import { BTPSubModuleView } from './components/BTPSubModuleView';

// Lazy load des vues
import { lazy, Suspense } from 'react';
import { LoadingSkeleton } from '@/presentation/components/LazyLoad';

// Vues par domaine (à créer progressivement)
const ChantiersView = lazy(() =>
  import('./views/ChantiersView').then((m) => ({ default: m.ChantiersView }))
);

const FinancierView = lazy(() =>
  import('./views/FinancierView').then((m) => ({ default: m.FinancierView }))
);

const RHView = lazy(() =>
  import('./views/RHView').then((m) => ({ default: m.RHView }))
);

const SousTraitantsView = lazy(() =>
  import('./views/SousTraitantsView').then((m) => ({ default: m.SousTraitantsView }))
);

const MaterielView = lazy(() =>
  import('./views/MaterielView').then((m) => ({ default: m.MaterielView }))
);

const CommercialView = lazy(() =>
  import('./views/CommercialView').then((m) => ({ default: m.CommercialView }))
);

const QSEView = lazy(() =>
  import('./views/QSEView').then((m) => ({ default: m.QSEView }))
);

const PlanificationView = lazy(() =>
  import('./views/PlanificationView').then((m) => ({ default: m.PlanificationView }))
);

const MultiAgencesView = lazy(() =>
  import('./views/MultiAgencesView').then((m) => ({ default: m.MultiAgencesView }))
);

const PerformanceView = lazy(() =>
  import('./views/PerformanceView').then((m) => ({ default: m.PerformanceView }))
);

export function BTPContentRouter() {
  const { navigation } = useAnalyticsBTPNavigationStore();
  const { domainId, moduleId, subModuleId } = navigation;

  // Si aucun domaine sélectionné, afficher la vue d'accueil
  if (!domainId) {
    return <WelcomeView />;
  }

  const domain = findDomain(domainId);
  if (!domain) {
    return (
      <>
        <BTPDrillDown />
        <NotFoundView message={`Domaine "${domainId}" introuvable`} />
      </>
    );
  }

  // Router selon le domaine, module et sous-module
  // Si un sous-module est sélectionné, afficher la vue sous-module
  if (moduleId && subModuleId) {
    return <BTPSubModuleView domainId={domainId} moduleId={moduleId} subModuleId={subModuleId} />;
  }
  
  // Si un module est sélectionné, afficher la vue module
  if (moduleId) {
    return <BTPModuleView domainId={domainId} moduleId={moduleId} />;
  }

  // Sinon, afficher la vue domaine (déjà géré par BaseDomainView)
  const viewProps = {
    domainId,
    moduleId: moduleId || null,
    subModuleId: subModuleId || null,
  };

  return (
    <>
      <BTPDrillDown />
      {(() => {
        switch (domainId) {
    case 'chantiers':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <ChantiersView {...viewProps} />
        </Suspense>
      );
    case 'financier':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <FinancierView {...viewProps} />
        </Suspense>
      );
    case 'ressources-humaines':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <RHView {...viewProps} />
        </Suspense>
      );
    case 'sous-traitants':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <SousTraitantsView {...viewProps} />
        </Suspense>
      );
    case 'materiel':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <MaterielView {...viewProps} />
        </Suspense>
      );
    case 'commercial':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <CommercialView {...viewProps} />
        </Suspense>
      );
    case 'qse':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <QSEView {...viewProps} />
        </Suspense>
      );
    case 'planification':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <PlanificationView {...viewProps} />
        </Suspense>
      );
    case 'multi-agences':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <MultiAgencesView {...viewProps} />
        </Suspense>
      );
    case 'performance':
      return (
        <Suspense fallback={<LoadingSkeleton className="p-6" lines={8} />}>
          <PerformanceView {...viewProps} />
        </Suspense>
      );
    default:
      return <NotFoundView message={`Vue pour le domaine "${domainId}" non implémentée`} />;
        }
      })()}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Vues de Fallback
// ═══════════════════════════════════════════════════════════════════════════

function WelcomeView() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Analytics BTP</h2>
        <p className="text-slate-400 text-sm">
          Sélectionnez un domaine dans le menu de navigation pour commencer l'analyse.
        </p>
      </div>
    </div>
  );
}

function NotFoundView({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Vue non trouvée</h3>
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

