'use client';

import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/utils';
import {
  Keyboard, Search, Download, BarChart3, Calendar, Users,
  Filter, Plus, Zap, Brain, Bell, Shield, FileText, Star,
  Command, Maximize2, PanelRightOpen
} from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

type ShortcutCategory = {
  title: string;
  icon: typeof Keyboard;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
};

const SHORTCUTS: ShortcutCategory[] = [
  {
    title: 'Navigation',
    icon: Command,
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Palette de commandes' },
      { keys: ['⌘', '1'], description: 'Vue À traiter' },
      { keys: ['⌘', '2'], description: 'Vue Urgentes' },
      { keys: ['⌘', '3'], description: 'Vue Congés' },
      { keys: ['⌘', '4'], description: 'Vue Validées' },
      { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
      { keys: ['⌘', '/'], description: 'Recherche rapide' },
    ],
  },
  {
    title: 'Actions',
    icon: Zap,
    shortcuts: [
      { keys: ['⌘', 'N'], description: 'Nouvelle demande' },
      { keys: ['⌘', 'S'], description: 'Statistiques' },
      { keys: ['⌘', 'E'], description: 'Exporter' },
      { keys: ['⌘', 'F'], description: 'Filtres avancés' },
      { keys: ['⌘', 'G'], description: 'Gestion agents' },
      { keys: ['⌘', 'W'], description: 'Workflows' },
      { keys: ['⌘', 'R'], description: 'Actualiser' },
    ],
  },
  {
    title: 'Affichage',
    icon: Maximize2,
    shortcuts: [
      { keys: ['⌘', 'D'], description: 'Mode sombre/clair' },
      { keys: ['F11'], description: 'Plein écran' },
      { keys: ['⌘', 'Tab'], description: 'Onglet suivant' },
      { keys: ['⌘', 'Shift', 'Tab'], description: 'Onglet précédent' },
      { keys: ['⌘', 'W'], description: 'Fermer onglet' },
    ],
  },
  {
    title: 'Fenêtres',
    icon: PanelRightOpen,
    shortcuts: [
      { keys: ['Escape'], description: 'Fermer modal/popup' },
      { keys: ['⌘', 'I'], description: 'Analytics IA' },
      { keys: ['⌘', 'L'], description: 'Délégations' },
      { keys: ['⌘', 'P'], description: 'Rappels' },
      { keys: ['⌘', 'M'], description: 'Validations multi-niveaux' },
      { keys: ['⌘', 'C'], description: 'Calendrier absences' },
      { keys: ['⌘', 'T'], description: 'Templates réponse' },
    ],
  },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Recherche intelligente',
    description: 'Recherchez par nom, matricule, type de demande ou contenu',
  },
  {
    icon: Filter,
    title: 'Filtres avancés',
    description: 'Filtrez par type, statut, priorité, bureau, dates et montants',
  },
  {
    icon: Download,
    title: 'Export multi-format',
    description: 'Exportez en PDF, Excel, CSV ou JSON avec options personnalisées',
  },
  {
    icon: BarChart3,
    title: 'Tableaux de bord',
    description: 'Visualisez les KPIs, tendances et métriques en temps réel',
  },
  {
    icon: Calendar,
    title: 'Calendrier des absences',
    description: 'Vue calendrier de toutes les absences par bureau et équipe',
  },
  {
    icon: Users,
    title: 'Gestion des agents',
    description: 'CRUD complet sur les agents avec import/export',
  },
  {
    icon: Zap,
    title: 'Workflows automatisés',
    description: 'Règles automatiques pour validation, notifications et escalades',
  },
  {
    icon: Brain,
    title: 'IA prédictive',
    description: 'Prédictions de charge, alertes préventives et recommandations',
  },
  {
    icon: Bell,
    title: 'Notifications intelligentes',
    description: 'Alertes par app, email, SMS selon la criticité',
  },
  {
    icon: Shield,
    title: 'Validation multi-niveaux',
    description: 'Processus de validation hiérarchique configurable',
  },
  {
    icon: FileText,
    title: 'Templates de réponse',
    description: 'Modèles de réponse personnalisables avec variables',
  },
  {
    icon: Star,
    title: 'Favoris et épingles',
    description: 'Gardez vos demandes importantes à portée de main',
  },
];

export function RHHelpModal({ open, onClose }: Props) {
  return (
    <FluentModal
      open={open}
      title="Aide & Raccourcis"
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Raccourcis clavier */}
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-orange-500" />
            Raccourcis clavier
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {SHORTCUTS.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.title}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4 text-orange-500" />
                    {category.title}
                  </h4>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-slate-600 dark:text-slate-400">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <kbd
                              key={keyIdx}
                              className={cn(
                                "px-2 py-1 rounded text-xs font-mono",
                                "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600",
                                "shadow-sm"
                              )}
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fonctionnalités */}
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Fonctionnalités
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700
                           hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Icon className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Conseils */}
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            💡 Conseils rapides
          </h3>
          
          <div className="grid gap-2">
            {[
              'Utilisez ⌘K pour accéder rapidement à toutes les fonctionnalités',
              'Les demandes urgentes sont automatiquement mises en évidence en rouge',
              'Épinglez vos demandes fréquentes pour y accéder plus rapidement',
              'Configurez des workflows pour automatiser les validations récurrentes',
              'L\'IA analyse les tendances et vous alerte sur les anomalies potentielles',
              'Exportez régulièrement vos données pour le reporting',
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <span className="text-amber-500">💡</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Version */}
        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400">
            Console RH v2.0 • Dernière mise à jour: Janvier 2026
          </p>
        </div>
      </div>
    </FluentModal>
  );
}

