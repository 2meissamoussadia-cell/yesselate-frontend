/**
 * Script pour ajouter automatiquement TOUTES les entrées manquantes au registry
 * Usage: node scripts/add-all-missing-registry-entries.js
 */

const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '..', 'src', 'modules', 'dashboard', 'registry', 'dashboardRegistry.tsx');

// Liste complète des composants à ajouter (routeKey, componentName, title)
const componentsToAdd = [
  // Performance - Bureaux
  ['performance::bureaux::all', 'PerformanceBureauxAllPage', 'Tous les Bureaux'],
  ['performance::bureaux::bmo', 'PerformanceBureauxBmoPage', 'BMO'],
  ['performance::bureaux::bf', 'PerformanceBureauxBfPage', 'BF'],
  ['performance::bureaux::bj', 'PerformanceBureauxBjPage', 'BJ'],
  ['performance::bureaux::bct', 'PerformanceBureauxBctPage', 'BCT'],
  ['performance::bureaux::bop', 'PerformanceBureauxBopPage', 'BOP'],
  ['performance::bureaux::bcg', 'PerformanceBureauxBcgPage', 'BCG'],
  ['performance::bureaux::bja', 'PerformanceBureauxBjaPage', 'BJA'],
  ['performance::bureaux::brc', 'PerformanceBureauxBrcPage', 'BRC'],
  ['performance::bureaux::bpl', 'PerformanceBureauxBplPage', 'BPL'],
  ['performance::bureaux::bex', 'PerformanceBureauxBexPage', 'BEX'],
  ['performance::bureaux::comparaison', 'PerformanceBureauxComparaisonPage', 'Comparaison Bureaux'],
  
  // Risks
  ['risks::critical::risques', 'RisksCriticalRisquesPage', 'Risques Critiques'],
  ['risks::critical::alertes', 'RisksCriticalAlertesPage', 'Alertes Critiques'],
  ['risks::warnings::moyens', 'RisksWarningsMoyensPage', 'Risques Moyens'],
  ['risks::warnings::faibles', 'RisksWarningsFaiblesPage', 'Risques Faibles'],
  ['risks::type::paiements-retard', 'RisksTypePaiementsRetardPage', 'Paiements en Retard'],
  ['risks::type::contrats-expires', 'RisksTypeContratsExpiresPage', 'Contrats Expirés'],
  ['risks::type::blocages', 'RisksTypeBlocagesPage', 'Blocages'],
  ['risks::type::alertes-systeme', 'RisksTypeAlertesSystemePage', 'Alertes Système'],
  ['risks::analyse::tendances', 'RisksAnalyseTendancesPage', 'Tendances des Risques'],
  ['risks::analyse::causes-racines', 'RisksAnalyseCausesRacinesPage', 'Causes Racines'],
  ['risks::analyse::previsions', 'RisksAnalysePrevisionsPage', 'Prévisions des Risques'],
  ['risks::actions-correctives::en-cours', 'RisksActionsCorrectivesEnCoursPage', 'Actions Correctives En Cours'],
  ['risks::actions-correctives::planifiees', 'RisksActionsCorrectivesPlanifieesPage', 'Actions Correctives Planifiées'],
  
  // Decisions
  ['decisions::pending::urgentes', 'DecisionsPendingUrgentesPage', 'Décisions Urgentes'],
  ['decisions::pending::normales', 'DecisionsPendingNormalesPage', 'Décisions Normales'],
  ['decisions::pending::planifiees', 'DecisionsPendingPlanifieesPage', 'Décisions Planifiées'],
  ['decisions::executed::recentes', 'DecisionsExecutedRecentesPage', 'Décisions Récentes'],
  ['decisions::executed::anciennes', 'DecisionsExecutedAnciennesPage', 'Décisions Anciennes'],
  ['decisions::executed::par-type', 'DecisionsExecutedParTypePage', 'Décisions Par Type'],
  ['decisions::timeline::chronologique', 'DecisionsTimelineChronologiquePage', 'Timeline Chronologique'],
  ['decisions::timeline::par-type', 'DecisionsTimelineParTypePage', 'Timeline Par Type'],
  ['decisions::timeline::par-auteur', 'DecisionsTimelineParAuteurPage', 'Timeline Par Auteur'],
  ['decisions::audit::traces', 'DecisionsAuditTracesPage', 'Traces d\'Audit'],
  ['decisions::audit::rapports', 'DecisionsAuditRapportsPage', 'Rapports d\'Audit'],
  ['decisions::audit::conformite', 'DecisionsAuditConformitePage', 'Conformité'],
  ['decisions::modeles::substitution', 'DecisionsModelesSubstitutionPage', 'Modèles de Substitution'],
  ['decisions::modeles::delegation', 'DecisionsModelesDelegationPage', 'Modèles de Délégation'],
  ['decisions::modeles::arbitrage', 'DecisionsModelesArbitragePage', 'Modèles d\'Arbitrage'],
  
  // Realtime
  ['realtime::monitoring::vue-globale', 'RealtimeMonitoringVueGlobalePage', 'Vue Globale'],
  ['realtime::monitoring::metriques', 'RealtimeMonitoringMetriquesPage', 'Métriques'],
  ['realtime::monitoring::performance', 'RealtimeMonitoringPerformancePage', 'Performance'],
  ['realtime::alerts::actives', 'RealtimeAlertsActivesPage', 'Alertes Actives'],
  ['realtime::alerts::resolues', 'RealtimeAlertsResoluesPage', 'Alertes Résolues'],
  ['realtime::alerts::historique', 'RealtimeAlertsHistoriquePage', 'Historique des Alertes'],
  ['realtime::notifications::non-lues', 'RealtimeNotificationsNonLuesPage', 'Notifications Non Lues'],
  ['realtime::notifications::toutes', 'RealtimeNotificationsToutesPage', 'Toutes les Notifications'],
  ['realtime::notifications::preferences', 'RealtimeNotificationsPreferencesPage', 'Préférences Notifications'],
  ['realtime::sync::etat', 'RealtimeSyncEtatPage', 'État de Synchronisation'],
  ['realtime::sync::historique', 'RealtimeSyncHistoriquePage', 'Historique de Synchronisation'],
  ['realtime::sync::configuration', 'RealtimeSyncConfigurationPage', 'Configuration Synchronisation'],
  
  // Administration
  ['administration::settings::dashboard', 'AdministrationSettingsDashboardPage', 'Paramètres Dashboard'],
  ['administration::settings::kpis', 'AdministrationSettingsKpisPage', 'Paramètres KPIs'],
  ['administration::settings::notifications', 'AdministrationSettingsNotificationsPage', 'Paramètres Notifications'],
  ['administration::users::liste', 'AdministrationUsersListePage', 'Liste des Utilisateurs'],
  ['administration::users::permissions', 'AdministrationUsersPermissionsPage', 'Permissions Utilisateurs'],
  ['administration::permissions::roles', 'AdministrationPermissionsRolesPage', 'Rôles'],
  ['administration::permissions::acces', 'AdministrationPermissionsAccesPage', 'Accès'],
  ['administration::logs::activite', 'AdministrationLogsActivitePage', 'Logs d\'Activité'],
  ['administration::logs::systeme', 'AdministrationLogsSystemePage', 'Logs Système'],
];

