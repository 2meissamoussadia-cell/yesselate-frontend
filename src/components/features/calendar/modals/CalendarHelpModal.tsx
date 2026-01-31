/**
 * Help Modal - Calendrier
 * Aide contextuelle complète pour le module Calendrier
 */

'use client';

import React, { useState } from 'react';
import { X, Keyboard, Calendar, HelpCircle, BookOpen } from 'lucide-react';

interface CalendarHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarHelpModal({ isOpen, onClose }: CalendarHelpModalProps) {
  const [activeSection, setActiveSection] = useState<'shortcuts' | 'workflow' | 'types' | 'faq'>('shortcuts');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] m-4 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <HelpCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Centre d'aide - Calendrier</h2>
              <p className="text-sm text-slate-400">Tout ce que vous devez savoir sur le module Calendrier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-slate-700 bg-slate-800/30 p-3 flex flex-col gap-1">
            <button
              onClick={() => setActiveSection('shortcuts')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'shortcuts'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Raccourcis
            </button>
            <button
              onClick={() => setActiveSection('workflow')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'workflow'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Workflow
            </button>
            <button
              onClick={() => setActiveSection('types')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'types'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Types
            </button>
            <button
              onClick={() => setActiveSection('faq')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'faq'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'shortcuts' && <ShortcutsSection />}
            {activeSection === 'workflow' && <WorkflowSection />}
            {activeSection === 'types' && <TypesSection />}
            {activeSection === 'faq' && <FAQSection />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-700 bg-slate-800/30">
          <p className="text-xs text-slate-400">
            Appuyez sur <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">F1</kbd> pour afficher cette aide
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================
// SECTION: Raccourcis Clavier
// ================================
function ShortcutsSection() {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Ouvrir la palette de commandes', category: 'Navigation' },
    { keys: ['Ctrl', 'N'], description: 'Créer un nouvel événement', category: 'Actions' },
    { keys: ['Ctrl', 'F'], description: 'Rechercher un événement', category: 'Navigation' },
    { keys: ['Ctrl', 'R'], description: 'Rafraîchir les données', category: 'Actions' },
    { keys: ['Ctrl', 'E'], description: 'Exporter le calendrier', category: 'Actions' },
    { keys: ['F1'], description: 'Afficher cette aide', category: 'Aide' },
    { keys: ['Échap'], description: 'Fermer les modales', category: 'Navigation' },
    { keys: ['←', '→'], description: 'Naviguer entre les mois', category: 'Navigation' },
  ];

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">⌨️ Raccourcis clavier</h3>
        <p className="text-sm text-slate-400">Utilisez ces raccourcis pour une navigation rapide et efficace.</p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-purple-400 mb-3">{category}</h4>
          <div className="space-y-2">
            {shortcuts
              .filter((s) => s.category === category)
              .map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-slate-400 text-xs mx-1">+</span>}
                        <kbd className="px-3 py-1.5 bg-slate-700 rounded-md text-xs font-mono text-slate-200 border border-slate-600">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ================================
// SECTION: Workflow
// ================================
function WorkflowSection() {
  const steps = [
    {
      number: 1,
      title: 'Créer un événement',
      description: 'Utilisez le bouton "+" ou Ctrl+N pour créer un nouvel événement. Remplissez les informations requises.',
      icon: '📝',
    },
    {
      number: 2,
      title: 'Définir les détails',
      description: 'Choisissez le type (réunion, deadline, tâche), la priorité, la date, l\'heure et les participants.',
      icon: '⚙️',
    },
    {
      number: 3,
      title: 'Détecter les conflits',
      description: 'Le système détecte automatiquement les conflits d\'horaires avec d\'autres événements.',
      icon: '⚠️',
    },
    {
      number: 4,
      title: 'Gérer les conflits',
      description: 'Résolvez les conflits en modifiant l\'horaire ou en annulant l\'un des événements.',
      icon: '🔄',
    },
    {
      number: 5,
      title: 'Suivre l\'avancement',
      description: 'Marquez les événements comme complétés au fur et à mesure. Consultez les métriques.',
      icon: '✅',
    },
    {
      number: 6,
      title: 'Exporter et partager',
      description: 'Exportez votre calendrier en iCal, CSV, JSON ou PDF pour le partager ou l\'archiver.',
      icon: '📤',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">🔄 Workflow de gestion</h3>
        <p className="text-sm text-slate-400">Processus complet de gestion des événements dans le calendrier.</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.number} className="relative">
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent" />
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center text-xl relative z-10 bg-slate-900">
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-400">ÉTAPE {step.number}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">{step.title}</h4>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// SECTION: Types d'événements
// ================================
function TypesSection() {
  const types = [
    {
      name: 'Réunion',
      icon: '👥',
      color: 'purple',
      description: 'Événement avec plusieurs participants à une date/heure précise.',
      examples: 'Réunion d\'équipe, Comité de pilotage, Point hebdomadaire',
    },
    {
      name: 'Deadline',
      icon: '⏰',
      color: 'red',
      description: 'Date limite pour une livraison ou une action importante.',
      examples: 'Date de rendu, Fin de sprint, Échéance contractuelle',
    },
    {
      name: 'Milestone',
      icon: '🎯',
      color: 'amber',
      description: 'Étape importante dans un projet ou processus.',
      examples: 'Fin de phase, Validation client, Go-live',
    },
    {
      name: 'Tâche',
      icon: '✓',
      color: 'blue',
      description: 'Action à effectuer, peut s\'étendre sur plusieurs heures ou jours.',
      examples: 'Rédaction rapport, Revue de code, Formation',
    },
    {
      name: 'Rappel',
      icon: '🔔',
      color: 'emerald',
      description: 'Notification pour ne pas oublier une action ou un événement.',
      examples: 'Relance client, Paiement fournisseur, Renouvellement',
    },
  ];

  const priorities = [
    { level: 'Haute', color: 'red', icon: '🔴', sla: '< 24h', description: 'Urgence critique, traitement immédiat requis' },
    { level: 'Moyenne', color: 'amber', icon: '🟡', sla: '< 3 jours', description: 'Priorité normale, traitement dans les délais standards' },
    { level: 'Basse', color: 'blue', icon: '🔵', sla: '< 1 semaine', description: 'Peut attendre, traitement quand disponible' },
  ];

  return (
    <div className="space-y-8">
      {/* Types d'événements */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">📚 Types d'événements</h3>
        <p className="text-sm text-slate-400 mb-4">Cinq types d'événements pour organiser votre calendrier.</p>

        <div className="space-y-3">
          {types.map((type) => (
            <div key={type.name} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-200 mb-1">{type.name}</h4>
                  <p className="text-xs text-slate-400 mb-2">{type.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Exemples:</span>
                    <span className="text-slate-400">{type.examples}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Niveaux de priorité */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">⚠️ Niveaux de priorité</h3>
        <p className="text-sm text-slate-400 mb-4">Trois niveaux de priorité avec SLA associés.</p>

        <div className="space-y-3">
          {priorities.map((priority) => (
            <div key={priority.level} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{priority.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-200">{priority.level}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300">SLA: {priority.sla}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{priority.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================
// SECTION: FAQ
// ================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Comment créer un nouvel événement ?',
      answer:
        'Cliquez sur le bouton "+" en haut à droite ou utilisez le raccourci Ctrl+N. Remplissez le formulaire avec les détails de l\'événement (titre, type, date, heure, participants, etc.) puis validez.',
    },
    {
      question: 'Comment gérer les conflits d\'horaires ?',
      answer:
        'Le système détecte automatiquement les conflits lors de la création ou modification d\'événements. Les conflits sont affichés avec un badge rouge. Pour les résoudre, modifiez l\'horaire de l\'un des événements ou annulez-en un.',
    },
    {
      question: 'Puis-je exporter mon calendrier ?',
      answer:
        'Oui ! Utilisez le bouton "Exporter" ou Ctrl+E. Vous pouvez exporter en format iCal (compatible Outlook/Google), CSV, JSON ou PDF. Choisissez le périmètre (aujourd\'hui, semaine, mois ou tout).',
    },
    {
      question: 'Comment ajouter des participants à une réunion ?',
      answer:
        'Lors de la création ou modification d\'une réunion, utilisez le champ "Participants". Tapez les noms ou emails et sélectionnez-les dans la liste. Les participants recevront une notification.',
    },
    {
      question: 'Quels sont les différents types d\'événements ?',
      answer:
        'Il y a 5 types : Réunion (événement avec participants), Deadline (date limite), Milestone (étape importante), Tâche (action à effectuer) et Rappel (notification). Consultez l\'onglet "Types" pour plus de détails.',
    },
    {
      question: 'Comment marquer un événement comme complété ?',
      answer:
        'Cliquez sur l\'événement pour ouvrir ses détails, puis cliquez sur le bouton "Marquer comme complété" ou cochez la case. L\'événement passera en statut complété et sera comptabilisé dans les métriques.',
    },
    {
      question: 'Puis-je voir les métriques de mon calendrier ?',
      answer:
        'Oui ! Allez dans l\'onglet "Metrics" du dashboard. Vous verrez des graphiques sur les types d\'événements, les priorités, la distribution horaire, le taux de complétion, les conflits et plus encore.',
    },
    {
      question: 'Comment recevoir des rappels pour mes événements ?',
      answer:
        'Lors de la création d\'un événement, vous pouvez définir un ou plusieurs rappels (15min, 1h, 1 jour avant). Vous recevrez des notifications push et/ou par email selon vos préférences.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">❓ Questions fréquentes</h3>
        <p className="text-sm text-slate-400">Réponses aux questions les plus courantes sur le module Calendrier.</p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors"
            >
              <span className="text-sm font-medium text-slate-200 pr-4">{faq.question}</span>
              <span
                className={`text-purple-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

