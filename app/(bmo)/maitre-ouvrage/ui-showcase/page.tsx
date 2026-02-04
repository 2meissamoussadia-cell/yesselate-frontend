'use client';

/**
 * UI Showcase — Page de démonstration des composants BMO
 * 
 * Cette page présente tous les nouveaux composants UI créés
 * pour l'audit Outlook-like.
 */

import React, { useState } from 'react';
import { 
  // Priorité
  PriorityIndicator, 
  PriorityBadge, 
  PriorityDot,
  
  // Alertes
  AlertItem,
  AlertItemSkeleton,
  
  // Onglets
  TabBar,
  TabBadge,
  
  // Boutons
  ActionButton,
  IconButton,
  NewButton,
  SaveButton,
  CancelButton,
  DeleteButton,
  ButtonGroup,
  
  // Panneau lecture
  ReadingPane,
  ReadingPaneSection,
  
  // Temps
  TimeAgo,
  DeadlineBadge,
  
  // Références
  ReferenceNumber,
  ModuleReference,
  
  // Chargement
  ListSkeleton,
  DetailPanelSkeleton,
  PageLoader,
  InlineLoader,
  
  // Badges
  StatusBadge,
  CategoryBadge,
  
  // Liste
  ListItem,
  ListItemContent,
  
  // États vides
  EmptyState,
  NoSearchResults,
  ErrorState,
  
  // Troncature
  TruncateWithTooltip,
  TruncatedTitle,
  TruncatedText,
} from '@/components/bmo/ui';

import { 
  Plus, 
  Edit, 
  Trash2, 
  Archive, 
  User, 
  Calendar,
  Search,
  Filter,
  Bell,
  Settings,
} from 'lucide-react';

