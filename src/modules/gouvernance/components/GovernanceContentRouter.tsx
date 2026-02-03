/**
 * Router de contenu pour le module Gouvernance
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 */

'use client';

import React from 'react';
import type { GovernanceMainCategory } from '../types/governanceNavigationTypes';
import TableauBordPage from '../pages/dashboard/TableauBordPage';
import TendancesPage from '../pages/dashboard/TendancesPage';
import SyntheseProjetsPage from '../pages/dashboard/SyntheseProjetsPage';
import SyntheseBudgetPage from '../pages/dashboard/SyntheseBudgetPage';
import SyntheseJalonsPage from '../pages/dashboard/SyntheseJalonsPage';
import SyntheseRisquesPage from '../pages/dashboard/SyntheseRisquesPage';
import SyntheseValidationsPage from '../pages/dashboard/SyntheseValidationsPage';
import DepassementsBudgetPage from '../pages/attention/DepassementsBudgetPage';
import RetardsCritiquesPage from '../pages/attention/RetardsCritiquesPage';
import RessourcesIndispoPage from '../pages/attention/RessourcesIndispoPage';
import EscaladesPage from '../pages/attention/EscaladesPage';
import DecisionsValideesPage from '../pages/arbitrages/DecisionsValideesPage';
import ArbitragesEnAttentePage from '../pages/arbitrages/ArbitragesEnAttentePage';
import HistoriqueDecisionsPage from '../pages/arbitrages/HistoriqueDecisionsPage';
import ReunionsDGPage from '../pages/instances/ReunionsDGPage';
import ReunionsMOAMOEPage from '../pages/instances/ReunionsMOAMOEPage';
import ReunionsTransversesPage from '../pages/instances/ReunionsTransversesPage';
import IndicateursConformitePage from '../pages/conformite/IndicateursConformitePage';
import AuditGouvernancePage from '../pages/conformite/AuditGouvernancePage';
import SuiviEngagementsPage from '../pages/conformite/SuiviEngagementsPage';
import GovernanceWidgetsDashboardPage from '../pages/dashboard/GovernanceWidgetsDashboardPage';

interface GovernanceContentRouterProps {
  mainCategory: GovernanceMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function GovernanceContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: GovernanceContentRouterProps) {
  // Vue stratégique
  if (mainCategory === 'strategic') {
    if (subCategory === 'overview') {
      if (subSubCategory === 'dashboard' || !subSubCategory) {
        return <TableauBordPage />;
      }
      if (subSubCategory === 'widgets') {
        return <GovernanceWidgetsDashboardPage />;
      }
      if (subSubCategory === 'summary') {
        return <TableauBordPage />;
      }
      if (subSubCategory === 'highlights') {
        return <TableauBordPage />;
      }
    }

    if (subCategory === 'tendances') {
      if (subSubCategory === 'all' || !subSubCategory) {
        return <TendancesPage />;
      }
      if (subSubCategory === 'mensuelles') {
        return <TendancesPage />;
      }
      if (subSubCategory === 'trimestrielles') {
        return <TendancesPage />;
      }
    }

    if (subCategory === 'synthese') {
      if (subSubCategory === 'projets') {
        return <SyntheseProjetsPage />;
      }
      if (subSubCategory === 'budget') {
        return <SyntheseBudgetPage />;
      }
      if (subSubCategory === 'jalons') {
        return <SyntheseJalonsPage />;
      }
      if (subSubCategory === 'risques') {
        return <SyntheseRisquesPage />;
      }
      if (subSubCategory === 'validations') {
        return <SyntheseValidationsPage />;
      }
      // Par défaut pour synthese
      return <SyntheseProjetsPage />;
    }

    // Par défaut pour strategic
    return <TableauBordPage />;
  }

  // Points d'attention
  if (mainCategory === 'attention') {
    if (subCategory === 'depassements') {
      return <DepassementsBudgetPage />;
    }
    if (subCategory === 'retards') {
      return <RetardsCritiquesPage />;
    }
    if (subCategory === 'ressources') {
      return <RessourcesIndispoPage />;
    }
    if (subCategory === 'escalades') {
      return <EscaladesPage />;
    }
    // Par défaut pour attention
    return <DepassementsBudgetPage />;
  }

  // Arbitrages & décisions
  if (mainCategory === 'arbitrages') {
    if (subCategory === 'decisions') {
      return <DecisionsValideesPage />;
    }
    if (subCategory === 'en-attente') {
      return <ArbitragesEnAttentePage />;
    }
    if (subCategory === 'historique') {
      return <HistoriqueDecisionsPage />;
    }
    // Par défaut pour arbitrages
    return <ArbitragesEnAttentePage />;
  }

  // Instances de coordination
  if (mainCategory === 'instances') {
    if (subCategory === 'reunions') {
      if (subSubCategory === 'dg') {
        return <ReunionsDGPage />;
      }
      if (subSubCategory === 'moa-moe') {
        return <ReunionsMOAMOEPage />;
      }
      if (subSubCategory === 'transverses') {
        return <ReunionsTransversesPage />;
      }
      // Par défaut pour reunions
      return <ReunionsDGPage />;
    }
    // Par défaut pour instances
    return <ReunionsDGPage />;
  }

  // Conformité & performance
  if (mainCategory === 'compliance') {
    if (subCategory === 'indicateurs') {
      return <IndicateursConformitePage />;
    }
    if (subCategory === 'audit') {
      return <AuditGouvernancePage />;
    }
    if (subCategory === 'engagements') {
      return <SuiviEngagementsPage />;
    }
    // Par défaut pour compliance
    return <IndicateursConformitePage />;
  }

  // Par défaut
  return <TableauBordPage />;
}

