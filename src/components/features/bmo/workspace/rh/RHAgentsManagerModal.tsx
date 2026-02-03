'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  bureau: string;
  service: string;
  poste: string;
  dateEmbauche: string;
  salaire: number;
  statut: 'actif' | 'inactif' | 'suspendu';
  soldeConges: {
    annuel: number;
    maladie: number;
    exceptionnel: number;
  };
}

interface RHAgentsManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export function RHAgentsManagerModal({ open, onClose }: RHAgentsManagerModalProps) {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'AGT-001',
      matricule: 'MAT-2020-001',
      nom: 'Kaci',
      prenom: 'Ahmed',
      email: 'ahmed.kaci@example.dz',
      telephone: '+213 555 123 456',
      bureau: 'Alger',
      service: 'Informatique',
      poste: 'Développeur Senior',
      dateEmbauche: '2020-03-15',
      salaire: 150000,
      statut: 'actif',
      soldeConges: {
        annuel: 25,
        maladie: 15,
        exceptionnel: 5,
      },
    },
    {
      id: 'AGT-002',
      matricule: 'MAT-2019-045',
      nom: 'Benali',
      prenom: 'Farid',
      email: 'farid.benali@example.dz',
      telephone: '+213 555 234 567',
      bureau: 'Oran',
      service: 'Finance',
      poste: 'Contrôleur de gestion',
      dateEmbauche: '2019-09-01',
      salaire: 135000,
      statut: 'actif',
      soldeConges: {
        annuel: 28,
        maladie: 15,
        exceptionnel: 5,
      },
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBureau, setFilterBureau] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBureau = filterBureau === 'all' || agent.bureau === filterBureau;
    const matchesStatut = filterStatut === 'all' || agent.statut === filterStatut;

    return matchesSearch && matchesBureau && matchesStatut;
  });

  const stats = {
    total: agents.length,
    actifs: agents.filter((a) => a.statut === 'actif').length,
    inactifs: agents.filter((a) => a.statut === 'inactif').length,
    bureaux: [...new Set(agents.map((a) => a.bureau))].length,
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'inactif':
        return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
      case 'suspendu':
        return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Gestion des agents"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <p className="text-sm text-slate-400">Total agents</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <p className="text-sm text-slate-400">Actifs</p>
            <p className="text-2xl font-bold text-green-600">{stats.actifs}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-slate-500/5 to-slate-500/10">
            <p className="text-sm text-slate-400">Inactifs</p>
            <p className="text-2xl font-bold text-slate-600">{stats.inactifs}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <p className="text-sm text-slate-400">Bureaux</p>
            <p className="text-2xl font-bold text-purple-600">{stats.bureaux}</p>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un agent..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Select value={filterBureau} onValueChange={(v) => setFilterBureau(v)}>
            <SelectTrigger className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 h-10">
              <SelectValue placeholder="Bureau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les bureaux</SelectItem>
              <SelectItem value="Alger">Alger</SelectItem>
              <SelectItem value="Oran">Oran</SelectItem>
              <SelectItem value="Constantine">Constantine</SelectItem>
              <SelectItem value="Annaba">Annaba</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatut} onValueChange={(v) => setFilterStatut(v)}>
            <SelectTrigger className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 h-10">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="suspendu">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste des agents */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {agent.prenom[0]}{agent.nom[0]}
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">
                        {agent.prenom} {agent.nom}
                      </h4>
                      <span className="text-xs text-slate-400">{agent.matricule}</span>
                      <Badge
                        variant={agent.statut === 'actif' ? 'success' : 'default'}
                        className="text-xs"
                      >
                        {agent.statut === 'actif' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {agent.statut}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{agent.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {agent.telephone}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        {agent.bureau} - {agent.service}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {agent.poste}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Embauché le {new Date(agent.dateEmbauche).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {agent.salaire.toLocaleString('fr-DZ')} DZD
                      </div>
                    </div>

                    {/* Soldes de congés */}
                    <div className="flex gap-3 mt-2">
                      <div className="text-xs">
                        <span className="text-slate-400">Congés annuels:</span>{' '}
                        <span className="font-semibold text-blue-600">{agent.soldeConges.annuel}j</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400">Maladie:</span>{' '}
                        <span className="font-semibold text-green-600">{agent.soldeConges.maladie}j</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400">Exceptionnel:</span>{' '}
                        <span className="font-semibold text-purple-600">{agent.soldeConges.exceptionnel}j</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setIsEditMode(true);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Désactiver l'agent ${agent.prenom} ${agent.nom} ?`)) {
                        setAgents(agents.map(a => 
                          a.id === agent.id ? { ...a, statut: 'inactif' as const } : a
                        ));
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                    title="Désactiver"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun agent trouvé</p>
          </div>
        )}

        <div className="flex justify-between items-center w-full pt-4 border-t border-slate-700">
          <button
            onClick={() => {
              setSelectedAgent(null);
              setIsEditMode(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel agent
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </FluentModal>
  );
}

