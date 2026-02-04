/**
 * Modal d'aide pour Dossiers Bloqués
 * Guide utilisateur avec raccourcis, workflow, impacts, FAQ
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Keyboard,
  GitBranch,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface BlockedHelpModalProps {
  open: boolean;
  onClose: () => void;
}

type HelpSection = 'shortcuts' | 'workflow' | 'impacts' | 'faq';

export function BlockedHelpModal({ open, onClose }: BlockedHelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>('shortcuts');

  const sections = [
    { id: 'shortcuts', label: 'Raccourcis clavier', icon: Keyboard },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
    { id: 'impacts', label: 'Niveaux d\'impact', icon: AlertCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-200">Aide - Dossiers Bloqués</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 mt-4">
          {/* Sidebar */}
          <div className="w-48 space-y-1 flex-shrink-0">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as HelpSection)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    activeSection === section.id
                      ? 'bg-red-500/20 text-red-300 font-medium'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-150px)] pr-2">
            {activeSection === 'shortcuts' && <ShortcutsSection />}
            {activeSection === 'workflow' && <WorkflowSection />}
            {activeSection === 'impacts' && <ImpactsSection />}
            {activeSection === 'faq' && <FAQSection />}
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-700/50">
          <Button onClick={onClose} className="bg-red-500 hover:bg-red-600">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// Raccourcis clavier
// ================================
function ShortcutsSection() {
  const shortcuts = [
    { key: 'Ctrl+K / ⌘K', description: 'Ouvrir la palette de commandes' },
    { key: 'Ctrl+F / ⌘F', description: 'Ouvrir le panneau de filtres' },
    { key: 'Ctrl+B / ⌘B', description: 'Afficher/masquer la sidebar' },
    { key: 'Ctrl+E / ⌘E', description: 'Exporter les données' },
    { key: 'Ctrl+R / ⌘R', description: 'Rafraîchir les données' },
    { key: 'Alt+←', description: 'Retour à la page précédente' },
    { key: 'F11', description: 'Mode plein écran' },
    { key: 'Échap', description: 'Fermer les modales/panels' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Raccourcis clavier</h3>
        <p className="text-sm text-slate-400">
          Utilisez ces raccourcis pour naviguer plus rapidement dans la gestion des blocages
        </p>
      </div>

      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/50"
          >
            <span className="text-sm text-slate-300">{shortcut.description}</span>
            <kbd className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded text-xs font-mono">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-sm text-red-300">
          💡 <strong>Astuce :</strong> Appuyez sur Ctrl+K pour accéder rapidement aux actions d'urgence
        </p>
      </div>
    </div>
  );
}

// ================================
// Workflow de résolution
// ================================
function WorkflowSection() {
  const steps = [
    {
      number: 1,
      title: 'Détection du blocage',
      description: 'Le blocage est identifié et enregistré dans le système',
      status: 'done',
    },
    {
      number: 2,
      title: 'Évaluation de l\'impact',
      description: 'Analyse automatique: Critique, Haute, Moyenne ou Basse priorité',
      status: 'in-progress',
    },
    {
      number: 3,
      title: 'Assignment et notification',
      description: 'Assignation au BMO et notification des parties prenantes',
      status: 'in-progress',
    },
    {
      number: 4,
      title: 'Analyse et décision',
      description: 'Le BMO analyse et décide de l\'action appropriée',
      status: 'pending',
    },
    {
      number: 5,
      title: 'Action corrective',
      description: 'Déblocage, escalade, substitution ou négociation',
      status: 'pending',
    },
    {
      number: 6,
      title: 'Suivi et clôture',
      description: 'Vérification de la résolution et archivage',
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Workflow de résolution</h3>
        <p className="text-sm text-slate-400">
          Processus standard de traitement d'un dossier bloqué
        </p>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-start gap-4 pb-6 last:pb-0">
            {/* Number badge */}
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2',
              step.status === 'done' && 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
              step.status === 'in-progress' && 'bg-amber-500/20 border-amber-500/50 text-amber-300',
              step.status === 'pending' && 'bg-slate-700/20 border-slate-700/50 text-slate-400'
            )}>
              {step.number}
            </div>

            {/* Vertical line */}
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-6 bg-slate-700" />
            )}

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <h4 className="text-sm font-medium text-slate-200 mb-1">{step.title}</h4>
              <p className="text-xs text-slate-400">{step.description}</p>
            </div>

            {/* Status */}
            <div className="flex-shrink-0">
              {step.status === 'done' && (
                <span className="text-xs text-emerald-400">✓ Terminé</span>
              )}
              {step.status === 'in-progress' && (
                <span className="text-xs text-amber-400">En cours</span>
              )}
              {step.status === 'pending' && (
                <span className="text-xs text-slate-400">En attente</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>Note :</strong> Le BMO a le pouvoir de substituer ou d'escalader directement selon la criticité.
        </p>
      </div>
    </div>
  );
}