export default function UIShowcasePage() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const tabs = [
    { id: 'buttons', label: 'Boutons', count: 8 },
    { id: 'badges', label: 'Badges', count: 12 },
    { id: 'priority', label: 'Priorité', count: 5 },
    { id: 'alerts', label: 'Alertes', count: 3 },
    { id: 'time', label: 'Temps', count: 4 },
    { id: 'loading', label: 'Chargement', count: 6 },
    { id: 'empty', label: 'États vides', count: 5 },
  ];

  const mockAlerts = [
    {
      id: 'alert-1',
      title: 'Ressource critique non disponible pour le chantier ZAC Nord',
      priority: 'critical' as const,
      category: 'technique',
      createdAt: new Date(Date.now() - 38 * 60000),
      assignee: { name: 'Jean Dupont' },
      status: 'urgent' as const,
      unread: true,
    },
    {
      id: 'alert-2',
      title: 'Budget dépassé de 15% sur lot électricité',
      priority: 'high' as const,
      category: 'financier',
      createdAt: new Date(Date.now() - 10 * 3600000),
      assignee: { name: 'Marie Martin' },
      status: 'pending' as const,
    },
    {
      id: 'alert-3',
      title: 'Validation en attente depuis 72h',
      priority: 'medium' as const,
      category: 'planning',
      createdAt: new Date(Date.now() - 72 * 3600000),
      status: 'in_progress' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            UI Showcase — Composants BMO
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Démonstration des composants créés pour l'audit UI/Layout Outlook-like
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <TabBar 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          
          {/* BOUTONS */}
          {activeTab === 'buttons' && (
            <div className="space-y-8">
              <Section title="ActionButton — Variantes">
                <div className="flex flex-wrap gap-3">
                  <ActionButton variant="primary">Primary</ActionButton>
                  <ActionButton variant="secondary">Secondary</ActionButton>
                  <ActionButton variant="ghost">Ghost</ActionButton>
                  <ActionButton variant="danger">Danger</ActionButton>
                  <ActionButton variant="outline">Outline</ActionButton>
                </div>
              </Section>

              <Section title="ActionButton — Avec icônes">
                <div className="flex flex-wrap gap-3">
                  <ActionButton variant="primary" iconLeft={<Plus />}>Nouveau</ActionButton>
                  <ActionButton variant="secondary" iconLeft={<Edit />}>Modifier</ActionButton>
                  <ActionButton variant="danger" iconLeft={<Trash2 />}>Supprimer</ActionButton>
                </div>
              </Section>

              <Section title="ActionButton — Tailles">
                <div className="flex items-center gap-3">
                  <ActionButton size="xs">Extra Small</ActionButton>
                  <ActionButton size="sm">Small</ActionButton>
                  <ActionButton size="md">Medium</ActionButton>
                  <ActionButton size="lg">Large</ActionButton>
                </div>
              </Section>

              <Section title="ActionButton — États">
                <div className="flex flex-wrap gap-3">
                  <ActionButton loading loadingText="Chargement...">Loading</ActionButton>
                  <ActionButton disabled>Désactivé</ActionButton>
                </div>
              </Section>

              <Section title="IconButton">
                <div className="flex gap-2">
                  <IconButton icon={<Edit />} aria-label="Modifier" variant="ghost" />
                  <IconButton icon={<Trash2 />} aria-label="Supprimer" variant="ghost" />
                  <IconButton icon={<Archive />} aria-label="Archiver" variant="ghost" />
                  <IconButton icon={<Settings />} aria-label="Paramètres" variant="secondary" />
                </div>
              </Section>

              <Section title="ButtonGroup">
                <ButtonGroup>
                  <ActionButton variant="outline">Gauche</ActionButton>
                  <ActionButton variant="outline">Centre</ActionButton>
                  <ActionButton variant="outline">Droite</ActionButton>
                </ButtonGroup>
              </Section>

              <Section title="Boutons prédéfinis">
                <div className="flex gap-3">
                  <NewButton />
                  <SaveButton />
                  <CancelButton />
                  <DeleteButton />
                </div>
              </Section>
            </div>
          )}

          {/* BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-8">
              <Section title="StatusBadge — Variantes">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge variant="success">Validé</StatusBadge>
                  <StatusBadge variant="warning">En attente</StatusBadge>
                  <StatusBadge variant="error">Urgent</StatusBadge>
                  <StatusBadge variant="info">Information</StatusBadge>
                  <StatusBadge variant="neutral">Archivé</StatusBadge>
                </div>
              </Section>

              <Section title="StatusBadge — Tailles">
                <div className="flex items-center gap-2">
                  <StatusBadge size="xs">Extra Small</StatusBadge>
                  <StatusBadge size="sm">Small</StatusBadge>
                  <StatusBadge size="md">Medium</StatusBadge>
                  <StatusBadge size="lg">Large</StatusBadge>
                </div>
              </Section>

              <Section title="CategoryBadge">
                <div className="flex flex-wrap gap-2">
                  <CategoryBadge category="technique" />
                  <CategoryBadge category="planning" />
                  <CategoryBadge category="qualite" />
                  <CategoryBadge category="securite" />
                  <CategoryBadge category="financier" />
                  <CategoryBadge category="juridique" />
                </div>
              </Section>

              <Section title="TabBadge">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Inactif:</span>
                    <TabBadge count={42} active={false} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Actif:</span>
                    <TabBadge count={42} active={true} />
                  </div>
                </div>
              </Section>

              <Section title="ReferenceNumber">
                <div className="flex flex-wrap gap-3">
                  <ReferenceNumber value="alert-84" prefix="ALT" />
                  <ReferenceNumber value={42} format="hash" />
                  <ModuleReference module="demandes" value={123} />
                  <ModuleReference module="chantiers" value={456} />
                </div>
              </Section>
            </div>
          )}

          {/* PRIORITÉ */}
          {activeTab === 'priority' && (
            <div className="space-y-8">
              <Section title="PriorityIndicator — Variantes">
                <div className="flex items-center gap-6">
                  <PriorityIndicator priority="critical" showLabel />
                  <PriorityIndicator priority="high" showLabel />
                  <PriorityIndicator priority="medium" showLabel />
                  <PriorityIndicator priority="low" showLabel />
                  <PriorityIndicator priority="none" showLabel />
                </div>
              </Section>

              <Section title="PriorityDot">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <PriorityDot priority="critical" /> Critical
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityDot priority="high" /> High
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityDot priority="medium" /> Medium
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityDot priority="low" /> Low
                  </div>
                </div>
              </Section>

              <Section title="PriorityBadge">
                <div className="flex flex-wrap gap-3">
                  <PriorityBadge priority="critical" />
                  <PriorityBadge priority="high" />
                  <PriorityBadge priority="medium" />
                  <PriorityBadge priority="low" />
                </div>
              </Section>
            </div>
          )}

          {/* ALERTES */}
          {activeTab === 'alerts' && (
            <div className="space-y-8">
              <Section title="AlertItem — Liste">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  {mockAlerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      id={alert.id}
                      title={alert.title}
                      priority={alert.priority}
                      category={alert.category}
                      createdAt={alert.createdAt}
                      assignee={alert.assignee}
                      status={alert.status}
                      unread={alert.unread}
                      selected={selectedAlert === alert.id}
                      onSelect={setSelectedAlert}
                    />
                  ))}
                </div>
              </Section>

              <Section title="AlertItemSkeleton">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <AlertItemSkeleton />
                  <AlertItemSkeleton />
                </div>
              </Section>

              <Section title="ListItem générique">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <ListItem id="item-1" onClick={() => {}}>
                    <ListItemContent
                      topLine={<TimeAgo date={new Date()} />}
                      title="Demande de validation BC"
                      badge={<ModuleReference module="demandes" value={42} />}
                      subtitle="Jean Dupont"
                      description="Validation du bon de commande pour le lot électricité..."
                    />
                  </ListItem>
                </div>
              </Section>
            </div>
          )}

          {/* TEMPS */}
          {activeTab === 'time' && (
            <div className="space-y-8">
              <Section title="TimeAgo">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-slate-500">Maintenant:</span>
                    <TimeAgo date={new Date()} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-slate-500">Il y a 5 min:</span>
                    <TimeAgo date={new Date(Date.now() - 5 * 60000)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-slate-500">Il y a 2h:</span>
                    <TimeAgo date={new Date(Date.now() - 2 * 3600000)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-32 text-sm text-slate-500">Hier:</span>
                    <TimeAgo date={new Date(Date.now() - 24 * 3600000)} />
                  </div>
                </div>
              </Section>

              <Section title="DeadlineBadge">
                <div className="flex flex-wrap gap-3">
                  <DeadlineBadge date={new Date(Date.now() - 24 * 3600000)} />
                  <DeadlineBadge date={new Date(Date.now() + 6 * 3600000)} />
                  <DeadlineBadge date={new Date(Date.now() + 3 * 24 * 3600000)} />
                </div>
              </Section>
            </div>
          )}

          {/* CHARGEMENT */}
          {activeTab === 'loading' && (
            <div className="space-y-8">
              <Section title="InlineLoader">
                <InlineLoader text="Chargement des données..." />
              </Section>

              <Section title="ListSkeleton">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-64">
                  <ListSkeleton count={3} />
                </div>
              </Section>

              <Section title="DetailPanelSkeleton">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-64">
                  <DetailPanelSkeleton />
                </div>
              </Section>
            </div>
          )}

          {/* ÉTATS VIDES */}
          {activeTab === 'empty' && (
            <div className="space-y-8">
              <Section title="EmptyState — Types">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                    <EmptyState 
                      type="no-data" 
                      size="sm"
                      primaryAction={{ label: 'Créer', onClick: () => {} }}
                    />
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                    <EmptyState 
                      type="no-results" 
                      size="sm"
                    />
                  </div>
                </div>
              </Section>

              <Section title="NoSearchResults">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                  <NoSearchResults 
                    query="test recherche" 
                    onClearSearch={() => {}}
                  />
                </div>
              </Section>

              <Section title="ErrorState">
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                  <ErrorState 
                    message="Connexion au serveur impossible"
                    onRetry={() => {}}
                  />
                </div>
              </Section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
