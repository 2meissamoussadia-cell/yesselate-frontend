/**
 * ContentRouter pour Demandes RH
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import {
  Users,
  Plane,
  Wallet,
  AlertTriangle,
  Clock,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { DemandesRHOverviewView } from './views/DemandesRHOverviewView';
import { DemandesRHCongesView } from './views/DemandesRHCongesView';
import { DemandesRHDepensesView } from './views/DemandesRHDepensesView';

interface ContentRouterProps {
  category: string;
  subCategory: string;
}

export const DemandesRHContentRouter = React.memo(function DemandesRHContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  // Vue d'ensemble
  if (category === 'overview') {
    return <DemandesRHOverviewView />;
  }

  // Vue Congés
  if (category === 'conges') {
    return <DemandesRHCongesView subCategory={subCategory} />;
  }

  // Vue Dépenses
  if (category === 'depenses') {
    return <DemandesRHDepensesView subCategory={subCategory} />;
  }

  // Vue Déplacements (placeholder)
  if (category === 'deplacements') {
    return <PlaceholderView category={category} subCategory={subCategory} icon="Plane" />;
  }

  // Vue Avances (placeholder)
  if (category === 'avances') {
    return <PlaceholderView category={category} subCategory={subCategory} icon="Wallet" />;
  }

  // Vue Urgentes (placeholder)
  if (category === 'urgent') {
    return <PlaceholderView category={category} subCategory={subCategory} icon="AlertTriangle" />;
  }

  // Vue En attente (placeholder)
  if (category === 'pending') {
    return <PlaceholderView category={category} subCategory={subCategory} icon="Clock" />;
  }

  // Vue Validées (placeholder)
  if (category === 'validated') {
    return <PlaceholderView category={category} subCategory={subCategory} icon="CheckCircle" />;
  }

  // Vue Analytics (placeholder)
  if (category === 'analytics') {
    return <PlaceholderView category={category} subCategory={subCategory} icon="BarChart3" />;
  }

  // Autres vues (placeholder)
  return <PlaceholderView category={category} subCategory={subCategory} icon="Users" />;
});

// ================================
// Placeholder View
// ================================
function PlaceholderView({
  category,
  subCategory,
  icon: iconName,
}: {
  category: string;
  subCategory: string;
  icon: string;
}) {
  const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Plane,
    Wallet,
    AlertTriangle,
    Clock,
    CheckCircle,
    BarChart3,
    Users,
  };

  const Icon = IconMap[iconName] || Users;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory}
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
}