// ================================
// Niveaux d'impact
// ================================
function ImpactsSection() {
  const impacts = [
    {
      level: 'critical',
      icon: '🔴',
      label: 'Critique',
      description: 'Blocage total du projet. Impact financier > 10M FCFA. Délai SLA < 24h. Nécessite action immédiate du BMO.',
      sla: '< 24 heures',
      color: 'red',
    },
    {
      level: 'high',
      icon: '🟠',
      label: 'Haute priorité',
      description: 'Blocage majeur affectant plusieurs phases. Impact 5-10M FCFA. Délai SLA < 48h. Escalade recommandée.',
      sla: '< 48 heures',
      color: 'orange',
    },
    {
      level: 'medium',
      icon: '🟡',
      label: 'Priorité moyenne',
      description: 'Blocage partiel d\'une phase. Impact 1-5M FCFA. Délai SLA < 7j. Résolution standard.',
      sla: '< 7 jours',
      color: 'amber',
    },
    {
      level: 'low',
      icon: '🟢',
      label: 'Priorité basse',
      description: 'Blocage mineur ou administratif. Impact < 1M FCFA. Délai SLA < 14j. Traitement normal.',
      sla: '< 14 jours',
      color: 'slate',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Niveaux d'impact</h3>
        <p className="text-sm text-slate-400">
          Classification des blocages selon leur criticité
        </p>
      </div>

      <div className="space-y-3">
        {impacts.map((item) => (
          <div
            key={item.level}
            className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <h4 className={`text-sm font-medium text-${item.color}-400`}>{item.label}</h4>
                <span className="text-xs text-slate-400">SLA: {item.sla}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 ml-11">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-sm text-red-300">
          <strong>⚠️ Important :</strong> Les SLA sont calculés automatiquement. Le non-respect entraîne une escalade automatique vers la Direction.
        </p>
      </div>
    </div>
  );
}

// ================================
// FAQ
// ================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Comment débloquer un dossier ?',
      answer: 'Ouvrez les détails du dossier bloqué et cliquez sur "Débloquer". Sélectionnez l\'action appropriée (validation directe, modification, ou substitution). Ajoutez une justification (minimum 10 caractères) et confirmez. Le système notifiera automatiquement toutes les parties prenantes.',
    },
    {
      question: 'Quand escalader un blocage ?',
      answer: 'Escaladez quand : 1) Impact critique avec ramifications politiques, 2) Montant > 50M FCFA, 3) Conflit inter-bureaux non résolvable, 4) SLA dépassé de plus de 50%, ou 5) Nécessité d\'arbitrage de la Direction Générale. Utilisez l\'option "Escalader vers DG".',
    },
    {
      question: 'Qu\'est-ce qu\'une substitution ?',
      answer: 'La substitution est le pouvoir suprême du BMO de remplacer une décision ou un acteur bloquant. Utilisez-la pour : débloquer immédiatement un dossier critique, contourner un acteur défaillant, ou imposer une décision en cas d\'urgence absolue. Toute substitution génère un audit trail complet.',
    },
    {
      question: 'Comment prioriser plusieurs blocages critiques ?',
      answer: 'Le système calcule automatiquement un score de priorité basé sur : Impact × Délai × Montant. Consultez la "Matrice urgence" pour voir le classement. Traitez d\'abord les blocages avec score > 1000, puis ceux en rouge dans la matrice. Utilisez les filtres pour isoler les critiques.',
    },
    {
      question: 'Comment exporter un rapport de blocage ?',
      answer: 'Cliquez sur "Actions" puis "Exporter" ou utilisez Ctrl+E. Choisissez le format (Excel pour analyses, PDF pour rapports officiels), le périmètre (filtrés ou tous), et activez l\'audit trail si nécessaire. Le rapport inclura tous les détails, historique et décisions.',
    },
    {
      question: 'Où voir l\'historique des actions ?',
      answer: 'Dans les détails du dossier, onglet "Audit". Vous y trouverez toutes les actions : détection, assignments, décisions, escalades, substitutions, avec dates/heures précises, acteurs, et justifications. L\'historique est immuable et légalement opposable.',
    },
    {
      question: 'Comment gérer les alertes SLA ?',
      answer: 'Les alertes SLA apparaissent automatiquement dans les notifications et la section "Critiques > SLA dépassés". Rouge = dépassé, Amber = < 20% temps restant. Configurez vos préférences de notification pour recevoir des emails. L\'escalade auto se déclenche à +50% dépassement.',
    },
    {
      question: 'Que signifie "Scoring de priorité" ?',
      answer: 'Le scoring combine : Impact (critical=100, high=50, medium=20, low=5) × Délai (jours de blocage) × Facteur montant (1 + montant/1M). Un score > 1000 = URGENT, 500-1000 = Haute priorité, 100-500 = Moyen, < 100 = Bas. Recalculé en temps réel.',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Foire Aux Questions</h3>
        <p className="text-sm text-slate-400">
          Réponses aux questions les plus fréquentes sur la gestion des blocages
        </p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/60 transition-colors"
            >
              <span className="text-sm font-medium text-slate-200">{faq.question}</span>
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ml-2',
                  openIndex === index && 'rotate-90'
                )}
              />
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <p className="text-sm text-emerald-300">
          <strong>Besoin d'aide supplémentaire ?</strong> Contactez le support BMO ou consultez la documentation complète du Command Center.
        </p>
      </div>
    </div>
  );
}