let registryContent = fs.readFileSync(registryPath, 'utf8');

// Vérifier quelles entrées existent déjà
const existingEntries = new Set();
const entryPattern = /'([^']+)':\s*\{/g;
let match;
while ((match = entryPattern.exec(registryContent)) !== null) {
  existingEntries.add(match[1]);
}

// Générer les entrées à ajouter
const entriesToAdd = componentsToAdd
  .filter(([routeKey]) => !existingEntries.has(routeKey))
  .map(([routeKey, componentName, title]) => {
    const id = routeKey.replace(/::/g, '-');
    return `  '${routeKey}': {
    id: '${id}',
    title: '${title}',
    ttl: 60_000,
    loader: async () => ({ key: '${routeKey}', fetchedAt: Date.now(), data: {} }),
    render: () => {
      const ${componentName} = React.lazy(() => import('../components/views/${componentName}').then(m => ({ default: m.${componentName} })));
      const LoadingFallback = () => <div className="p-6 text-slate-400">Chargement...</div>;
      return (
        <React.Suspense fallback={<LoadingFallback />}>
          <${componentName} />
        </React.Suspense>
      );
    },
  },`;
  });

if (entriesToAdd.length === 0) {
  console.log('✅ Toutes les entrées sont déjà présentes dans le registry');
  process.exit(0);
}

// Trouver la position avant la fermeture du registry
const lastBraceIndex = registryContent.lastIndexOf('};');
if (lastBraceIndex === -1) {
  console.error('❌ Impossible de trouver la fermeture du registry');
  process.exit(1);
}

// Insérer les nouvelles entrées
const beforeClosing = registryContent.substring(0, lastBraceIndex);
const afterClosing = registryContent.substring(lastBraceIndex);

const newEntries = '\n' + entriesToAdd.join('\n\n') + '\n';
const updatedContent = beforeClosing + newEntries + afterClosing;

fs.writeFileSync(registryPath, updatedContent, 'utf8');

console.log(`✅ ${entriesToAdd.length} entrées ajoutées au registry`);
console.log(`   Composants ajoutés:`);
entriesToAdd.forEach((_, index) => {
  const [routeKey, componentName] = componentsToAdd.filter(([rk]) => !existingEntries.has(rk))[index];
  console.log(`   - ${componentName} (${routeKey})`);
});
