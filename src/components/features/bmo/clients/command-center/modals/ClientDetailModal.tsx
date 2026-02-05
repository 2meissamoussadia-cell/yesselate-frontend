/**
 * Client Detail Modal - Fiche client complète avec onglets
 * Modal sophistiqué inspiré de BlockedContentRouter
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Users,
  Crown,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  DollarSign,
  Star,
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Edit,
  Trash2,
  Download,
  Share2,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  Target,
  Award,
} from 'lucide-react';
import { Client, Contact, Interaction, Contract, Litige } from '@/lib/data/clientsMockData';
import { ClientsSatisfactionChart, ClientsMonthlyRevenueChart } from '../ClientsAnalyticsCharts';

interface ClientDetailModalProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  contacts?: Contact[];
  interactions?: Interaction[];
  contracts?: Contract[];
  litiges?: Litige[];
}

type TabType = 'overview' | 'contacts' | 'interactions' | 'contracts' | 'financials' | 'litiges' | 'history';

export function ClientDetailModal({
  open,
  onClose,
  client,
  contacts = [],
  interactions = [],
  contracts = [],
  litiges = [],
}: ClientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [actionsOpen, setActionsOpen] = useState(false);

  if (!open || !client) return null;

  const isPremium = client.type === 'premium';
  const hasLitiges = litiges.filter(l => l.status !== 'resolved').length > 0;
  const isAtRisk = client.status === 'at_risk' || client.satisfaction < 80;

  // Tabs configuration
  const tabs = [
    { id: 'overview' as TabType, label: 'Vue d\'ensemble', icon: Users, badge: null },
    { id: 'contacts' as TabType, label: 'Contacts', icon: Phone, badge: contacts.length },
    { id: 'interactions' as TabType, label: 'Interactions', icon: MessageSquare, badge: interactions.length },
    { id: 'contracts' as TabType, label: 'Contrats', icon: FileText, badge: contracts.length },
    { id: 'financials' as TabType, label: 'Financier', icon: DollarSign, badge: null },
    { id: 'litiges' as TabType, label: 'Litiges', icon: AlertTriangle, badge: litiges.filter(l => l.status !== 'resolved').length || null },
    { id: 'history' as TabType, label: 'Historique', icon: History, badge: null },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-slate-900 border border-slate-700/50 rounded-2xl z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className={cn(
          'flex items-start justify-between p-6 border-b',
          isPremium ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent' :
          isAtRisk ? 'border-rose-500/30 bg-gradient-to-r from-rose-500/10 to-transparent' :
          'border-slate-700/50'
        )}>
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center border',
              isPremium ? 'bg-amber-500/20 border-amber-500/30' :
              'bg-slate-800 border-slate-700/50'
            )}>
              {isPremium ? (
                <Crown className="w-7 h-7 text-amber-400" />
              ) : (
                <Building2 className="w-7 h-7 text-cyan-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-100">{client.name}</h2>
                {isPremium && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {isAtRisk && (
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    À risque
                  </Badge>
                )}
                <Badge className={cn(
                  'text-xs',
                  client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  client.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  client.status === 'at_risk' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  'bg-slate-500/20 text-slate-400 border-slate-500/30'
                )}>
                  {client.status === 'active' ? 'Actif' :
                   client.status === 'pending' ? 'En attente' :
                   client.status === 'at_risk' ? 'À risque' :
                   'Inactif'}
                </Badge>
              </div>

              {/* Quick info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {client.sector}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {client.city}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Client depuis {new Date(client.since).getFullYear()}
                </span>
                {client.manager && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {client.manager}
                  </span>
                )}
              </div>

              {/* Alerts */}
              {hasLitiges && (
                <div className="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-sm text-rose-400">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  {litiges.filter(l => l.status !== 'resolved').length} litige(s) en cours
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Éditer
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActionsOpen(!actionsOpen)}
                className="text-slate-400 hover:text-slate-200"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              {actionsOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setActionsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-slate-900 border border-slate-700/50 shadow-xl z-10 py-1">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50">
                      <Download className="w-4 h-4" />
                      Exporter
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50">
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                    <div className="border-t border-slate-700/50 my-1" />
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10">
                      <Trash2 className="w-4 h-4" />
                      Archiver
                    </button>
                  </div>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800/50 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== null && tab.badge > 0 && (
                  <Badge className="text-xs ml-1">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab client={client} />}
            {activeTab === 'contacts' && <ContactsTab contacts={contacts} />}
            {activeTab === 'interactions' && <InteractionsTab interactions={interactions} />}
            {activeTab === 'contracts' && <ContractsTab contracts={contracts} />}
            {activeTab === 'financials' && <FinancialsTab client={client} />}
            {activeTab === 'litiges' && <LitigesTab litiges={litiges} />}
            {activeTab === 'history' && <HistoryTab clientId={client.id} />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/60">
          <div className="text-sm text-slate-400">
            Dernière mise à jour: {client.lastInteraction ? new Date(client.lastInteraction).toLocaleDateString('fr-FR') : 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Fermer
            </Button>
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Nouvelle interaction
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ================================
// TAB COMPONENTS
// ================================

function OverviewTab({ client }: { client: Client }) {
  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">CA Annuel</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">{client.ca}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Satisfaction</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-200">{client.satisfaction}%</p>
            {client.satisfaction >= 90 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : null}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Projets</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">{client.projects || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400">Contacts</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">{client.contacts}</p>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Informations entreprise
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Secteur</span>
              <span className="text-slate-300">{client.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Effectif</span>
              <span className="text-slate-300">{client.employees || 'N/A'} employés</span>
            </div>
            {client.website && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Site web</span>
                <a href={`https://${client.website}`} className="text-cyan-400 hover:underline flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {client.website}
                </a>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Adresse</span>
              <span className="text-slate-300 text-right">
                {client.address}<br />
                {client.postalCode} {client.city}
              </span>
            </div>
          </div>
        </div>

        {/* Relationship Info */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Relation commerciale
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Type</span>
              <Badge className={cn(
                'text-xs',
                client.type === 'premium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-slate-500/20 text-slate-400 border-slate-500/30'
              )}>
                {client.type === 'premium' ? 'Premium' : 'Standard'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Manager</span>
              <span className="text-slate-300">{client.manager || 'Non assigné'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Client depuis</span>
              <span className="text-slate-300">{new Date(client.since).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dernière interaction</span>
              <span className="text-slate-300">
                {client.lastInteraction ? new Date(client.lastInteraction).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </div>
            {client.nextAction && (
              <div className="pt-2 mt-2 border-t border-slate-700/50">
                <span className="text-slate-400 block mb-1">Prochaine action</span>
                <span className="text-cyan-400">{client.nextAction}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {client.tags && client.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag, idx) => (
              <Badge key={idx} className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Notes</h3>
          <p className="text-sm text-slate-400">{client.notes}</p>
        </div>
      )}
    </div>
  );
}

function ContactsTab({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <Phone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Aucun contact enregistré</p>
        <Button size="sm" className="mt-4 bg-cyan-600 hover:bg-cyan-700">
          <Users className="w-4 h-4 mr-2" />
          Ajouter un contact
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-slate-200">
                {contact.firstName} {contact.lastName}
              </h4>
              <p className="text-sm text-slate-400">{contact.role}</p>
              {contact.isPrimary && (
                <Badge className="mt-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                  Contact principal
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${contact.email}`} className="hover:text-cyan-400">
                {contact.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-4 h-4" />
              <span>{contact.phone}</span>
            </div>
            {contact.mobile && (
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4" />
                <span>{contact.mobile}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function InteractionsTab({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Aucune interaction enregistrée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div
          key={interaction.id}
          className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                interaction.type === 'meeting' ? 'bg-purple-500/20 border border-purple-500/30' :
                interaction.type === 'call' ? 'bg-blue-500/20 border border-blue-500/30' :
                interaction.type === 'email' ? 'bg-cyan-500/20 border border-cyan-500/30' :
                'bg-slate-700/50'
              )}>
                {interaction.type === 'meeting' ? <Users className="w-5 h-5 text-purple-400" /> :
                 interaction.type === 'call' ? <Phone className="w-5 h-5 text-blue-400" /> :
                 <Mail className="w-5 h-5 text-cyan-400" />}
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">{interaction.subject}</h4>
                <p className="text-sm text-slate-400">
                  {new Date(interaction.date).toLocaleString('fr-FR')}
                  {interaction.duration && ` • ${interaction.duration} min`}
                </p>
              </div>
            </div>
            {interaction.outcome && (
              <Badge className={cn(
                'text-xs',
                interaction.outcome === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                interaction.outcome === 'negative' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                'bg-slate-500/20 text-slate-400 border-slate-500/30'
              )}>
                {interaction.outcome === 'positive' ? '👍 Positif' :
                 interaction.outcome === 'negative' ? '👎 Négatif' :
                 '➖ Neutre'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400 mb-3">{interaction.description}</p>
          {interaction.followUp && (
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-400">
              <strong>Suivi:</strong> {interaction.followUp}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ContractsTab({ contracts }: { contracts: Contract[] }) {
  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Aucun contrat enregistré</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <div
          key={contract.id}
          className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-slate-200">{contract.type}</h4>
              <p className="text-sm text-slate-400">
                {new Date(contract.startDate).toLocaleDateString('fr-FR')} → {new Date(contract.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <Badge className={cn(
              'text-xs',
              contract.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
              contract.status === 'expiring' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              contract.status === 'expired' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
              'bg-slate-500/20 text-slate-400 border-slate-500/30'
            )}>
              {contract.status === 'active' ? 'Actif' :
               contract.status === 'expiring' ? 'À renouveler' :
               contract.status === 'expired' ? 'Expiré' :
               'Annulé'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Valeur</span>
              <p className="text-slate-200 font-semibold">{(contract.value / 1000).toFixed(0)}K€</p>
            </div>
            <div>
              <span className="text-slate-400">Renouvellement</span>
              <p className="text-slate-200">{contract.autoRenewal ? 'Automatique' : 'Manuel'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FinancialsTab({ client }: { client: Client }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">CA Annuel</div>
          <div className="text-2xl font-bold text-slate-200">{client.ca}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">CA Moyen/mois</div>
          <div className="text-2xl font-bold text-slate-200">
            {(client.caNumeric / 12 / 1000).toFixed(0)}K€
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">Contrats actifs</div>
          <div className="text-2xl font-bold text-slate-200">{client.contracts || 0}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">Projets en cours</div>
          <div className="text-2xl font-bold text-slate-200">{client.projects || 0}</div>
        </div>
      </div>

      {client.revenue && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Évolution du CA</h3>
          <ClientsMonthlyRevenueChart />
        </div>
      )}
    </div>
  );
}

function LitigesTab({ litiges }: { litiges: Litige[] }) {
  if (litiges.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <p className="text-slate-400">Aucun litige enregistré</p>
        <p className="text-sm text-slate-400 mt-1">Excellent! Ce client n'a aucun litige.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {litiges.map((litige) => (
        <div
          key={litige.id}
          className={cn(
            'p-5 rounded-xl border transition-colors cursor-pointer',
            litige.severity === 'high' ? 'border-rose-500/50 bg-rose-950/20 hover:bg-rose-950/30' :
            litige.severity === 'medium' ? 'border-amber-500/50 bg-amber-950/20 hover:bg-amber-950/30' :
            'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                litige.severity === 'high' ? 'bg-rose-500 animate-pulse' :
                litige.severity === 'medium' ? 'bg-amber-500' :
                'bg-slate-500'
              )} />
              <div>
                <h4 className="font-semibold text-slate-200">{litige.subject}</h4>
                <p className="text-sm text-slate-400">
                  Ouvert le {new Date(litige.date).toLocaleDateString('fr-FR')}
                  {litige.daysOpen > 0 && ` • ${litige.daysOpen} jour(s)`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(
                'text-xs',
                litige.status === 'open' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                litige.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                litige.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                'bg-purple-500/20 text-purple-400 border-purple-500/30'
              )}>
                {litige.status === 'open' ? 'Ouvert' :
                 litige.status === 'in_progress' ? 'En cours' :
                 litige.status === 'resolved' ? 'Résolu' :
                 'Escaladé'}
              </Badge>
              <span className="text-sm font-bold text-rose-400">{litige.amount}</span>
            </div>
          </div>
          <p className="text-sm text-slate-400">{litige.description}</p>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({ clientId }: { clientId: string }) {
  // Mock history data
  const history = [
    { date: '2025-01-08', action: 'Mise à jour satisfaction', user: 'System', details: 'Score: 98%' },
    { date: '2025-01-05', action: 'Réunion trimestrielle', user: 'Jean Dupont', details: 'Revue Q4 2024' },
    { date: '2024-12-20', action: 'Renouvellement contrat', user: 'Marie Martin', details: 'Contrat renouvelé pour 2025' },
  ];

  return (
    <div className="space-y-4">
      {history.map((item, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-slate-200">{item.action}</h4>
              <span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <p className="text-sm text-slate-400">{item.details}</p>
            <p className="text-xs text-slate-600 mt-1">Par {item.user}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

